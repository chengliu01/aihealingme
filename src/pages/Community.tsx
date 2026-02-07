import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, Clock, Heart, Grid3x3, List, X, ChevronDown, ChevronUp } from 'lucide-react';
import Header from '@/components/Header';
import AudioCard from '@/components/AudioCard';
import { useStore } from '@/store';
import { categoryOptions } from '@/utils';

type SortType = 'trending' | 'newest' | 'popular';
type LayoutType = 'grid' | 'list';

const sortOptions = [
  { id: 'trending', label: '热门', icon: TrendingUp },
  { id: 'newest', label: '最新', icon: Clock },
  { id: 'popular', label: '最爱', icon: Heart },
];

const Community = () => {
  const { audios } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('trending');
  const [layout, setLayout] = useState<LayoutType>('grid');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);

  const displayedCategories = isCategoryExpanded ? categoryOptions : categoryOptions.slice(0, 5);

  const filteredAudios = useMemo(() => {
    let result = [...audios];

    if (selectedCategory !== 'all') {
      result = result.filter(a => a.category === selectedCategory || a.tags.includes(selectedCategory));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a => 
        a.title.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query) ||
        a.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
        result.sort((a, b) => b.likes - a.likes);
        break;
      case 'trending':
      default:
        result.sort((a, b) => b.views - a.views);
        break;
    }

    return result;
  }, [audios, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen pb-32">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* 标题 & 搜索图标 & 布局切换 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="pt-6 pb-6 flex items-end justify-between"
        >
          <div>
            <h1 className="text-[26px] font-semibold text-neutral-800 tracking-tight">
              社区疗愈频道
            </h1>
            <p className="text-[14px] text-neutral-400 mt-1">
              发现更多疗愈内容，与他人分享你的疗愈体验
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 搜索图标入口 */}
            <motion.button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              whileTap={{ scale: 0.95 }}
              className={`
                p-2.5 rounded-xl transition-all duration-300
                ${isSearchOpen 
                  ? 'bg-neutral-900 text-white' 
                  : 'bg-white/60 backdrop-blur-sm text-neutral-600 hover:bg-white/80 border border-black/[0.04]'
                }
              `}
            >
              {isSearchOpen ? <X size={18} strokeWidth={1.5} /> : <Search size={18} strokeWidth={1.5} />}
            </motion.button>

            {/* 布局切换 */}
            <div className="flex items-center gap-1 p-1 bg-white/60 backdrop-blur-sm rounded-xl border border-black/[0.04]">
              <motion.button
                onClick={() => setLayout('grid')}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-lg transition-all ${
                  layout === 'grid' 
                    ? 'bg-neutral-900 text-white' 
                    : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                <Grid3x3 size={18} strokeWidth={1.5} />
              </motion.button>
              <motion.button
                onClick={() => setLayout('list')}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-lg transition-all ${
                  layout === 'list' 
                    ? 'bg-neutral-900 text-white' 
                    : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                <List size={18} strokeWidth={1.5} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* 搜索框 - 可展开 */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="搜索音频..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-clean pl-11 pr-4 rounded-2xl text-[14px]"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-500 transition-colors"
                  >
                    <X size={16} strokeWidth={1.5} />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 分类和排序 */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          {/* 分类 */}
          <div className="flex flex-wrap gap-2 pb-3">
            {displayedCategories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`
                  px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap
                  transition-all duration-200
                  ${selectedCategory === cat.value 
                    ? 'bg-neutral-900 text-white' 
                    : 'bg-white/55 text-neutral-600 hover:bg-white/70 border border-black/[0.04] shadow-glass'
                  }
                `}
              >
                {cat.label}
              </button>
            ))}
            
            {/* 更多按钮 - 始终显示在最后 */}
            <button
              onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
              className="px-3 py-2 rounded-full bg-white/55 text-neutral-400 hover:text-neutral-600 hover:bg-white/70 border border-black/[0.04] shadow-glass transition-colors flex items-center gap-1"
            >
              <span className="text-[12px] font-medium">
                {isCategoryExpanded ? '收起' : '更多'}
              </span>
              {isCategoryExpanded ? (
                <ChevronUp size={14} strokeWidth={2} />
              ) : (
                <ChevronDown size={14} strokeWidth={2} />
              )}
            </button>
          </div>

          {/* 排序 */}
          <div className="flex gap-4 mt-2">
            {sortOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSortBy(option.id as SortType)}
                className={`
                  flex items-center gap-1.5 text-[12px] font-medium
                  transition-colors duration-200
                  ${sortBy === option.id ? 'text-neutral-800' : 'text-neutral-400'}
                `}
              >
                <option.icon size={14} strokeWidth={1.5} />
                {option.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* 音频列表 */}
        <AnimatePresence mode="wait">
          {filteredAudios.length > 0 ? (
            <motion.div 
              key={`${layout}-grid`}
              className={
                layout === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
                  : 'space-y-3'
              }
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filteredAudios.map((audio, index) => (
                <AudioCard 
                  key={audio.id} 
                  audio={audio} 
                  index={index}
                  layout={layout}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
                <Search size={24} className="text-neutral-300" strokeWidth={1.5} />
              </div>
              <h3 className="text-[15px] font-medium text-neutral-600 mb-1">没有找到内容</h3>
              <p className="text-[13px] text-neutral-400">试试其他关键词或分类</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 统计 */}
        {filteredAudios.length > 0 && (
          <motion.p 
            className="text-center text-[12px] text-neutral-400 mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            共 {filteredAudios.length} 个音频
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default Community;
