import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Info
} from 'lucide-react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const Visualization = () => {
  const navigate = useNavigate();

  // Data dummy
  const scatterDataCluster0 = [
    { x: 9500, y: 7.5, z: 100, user: 'User_01' }, { x: 11000, y: 8.0, z: 120, user: 'User_05' },
    { x: 10200, y: 7.2, z: 110, user: 'User_12' }, { x: 9800, y: 7.8, z: 90, user: 'User_33' },
    { x: 12000, y: 8.2, z: 130, user: 'User_45' },
  ];
  const scatterDataCluster1 = [
    { x: 4000, y: 5.5, z: 200, user: 'User_02' }, { x: 3500, y: 5.0, z: 180, user: 'User_08' },
    { x: 5200, y: 6.0, z: 190, user: 'User_19' }, { x: 4800, y: 5.2, z: 210, user: 'User_24' },
  ];
  const scatterDataCluster2 = [
    { x: 7500, y: 5.8, z: 300, user: 'User_03' }, { x: 8200, y: 6.2, z: 280, user: 'User_11' },
    { x: 8000, y: 5.5, z: 290, user: 'User_22' }, { x: 7800, y: 6.0, z: 270, user: 'User_44' },
  ];

  const barData = [
    { name: 'Steps', c0: 90, c1: 40, c2: 75 },
    { name: 'Sleep', c0: 85, c1: 50, c2: 60 },
    { name: 'Heart Rate', c0: 60, c1: 90, c2: 80 }, 
    { name: 'Calories', c0: 88, c1: 45, c2: 70 },
  ];

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
      <div className="bg-white py-8 px-4 text-center mb-2">
        <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">Visualisasi Hasil Analisis</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Temukan pola gaya hidup kamu melalui grafik interaktif berdasarkan hasil clustering.
        </p>
      </div>

      {/* Konten utama */}
      <main className="w-full max-w-7xl mx-auto px-4 md:px-8 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
          
          {/* Grafik */}
          <div className="lg:col-span-9 flex flex-col gap-12">
            
            {/* Visualisasi satu */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">A. Visualisasi 1: Distribusi Cluster</h2>
              <div className="bg-gray-100 rounded-3xl border border-gray-200 h-[400px] p-4 mb-4">
                 <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D1D5DB" />
                    <XAxis type="number" dataKey="x" name="Steps" unit=" steps" tick={{fill: '#6B7280', fontSize: 12}} />
                    <YAxis type="number" dataKey="y" name="Sleep" unit=" hrs" tick={{fill: '#6B7280', fontSize: 12}} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{borderRadius: '8px', border: 'none'}} />
                    <Scatter name="Cluster 0" data={scatterDataCluster0} fill="#FF366F" />
                    <Scatter name="Cluster 1" data={scatterDataCluster1} fill="#FFA3B5" />
                    <Scatter name="Cluster 2" data={scatterDataCluster2} fill="#9CA3AF" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-gray-200 rounded-2xl p-6 border border-gray-300">
                 <h4 className="text-gray-800 font-bold text-sm mb-2 flex items-center gap-2">
                   <Info className="w-4 h-4" /> Ringkasan hasil analisis visual
                 </h4>
                 <p className="text-gray-600 text-sm leading-relaxed">
                   Penyebaran data menunjukkan pengelompokan yang jelas. Cluster 0 (Merah) mendominasi area kanan atas yang menandakan aktivitas tinggi dan tidur cukup.
                 </p>
              </div>
            </div>

            {/* Visualisasi kedua */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">B. Visualisasi 2: Perbandingan Rata-rata</h2>
              <div className="bg-gray-100 rounded-3xl border border-gray-200 h-[400px] p-4 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D1D5DB"/>
                    <XAxis dataKey="name" tick={{fill: '#6B7280', fontSize: 12}} />
                    <YAxis tick={{fill: '#6B7280', fontSize: 12}} />
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none'}} />
                    <Bar dataKey="c0" name="Cluster 0" fill="#FF366F" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="c1" name="Cluster 1" fill="#FFA3B5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="c2" name="Cluster 2" fill="#9CA3AF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-200 rounded-2xl p-6 border border-gray-300">
                 <h4 className="text-gray-800 font-bold text-sm mb-2 flex items-center gap-2">
                   <Info className="w-4 h-4" /> Ringkasan hasil analisis visual
                 </h4>
                 <p className="text-gray-600 text-sm leading-relaxed">
                   Terlihat perbedaan signifikan pada <strong>Steps</strong> dan <strong>Calories</strong>. Hal ini menegaskan bahwa aktivitas fisik menjadi faktor pembeda utama antar cluster.
                 </p>
              </div>
            </div>
          </div>

          {/* Legenda */}
          <div className="lg:col-span-3">
             <div className="sticky top-32 space-y-6">
                <div className="bg-gray-100 rounded-3xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-gray-800 font-bold mb-4 border-b border-gray-300 pb-2">Legenda Cluster</h3>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded-full bg-[#FF366F] mt-1 shrink-0"></div>
                      <div>
                         <div className="text-sm text-gray-800 font-bold">Cluster 0</div>
                         <div className="text-xs text-gray-500">Aktif & Seimbang</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded-full bg-[#FFA3B5] mt-1 shrink-0"></div>
                      <div>
                         <div className="text-sm text-gray-800 font-bold">Cluster 1</div>
                         <div className="text-xs text-gray-500">Kurang Aktif</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded-full bg-[#9CA3AF] mt-1 shrink-0"></div>
                      <div>
                         <div className="text-sm text-gray-800 font-bold">Cluster 2</div>
                         <div className="text-xs text-gray-500">Kurang Tidur</div>
                      </div>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* Button bawah */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 p-4 z-30">
        <div className="max-w-5xl mx-auto flex gap-4">
          <button 
            onClick={() => navigate('/analysis')}
            className="flex-1 py-3 rounded-full bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            Kembali
          </button>
          
          <button 
            onClick={() => navigate('/about')}
            className="flex-1 py-3 rounded-full bg-primary text-white font-bold hover:shadow-primary/40 hover:shadow-lg hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
          >
            Lanjut
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Visualization;