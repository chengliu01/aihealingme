import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import Layout from '@/components/Layout';
import ScrollToTop from '@/components/ScrollToTop';
import Home from '@/pages/Home';
import Community from '@/pages/Community';
import Create from '@/pages/Create';
import Profile from '@/pages/Profile';
import AudioPlayer from '@/pages/AudioPlayer';
import SingleHealing from '@/pages/SingleHealing';
import PlanHealing from '@/pages/PlanHealing';
import Onboarding from '@/pages/Onboarding';
import { useAuthStore } from '@/store/authStore';

// Guard: redirect to onboarding if not completed
function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, needsOnboarding } = useAuthStore();
  const location = useLocation();

  if (isAuthenticated && needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { getCurrentUser } = useAuthStore();

  useEffect(() => {
    // Check if user is logged in on app load
    const token = localStorage.getItem('token');
    if (token) {
      getCurrentUser();
    }
  }, [getCurrentUser]);

  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes>
          {/* Onboarding route - standalone, no layout */}
          <Route path="/onboarding" element={<Onboarding />} />

          <Route path="/" element={
            <OnboardingGuard>
              <Layout />
            </OnboardingGuard>
          }>
            <Route index element={<Home />} />
            <Route path="community" element={<Community />} />
            <Route path="create" element={<Create />} />
            <Route path="create/single" element={<SingleHealing />} />
            <Route path="create/plan" element={<PlanHealing />} />
            <Route path="profile" element={<Profile />} />
            <Route path="audio/:id" element={<AudioPlayer />} />
            {/* 为了兼容，保留旧的视频路由重定向 */}
            <Route path="video/:id" element={<AudioPlayer />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;
