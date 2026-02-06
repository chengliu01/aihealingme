import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useStore } from '@/store';

const Header = () => {
  const { currentUser } = useStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            <motion.button 
              className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
              whileTap={{ scale: 0.95 }}
            >
              <Bell size={18} strokeWidth={1.5} />
            </motion.button>

            <NavLink to="/profile" className="ml-1">
              <motion.img
                src={currentUser?.avatar}
                alt={currentUser?.name}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-black/5"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              />
            </NavLink>
          </div>
        </div>
      </motion.div>
    </header>
  );
};

export default Header;
