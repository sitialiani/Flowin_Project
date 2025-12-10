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
  BarChart2,
  Loader2 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Analysis = () => {
  const navigate = useNavigate();

  // state
  const [selectedK, setSelectedK] = useState(() => localStorage.getItem('analysis_k') || '');
  const [showResult, setShowResult] = useState(() => localStorage.getItem('analysis_showResult') === 'true');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showElbowModal, setShowElbowModal] = useState(false);
  const [isLoadingElbow, setIsLoadingElbow] = useState(false);

  // Data
  const [filename] = useState(localStorage.getItem('final_filename') || '');
  const [elbowData, setElbowData] = useState([]); 
  const [optimalK, setOptimalK] = useState(null); // <--- State K Rekomendasi
  const [clusterResults, setClusterResults] = useState([]); 
  const [featuresList, setFeaturesList] = useState("Steps, Sleep, Heart Rate, Calories");

  // Insight Text
  const [insightText, setInsightText] = useState("Belum ada analisis.");

  useEffect(() => {
    localStorage.setItem('analysis_k', selectedK);
    localStorage.setItem('analysis_showResult', showResult);
  }, [selectedK, showResult]);

  useEffect(() => {
      const savedFeatures = localStorage.getItem('prep_features');
      if (savedFeatures) {
          const parsed = JSON.parse(savedFeatures);
          const active = parsed.filter(f => f.checked).map(f => f.name).join(", ");
          if (active) setFeaturesList(active);
      }
      
      const savedResults = localStorage.getItem('analysis_results');
      if (savedResults) {
          const results = JSON.parse(savedResults);
          setClusterResults(results);
          generateInsight(results); 
      }
  }, []);

  // Mencari K pada elbow
  const findOptimalK = (data) => {
      if (!data || data.length < 3) return 3;

      let maxDist = 0;
      let bestK = 3;
      
      // titik ujung ke ujung
      const first = data[0];
      const last = data[data.length - 1];

      // Hitung jarak siku terjauh (Elbow Point)
      for (let i = 1; i < data.length - 1; i++) {
          const point = data[i];
          
          // Rumus jarak titik ke garis lurus
          const numerator = Math.abs(
              (last.inertia - first.inertia) * point.k - 
              (last.k - first.k) * point.inertia + 
              last.k * first.inertia - 
              last.inertia * first.k
          );
          const denominator = Math.sqrt(
              Math.pow(last.inertia - first.inertia, 2) + 
              Math.pow(last.k - first.k, 2)
          );
          const dist = numerator / denominator;

          if (dist > maxDist) {
              maxDist = dist;
              bestK = point.k;
          }
      }
      return bestK;
  };

  // API handler

  const fetchElbowData = async () => {
    if (!filename) { alert("File preprocessing tidak ditemukan!"); return; }
    setIsLoadingElbow(true);
    try {
        const response = await fetch('http://127.0.0.1:8000/api/analysis/elbow/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: filename })
        });
        const data = await response.json();
        if (response.ok) {
            setElbowData(data.elbow_data);
            
            // Hitung K optimal
            const rekomenK = findOptimalK(data.elbow_data);
            setOptimalK(rekomenK); 
        } else {
            alert("Gagal load elbow: " + data.error);
        }
    } catch (e) {
        alert("Gagal koneksi ke backend");
    } finally {
        setIsLoadingElbow(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedK || !filename) return;
    setIsAnalyzing(true);
    
    try {
        const response = await fetch('http://127.0.0.1:8000/api/analysis/kmeans/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                filename: filename,
                k: parseInt(selectedK)
            })
        });
        const data = await response.json();

        if (response.ok) {
            setClusterResults(data.clusters);
            localStorage.setItem('analysis_results', JSON.stringify(data.clusters));
            generateInsight(data.clusters); 
            
            setTimeout(() => {
                setIsAnalyzing(false);
                setShowResult(true);
            }, 500);
        } else {
            alert("Gagal analisis: " + data.error);
            setIsAnalyzing(false);
        }
    } catch (e) {
        alert("Gagal koneksi ke backend");
        setIsAnalyzing(false);
    }
  };

  // Interpretasi 
  const getValue = (row, keywords) => {
      const key = Object.keys(row).find(k => keywords.some(kw => k.toLowerCase().includes(kw)));
      return key ? row[key] : 0;
  };

  const getLabelColor = (text) => {
      const lower = text.toLowerCase();
      
      if (lower.includes('& sehat') || lower.includes('& seimbang')) {
          return 'bg-green-100 text-green-800 border-green-200';
      }
      
      if (lower.includes('kurang tidur')) {
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      }
      
      if (lower.includes('cukup')) {
          return 'bg-blue-100 text-blue-800 border-blue-200';
      }
      
      return 'bg-red-100 text-red-800 border-red-200';
  };

  const getInterpretation = (row) => {
      const steps = getValue(row, ['step', 'count']);
      const sleep = getValue(row, ['sleep', 'hour']);
            
      if (steps > 10000) {
          if (sleep >= 7) return "Atletis & Sehat"; 
          return "Atletis (Kurang Tidur)"; 
      }
      if (steps > 7000) {
          if (sleep >= 7) return "Sehat & Seimbang";
          return "Aktif (Kurang Tidur)";
      }
      if (steps > 4000) return "Cukup Aktif";
      return "Kurang Aktif (Sedenter)";
  };

  // Insight box
  const generateInsight = (clusters) => {
      if (!clusters || clusters.length === 0) return;
      const getVal = (c, key) => getValue(c, key);
      const healthyCandidates = clusters.filter(c => {
          const sleep = getVal(c, ['sleep', 'hour']);
          const steps = getVal(c, ['step', 'count']);
          return sleep >= 6.5 && steps > 5000;
      });

      let bestCluster;

      if (healthyCandidates.length > 0) {
          bestCluster = healthyCandidates.reduce((prev, current) => 
              (getVal(prev, ['step']) > getVal(current, ['step'])) ? prev : current
          );
      } else {
          bestCluster = clusters.reduce((prev, current) => 
              (getVal(prev, ['step']) > getVal(current, ['step'])) ? prev : current
          );
      }

      // Mencari worst cluster
      const worstCluster = clusters.reduce((prev, current) => 
          (getVal(prev, ['step']) < getVal(current, ['step'])) ? prev : current
      );

      const bestSteps = formatNumber(getVal(bestCluster, ['step']));
      const bestSleep = getVal(bestCluster, ['sleep', 'hour']); // Ambil data tidur juga

      setInsightText(`
        Analisis menemukan <strong>${clusters.length} pola gaya hidup</strong> berbeda.
        <br/><br/>
        <strong>Cluster ${bestCluster.cluster} (Paling Ideal):</strong> Kelompok ini memiliki keseimbangan terbaik dengan 
        rata-rata aktivitas tinggi ${bestSteps} langkah dan istirahat yang cukup ${bestSleep}.
        <br/>
        <strong>Cluster ${worstCluster.cluster} (Perlu Perhatian):</strong> Kelompok dengan aktivitas terendah 
        (rata-rata ${formatNumber(getVal(worstCluster, ['step']))} langkah). Disarankan untuk mulai rutin berjalan kaki.
      `);
  };

  const formatNumber = (num) => new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(num);

  const pageTransition = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.5 }
  };

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-white font-sans flex flex-col pb-24">
      
      <nav className="flex justify-between items-center px-8 md:px-16 py-6 bg-white z-20 sticky top-0">
        <button onClick={() => navigate('/')} className="text-3xl font-bold text-primary tracking-tight">Flowin</button>
        <div className="flex gap-8 font-medium text-lg">
          <button onClick={() => navigate('/')} className="text-gray-500 hover:text-primary transition-colors">Beranda</button>
          <button onClick={() => navigate('/about')} className="text-gray-500 hover:text-primary transition-colors">Tentang Kami</button>
        </div>
      </nav>

      <div className="bg-white py-8 px-4 text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">Analisis Pola Gaya Hidup</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Mengelompokkan pengguna <span className="italic">smartwatch</span> berdasarkan aktivitas fisik, kualitas tidur, dan faktor kesehatan.
        </p>
      </div>

      <main className="w-full max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Panel kiri */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 h-fit sticky top-28">
            <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100">Pengaturan Cluster</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Pilih jumlah cluster</label>
              <div className="relative">
                <select 
                  value={selectedK}
                  onChange={(e) => { setSelectedK(e.target.value); setShowResult(false); }}
                  className="w-full p-3 pl-4 pr-10 border border-gray-300 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white text-gray-800 cursor-pointer font-medium"
                >
                  <option value="" disabled>-- Pilih (2-6) --</option>
                  {[2, 3, 4, 5, 6].map(k => (
                    <option key={k} value={k}>{k} Cluster</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
              {!selectedK && <p className="text-xs text-red-400 mt-2 flex items-center gap-1">*Wajib dipilih.</p>}
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-600 font-medium">Bingung menentukan jumlah cluster?</span>
              </div>
              <button 
                onClick={() => { setShowElbowModal(true); fetchElbowData(); }}
                className="w-full py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-semibold text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 group"
              >
                Lihat Rekomendasi <span className="text-primary group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>

            <div>
              <div className="mb-4">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Fitur Terpilih</p>
                <div className="flex flex-wrap gap-2">
                  {featuresList.split(', ').map((fitur, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md border border-gray-200">{fitur}</span>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleAnalyze}
                disabled={!selectedK || isAnalyzing}
                className={`w-full py-4 rounded-full text-white font-bold text-lg transition-all flex items-center justify-center gap-2
                  ${!selectedK ? 'bg-gray-200 cursor-not-allowed text-gray-400' : isAnalyzing ? 'bg-primary/80 cursor-wait' : 'bg-primary hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1'}`}
              >
                {isAnalyzing ? <><Activity className="animate-spin w-5 h-5" /> Memproses...</> : "JALANKAN ANALISIS"}
              </button>
            </div>
          </div>
        </div>

        {/* panel kanan (hasil) */}
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
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                 
                 {/* tabel data hasil */}
                 <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                          <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Cluster</th>
                          {clusterResults.length > 0 && Object.keys(clusterResults[0]).filter(k => k !== 'cluster').map((key, i) => (
                             <th key={i} className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">{key}</th>
                          ))}
                          <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Interpretasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {clusterResults.map((row, idx) => {
                          const interpretation = getInterpretation(row);
                          
                          return (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="p-5">
                              {/* warna icon cluster */}
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm
                                ${idx === 0 ? 'bg-[#FF366F]' :  // Pink Utama
                                  idx === 1 ? 'bg-purple-500' : // Ungu
                                  idx === 2 ? 'bg-orange-400' : // Oranye
                                  'bg-blue-500'}                // Biru (untuk cluster 3)
                              `}>
                                {row.cluster}
                              </div>
                            </td>
                            
                            {Object.keys(row).filter(k => k !== 'cluster').map((key, i) => (
                                <td key={i} className="p-5 text-gray-800 font-semibold">
                                    {typeof row[key] === 'number' ? formatNumber(row[key]) : row[key]}
                                </td>
                            ))}

                            <td className="p-5">
                              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${getLabelColor(interpretation)}`}>
                                {interpretation}
                              </span>
                            </td>
                          </tr>
                        )})}
                      </tbody>
                    </table>
                 </div>

                 {/* insight box */}
                 <div className="bg-gray-50 p-6 m-6 rounded-2xl border border-gray-100">
                    <h3 className="text-gray-900 font-bold flex items-center gap-2 mb-3">
                      <Lightbulb className="w-5 h-5 text-primary" /> Insight
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: insightText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                 </div>
               </motion.div>
             )}
           </div>
        </div>
      </main>

      {/* modal elbow */}
      <AnimatePresence>
        {showElbowModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowElbowModal(false)} className="absolute inset-0 bg-white/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-gray-100">
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-black">Metode Elbow</h3>
                  <p className="text-sm text-gray-500">Grafik WCSS berdasarkan data kamu</p>
                </div>
                <button onClick={() => setShowElbowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6 text-gray-400" /></button>
              </div>

              <div className="w-full h-64 bg-gray-50 rounded-2xl border border-gray-200 relative mb-6 p-2 flex items-center justify-center overflow-hidden">
                {isLoadingElbow ? (
                    <div className="flex flex-col items-center text-primary">
                        <Loader2 className="animate-spin w-8 h-8 mb-2"/>
                        <span className="text-sm">Menghitung K Optimal...</span>
                    </div>
                ) : elbowData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={elbowData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                            <XAxis dataKey="k" stroke="#9CA3AF" tick={{fontSize: 12}} />
                            <YAxis stroke="#9CA3AF" tick={{fontSize: 10}} width={40} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ color: '#FF366F', fontWeight: 'bold' }}
                            />
                            <Line type="monotone" dataKey="inertia" stroke="#FF366F" strokeWidth={3} dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-red-400 text-sm">Gagal memuat data grafik</p>
                )}
              </div>

              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 text-center mb-6">
                 <p className="text-gray-600 text-sm">Rekomendasi Optimal:</p>
                 <p className="text-3xl font-bold text-primary">
                    {optimalK ? `K = ${optimalK} Cluster` : "Menghitung..."}
                 </p>
                 <p className="text-xs text-gray-400 mt-1">(Titik di mana penurunan WCSS mulai melambat)</p>
              </div>

              {optimalK && (
                  <button onClick={() => { setSelectedK(optimalK); setShowElbowModal(false); }} className="w-full bg-primary text-white font-bold py-4 rounded-full hover:bg-pink-600 transition-colors shadow-lg shadow-primary/20">
                    Gunakan K = {optimalK}
                  </button>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 p-4 z-30">
        <div className="max-w-5xl mx-auto flex gap-4">
          <button onClick={() => navigate('/preprocessing')} className="flex-1 py-3 rounded-full bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">Kembali</button>
          <button onClick={() => showResult ? navigate('/visualization') : alert("Silakan jalankan analisis terlebih dahulu")} disabled={!showResult} className={`flex-1 py-3 rounded-full font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${showResult ? 'bg-primary text-white hover:shadow-primary/40 hover:-translate-y-1 cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}>Lanjut</button>
        </div>
      </div>

    </motion.div>
  );
};

export default Analysis;