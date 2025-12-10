import React, { useState, useEffect, useRef } from 'react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Upload, X, FileText, CheckCircle, ArrowRight, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'; 

const InputData = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // state manajemen
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showError, setShowError] = useState(false); 
  const [showFormatInfo, setShowFormatInfo] = useState(false);
  const [uploading, setUploading] = useState(false); 
  const [errorMsg, setErrorMsg] = useState('');      
  const [previewData, setPreviewData] = useState([]); 
  const [columns, setColumns] = useState([]);         
  const [datasetInfo, setDatasetInfo] = useState(null);

  const allowedExtensions = ['csv', 'xlsx', 'xls', 'json', 'txt'];

  useEffect(() => {
    localStorage.removeItem('prep_steps');
    localStorage.removeItem('prep_showResult');
    localStorage.removeItem('analysis_k');
    localStorage.removeItem('analysis_showResult');
    localStorage.removeItem('uploaded_filename'); 
  }, []);

  // upload ke django
  const uploadFileToBackend = async (selectedFile) => {
    setUploading(true);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/upload/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setFile(selectedFile);
        setPreviewData(data.preview); 
        setColumns(data.columns);     
        setDatasetInfo({ rows: data.total_rows, cols: data.total_cols });
        
        localStorage.setItem('uploaded_filename', data.filename);
      } else {
        setErrorMsg(data.error || 'Gagal mengupload file.');
        setFile(null);
      }
    } catch (error) {
      console.error("Error upload:", error);
      setErrorMsg('Gagal terhubung ke server Backend. Pastikan Django sudah jalan!');
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.size > 100 * 1024 * 1024) {
      alert("Ukuran file terlalu besar! Maksimal 100 MB."); 
      return; 
    }

    const extension = selectedFile.name.split('.').pop().toLowerCase();
    
    if (allowedExtensions.includes(extension)) {
      setShowError(false);
      uploadFileToBackend(selectedFile);
    } else {
      setShowError(true); 
      setFile(null);
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    validateAndSetFile(e.dataTransfer.files[0]);
  };

  const pageTransition = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.5 }
  };

  return (
    <motion.div 
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-white font-sans flex flex-col pb-24"
    >
      
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 md:px-16 py-6 bg-white z-20 sticky top-0">
        <button onClick={() => navigate('/')} className="text-3xl font-bold text-primary tracking-tight">Flowin</button>
        <div className="flex gap-8 font-medium text-lg">
          <button onClick={() => navigate('/')} className="text-gray-500 hover:text-primary transition-colors">Beranda</button>
          <button onClick={() => navigate('/about')} className="text-gray-500 hover:text-primary transition-colors">Tentang Kami</button>
        </div>
      </nav>

      {/* Konten utama */}
      <main className="flex-1 flex flex-col items-center pt-10 px-4 w-full max-w-5xl mx-auto">
        
        {/* Header Teks */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-3">Unggah Dataset</h1>
          <p className="text-gray-600 text-lg">
            Unggah dataset smartwatch yang ingin kamu analisis. {' '}
            <button 
              onClick={() => setShowFormatInfo(true)}
              className="text-primary underline cursor-pointer hover:text-pink-600 font-medium"
            >
              Contoh Format
            </button>
          </p>
        </div>

        {/* Area konten */}
        <div className="w-full flex flex-col items-center"> 
          
          {/* kondisi belum ada file dan tidak loading */}
          {!file && !uploading ? (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className={`w-full max-w-3xl h-72 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300
                ${isDragging ? 'border-primary bg-pink-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
                ${errorMsg ? 'border-red-300 bg-red-50' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
            >
              <input type="file" ref={fileInputRef} onChange={(e) => validateAndSetFile(e.target.files[0])} className="hidden" accept=".csv,.xlsx,.xls,.json,.txt"/>
              
              {/* menampilkan jika ada error koneksi BE */}
              {errorMsg ? (
                 <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mb-2 mx-auto" />
                    <p className="text-red-500 font-bold mb-1">Gagal Upload</p>
                    <p className="text-red-400 text-sm">{errorMsg}</p>
                 </div>
              ) : (
                 <>
                    <Upload className="w-16 h-16 text-gray-400 mb-4" />
                    <p className="text-gray-700 text-xl font-medium">Unggah dataset kamu di sini</p>
                    <p className="text-gray-400 mt-2">atau <span className="underline decoration-gray-400">klik untuk menjelajah</span></p>
                 </>
              )}
            </motion.div>

          /* kondisi sedang loading */
          ) : uploading ? (
            <div className="w-full max-w-3xl h-72 rounded-3xl flex flex-col items-center justify-center bg-white border border-gray-200 shadow-sm">
               <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
               <p className="text-gray-800 font-bold text-lg">Sedang Memproses...</p>
               <p className="text-gray-500 text-sm">Mengirim data ke server...</p>
            </div>

          /* kondisi berhasil dari backend */
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col gap-6"
            >
              {/* Info file */}
              <div className="w-full flex justify-between items-center border border-gray-300 rounded-full px-6 py-3 bg-white shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-800 text-lg block leading-none">{file.name}</span>
                    {datasetInfo && <span className="text-xs text-gray-500">{datasetInfo.rows} Baris • {datasetInfo.cols} Kolom</span>}
                  </div>
                </div>
                <button onClick={() => { setFile(null); setPreviewData([]); }} className="hover:bg-gray-100 p-2 rounded-full text-gray-400 hover:text-red-500 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Tabel Preview */}
              <div className="w-full overflow-x-auto border border-gray-200 rounded-2xl bg-white shadow-sm">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-4 font-bold text-gray-700 border-b text-sm uppercase tracking-wider">#</th>
                      {/* Render nama kolom */}
                      {columns.map((col, idx) => (
                        <th key={idx} className="p-4 font-bold text-gray-700 border-b text-sm uppercase tracking-wider whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    {/* Render baris data */}
                    {previewData.map((row, i) => (
                      <tr key={i} className="hover:bg-pink-50 transition-colors border-b last:border-0">
                        <td className="p-4 font-medium text-xs text-gray-400">{i + 1}</td>
                        {columns.map((col, j) => (
                          <td key={j} className="p-4 text-sm whitespace-nowrap">
                            {row[col] !== null ? row[col] : <span className="italic text-gray-300">NULL</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-center text-gray-400 text-sm italic mb-4">*Menampilkan 5 baris pertama dari dataset asli</p>
            </motion.div>
          )}
        </div>

      </main>

      {/* footer button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 p-4 z-30">
        <div className="max-w-5xl mx-auto flex gap-4">
          <button 
            onClick={() => navigate('/')}
            className="flex-1 py-3 rounded-full bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
          >
             Kembali
          </button>
          
          <button 
            onClick={() => file ? navigate('/preprocessing') : null}
            disabled={!file}
            className={`flex-1 py-3 rounded-full font-bold transition-all shadow-lg flex items-center justify-center gap-2
              ${file 
                ? 'bg-primary text-white hover:shadow-primary/40 hover:-translate-y-1 cursor-pointer' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            Lanjut 
          </button>
        </div>
      </div>

      {/* Pop Up Error (Format Salah) */}
      <AnimatePresence>
        {showError && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowError(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-[400px] rounded-3xl p-8 flex flex-col items-center shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <X className="w-8 h-8 text-red-500" strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-black">Format Salah</h3>
              <p className="text-center text-gray-600 mb-6">File yang diunggah tidak valid. Harap gunakan format .csv, .xlsx, atau .json.</p>
              <button onClick={() => setShowError(false)} className="w-full bg-gray-900 text-white font-bold py-3 rounded-full">Tutup</button>
            </motion.div>
          </div>
        )}

        {showFormatInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFormatInfo(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-[500px] rounded-3xl p-8 flex flex-col shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-black">Format Dataset</h3>
                <button onClick={() => setShowFormatInfo(false)}><X className="text-gray-400 hover:text-black" /></button>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <FileText className="text-primary shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-800">Ekstensi File</h4>
                    <p className="text-sm text-gray-600">.csv, .xlsx, .xls, .json, .txt</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <CheckCircle className="text-green-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-800">Isi Data</h4>
                    <p className="text-sm text-gray-600">Pastikan ada header kolom (Steps, Calories, dll). Data backend akan membaca baris pertama sebagai header.</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowFormatInfo(false)} className="mt-8 w-full bg-primary text-white font-bold py-3 rounded-full hover:bg-pink-600">Saya Mengerti</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default InputData;