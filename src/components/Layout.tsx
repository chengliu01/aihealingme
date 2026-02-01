import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navigation from './Navigation';
import FloatingBubbles from './FloatingBubbles';
import AnimatedBackground from './AnimatedBackground';

const Layout = () => {
  const location = useLocation();
  const isCreatePage = location.pathname.includes('/create');

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 增强的动画背景 */}
      <AnimatedBackground />

      {/* 背景装饰光晕 */}
      <FloatingBubbles />
      
      {/* 主内容区 */}
      <main className={`relative z-10 ${isCreatePage ? 'pb-0' : 'pb-20'}`}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="min-h-screen"
        >
          <Outlet />
        </motion.div>
      </main>

      {/* 导航栏 - 创建页面隐藏 */}
      {!isCreatePage && <Navigation />}
    </div>
  );
};

export default Layout;
