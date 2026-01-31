import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Community from '@/pages/Community';
import Create from '@/pages/Create';
import Profile from '@/pages/Profile';
import AudioPlayer from '@/pages/AudioPlayer';
import SingleHealing from '@/pages/SingleHealing';
import PlanHealing from '@/pages/PlanHealing';

function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Layout />}>
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
  );
}

export default App;
