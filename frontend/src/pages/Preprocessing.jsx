import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ListFilter, 
  Scaling, 
  CheckCircle, 
  Lock, 
  ArrowRight, 
  ArrowLeft
} from 'lucide-react';

// Agar tidak di-recreate setiap render
const initialStepsData = [
  { id: 1, title: 'Data Cleaning', icon: <Sparkles className="w-8 h-8"/>, status: 'active', desc: 'Menghapus missing value dan duplikat.' },
  { id: 2, title: 'Feature Selection', icon: <ListFilter className="w-8 h-8"/>, status: 'locked', desc: 'Memilih fitur utama untuk analisis.' },
  { id: 3, title: 'Normalization', icon: <Scaling className="w-8 h-8"/>, status: 'locked', desc: 'Menyamakan skala variabel numerik.' },
];

const Preprocessing = () => {
  const navigate = useNavigate();
  const FLIP_DURATION = 0.4; 

  // Manajemen state
  
  // Load Steps dari LocalStorage
  const [steps, setSteps] = useState(() => {
    try {
      const savedSteps = localStorage.getItem('prep_steps');
      if (savedSteps) {
        const parsed = JSON.parse(savedSteps);
        if (Array.isArray(parsed) && parsed.length === initialStepsData.length) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Gagal load steps, pakai default");
    }
    return initialStepsData;
  });

  // Load ShowResult dari LocalStorage
  const [showResult, setShowResult] = useState(() => {
    try {
      return localStorage.getItem('prep_showResult') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [flippedCard, setFlippedCard] = useState(null);

  // State Fitur (Default)
  const [features, setFeatures] = useState([
    { name: 'Steps', checked: true },
    { name: 'Heart Rate', checked: true },
    { name: 'Sleep Quality', checked: true },
    { name: 'Calories', checked: false },
  ]);

  // Simpan perubahan ke local
  useEffect(() => {
    localStorage.setItem('prep_steps', JSON.stringify(steps));
    localStorage.setItem('prep_showResult', showResult);
  }, [steps, showResult]);

  // Jika user kembali ke halaman ini dan step terakhir sudah done,
  // ShowResult bernilai true agar tabel muncul.
  useEffect(() => {
    const lastStep = steps[steps.length - 1];
    if (lastStep.status === 'done' && !showResult) {
      setShowResult(true);
    }
  }, [steps]); 


  // Handlers
  const handleCardClick = (index) => {
    const step = steps[index];

    // Jika terkunci, diam saja
    if (step.status === 'locked') return;

    // Jika sudah selesai tapi hasil belum muncul (lagi proses animasi), jangan klik
    // TAPI jika showResult sudah true (semua selesai), user boleh buka tutup untuk review
    if (step.status === 'done' && !showResult) return;

    // Logika Flip
    if (flippedCard === index) {
      setFlippedCard(null); 
    } else {
      setFlippedCard(index); 
    }
  };

  const handleCompleteStep = (index, e) => {
    e.stopPropagation(); 
    setFlippedCard(null); 

    // Tunggu animasi flip selesai, baru update status
    setTimeout(() => {
      setSteps(prevSteps => {
        const newSteps = [...prevSteps];
        const currentStep = newSteps[index];

        // Jika status sudah done, tidak perlu update lagi
        if (currentStep.status === 'done') return newSteps;

        // Update status step ini jadi done
        newSteps[index] = { ...currentStep, status: 'done' };

        // Buka kunci step berikutnya
        if (index + 1 < newSteps.length) {
          newSteps[index + 1] = { ...newSteps[index + 1], status: 'active' };
        }
        
        return newSteps;
      });

      // Jika ini adalah step terakhir, tampilkan hasil
      if (index === steps.length - 1) {
        setShowResult(true);
      }

    }, FLIP_DURATION * 1000); 
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
      className="min-h-screen bg-white font-sans flex flex-col pb-28"
    >
      
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 md:px-16 py-6 z-20">
        <button onClick={() => navigate('/')} className="text-3xl font-bold text-primary tracking-tight">Flowin</button>
        <div className="flex gap-8 font-medium text-lg">
          <button onClick={() => navigate('/')} className="text-gray-500 hover:text-primary transition-colors">Beranda</button>
          <button onClick={() => navigate('/about')} className="text-gray-500 hover:text-primary transition-colors">Tentang Kami</button>
        </div>
      </nav>

      {/* Header */}
      <div className="text-center mt-4 mb-10 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-black mb-3">Preprocessing Data</h1>
        <p className="text-gray-600 text-lg">Langkah awal untuk memastikan data <span className="italic">smartwatch</span> kamu siap dianalisis.</p>
      </div>

      {/* Grid Card */}
      <div className="w-full max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 perspective-1000">
        {steps.map((step, index) => (
          <div 
            key={step.id} 
            className="relative h-[320px] w-full cursor-pointer group perspective-1000"
            onClick={() => handleCardClick(index)}
          >
            {/* Flip Container */}
            <motion.div 
              className="w-full h-full relative preserve-3d"
              animate={{ rotateY: flippedCard === index ? 180 : 0 }}
              transition={{ 
                duration: FLIP_DURATION, 
                ease: "easeInOut" 
              }}
            >
              
              {/* Bagian depan card */}
              <div className={`absolute inset-0 backface-hidden rounded-3xl shadow-lg border p-8 flex flex-col items-center justify-center text-center gap-4 bg-gray-50 transition-colors duration-300
                ${step.status === 'active' ? 'border-primary ring-2 ring-primary/20 bg-white hover:scale-[1.02] transition-transform' : ''}
                ${step.status === 'locked' ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''}
                ${step.status === 'done' ? 'border-green-500 bg-green-50' : ''}
              `}>
                
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 transition-colors
                  ${step.status === 'active' ? 'bg-pink-100 text-primary' : ''}
                  ${step.status === 'locked' ? 'bg-gray-200 text-gray-400' : ''}
                  ${step.status === 'done' ? 'bg-green-100 text-green-600' : ''}
                `}>
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


              {/* Bagian belakang card */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl shadow-xl bg-white border-2 border-primary p-6 flex flex-col items-center justify-between">
                
                <h4 className="text-lg font-bold text-primary border-b pb-2 w-full text-center">{step.title}</h4>

                <div className="flex-1 w-full flex flex-col items-center justify-center py-2">
                  
                  {/* Cleaning */}
                  {index === 0 && (
                    <div className="space-y-3 text-center w-full">
                      <div className="flex justify-between text-sm text-gray-500 bg-gray-50 p-2 rounded">
                        <span>Data Awal:</span> <span className="font-bold text-black">1000</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 bg-gray-50 p-2 rounded">
                        <span>Duplikat:</span> <span className="font-bold text-red-500">-12</span>
                      </div>
                      <div className="h-[1px] bg-gray-200 my-1"></div>
                      <div className="flex justify-between text-base font-bold text-primary">
                        <span>Bersih:</span> <span>983</span>
                      </div>
                    </div>
                  )}

                  {/* Feature Selection */}
                  {index === 1 && (
                    <div className="w-full space-y-2 max-h-[140px] overflow-y-auto pr-1">
                      <p className="text-xs text-gray-400 text-center mb-2">Pilih fitur:</p>
                      {features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 bg-gray-50 p-2 rounded cursor-pointer hover:bg-pink-50"
                             onClick={(e) => {
                               e.stopPropagation(); 
                               if (step.status === 'done') return; 
                               const newF = [...features]; newF[i].checked = !newF[i].checked; setFeatures(newF);
                             }}>
                          <input type="checkbox" checked={f.checked} readOnly className="accent-primary w-4 h-4"/>
                          <span className="text-sm text-gray-700">{f.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* normalization */}
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
                  onClick={(e) => handleCompleteStep(index, e)}
                  className={`w-full py-2 rounded-full font-bold text-sm transition-all
                    ${step.status === 'done' 
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                      : 'bg-primary text-white hover:bg-pink-600 hover:shadow-lg' 
                    }`}
                >
                  {step.status === 'done' ? 'Tutup' : 'Selesai'}
                </button>
              </div>

            </motion.div>
          </div>
        ))}
      </div>


      {/* Hasil tabel */}
      <AnimatePresence>
        {showResult && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }} 
            className="w-full max-w-5xl mx-auto px-4 mt-4"
          >
            <h2 className="text-2xl font-bold text-black mb-4">Hasil Data Setelah Preprocessing</h2>
            
            <div className="w-full overflow-x-auto border border-gray-200 rounded-2xl bg-white shadow-sm">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="bg-gray-50">
                  <tr>
                    {['ID', 'Steps (Norm)', 'Heart Rate (Norm)', 'Sleep (Norm)', 'Calories (Raw)'].map((head) => (
                      <th key={head} className="p-4 font-bold text-gray-700 border-b text-sm uppercase tracking-wider">{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="hover:bg-pink-50 transition-colors border-b last:border-0">
                      <td className="p-4 text-sm">#00{i + 1}</td>
                      <td className="p-4 text-sm font-mono text-blue-600">{(Math.random()).toFixed(4)}</td>
                      <td className="p-4 text-sm font-mono text-blue-600">{(Math.random()).toFixed(4)}</td>
                      <td className="p-4 text-sm font-mono text-blue-600">{(Math.random()).toFixed(4)}</td>
                      <td className="p-4 text-sm">2{Math.floor(Math.random() * 900)} kcal</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Navigasi */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 z-30">
        <div className="max-w-5xl mx-auto flex gap-4">
          <button 
            onClick={() => navigate('/input')}
            className="flex-1 py-3 rounded-full bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            Kembali
          </button>
          
          <button 
            onClick={() => showResult ? navigate('/analysis') : null}
            disabled={!showResult}
            className={`flex-1 py-3 rounded-full font-bold transition-all shadow-lg flex items-center justify-center gap-2
              ${showResult 
                ? 'bg-primary text-white hover:shadow-primary/40 hover:-translate-y-1 cursor-pointer' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            Lanjut 
          </button>
        </div>
      </div>

    </motion.div>
  );
};

export default Preprocessing;