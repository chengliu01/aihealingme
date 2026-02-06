import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import FloatingBubbles from './FloatingBubbles';
import AnimatedBackground from './AnimatedBackground';
import Footer from './Footer';
import PlayerBar from './PlayerBar';

const Layout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* 增强的动画背景 */}
      <AnimatedBackground />

      {/* 背景装饰光晕 */}
      <FloatingBubbles />
      
      {/* 主内容区 */}
      <main className="relative z-10 flex-1">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex-1"
        >
          <Outlet />
        </motion.div>
      </main>

      <Footer />
      
      {/* 全局播放器 - 确保在最顶层 */}
      <PlayerBar />
    </div>
  );
};

export default Layout;
