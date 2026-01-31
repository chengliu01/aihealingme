import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, X } from 'lucide-react';
import { useStore } from '@/store';

interface HeaderProps {
  showSearch?: boolean;
  onSearch?: (query: string) => void;
}

const Header = ({ showSearch = true, onSearch }: HeaderProps) => {
  const { currentUser } = useStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <header className="sticky top-0 z-40">
      <div className="glass border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 flex items-center justify-center">
              <span className="text-white text-lg">🌿</span>
            </div>
            <span className="font-semibold text-lg text-neutral-900 hidden sm:block">心语疗愈</span>
          </NavLink>

          {/* 搜索框 */}
          {showSearch && (
            <div className="flex-1 max-w-md mx-4">
              <AnimatePresence>
                {isSearchOpen ? (
                  <motion.form
                    initial={{ width: 40, opacity: 0 }}
                    animate={{ width: '100%', opacity: 1 }}
                    exit={{ width: 40, opacity: 0 }}
                    onSubmit={handleSearch}
                    className="relative"
                  >
                    <input
                      type="text"
                      placeholder="搜索疗愈音频..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 bg-neutral-100 rounded-xl border-0 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      autoFocus
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                    <button
                      type="button"
                      onClick={() => setIsSearchOpen(false)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      <X size={18} />
                    </button>
                  </motion.form>
                ) : (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setIsSearchOpen(true)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors"
                  >
                    <Search size={20} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* 右侧操作 */}
          <div className="flex items-center gap-2">
            {/* 通知 */}
            <button className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors">
              <Bell size={20} />
            </button>

            {/* 用户头像 */}
            <NavLink to="/profile" className="flex items-center gap-2 pl-2">
              <img
                src={currentUser?.avatar}
                alt={currentUser?.name}
                className="w-9 h-9 rounded-xl object-cover border border-neutral-200"
              />
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
