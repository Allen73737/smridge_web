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
import AppPreview from './sections/AppPreview/AppPreview';
import DownloadAPK from './sections/Download/Download';
import AdminLayout from './components/Admin/Layout/AdminLayout';
import Login from './sections/Admin/Login/Login';
import MouseTrail from './components/Effects/MouseTrail';

const Home = () => {
  const [loading, setLoading] = useState(true);

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

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {!loading && (
        <main>
          <Hero />
          <ProblemStats />
          <Sensors />
          <Features />
          <AppPreview />
          <DownloadAPK />
        </main>
      )}
    </>
  );
};

import Dashboard from './sections/Admin/Dashboard/Dashboard';
import UsersManagement from './sections/Admin/Users/Users';
import FridgeStatus from './sections/Admin/FridgeStatus/FridgeStatus';

import Thresholds from './sections/Admin/Thresholds/Thresholds';
import APKManager from './sections/Admin/APKManager/APKManager';
import ActivityLogs from './sections/Admin/ActivityLogs/ActivityLogs';

const AdminPlaceholder = ({ title }) => (
  <div style={{ color: 'white', fontSize: '2rem', textAlign: 'center', marginTop: '20%' }}>
    {title} Component Coming Soon
  </div>
);

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <MouseTrail />
        <Routes>
          <Route path="/" element={
            <>
              <Navbar />
              <Home />
            </>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={<Login />} />
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="fridge" element={<FridgeStatus />} />
            <Route path="thresholds" element={<Thresholds />} />
            <Route path="apk" element={<APKManager />} />
            <Route path="logs" element={<ActivityLogs />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
