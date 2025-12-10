import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ListFilter, 
  Scaling, 
  CheckCircle, 
  Lock, 
  Loader2 
} from 'lucide-react';

const initialStepsData = [
  { id: 1, title: 'Data Cleaning', icon: <Sparkles className="w-8 h-8"/>, status: 'active', desc: 'Menghapus missing value dan duplikat.' },
  { id: 2, title: 'Feature Selection', icon: <ListFilter className="w-8 h-8"/>, status: 'locked', desc: 'Memilih fitur utama untuk analisis.' },
  { id: 3, title: 'Normalization', icon: <Scaling className="w-8 h-8"/>, status: 'locked', desc: 'Menyamakan skala variabel numerik.' },
];

const Preprocessing = () => {
  const navigate = useNavigate();
  const FLIP_DURATION = 0.4; 

  // state manajemen
  const [steps, setSteps] = useState(() => {
    try {
      const savedSteps = localStorage.getItem('prep_steps');
      return savedSteps ? JSON.parse(savedSteps) : initialStepsData;
    } catch { return initialStepsData; }
  });

  const [showResult, setShowResult] = useState(() => {
    try { return localStorage.getItem('prep_showResult') === 'true'; } catch { return false; }
  });

  const [flippedCard, setFlippedCard] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [filename] = useState(localStorage.getItem('uploaded_filename') || '');
  const [cleanFilename, setCleanFilename] = useState(localStorage.getItem('clean_filename') || '');
  
  const [cleanStats, setCleanStats] = useState({ 
    initial: 0, 
    duplicates: 0, 
    missing: 0, 
    final: 0 
  });
  
  const [features, setFeatures] = useState([]);
  const [finalPreview, setFinalPreview] = useState([]); 
  const [finalColumns, setFinalColumns] = useState([]); 
  const [hasCleaned, setHasCleaned] = useState(false);

  useEffect(() => {
    localStorage.setItem('prep_steps', JSON.stringify(steps));
    localStorage.setItem('prep_showResult', showResult);
    if (cleanFilename) localStorage.setItem('clean_filename', cleanFilename);
    if (features.length > 0) localStorage.setItem('prep_features', JSON.stringify(features));
  }, [steps, showResult, cleanFilename, features]);

  useEffect(() => {
      const savedFeatures = localStorage.getItem('prep_features');
      if (savedFeatures) setFeatures(JSON.parse(savedFeatures));
      
      const savedStats = localStorage.getItem('prep_stats');
      if (savedStats) {
          const stats = JSON.parse(savedStats);
          setCleanStats(stats);
          if (stats.final > 0) setHasCleaned(true);
      }
  }, []);

  useEffect(() => {
    const lastStep = steps[steps.length - 1];
    if (lastStep.status === 'done' && !showResult) setShowResult(true);
  }, [steps]); 

  // API backend
  // cleaning
  const runCleaning = async (index) => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/preprocess/cleaning/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: filename })
      });
      const data = await response.json();

      if (response.ok) {
        const newStats = {
          initial: data.initial_rows,
          duplicates: data.duplicates,
          missing: data.missing_values,
          final: data.final_rows
        };
        setCleanStats(newStats);
        localStorage.setItem('prep_stats', JSON.stringify(newStats));
        setCleanFilename(data.clean_filename);
        
        const dynamicFeatures = data.columns.map(col => ({ name: col, checked: true }));
        setFeatures(dynamicFeatures);

        setHasCleaned(true); 
      } else {
        alert("Gagal cleaning: " + data.error);
      }
    } catch (e) {
      alert("Gagal terhubung ke backend (Cleaning)");
    } finally {
      setLoading(false);
    }
  };

  // scaling
  const runScaling = async (index) => {
    setLoading(true);
    const selectedFeatures = features.filter(f => f.checked).map(f => f.name);

    if (selectedFeatures.length === 0) {
        alert("Pilih minimal 1 fitur!");
        setLoading(false);
        return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/preprocess/scaling/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          filename: cleanFilename, 
          features: selectedFeatures 
        })
      });
      const data = await response.json();

      if (response.ok) {
        setFinalPreview(data.preview);
        setFinalColumns(data.columns);
        localStorage.setItem('final_filename', data.final_filename); 
        finishStepAnimation(index); 
      } else {
        alert("Gagal scaling: " + data.error);
      }
    } catch (e) {
      alert("Gagal terhubung ke backend (Scaling)");
    } finally {
      setLoading(false);
    }
  };

  // logika tombol
  const handleCardClick = (index) => {
    const step = steps[index];
    if (step.status === 'locked' || loading) return;
    if (step.status === 'done' && !showResult) return;

    if (flippedCard === index) {
      setFlippedCard(null); 
    } else {
      setFlippedCard(index); 
    }
  };

  const handleProcessStep = (index, e) => {
    e.stopPropagation();

    // cleaning
    if (index === 0) {
        // Jika belum pernah cleaning (atau data kosong), jalankan API
        if (!hasCleaned && cleanStats.final === 0) {
            runCleaning(index);
        } else {
            finishStepAnimation(index);
        }
    } 
    // feature
    else if (index === 1) {
        finishStepAnimation(index);
    } 
    // scaling
    else if (index === 2) {
        runScaling(index);
    }
  };

  const finishStepAnimation = (index) => {
    setFlippedCard(null); 
    setTimeout(() => {
      setSteps(prevSteps => {
        const newSteps = [...prevSteps];
        if (newSteps[index].status === 'done') return newSteps;
        newSteps[index] = { ...newSteps[index], status: 'done' };
        if (index + 1 < newSteps.length) {
          newSteps[index + 1] = { ...newSteps[index + 1], status: 'active' };
        }
        return newSteps;
      });
    }, FLIP_DURATION * 1000); 
  };

  const toggleFeature = (idx) => {
    const newF = [...features];
    newF[idx].checked = !newF[idx].checked;
    setFeatures(newF);
  };

  // Helper untuk teks tombol
  const getButtonText = (index, status) => {
      if (loading) return <Loader2 className="animate-spin w-4 h-4"/>;
      if (status === 'done') return 'Tutup';
      if (index === 0 && (hasCleaned || cleanStats.final > 0)) return 'Selesai';
      
      return 'Proses';
  };

  const pageTransition = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.5 }
  };

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-white font-sans flex flex-col pb-28">
      <nav className="flex justify-between items-center px-8 md:px-16 py-6 bg-white z-20 sticky top-0">
        <button onClick={() => navigate('/')} className="text-3xl font-bold text-primary tracking-tight">Flowin</button>
        <div className="flex gap-8 font-medium text-lg">
          <button onClick={() => navigate('/')} className="text-gray-500 hover:text-primary transition-colors">Beranda</button>
          <button onClick={() => navigate('/about')} className="text-gray-500 hover:text-primary transition-colors">Tentang Kami</button>
        </div>
      </nav>

      <div className="text-center mt-4 mb-10 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-black mb-3">Preprocessing Data</h1>
        <p className="text-gray-600 text-lg">Langkah awal untuk memastikan data <span className="italic">smartwatch</span> kamu siap dianalisis.</p>
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 perspective-1000">
        {steps.map((step, index) => (
          <div key={step.id} className="relative h-[320px] w-full cursor-pointer group perspective-1000" onClick={() => handleCardClick(index)}>
            <motion.div className="w-full h-full relative preserve-3d" animate={{ rotateY: flippedCard === index ? 180 : 0 }} transition={{ duration: FLIP_DURATION, ease: "easeInOut" }}>
              
              {/* front card */}
              <div className={`absolute inset-0 backface-hidden rounded-3xl shadow-lg border p-8 flex flex-col items-center justify-center text-center gap-4 bg-gray-50 transition-colors duration-300
                ${step.status === 'active' ? 'border-primary ring-2 ring-primary/20 bg-white hover:scale-[1.02] transition-transform' : ''}
                ${step.status === 'locked' ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''}
                ${step.status === 'done' ? 'border-green-500 bg-green-50' : ''}`}>
                
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 transition-colors
                  ${step.status === 'active' ? 'bg-pink-100 text-primary' : ''}
                  ${step.status === 'locked' ? 'bg-gray-200 text-gray-400' : ''}
                  ${step.status === 'done' ? 'bg-green-100 text-green-600' : ''}`}>
                  {step.status === 'done' ? <CheckCircle className="w-8 h-8"/> : 
                   step.status === 'locked' ? <Lock className="w-7 h-7"/> : step.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                <div className="mt-4">
                  {step.status === 'active' && <span className="text-primary font-bold text-sm animate-pulse">Klik untuk memproses</span>}
                  {step.status === 'done' && <span className="text-green-600 font-bold text-sm">Selesai</span>}
                  {step.status === 'locked' && <span className="text-gray-400 text-xs uppercase tracking-wide">Terkunci</span>}
                </div>
              </div>

              {/* back card */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl shadow-xl bg-white border-2 border-primary p-6 flex flex-col items-center justify-between">
                <h4 className="text-lg font-bold text-primary border-b pb-2 w-full text-center">{step.title}</h4>
                <div className="flex-1 w-full flex flex-col items-center justify-center py-2">
                  
                  {/* cleaning */}
                  {index === 0 && (
                    <div className="space-y-2 text-center w-full">
                       {/* menampilkan statistik jika status done atau cleaned */}
                       {step.status === 'done' || hasCleaned || cleanStats.final > 0 ? (
                         <div className="text-sm">
                           <div className="flex justify-between text-gray-600 bg-gray-50 p-2 rounded mb-1">
                                <span>Data Awal:</span> <span className="font-bold">{cleanStats.initial}</span>
                           </div>
                           <div className="flex justify-between text-gray-600 px-2 mb-1">
                                <span>Duplikat:</span> <span className="font-bold text-red-500">-{cleanStats.duplicates}</span>
                           </div>
                           <div className="flex justify-between text-gray-600 px-2 mb-2">
                                <span>Missing:</span> <span className="font-bold text-red-500">-{cleanStats.missing}</span>
                           </div>
                           <p className="border-t pt-2 font-bold text-green-600 text-lg">Bersih: {cleanStats.final}</p>
                         </div>
                       ) : (
                         <p className="text-sm text-gray-600">Klik tombol di bawah untuk membersihkan data otomatis.</p>
                       )}
                    </div>
                  )}

                  {/* feature selection */}
                  {index === 1 && (
                    <div className="w-full space-y-2 max-h-[140px] overflow-y-auto pr-1">
                      <p className="text-xs text-gray-400 text-center mb-2">Pilih fitur ({features.length}):</p>
                      {features.length === 0 ? (
                          <p className="text-xs text-red-400 text-center">Data belum dibersihkan</p>
                      ) : (
                          features.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 bg-gray-50 p-2 rounded cursor-pointer hover:bg-pink-50"
                                onClick={(e) => { e.stopPropagation(); if (step.status !== 'done') toggleFeature(i); }}>
                              <input type="checkbox" checked={f.checked} readOnly className="accent-primary w-4 h-4"/>
                              <span className="text-xs md:text-sm text-gray-700 truncate max-w-[150px]">{f.name}</span>
                            </div>
                          ))
                      )}
                    </div>
                  )}

                  {/* normalisasi */}
                  {index === 2 && (
                    <div className="text-center">
                      <div className="w-14 h-14 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-2">
                        <Scaling className="text-green-500 w-7 h-7" />
                      </div>
                      <p className="text-xs text-gray-600 mb-2">Min-Max Scaling (0-1)</p>
                      <div className="text-[10px] text-gray-400 bg-gray-100 p-2 rounded leading-tight">
                        Transformasi nilai numerik agar memiliki bobot yang setara.
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={(e) => handleProcessStep(index, e)}
                  disabled={loading} 
                  className={`w-full py-2 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2
                    ${step.status === 'done' 
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                      : (index === 0 && (hasCleaned || cleanStats.final > 0) ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-primary text-white hover:bg-pink-600 hover:shadow-lg')
                    }`}
                >
                  {getButtonText(index, step.status)}
                </button>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showResult && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full max-w-5xl mx-auto px-4 mt-4">
            <h2 className="text-2xl font-bold text-black mb-4">Hasil Data Setelah Preprocessing</h2>
            <div className="w-full overflow-x-auto border border-gray-200 rounded-2xl bg-white shadow-sm">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 font-bold text-gray-700 border-b text-sm">#</th>
                    {finalColumns.map((col, i) => (
                         <th key={i} className="p-4 font-bold text-gray-700 border-b text-sm uppercase tracking-wider">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  {finalPreview.map((row, i) => (
                    <tr key={i} className="hover:bg-pink-50 transition-colors border-b last:border-0">
                      <td className="p-4 text-xs font-medium text-gray-400">{i + 1}</td>
                      {finalColumns.map((col, j) => (
                        <td key={j} className="p-4 text-sm font-mono text-blue-600">
                            {typeof row[col] === 'number' ? row[col].toFixed(4) : row[col]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 z-30">
        <div className="max-w-5xl mx-auto flex gap-4">
          <button onClick={() => navigate('/input')} className="flex-1 py-3 rounded-full bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">Kembali</button>
          <button onClick={() => showResult ? navigate('/analysis') : null} disabled={!showResult} className={`flex-1 py-3 rounded-full font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${showResult ? 'bg-primary text-white hover:shadow-primary/40 hover:-translate-y-1 cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Lanjut</button>
        </div>
      </div>
    </motion.div>
  );
};

export default Preprocessing;