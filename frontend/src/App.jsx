import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import InputData from './pages/InputData';
import Preprocessing from './pages/Preprocessing';
import Analysis from './pages/Analysis';
import Visualization from './pages/Visualization';
import About from './pages/About';
import ScrollToTop from './components/ScrollToTop';

// Komponen Khusus untuk Menangani Animasi Route
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/input" element={<InputData />} />
        <Route path="/preprocessing" element={<Preprocessing />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/visualization" element={<Visualization />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <AnimatedRoutes />
      <ScrollToTop />
    </Router>
  );
}

export default App;