import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Lenis from '@studio-freight/lenis';
import Navbar from './components/Navigation/Navbar';
import LoadingScreen from './sections/LoadingScreen/LoadingScreen';
import Hero from './sections/Hero/Hero';
import ProblemStats from './sections/ProblemStats/ProblemStats';
import Sensors from './sections/Sensors/Sensors';
import Features from './sections/Features/Features';
import Insights from './sections/Insights/Insights';
import AppPreview from './sections/AppPreview/AppPreview';
import DownloadAPK from './sections/Download/Download';
import Team from './sections/Team/Team';
import Footer from './components/Footer/Footer';
import AdminLayout from './components/Admin/Layout/AdminLayout';
import Login from './sections/Admin/Login/Login';

import Dashboard from './sections/Admin/Dashboard/Dashboard';
import UsersManagement from './sections/Admin/Users/Users';
import FridgeStatus from './sections/Admin/FridgeStatus/FridgeStatus';
import Thresholds from './sections/Admin/Thresholds/Thresholds';
import BuildManager from './sections/Admin/APKManager/APKManager';
import ActivityLogs from './sections/Admin/ActivityLogs/ActivityLogs';
import TeamManagement from './sections/Admin/Team/TeamManagement';

import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

const StreakOverlay = ({ isActive }) => (
    <div className={`streak-container ${isActive ? 'active' : ''}`}>
        {[...Array(5)].map((_, i) => (
            <div key={i} className="streak" style={{ 
                top: `${20 + i * 15}%`,
                left: `${10 + (i % 3) * 20}%`
            }} />
        ))}
    </div>
);

const Home = ({ loading }) => {
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    window.lenis = lenis;

    window.premiumScrollTo = (id) => {
      const element = document.getElementById(id);
      if (!element) return;

      setIsScrolling(true);
      document.body.classList.add('scroll-blur');
      document.body.style.pointerEvents = 'none';

      lenis.scrollTo(element, {
        duration: 0.8,
        easing: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
        onComplete: () => {
          setTimeout(() => {
            setIsScrolling(false);
            document.body.classList.remove('scroll-blur');
            document.body.style.pointerEvents = 'auto';
          }, 400);
        }
      });
    };

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      window.lenis = null;
      window.premiumScrollTo = null;
    };
  }, []);

  return (
    <>
      <main style={{ opacity: loading ? 0 : 1, position: 'relative' }}>
        <StreakOverlay isActive={isScrolling} />
        <Hero />
        <ProblemStats />
        <Sensors />
        <Features />
        <Insights />
        <AppPreview />
        <DownloadAPK />
        <Team />
        <Footer />
      </main>
    </>
  );
};

const AdminPlaceholder = ({ title }) => (
  <div style={{ color: 'white', fontSize: '2rem', textAlign: 'center', marginTop: '20%' }}>
    {title} Component Coming Soon
  </div>
);

const App = () => {
  const [loading, setLoading] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('skipLoading') !== 'true';
  });

  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <AnimatePresence mode="wait">
            {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
          </AnimatePresence>
          <Routes>
            <Route path="/" element={
              <>
                <Navbar />
                <Home loading={loading} />
              </>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={<Login />} />
            <Route path="/admin/*" element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="fridge" element={<FridgeStatus />} />
              <Route path="thresholds" element={<Thresholds />} />
              <Route path="apk" element={<BuildManager />} />
              <Route path="team" element={<TeamManagement />} />
              <Route path="logs" element={<ActivityLogs />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
