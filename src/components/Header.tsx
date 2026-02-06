import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, LogOut, User, LogIn } from 'lucide-react';
import { useStore } from '@/store';
import { useAuthStore } from '@/store/authStore';
import AuthModal from './AuthModal';

const Header = () => {
  const { currentUser } = useStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  const displayUser = user || currentUser;

  return (
    <header className="sticky top-0 z-40">
      <motion.div 
        className="transition-all duration-500 ease-out"
        initial={false}
        animate={{
          backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.60)' : 'transparent',
          backdropFilter: scrolled ? 'blur(24px) saturate(160%)' : 'blur(0px)',
          borderBottom: scrolled ? '1px solid rgba(0,0,0,0.04)' : '1px solid transparent',
          boxShadow: scrolled
            ? '0 12px 40px rgba(15, 23, 42, 0.08), 0 1px 0 rgba(255,255,255,0.7) inset'
            : '0 0 0 rgba(0,0,0,0)',
        }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-[12px] bg-gradient-to-br from-neutral-950 to-neutral-700 flex items-center justify-center transition-transform duration-300 ease-out group-hover:scale-105 shadow-glass ring-1 ring-white/40">
              <span className="text-white text-sm">🌿</span>
            </div>
            <span className="font-medium text-[15px] text-neutral-800 tracking-tight hidden sm:block">
              心语疗愈
            </span>
          </NavLink>

          {/* 右侧操作 */}
          <div className="flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <motion.button 
                  className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
                  whileTap={{ scale: 0.95 }}
                >
                  <Bell size={18} strokeWidth={1.5} />
                </motion.button>

                <div className="relative ml-1">
                  <motion.button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-black/5 overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    {displayUser?.avatar ? (
                      <img
                        src={displayUser.avatar}
                        alt={(displayUser as any).username || (displayUser as any).name || 'User'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                    )}
                  </motion.button>

                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-100"
                    >
                      <NavLink
                        to="/profile"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors"
                      >
                        <User size={16} />
                        <span className="text-sm">个人中心</span>
                      </NavLink>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors text-red-600"
                      >
                        <LogOut size={16} />
                        <span className="text-sm">退出登录</span>
                      </button>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              <motion.button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors rounded-lg hover:bg-white/50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogIn size={16} strokeWidth={2} />
                <span>登录</span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        initialMode="login"
      />
    </header>
  );
};

export default Header;
