import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Compass, Sparkles, Calendar, User, Play, Pause, SkipBack, SkipForward, X } from 'lucide-react';
import { useStore } from '@/store';

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/community', icon: Compass, label: '发现' },
  { path: '/create/single', icon: Sparkles, label: '疗愈' },
  { path: '/create/plan', icon: Calendar, label: '计划' },
  { path: '/profile', icon: User, label: '我' },
];

const Navigation = () => {
  const { currentlyPlaying, isPlaying, setIsPlaying, setCurrentlyPlaying, audios } = useStore();

  return (
    <>
      {/* 底部导航 - 极简风格 */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-md px-6 pb-safe">
          <div className="bg-white/70 backdrop-blur-2xl rounded-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.04)] border border-white/60 mx-4 mb-2">
            <ul className="flex items-center justify-around py-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `
                      relative flex flex-col items-center gap-0.5 px-4 py-2
                      transition-all duration-300 ease-out
                      ${isActive ? 'text-neutral-900' : 'text-neutral-400'}
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        <motion.span 
                          className="relative z-10"
                          animate={{ 
                            scale: isActive ? 1 : 0.92,
                            y: isActive ? -1 : 0 
                          }}
                          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                        >
                          <item.icon 
                            size={22} 
                            strokeWidth={isActive ? 2 : 1.5}
                          />
                        </motion.span>
                        <motion.span 
                          className="text-[10px] font-medium"
                          animate={{ 
                            opacity: isActive ? 1 : 0.6,
                            y: isActive ? 0 : 2
                          }}
                          transition={{ duration: 0.25 }}
                        >
                          {item.label}
                        </motion.span>
                        {isActive && (
                          <motion.div
                            layoutId="nav-indicator"
                            className="absolute -bottom-0.5 left-1/2 w-1 h-1 bg-neutral-900 rounded-full"
                            style={{ x: '-50%' }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* 迷你播放器 - 悬浮胶囊 */}
      <AnimatePresence>
        {currentlyPlaying && (
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed bottom-28 left-4 right-4 z-40 max-w-md mx-auto"
          >
            <div className="bg-white/80 backdrop-blur-2xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/60 p-3 flex items-center gap-3">
              {/* 封面 */}
              <NavLink to={`/audio/${currentlyPlaying.id}`} className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0">
                <img 
                  src={currentlyPlaying.coverUrl} 
                  alt={currentlyPlaying.title}
                  className="w-full h-full object-cover"
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="flex gap-[2px]">
                      {[0, 1, 2].map((i) => (
                        <motion.div 
                          key={i}
                          className="w-[2px] bg-white rounded-full"
                          animate={{ height: ['8px', '14px', '8px'] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </NavLink>

              {/* 信息 */}
              <NavLink to={`/audio/${currentlyPlaying.id}`} className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-neutral-800 truncate">
                  {currentlyPlaying.title}
                </h4>
                <p className="text-xs text-neutral-400 truncate">
                  {currentlyPlaying.author.name}
                </p>
              </NavLink>

              {/* 控制按钮 */}
              <div className="flex items-center gap-0.5">
                <motion.button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const currentIndex = audios.findIndex(a => a.id === currentlyPlaying.id);
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : audios.length - 1;
                    setCurrentlyPlaying(audios[prevIndex]);
                    setIsPlaying(true);
                  }}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <SkipBack size={16} />
                </motion.button>

                <motion.button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsPlaying(!isPlaying);
                  }}
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center text-white"
                >
                  {isPlaying ? (
                    <Pause size={15} fill="currentColor" />
                  ) : (
                    <Play size={15} fill="currentColor" className="ml-0.5" />
                  )}
                </motion.button>

                <motion.button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const currentIndex = audios.findIndex(a => a.id === currentlyPlaying.id);
                    const nextIndex = currentIndex < audios.length - 1 ? currentIndex + 1 : 0;
                    setCurrentlyPlaying(audios[nextIndex]);
                    setIsPlaying(true);
                  }}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <SkipForward size={16} />
                </motion.button>

                <motion.button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentlyPlaying(null);
                    setIsPlaying(false);
                  }}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 flex items-center justify-center text-neutral-300 hover:text-neutral-500 transition-colors"
                >
                  <X size={16} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
