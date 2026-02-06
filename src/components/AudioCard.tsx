import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Play, Pause, Headphones, MessageCircle, Clock } from 'lucide-react';
import type { HealingAudio } from '@/types';
import { formatDuration, formatNumber, formatDate } from '@/utils';
import { useStore } from '@/store';

interface AudioCardProps {
  audio: HealingAudio;
  index?: number;
  layout?: 'grid' | 'list';
}

const AudioCard = ({ audio, index = 0, layout = 'grid' }: AudioCardProps) => {
  const { 
    currentlyPlaying, 
    isPlaying, 
    setCurrentlyPlaying, 
    setIsPlaying
  } = useStore();
  
  const isCurrentlyPlaying = currentlyPlaying?.id === audio.id;
  const [localLikes, setLocalLikes] = useState(audio.likes);
  const [liked, setLiked] = useState(false);

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isCurrentlyPlaying) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentlyPlaying(audio);
      setIsPlaying(true);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (liked) {
      setLocalLikes(prev => prev - 1);
      setLiked(false);
    } else {
      setLocalLikes(prev => prev + 1);
      setLiked(true);
    }
  };

  // List 布局 - 类似 Bilibili 横向卡片
  if (layout === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.3, 
          delay: index * 0.03,
          ease: [0.25, 0.1, 0.25, 1]
        }}
        className="group"
      >
        <Link to={`/audio/${audio.id}`} className="flex gap-4 p-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-black/[0.04] hover:bg-white/80 hover:shadow-lg transition-all duration-300">
          {/* 封面 - 不旋转 */}
          <div className="relative w-40 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100">
            <img
              src={audio.coverUrl}
              alt={audio.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* 时长 */}
            <div className="absolute bottom-2 right-2">
              <span className="px-2 py-0.5 bg-black/70 backdrop-blur-sm rounded text-white text-[10px] font-medium">
                {formatDuration(audio.duration)}
              </span>
            </div>
            
            {/* 播放按钮 */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <motion.button
                onClick={handlePlay}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-neutral-900 shadow-lg"
              >
                {isCurrentlyPlaying && isPlaying ? (
                  <Pause size={16} fill="currentColor" />
                ) : (
                  <Play size={16} fill="currentColor" className="ml-0.5" />
                )}
              </motion.button>
            </div>

            {/* 正在播放指示器 */}
            {isCurrentlyPlaying && (
              <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-violet-500 rounded text-white text-[9px] font-medium">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-white"
                />
                播放中
              </div>
            )}
          </div>
          
          {/* 信息 */}
          <div className="flex-1 min-w-0 py-1">
            <h3 className="font-semibold text-[15px] text-neutral-900 leading-snug line-clamp-2 mb-2 group-hover:text-violet-600 transition-colors">
              {audio.title}
            </h3>
            
            {/* 作者 */}
            <div className="flex items-center gap-2 mb-2">
              <img 
                src={audio.author.avatar} 
                alt={audio.author.name}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="text-[12px] text-neutral-500">
                {audio.author.name}
              </span>
            </div>
            
            {/* 标签 */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {audio.tags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-md text-[10px] font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            {/* 统计信息 */}
            <div className="flex items-center gap-4 text-[11px] text-neutral-400">
              <span className="flex items-center gap-1">
                <Headphones size={12} />
                {formatNumber(audio.views)}
              </span>
              <span className="flex items-center gap-1">
                <Heart size={12} fill={liked ? 'currentColor' : 'none'} className={liked ? 'text-rose-500' : ''} />
                {formatNumber(localLikes)}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={12} />
                {audio.comments.length}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {formatDate(audio.createdAt)}
              </span>
            </div>
          </div>
          
          {/* 收藏按钮 */}
          <motion.button
            onClick={handleLike}
            whileTap={{ scale: 0.9 }}
            className={`self-start w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              liked ? 'bg-rose-50 text-rose-500' : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
            }`}
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          </motion.button>
        </Link>
      </motion.div>
    );
  }

  // Grid 布局
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.03,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      whileHover={{ y: -4 }}
      className="group"
    >
      {/* 封面（可点击）- 不旋转 */}
      <div className="relative aspect-square rounded-2xl overflow-hidden mb-2.5 bg-neutral-100 shadow-lg ring-1 ring-white/40 group-hover:shadow-2xl group-hover:ring-violet-500/20 transition-all duration-300">
        <Link to={`/audio/${audio.id}`} className="absolute inset-0">
          <img
            src={audio.coverUrl}
            alt={audio.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
          />

          {/* 渐变遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
        </Link>

        {/* 时长 - 左下角 */}
        <div className="absolute bottom-2 left-2 z-10">
          <span className="px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg text-white text-[10px] font-medium ring-1 ring-white/10">
            {formatDuration(audio.duration)}
          </span>
        </div>

        {/* 统计信息 - 右下角 */}
        <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1.5">
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-black/40 backdrop-blur-md rounded-lg text-white text-[10px] font-medium ring-1 ring-white/10">
            <Headphones size={10} />
            {formatNumber(audio.views)}
          </span>
        </div>

        {/* 正在播放指示器 */}
        {isCurrentlyPlaying && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 bg-violet-500 rounded-lg text-white text-[9px] font-medium">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-white"
            />
            播放中
          </div>
        )}

        {/* 点赞按钮 - 右上角 */}
        <motion.button
          onClick={handleLike}
          whileTap={{ scale: 0.9 }}
          className={`
            absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-lg
            transition-all duration-200 text-[10px] font-medium ring-1
            ${liked
              ? 'bg-rose-500 text-white ring-rose-400/50'
              : 'bg-white/90 backdrop-blur-md text-neutral-700 ring-white/40 hover:bg-white'
            }
          `}
        >
          <Heart size={11} fill={liked ? 'currentColor' : 'none'} strokeWidth={2} />
          <span>{formatNumber(localLikes)}</span>
        </motion.button>

        {/* 播放按钮 */}
        <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
          <motion.button
            onClick={handlePlay}
            whileTap={{ scale: 0.92 }}
            initial={{ scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            className={`
              w-12 h-12 rounded-full flex items-center justify-center pointer-events-auto
              transition-all duration-300
              ${isCurrentlyPlaying && isPlaying
                ? 'bg-white text-neutral-900'
                : 'bg-white/95 backdrop-blur-md text-neutral-900'
              }
              shadow-2xl ring-2 ring-white/60
            `}
          >
            {isCurrentlyPlaying && isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" className="ml-0.5" />
            )}
          </motion.button>
        </div>
      </div>

      {/* 信息（可点击） */}
      <Link to={`/audio/${audio.id}`} className="block">
        <h3 className="font-semibold text-[14px] text-neutral-900 leading-snug line-clamp-2 mb-1.5 group-hover:text-violet-600 transition-colors">
          {audio.title}
        </h3>
        
        {/* 作者信息 */}
        <div className="flex items-center gap-1.5 mb-2">
          <img 
            src={audio.author.avatar} 
            alt={audio.author.name}
            className="w-4 h-4 rounded-full object-cover"
          />
          <p className="text-[11px] text-neutral-500 truncate">
            {audio.author.name}
          </p>
        </div>
        
        {/* 标签 */}
        <div className="flex flex-wrap gap-1">
          {audio.tags.slice(0, 2).map((tag, i) => (
            <span
              key={i}
              className="px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded text-[9px] font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </Link>
    </motion.div>
  );
};

export default AudioCard;
