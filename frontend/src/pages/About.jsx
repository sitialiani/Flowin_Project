import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, User } from 'lucide-react';
import sitiPhoto from '../assets/foto-siti.jpg';
import abePhoto from '../assets/foto-abe.jpg';

const About = () => {
  const navigate = useNavigate();

  const pageTransition = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.6 }
  };

  const floatAnimation = {
    animate: {
      y: [0, -20, 0],
      transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
    }
  };

  const floatAnimationDelayed = {
    animate: {
      y: [0, 20, 0],
      transition: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }
    }
  };

  return (
    <motion.div 
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="h-screen w-full bg-white font-sans flex flex-col overflow-hidden relative"
    >
      
       {/* Background */}
      
      <motion.div 
        variants={floatAnimation}
        animate="animate"
        className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-pink-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 z-0"
      />
      
      <motion.div 
        variants={floatAnimationDelayed}
        animate="animate"
        className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#8BF883] rounded-full mix-blend-multiply filter blur-[80px] opacity-40 z-0"
      />


      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 md:px-16 py-6 z-20 shrink-0">
        <button onClick={() => navigate('/')} className="text-3xl font-bold text-primary tracking-tight">Flowin</button>
        <div className="flex gap-8 font-medium text-lg">
          <button onClick={() => navigate('/')} className="text-gray-500 hover:text-primary transition-colors">Beranda</button>
          <span className="text-primary font-bold cursor-default">Tentang Kami</span>
        </div>
      </nav>


      {/* Konten utama */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 z-10 w-full max-w-5xl mx-auto h-full pb-20">
        
        {/* Teks header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
           <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 drop-shadow-sm">Tentang Kami</h1>
           <p className="text-gray-600 text-lg font-medium bg-white/50 backdrop-blur-sm py-1 px-4 rounded-full inline-block border border-white/60">
             Kelompok 1 Mata Kuliah Akuisisi Data
           </p>
        </motion.div>

        {/* Card profile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl mb-8">
           
           {/* Card Siti */}
           <motion.div 
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ delay: 0.3 }}
             whileHover={{ scale: 1.03, rotate: -1 }}
             className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 flex flex-col items-center justify-center border border-white/80 shadow-xl shadow-pink-100/50"
           >
              <div className="w-32 h-32 rounded-3xl overflow-hidden mb-5 border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center relative group">
                 {sitiPhoto ? (
                    <img src={sitiPhoto} alt="Siti" className="w-full h-full object-cover" />
                 ) : (
                    <User className="w-16 h-16 text-gray-400" />
                 )}
                 <div className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">Siti Aliani Husnah.F</h3>
              <p className="text-primary font-bold tracking-wider bg-pink-50 px-3 py-1 rounded-lg text-sm">2311522006</p>
           </motion.div>

           {/* Card Abe */}
           <motion.div 
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ delay: 0.4 }}
             whileHover={{ scale: 1.03, rotate: 1 }}
             className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 flex flex-col items-center justify-center border border-white/80 shadow-xl shadow-purple-100/50"
           >
              <div className="w-32 h-32 rounded-3xl overflow-hidden mb-5 border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center relative">
                 {abePhoto ? (
                    <img src={abePhoto} alt="Abrar" className="w-full h-full object-cover" />
                 ) : (
                    <User className="w-16 h-16 text-gray-400" />
                 )}
                 <div className="absolute top-2 right-2 w-3 h-3 bg-blue-400 rounded-full border-2 border-white"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">Muhammad Abrar Rayva</h3>
              <p className="text-primary font-bold tracking-wider bg-pink-50 px-3 py-1 rounded-lg text-sm">2311522012</p>
           </motion.div>

        </div>

        {/* Text deskripsi web*/}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center max-w-2xl px-6 py-4 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/60"
        >
           <p className="text-gray-700 text-lg leading-relaxed font-medium">
             Website ini bertujuan untuk menganalisis pola gaya hidup pengguna <span className="italic text-primary font-bold">smartwatch</span> berdasarkan aktivitas fisik, kualitas tidur, dan faktor kesehatan menggunakan algoritma <span className="text-gray-900 font-bold underline decoration-pink-300">K-Means Clustering</span>.
           </p>
        </motion.div>

      </main>


      {/* Button footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-white/50 p-4 z-30">
        <div className="max-w-5xl mx-auto">
          <button 
            onClick={() => {
                alert("Terima kasih telah menggunakan Flowin!");
                navigate('/'); 
            }}
            className="w-full py-3 rounded-full bg-primary text-white font-bold hover:shadow-primary/40 hover:shadow-lg hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
          >
            Selesai
          </button>
        </div>
      </div>

    </motion.div>
  );
};

export default About;