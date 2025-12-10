import os
import pandas as pd
import numpy as np
import gc
from sklearn.preprocessing import MinMaxScaler
from sklearn.cluster import KMeans
from django.conf import settings
from django.core.files.storage import default_storage
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

class UploadDatasetView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        file_obj = request.FILES['file']
        file_name = file_obj.name
        save_path = default_storage.save(f"uploads/{file_name}", file_obj)
        full_path = os.path.join(settings.MEDIA_ROOT, save_path)

        try:            
            # Baca 10 baris aja untuk preview
            if file_name.endswith('.csv'):
                df_preview = pd.read_csv(full_path, nrows=10)
            elif file_name.endswith(('.xls', '.xlsx')):
                df_preview = pd.read_excel(full_path, nrows=10)
            else:
                default_storage.delete(save_path)
                return Response({'error': 'Format file tidak didukung'}, status=status.HTTP_400_BAD_REQUEST)

            # Bersihkan NaN di preview
            df_preview = df_preview.replace({np.nan: None})
            
            # Ambil data preview & columns
            preview_data = df_preview.head(5).to_dict(orient='records')
            columns = list(df_preview.columns)
            total_cols = len(columns)

            # Hitung Total Baris dengan Cara Ringan 
            total_rows = 0
            if file_name.endswith('.csv'):
                # Hitung baris manual tanpa load data 
                with open(full_path, 'rb') as f:
                    total_rows = sum(1 for _ in f) - 1 # 1 untuk header
            else:
                df_temp = pd.read_excel(full_path, usecols=[0])
                total_rows = len(df_temp)

            # Kirim Response
            return Response({
                'message': 'File berhasil diupload',
                'filename': file_name,
                'path': save_path,
                'total_rows': total_rows,
                'total_cols': total_cols,
                'columns': columns,
                'preview': preview_data
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            # Hapus file jika gagal
            if os.path.exists(full_path):
                default_storage.delete(save_path)
            print(f"Error Upload: {str(e)}") 
            return Response({'error': f"Gagal memproses file: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# API cleaning data
class PreprocessCleaningView(APIView):
    def post(self, request):
        filename = request.data.get('filename')
        if not filename:
            return Response({'error': 'Filename is required'}, status=status.HTTP_400_BAD_REQUEST)

        file_path = os.path.join(settings.MEDIA_ROOT, 'uploads', filename)
        if not os.path.exists(file_path):
            return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            if filename.endswith('.csv'):
                df = pd.read_csv(file_path)
            else:
                df = pd.read_excel(file_path)

            initial_rows = len(df)
            
            # Hapus Duplikat
            df.drop_duplicates(inplace=True)
            duplicates_dropped = initial_rows - len(df)

            # Hapus Missing Value (NaN)
            rows_before_na = len(df)
            df.dropna(inplace=True)
            na_dropped = rows_before_na - len(df)

            # Simpan file versi "Cleaned"
            clean_filename = f"cleaned_{filename}"
            clean_path = os.path.join(settings.MEDIA_ROOT, 'uploads', clean_filename)
            df.to_csv(clean_path, index=False)

            return Response({
                'message': 'Data cleaning success',
                'initial_rows': initial_rows,
                'duplicates': duplicates_dropped,
                'missing_values': na_dropped,
                'final_rows': len(df),
                'clean_filename': clean_filename, 
                'columns': list(df.columns)
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# API preprocessing (feature selection + normalization)
class PreprocessScalingView(APIView):
    def post(self, request):
        filename = request.data.get('filename') # Ini harus nama file yang sudah di-clean
        selected_features = request.data.get('features', []) # List kolom yang dipilih user

        if not filename or not selected_features:
            return Response({'error': 'Filename and features are required'}, status=status.HTTP_400_BAD_REQUEST)

        file_path = os.path.join(settings.MEDIA_ROOT, 'uploads', filename)
        
        try:
            df = pd.read_csv(file_path)

            # Filter hanya kolom yang dipilih user
            valid_features = [f for f in selected_features if f in df.columns]
            if not valid_features:
                return Response({'error': 'No valid features selected'}, status=status.HTTP_400_BAD_REQUEST)
            
            df_selected = df[valid_features].copy()

            # Normalisasi (MinMax Scaling)
            numeric_cols = df_selected.select_dtypes(include=[np.number]).columns.tolist()
            
            if numeric_cols:
                scaler = MinMaxScaler()
                df_selected[numeric_cols] = scaler.fit_transform(df_selected[numeric_cols])

            # Simpan file final untuk dianalisis
            final_filename = f"processed_{filename.replace('cleaned_', '')}"
            final_path = os.path.join(settings.MEDIA_ROOT, 'uploads', final_filename)
            df_selected.to_csv(final_path, index=False)

            # ganti NaN dengan None agar JSON aman
            preview = df_selected.head(5).replace({np.nan: None}).to_dict(orient='records')

            return Response({
                'message': 'Preprocessing complete',
                'final_filename': final_filename,
                'preview': preview,
                'columns': list(df_selected.columns)
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# API elbow method
class ElbowMethodView(APIView):
    def post(self, request):
        filename = request.data.get('filename')
        
        if not filename:
            return Response({'error': 'Filename is required'}, status=status.HTTP_400_BAD_REQUEST)

        file_path = os.path.join(settings.MEDIA_ROOT, 'uploads', filename)
        
        try:
            df = pd.read_csv(file_path)            
            numeric_df = df.select_dtypes(include=[np.number])
            inertia = []
            k_range = range(1, 11) 

            for k in k_range:
                kmeans = KMeans(n_clusters=k, random_state=42)
                kmeans.fit(numeric_df)
                inertia.append({
                    'k': k, 
                    'inertia': kmeans.inertia_
                })

            return Response({
                'elbow_data': inertia,
                'message': 'Elbow method calculation success'
            })

        except Exception as e:
            print(f"Error Elbow: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# API K-Means 
class KMeansClusteringView(APIView):
    def post(self, request):
        gc.collect()
        filename_scaled = request.data.get('filename') 
        k = request.data.get('k')

        if not filename_scaled or not k: return Response({'error': 'Invalid data'}, status=400)

        path_scaled = os.path.join(settings.MEDIA_ROOT, 'uploads', filename_scaled)
        
        # Nama file asli
        filename_raw = filename_scaled.replace('processed_', 'cleaned_')
        path_raw = os.path.join(settings.MEDIA_ROOT, 'uploads', filename_raw)
        
        try:
            # Load Data Scaled & Raw
            if not os.path.exists(path_scaled):
                return Response({'error': 'File processed hilang. Preprocessing ulang.'}, status=404)
            
            df_scaled = pd.read_csv(path_scaled)
            
            # Clustering
            kmeans = KMeans(n_clusters=int(k), random_state=42, n_init=10)
            labels = kmeans.fit_predict(df_scaled)
            
            # Siapkan Data Display (Raw)
            if os.path.exists(path_raw):
                df_display = pd.read_csv(path_raw)
                
                # Samakan jumlah baris
                if len(df_display) != len(df_scaled):
                    df_display = df_display.iloc[:len(df_scaled)]
                
                # Ambil daftar nama kolom dari file yang sudah di-scale
                cols_used = list(df_scaled.columns)
                df_display = df_display[cols_used]
            else:
                df_display = df_scaled.copy()

            # Tempel Label Cluster
            df_display['cluster'] = labels
            
            # Simpan file hasil agar bisa dibaca page Visualization 
            # Nama file: result_kmeans_cleaned_
            result_filename = f"result_kmeans_{filename_raw}"
            result_path = os.path.join(settings.MEDIA_ROOT, 'uploads', result_filename)
            df_display.to_csv(result_path, index=False)
            
            # Ringkasan untuk tabel
            summary = df_display.groupby('cluster').mean().reset_index().round(0)

            return Response({
                'message': 'Clustering success',
                'clusters': summary.to_dict(orient='records')
            })

        except Exception as e:
            return Response({'error': str(e)}, status=500)
        
# API Clustering
class VisualizationView(APIView):
    def post(self, request):
        gc.collect()
        filename_raw = request.data.get('filename') 
        
        if not filename_raw: return Response({'error': 'Filename required'}, status=400)

        target_filename = f"result_kmeans_{filename_raw.replace('processed_', 'cleaned_')}"
        file_path = os.path.join(settings.MEDIA_ROOT, 'uploads', target_filename)
        
        try:
            if not os.path.exists(file_path):
                return Response({'error': 'Belum ada data clustering. Jalankan analisis dulu.'}, status=404)

            df = pd.read_csv(file_path)

            # data pie chart (distribusi user)
            cluster_counts = df['cluster'].value_counts().sort_index()
            pie_data = [
                {'name': f'Cluster {k}', 'value': v} 
                for k, v in cluster_counts.items()
            ]

            # data radar & bar chart (Rata-rata per Cluster)
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            # Buang kolom 'cluster' dari rata-rata, tapi keep buat groupby
            cols_to_mean = [c for c in numeric_cols if c != 'cluster']
            
            summary = df.groupby('cluster')[cols_to_mean].mean().reset_index().round(0)
            radar_data = summary.to_dict(orient='records')

            return Response({
                'pie_data': pie_data,
                'radar_data': radar_data,
                'total_users': len(df)
            })

        except Exception as e:
            return Response({'error': str(e)}, status=500)