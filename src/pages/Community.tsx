import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, TrendingUp, Clock, Heart, Music2 } from 'lucide-react';
import Header from '@/components/Header';
import AudioCard from '@/components/AudioCard';
import { useStore } from '@/store';
import { categoryOptions } from '@/utils';

type SortType = 'trending' | 'newest' | 'popular';

const Community = () => {
  const { audios } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('trending');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
    <div className="min-h-screen pb-24">
      <Header showSearch={false} />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Music2 size={20} className="text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">疗愈社区</h1>
          </div>
          <p className="text-neutral-500 text-sm md:text-base ml-13">
            探索来自社区的心灵疗愈音频，发现属于你的平静时刻
          </p>
        </motion.div>

        {/* 搜索和筛选栏 */}
        <div className="sticky top-0 z-30 py-4 -mx-4 px-4 bg-white/80 backdrop-blur-xl border-b border-neutral-100 mb-6">
          <div className="flex flex-col gap-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="text"
                placeholder="搜索疗愈音频、标签或话题..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
              />
            </div>

            {/* 分类和排序 */}
            <div className="flex items-center justify-between gap-4">
              {/* 分类标签 */}
              <div className="flex-1 overflow-x-auto scrollbar-hide">
                <div className="flex gap-2">
                  {categoryOptions.map((cat) => (
                    <motion.button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`
                        px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap
                        transition-all duration-300
                        ${selectedCategory === cat.value 
                          ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-900/20' 
                          : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300'
                        }
                      `}
                    >
                      {cat.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* 排序下拉 */}
              <div className="relative">
                <motion.button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-xl text-neutral-600 hover:border-neutral-300 transition-colors"
                >
                  <SlidersHorizontal size={18} />
                </motion.button>

                <AnimatePresence>
                  {isFilterOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-40 bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden"
                    >
                      <button
                        onClick={() => { setSortBy('trending'); setIsFilterOpen(false); }}
                        className={`w-full px-4 py-3 flex items-center gap-2 text-left hover:bg-neutral-50 transition-colors text-sm ${sortBy === 'trending' ? 'text-violet-600 bg-violet-50' : 'text-neutral-700'}`}
                      >
                        <TrendingUp size={16} />
                        热门
                      </button>
                      <button
                        onClick={() => { setSortBy('newest'); setIsFilterOpen(false); }}
                        className={`w-full px-4 py-3 flex items-center gap-2 text-left hover:bg-neutral-50 transition-colors text-sm ${sortBy === 'newest' ? 'text-violet-600 bg-violet-50' : 'text-neutral-700'}`}
                      >
                        <Clock size={16} />
                        最新
                      </button>
                      <button
                        onClick={() => { setSortBy('popular'); setIsFilterOpen(false); }}
                        className={`w-full px-4 py-3 flex items-center gap-2 text-left hover:bg-neutral-50 transition-colors text-sm ${sortBy === 'popular' ? 'text-violet-600 bg-violet-50' : 'text-neutral-700'}`}
                      >
                        <Heart size={16} />
                        最受欢迎
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* 音频网格 */}
        <div className="mt-6">
          {filteredAudios.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredAudios.map((audio, index) => (
                <AudioCard key={audio.id} audio={audio} index={index} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mb-4">
                <Search size={28} className="text-violet-400" />
              </div>
              <h3 className="text-base font-semibold text-neutral-700 mb-1">没有找到相关内容</h3>
              <p className="text-neutral-400 text-sm">试试其他关键词或分类</p>
            </motion.div>
          )}
        </div>

        {/* 结果统计 */}
        {filteredAudios.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-neutral-400 text-sm">
              共找到 {filteredAudios.length} 个疗愈音频
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
