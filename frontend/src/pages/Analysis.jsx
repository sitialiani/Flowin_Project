import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronDown, 
  Lightbulb, 
  Activity, 
  ArrowRight, 
  ArrowLeft,
  X,
  BarChart2
} from 'lucide-react';

const Analysis = () => {
  const navigate = useNavigate();

  // State manajemen
  
  // Load Selected K (Jumlah Cluster)
  const [selectedK, setSelectedK] = useState(() => {
    return localStorage.getItem('analysis_k') || '';
  });

  // Load Show Result
  const [showResult, setShowResult] = useState(() => {
    return localStorage.getItem('analysis_showResult') === 'true';
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showElbowModal, setShowElbowModal] = useState(false);

  // Data Fitur (Statis)
  const featuresList = "Steps, Sleep Hours, Heart Rate, Calories Burned"; 

  // Dummy Data Hasil
  const resultData = [
    { cluster: 0, steps: '10.200', sleep: '7.5 jam', heart: '72 bpm', cal: '2800', interpretasi: 'Aktif dan seimbang' },
    { cluster: 1, steps: '5.300', sleep: '5.8 jam', heart: '89 bpm', cal: '2200', interpretasi: 'Kurang aktif dan stres' },
    { cluster: 2, steps: '8.000', sleep: '6.0 jam', heart: '80 bpm', cal: '2600', interpretasi: 'Aktif tapi kurang tidur' },
  ];

  // Simpan perubahan ke local
  useEffect(() => {
    localStorage.setItem('analysis_k', selectedK);
    localStorage.setItem('analysis_showResult', showResult);
  }, [selectedK, showResult]);


  // Handlers
  const handleAnalyze = () => {
    if (!selectedK) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResult(true);
    }, 1500);
  };

  // animasi
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

      {/* Header */}
      <div className="bg-white py-8 px-4 text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">Analisis Pola Gaya Hidup</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Mengelompokkan pengguna <span className="italic">smartwatch</span> berdasarkan aktivitas fisik, kualitas tidur, dan faktor kesehatan.
        </p>
      </div>

      {/* Konten utama */}
      <main className="w-full max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Pengaturan (kiri) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 h-fit sticky top-28">
            <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100">Pengaturan Cluster</h2>

            {/* Dropdown jumlah cluster */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Pilih jumlah cluster</label>
              <div className="relative">
                <select 
                  value={selectedK}
                  onChange={(e) => {
                    setSelectedK(e.target.value);
                    setShowResult(false); // Reset hasil jika ganti K
                  }}
                  className="w-full p-3 pl-4 pr-10 border border-gray-300 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white text-gray-800 cursor-pointer font-medium"
                >
                  <option value="" disabled>-- Pilih (2-6) --</option>
                  {[2, 3, 4, 5, 6].map(k => (
                    <option key={k} value={k}>{k} Cluster</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
              {!selectedK && (
                <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                  *Wajib dipilih.
                </p>
              )}
            </div>

            {/* Rekomendasi Elbow */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-600 font-medium">Bingung menentukan jumlah cluster?</span>
              </div>
              <button 
                onClick={() => setShowElbowModal(true)}
                className="w-full py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-semibold text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 group"
              >
                Lihat Rekomendasi <span className="text-primary group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>

            {/* Tombol analisis */}
            <div>
              <div className="mb-4">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Fitur Terpilih</p>
                <div className="flex flex-wrap gap-2">
                  {featuresList.split(', ').map((fitur, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md border border-gray-200">
                      {fitur}
                    </span>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleAnalyze}
                disabled={!selectedK || isAnalyzing}
                className={`w-full py-4 rounded-full text-white font-bold text-lg transition-all flex items-center justify-center gap-2
                  ${!selectedK 
                    ? 'bg-gray-200 cursor-not-allowed text-gray-400' 
                    : isAnalyzing 
                      ? 'bg-primary/80 cursor-wait' 
                      : 'bg-primary hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1'
                  }`}
              >
                {isAnalyzing ? (
                  <>
                    <Activity className="animate-spin w-5 h-5" /> Memproses...
                  </>
                ) : (
                  "JALANKAN ANALISIS"
                )}
              </button>
            </div>
          </div>
        </div>


        {/* Hasil (kanan) */}
        <div className="lg:col-span-8 flex flex-col">
           <div className="flex items-center justify-between mb-6">
             <h2 className="text-xl font-bold text-gray-800">Hasil Analisis</h2>
             {showResult && <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full font-medium">Selesai ({selectedK} Cluster)</span>}
           </div>
           
           <div className={`w-full flex-1 rounded-3xl transition-all duration-500 relative overflow-hidden min-h-[500px]
             ${showResult ? 'bg-white border border-gray-200' : 'bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center'}`}>
             
             {!showResult ? (
               <div className="text-center text-gray-400 p-8">
                 <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                   <BarChart2 className="w-10 h-10 text-gray-300" />
                 </div>
                 <p className="text-lg font-medium text-gray-500">Menunggu Analisis</p>
                 <p className="text-sm text-gray-400 mt-1">Silakan pilih cluster dan jalankan analisis.</p>
               </div>
             ) : (
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                 className="flex flex-col h-full"
               >
                 {/* Tabel */}
                 <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                          <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Cluster</th>
                          <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Steps</th>
                          <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Sleep</th>
                          <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Heart Rate</th>
                          <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Calories</th>
                          <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Interpretasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {resultData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="p-5">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm
                                ${idx === 0 ? 'bg-primary' : idx === 1 ? 'bg-[#FF7096]' : 'bg-[#FF9EB8]'}
                              `}>
                                {row.cluster}
                              </div>
                            </td>
                            <td className="p-5 text-gray-800 font-semibold">{row.steps}</td>
                            <td className="p-5 text-gray-600">{row.sleep}</td>
                            <td className="p-5 text-gray-600">{row.heart}</td>
                            <td className="p-5 text-gray-600">{row.cal}</td>
                            <td className="p-5">
                              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border
                                ${idx === 0 ? 'bg-green-50 text-green-700 border-green-100' : idx === 1 ? 'bg-red-50 text-red-700 border-red-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}
                              `}>
                                {row.interpretasi}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>

                 {/* Insight */}
                 <div className="bg-gray-50 p-6 m-6 rounded-2xl border border-gray-100">
                    <h3 className="text-gray-900 font-bold flex items-center gap-2 mb-3">
                      <Lightbulb className="w-5 h-5 text-primary" /> Insight
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Berdasarkan analisis, <strong>Cluster 0</strong> adalah kelompok paling ideal. Sebaliknya, <strong>Cluster 1</strong> memerlukan intervensi gaya hidup.
                    </p>
                 </div>
               </motion.div>
             )}
           </div>
        </div>

      </main>


      {/* MODAL ELBOW */}
      <AnimatePresence>
        {showElbowModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowElbowModal(false)} className="absolute inset-0 bg-white/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-gray-100">
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-black">Metode Elbow</h3>
                  <p className="text-sm text-gray-500">Grafik WCSS untuk menentukan K optimal</p>
                </div>
                <button onClick={() => setShowElbowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6 text-gray-400" /></button>
              </div>

              {/* Grafik Dummy */}
              <div className="w-full h-64 bg-gray-50 rounded-2xl border border-gray-200 relative mb-6 p-6 flex items-end justify-between overflow-hidden">
                <svg className="absolute inset-0 w-full h-full p-6" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polyline points="0,10 25,60 50,85 75,92 100,95" fill="none" stroke="#FF366F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="50" cy="85" r="4" fill="white" stroke="#FF366F" strokeWidth="3" />
                </svg>
                {[2, 3, 4, 5, 6].map((k, i) => (
                    <span key={k} className={`relative z-10 text-xs font-bold ${k === 4 ? 'text-primary' : 'text-gray-400'}`} style={{ left: `${i * 20}%` }}>K={k}</span>
                ))}
              </div>

              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 text-center mb-6">
                 <p className="text-gray-600 text-sm">Rekomendasi Optimal:</p>
                 <p className="text-3xl font-bold text-primary">K = 4 Cluster</p>
              </div>

              <button onClick={() => { setSelectedK(4); setShowElbowModal(false); }} className="w-full bg-primary text-white font-bold py-4 rounded-full hover:bg-pink-600 transition-colors shadow-lg shadow-primary/20">
                Gunakan K = 4
              </button>

            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* Button footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 p-4 z-30">
        <div className="max-w-5xl mx-auto flex gap-4">
          <button 
            onClick={() => navigate('/preprocessing')}
            className="flex-1 py-3 rounded-full bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            Kembali
          </button>
          
          <button 
            onClick={() => showResult ? navigate('/visualization') : alert("Silakan jalankan analisis terlebih dahulu")}
            disabled={!showResult}
            className={`flex-1 py-3 rounded-full font-bold transition-all shadow-lg flex items-center justify-center gap-2
              ${showResult 
                ? 'bg-primary text-white hover:shadow-primary/40 hover:-translate-y-1 cursor-pointer' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
          >
            Lanjut 
          </button>
        </div>
      </div>

    </motion.div>
  );
};

export default Analysis;