from django.urls import path
from .views import (
    UploadDatasetView, 
    PreprocessCleaningView, 
    PreprocessScalingView, 
    ElbowMethodView, 
    KMeansClusteringView,
    VisualizationView
)

urlpatterns = [
    path('upload/', UploadDatasetView.as_view(), name='upload-dataset'),
    path('preprocess/cleaning/', PreprocessCleaningView.as_view(), name='cleaning'), 
    path('preprocess/scaling/', PreprocessScalingView.as_view(), name='scaling'),
    path('analysis/elbow/', ElbowMethodView.as_view(), name='elbow'),
    path('analysis/kmeans/', KMeansClusteringView.as_view(), name='kmeans'),
    path('visualization/', VisualizationView.as_view(), name='visualization'),
]