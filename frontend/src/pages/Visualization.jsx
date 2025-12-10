import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Lightbulb, 
  Loader2
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from 'recharts';

const Visualization = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const filename = localStorage.getItem('final_filename');

  const COLORS = ['#FF366F', '#A855F7', '#FB923C', '#3B82F6', '#10B981'];

  useEffect(() => {
    const fetchData = async () => {
      if (!filename) {
          alert("Data tidak ditemukan. Harap lakukan analisis dulu.");
          navigate('/analysis');
          return;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/api/visualization/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: filename })
        });
        const result = await response.json();

        if (response.ok) {
          setData(result);
        } else {
          alert("Gagal memuat visualisasi: " + result.error);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filename, navigate]);

  const getValue = (row, keywords) => {
      if (!row) return 0;
      const key = Object.keys(row).find(k => keywords.some(kw => k.toLowerCase().includes(kw)));
      return key ? row[key] : 0;
  };

  // logika interpretasi
  const getLabelInfo = (clusterStats) => {
      const steps = getValue(clusterStats, ['step', 'count']);
      const sleep = getValue(clusterStats, ['sleep', 'hour']);

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

  const processRadarData = (rawData) => {
      if (!rawData) return [];
      const keys = Object.keys(rawData[0]).filter(k => k !== 'cluster');
      const maxValues = {};
      keys.forEach(key => {
          maxValues[key] = Math.max(...rawData.map(d => d[key]));
      });

      return keys.map(key => {
          const obj = { subject: key };
          rawData.forEach((cluster) => {
              obj[`Cluster ${cluster.cluster}`] = (cluster[key] / maxValues[key]) * 100;
              obj[`real_${cluster.cluster}`] = cluster[key];
          });
          return obj;
      });
  };

  const radarData = data ? processRadarData(data.radar_data) : [];

  const pageTransition = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.5 }
  };

  if (loading) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Sedang menyiapkan grafik...</p>
        </div>
      );
  }

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-white font-sans flex flex-col pb-24">
      
      <nav className="flex justify-between items-center px-8 md:px-16 py-6 bg-white z-20 sticky top-0">
        <button onClick={() => navigate('/')} className="text-3xl font-bold text-primary tracking-tight">Flowin</button>
        <div className="flex gap-8 font-medium text-lg">
          <button onClick={() => navigate('/')} className="text-gray-500 hover:text-primary transition-colors">Beranda</button>
          <button onClick={() => navigate('/about')} className="text-gray-500 hover:text-primary transition-colors">Tentang Kami</button>
        </div>
      </nav>

      <div className="bg-white py-8 px-4 text-center mb-2">
        <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">Visualisasi Hasil Analisis</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Temukan pola gaya hidup kamu melalui grafik interaktif berdasarkan hasil clustering (K={data?.radar_data.length}).
        </p>
      </div>

      <main className="w-full max-w-7xl mx-auto px-4 md:px-8 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
          
          <div className="lg:col-span-9 flex flex-col gap-10">
            
            {/* pie chart */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">A. Distribusi Populasi (Donut Chart)</h2>
              <div className="bg-white rounded-3xl border border-gray-200 h-[400px] p-4 mb-4 relative shadow-sm">
                 <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data?.pie_data} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                      {data?.pie_data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} Orang`, 'Jumlah']} contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                  </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-4xl font-bold text-gray-800">{data?.total_users}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-widest">Total User</span>
                 </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                 <h4 className="text-slate-800 font-bold text-sm mb-2 flex items-center gap-2">
                  Insight & Analisis
                 </h4>
                 <p className="text-slate-600 text-sm leading-relaxed">
                   Grafik Donat menunjukkan seberapa besar porsi setiap kelompok. Jika salah satu potongan sangat besar, artinya mayoritas pengguna memiliki gaya hidup tersebut.
                 </p>
              </div>
            </div>

            {/* radar chart */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">B. Profil Karakteristik (Radar Chart)</h2>
              <div className="bg-white rounded-3xl border border-gray-200 h-[450px] p-4 mb-4 shadow-sm">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    {data?.pie_data.map((entry, index) => (
                        <Radar
                          key={index}
                          name={entry.name}
                          dataKey={entry.name}
                          stroke={COLORS[index % COLORS.length]}
                          fill={COLORS[index % COLORS.length]}
                          fillOpacity={0.1}
                        />
                    ))}
                    <Legend />
                    <Tooltip formatter={(value, name, props) => {
                        const clusterIndex = name.split(' ')[1];
                        const realVal = props.payload[`real_${clusterIndex}`];
                        return [new Intl.NumberFormat('id-ID').format(realVal), name];
                    }} contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}/>
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                 <h4 className="text-slate-800 font-bold text-sm mb-2 flex items-center gap-2">
                  Insight & Analisis
                 </h4>
                 <p className="text-slate-600 text-sm leading-relaxed">
                   Grafik Radar membantu melihat "bentuk" kekuatan setiap cluster. Semakin luas jaring ke arah luar pada label tertentu (misal: Steps), semakin dominan fitur tersebut di cluster itu.
                 </p>
              </div>
            </div>

            {/* bar chart */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">C. Perbandingan Aktivitas (Bar Chart)</h2>
              <div className="bg-white rounded-3xl border border-gray-200 h-[450px] p-6 mb-4 shadow-sm">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.radar_data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                    <XAxis dataKey="cluster" tickFormatter={(val) => `Cluster ${val}`} tick={{fill: '#6B7280', fontSize: 12}} />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" label={{ value: 'Steps', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#fb923c" label={{ value: 'Calories', angle: 90, position: 'insideRight' }} />
                    <Tooltip contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}} formatter={(value) => new Intl.NumberFormat('id-ID').format(value)}/>
                    <Legend />
                    <Bar yAxisId="left" dataKey={(d) => getValue(d, ['step'])} name="Langkah" fill="#8884d8" radius={[6, 6, 0, 0]} barSize={40} />
                    <Bar yAxisId="right" dataKey={(d) => getValue(d, ['calor'])} name="Kalori" fill="#fb923c" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                 <h4 className="text-slate-800 font-bold text-sm mb-2 flex items-center gap-2">
                  Insight & Analisis
                 </h4>
                 <p className="text-slate-600 text-sm leading-relaxed">
                   Membandingkan Steps (Ungu) dan Calories (Oranye) secara berdampingan. Korelasi positif biasanya terlihat (batang ungu tinggi = batang oranye tinggi).
                 </p>
              </div>
            </div>

          </div>

          {/* legenda */}
          <div className="lg:col-span-3">
              <div className="sticky top-32 space-y-6">
                 <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xl shadow-gray-100/50">
                   <h3 className="text-gray-800 font-bold mb-4 border-b border-gray-100 pb-4 text-lg">Legenda Cluster</h3>
                   <div className="flex flex-col gap-4">
                     {data?.radar_data.map((cluster, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                          <div className="w-10 h-10 rounded-xl mt-1 shrink-0 flex items-center justify-center text-white font-bold shadow-sm"
                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}>
                              {cluster.cluster}
                          </div>
                          <div>
                              <div className="text-sm text-gray-900 font-bold">Cluster {cluster.cluster}</div>
                              <div className="text-xs text-gray-500 mt-1 font-medium bg-slate-100 px-2 py-1 rounded-md inline-block border border-slate-200">
                                  {getLabelInfo(cluster)}
                              </div>
                              <div className="text-[10px] text-gray-400 mt-1">
                                  Steps: {new Intl.NumberFormat('id-ID').format(getValue(cluster, ['step']))}
                              </div>
                          </div>
                        </div>
                     ))}
                   </div>
                 </div>

                 <button onClick={() => navigate('/about')} className="w-full py-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                    Tentang Kami <ArrowLeft className="w-4 h-4 rotate-180" />
                 </button>
              </div>
          </div>

        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 p-4 z-30 lg:hidden">
        <div className="max-w-5xl mx-auto flex gap-4">
          <button onClick={() => navigate('/analysis')} className="flex-1 py-3 rounded-full bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4"/> Kembali
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Visualization;