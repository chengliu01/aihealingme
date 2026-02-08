import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, Clock, Heart, Grid3x3, List, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import AudioCard from '@/components/AudioCard';
import { useStore } from '@/store';
import { audioAPI } from '@/services/api';
import { categoryOptions } from '@/utils';
import type { HealingAudio } from '@/types';

type SortType = 'trending' | 'newest' | 'popular';
type LayoutType = 'grid' | 'list';

const sortOptions = [
  { id: 'trending', label: '热门', icon: TrendingUp },
  { id: 'newest', label: '最新', icon: Clock },
  { id: 'popular', label: '最爱', icon: Heart },
];

// 将后端音频数据转换为前端格式
const transformBackendAudio = (audio: any): HealingAudio => ({
  id: audio._id || audio.id,
  title: audio.title || '',
  description: audio.description || '',
  coverUrl: audio.coverImage || audio.coverUrl || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
  audioUrl: audio.audioUrl || '',
  duration: audio.duration || 0,
  author: {
    id: audio.creator?._id || audio.creator?.id || audio.author?.id || '',
    name: audio.creator?.nickname || audio.creator?.username || audio.author?.name || '匿名用户',
    avatar: audio.creator?.avatar || audio.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=default`,
    email: '',
    createdAt: audio.createdAt || new Date().toISOString(),
  },
  tags: audio.tags || [],
  category: audio.category || '',
  likes: audio.likesCount ?? audio.likes?.length ?? (typeof audio.likes === 'number' ? audio.likes : 0),
  views: audio.listens || audio.views || 0,
  comments: [],
  isPublished: audio.isPublic ?? audio.isPublished ?? true,
  createdAt: audio.createdAt || new Date().toISOString(),
  updatedAt: audio.updatedAt || new Date().toISOString(),
  type: audio.type || 'single',
  shareText: audio.shareText || '',
  waveform: audio.waveform,
  backgroundColor: audio.backgroundColor,
  commentCount: audio.commentCount || 0,
  isLikedByCurrentUser: audio.isLikedByCurrentUser || false,
});

const Community = () => {
  const { audios: localAudios } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('trending');
  const [layout, setLayout] = useState<LayoutType>('grid');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);
  
  // 后端数据状态
  const [backendAudios, setBackendAudios] = useState<HealingAudio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useBackend, setUseBackend] = useState(true);
  const [page] = useState(1);
  
  // 分类容器 ref 和可见数量计算
  const categoryContainerRef = useRef<HTMLDivElement>(null);
  const [visibleCategoryCount, setVisibleCategoryCount] = useState(categoryOptions.length);
  
  // 后端排序映射
  const sortMap: Record<SortType, string> = {
    trending: 'trending',
    newest: 'newest',
    popular: 'popular',
  };

  // 从后端获取音频
  const fetchAudios = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await audioAPI.getAllAudios({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery.trim() || undefined,
        page,
        limit: 20,
        sort: sortMap[sortBy],
      });
      
      if (response.success && response.data.audios) {
        const transformed = response.data.audios.map(transformBackendAudio);
        setBackendAudios(transformed);
        setUseBackend(true);
      }
    } catch (error) {
      console.warn('Failed to fetch from backend, using local data:', error);
      setUseBackend(false);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery, sortBy, page]);

  useEffect(() => {
    fetchAudios();
  }, [fetchAudios]);
  
  // 根据容器宽度计算能显示的分类数量
  useEffect(() => {
    const calculateVisibleCount = () => {
      if (!categoryContainerRef.current) return;
      
      const containerWidth = categoryContainerRef.current.offsetWidth;
      const avgTagWidth = 85;
      const moreButtonWidth = 70;
      const availableWidth = containerWidth - moreButtonWidth - 20;
      
      const count = Math.max(3, Math.floor(availableWidth / avgTagWidth));
      setVisibleCategoryCount(Math.min(count, categoryOptions.length));
    };
    
    calculateVisibleCount();
    
    window.addEventListener('resize', calculateVisibleCount);
    
    const resizeObserver = new ResizeObserver(calculateVisibleCount);
    if (categoryContainerRef.current) {
      resizeObserver.observe(categoryContainerRef.current);
    }
    
    return () => {
      window.removeEventListener('resize', calculateVisibleCount);
      resizeObserver.disconnect();
    };
  }, []);

  const displayedCategories = isCategoryExpanded 
    ? categoryOptions 
    : categoryOptions.slice(0, visibleCategoryCount);

  // 本地数据的过滤逻辑（后备方案）
  const localFilteredAudios = useMemo(() => {
    let result = localAudios.filter(a => a.isPublished);

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
  }, [localAudios, selectedCategory, searchQuery, sortBy]);

  const filteredAudios = useBackend ? backendAudios : localFilteredAudios;

  // 音频点赞后更新本地状态
  const handleAudioLikeUpdate = (audioId: string, liked: boolean) => {
    setBackendAudios(prev => prev.map(a => 
      a.id === audioId 
        ? { ...a, likes: liked ? a.likes + 1 : Math.max(0, a.likes - 1) }
        : a
    ));
  };

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
          <div ref={categoryContainerRef} className="flex flex-wrap gap-2 pb-3">
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
            
            {/* 更多按钮 - 只有当有隐藏分类时才显示 */}
            {categoryOptions.length > visibleCategoryCount && (
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
            )}
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
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <Loader2 size={24} className="text-neutral-400 animate-spin mb-3" />
              <p className="text-[13px] text-neutral-400">加载中...</p>
            </motion.div>
          ) : filteredAudios.length > 0 ? (
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
                  onLikeUpdate={handleAudioLikeUpdate}
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
