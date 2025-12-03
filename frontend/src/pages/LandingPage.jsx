import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import chartImage from '../assets/chart-3d.png';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-screen bg-white overflow-hidden flex flex-col font-sans">  
      <div className="absolute top-[-10%] right-[20%] w-[600px] h-[600px] bg-[#8BF883] rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob"></div>
      <div className="absolute bottom-[-50%] left-[-10%] w-[800px] h-[600px] bg-[#FF366F] rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]"></div>

      {/* --- Navbar --- */}
      <nav className="relative z-10 flex justify-between items-center px-8 md:px-16 py-6">
        <div className="text-3xl font-bold text-primary tracking-tight">
          Flowin
        </div>
        
        {/* Menu Navigasi */}
        <div className="hidden md:flex gap-8 font-medium text-lg">
          <span className="text-primary font-bold cursor-default">
            Beranda
          </span>          
          <button 
            onClick={() => navigate('/about')} 
            className="text-gray-500 hover:text-primary transition-colors"
          >
            Tentang Kami
          </button>
        </div>
      </nav>


      {/* --- Main Content --- */}
      <main className="relative z-10 flex flex-1 items-center justify-between px-8 md:px-16 pb-10">
        <div className="w-full md:w-1/2 flex flex-col gap-6">
          <motion.h1 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold text-gray-900 leading-[1.15]"
          >
            Kenali gaya hidup kamu, <br/>
            melalui aktivitas fisik, <br/>
            kualitas tidur, dan faktor kesehatan
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <button 
              onClick={() => navigate('/input')}
              className="mt-6 px-10 py-4 bg-primary text-white text-lg font-semibold rounded-full shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all duration-300"
            >
              Start Now
            </button>
          </motion.div>
        </div>
        <div className="hidden md:flex w-1/2 justify-center items-center relative">
          <motion.div
            animate={{ 
              y: [0, -25, 0], 
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            whileHover={{ scale: 1.05 }}
            className="relative z-20"
          >
            <img 
              src={chartImage} 
              alt="3D Analytics Chart" 
              className="w-[500px] object-contain drop-shadow-2xl"
            />
          </motion.div>
        </div>

      </main>
    </div>
  );
};

export default LandingPage;