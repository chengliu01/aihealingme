import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass, Sparkles, Calendar, User } from 'lucide-react';
import { useStore } from '@/store';

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/community', icon: Compass, label: '社区' },
  { path: '/create/single', icon: Sparkles, label: '单次疗愈', highlight: true },
  { path: '/create/plan', icon: Calendar, label: '计划疗愈', highlight: true },
  { path: '/profile', icon: User, label: '我的' },
];

const Navigation = () => {
  const { currentlyPlaying, isPlaying } = useStore();

  return (
    <>
      {/* 底部导航 */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-lg px-4 pb-safe pt-2">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-neutral-200/50 px-2 py-2 border border-white/50">
            <ul className="flex items-center justify-around">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `
                      relative flex flex-col items-center gap-1 px-3 py-2 rounded-2xl
                      transition-all duration-300
                      ${isActive 
                        ? item.highlight 
                          ? 'text-violet-600' 
                          : 'text-violet-600' 
                        : 'text-neutral-400 hover:text-neutral-600'
                      }
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.div
                            layoutId="nav-active"
                            className={`absolute inset-0 rounded-2xl ${
                              item.highlight 
                                ? 'bg-gradient-to-br from-violet-100 to-purple-100' 
                                : 'bg-violet-50'
                            }`}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        )}
                        <span className={`relative z-10 ${item.highlight ? 'mb-0.5' : ''}`}>
                          <item.icon 
                            size={item.highlight ? 20 : 22} 
                            strokeWidth={isActive ? 2.5 : 2}
                            className={item.highlight && isActive ? 'text-violet-600' : ''}
                          />
                        </span>
                        <span className={`relative z-10 text-[10px] font-medium ${
                          isActive ? 'opacity-100' : 'opacity-0'
                        }`}>
                          {item.label}
                        </span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* 迷你播放器 - 当有音频正在播放时显示 */}
      {currentlyPlaying && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 z-40"
        >
          <NavLink to={`/audio/${currentlyPlaying.id}`}>
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg shadow-neutral-200/50 p-3 border border-white/50 flex items-center gap-3">
              {/* 封面 */}
              <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                <img 
                  src={currentlyPlaying.coverUrl} 
                  alt={currentlyPlaying.title}
                  className="w-full h-full object-cover"
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="flex gap-0.5">
                      <motion.div 
                        className="w-0.5 h-3 bg-white rounded-full"
                        animate={{ height: [12, 6, 12] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      />
                      <motion.div 
                        className="w-0.5 h-4 bg-white rounded-full"
                        animate={{ height: [16, 8, 16] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                      />
                      <motion.div 
                        className="w-0.5 h-2 bg-white rounded-full"
                        animate={{ height: [8, 14, 8] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 信息 */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-neutral-900 truncate">
                  {currentlyPlaying.title}
                </h4>
                <p className="text-xs text-neutral-500 truncate">
                  {currentlyPlaying.author.name}
                </p>
              </div>

              {/* 播放状态 */}
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                {isPlaying ? (
                  <motion.div
                    className="w-2 h-2 bg-violet-600 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                ) : (
                  <div className="w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-violet-600 ml-0.5" />
                )}
              </div>
            </div>
          </NavLink>
        </motion.div>
      )}
    </>
  );
};

export default Navigation;
