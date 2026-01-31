import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Play, Pause, Clock, Headphones } from 'lucide-react';
import type { HealingAudio } from '@/types';
import { formatDuration, formatNumber } from '@/utils';
import { useStore } from '@/store';

interface AudioCardProps {
  audio: HealingAudio;
  index?: number;
}

const AudioCard = ({ audio, index = 0 }: AudioCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { 
    currentlyPlaying, 
    isPlaying, 
    setCurrentlyPlaying, 
    setIsPlaying,
    favoriteAudios,
    toggleFavorite 
  } = useStore();
  
  const isCurrentlyPlaying = currentlyPlaying?.id === audio.id;
  const isFavorite = favoriteAudios.some(a => a.id === audio.id);

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

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(audio.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
    >
      <Link to={`/audio/${audio.id}`} className="block">
        {/* 封面 - 音乐专辑风格 */}
        <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-neutral-100 shadow-lg shadow-neutral-200/30 group-hover:shadow-xl group-hover:shadow-violet-200/30 transition-all duration-500">
          <motion.img
            src={audio.coverUrl}
            alt={audio.title}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.08 : 1 }}
            transition={{ duration: 0.5 }}
          />
          
          {/* 渐变遮罩 - 类似网易云 */}
          <div className={`
            absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent
            transition-opacity duration-300
            ${isHovered ? 'opacity-100' : 'opacity-60'}
          `} />
          
          {/* 顶部标签 */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-lg text-white text-xs font-medium">
              {audio.category}
            </span>
          </div>

          {/* 收藏按钮 */}
          <motion.button
            onClick={handleFavorite}
            className={`
              absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center
              transition-all duration-300
              ${isFavorite 
                ? 'bg-rose-500 text-white' 
                : 'bg-black/30 backdrop-blur-md text-white hover:bg-rose-500'
              }
            `}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
          </motion.button>
          
          {/* 播放按钮 - 网易云风格 */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              onClick={handlePlay}
              className={`
                w-14 h-14 rounded-full flex items-center justify-center
                ${isCurrentlyPlaying && isPlaying 
                  ? 'bg-violet-500 text-white' 
                  : 'bg-white text-violet-600'
                }
                shadow-lg hover:scale-110 transition-transform
              `}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isCurrentlyPlaying && isPlaying ? (
                <Pause size={24} fill="currentColor" />
              ) : (
                <Play size={24} fill="currentColor" className="ml-1" />
              )}
            </motion.button>
          </motion.div>

          {/* 底部信息栏 */}
          <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
            {/* 时长 */}
            <div className="flex items-center gap-1 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg text-white text-xs">
              <Clock size={12} />
              {formatDuration(audio.duration)}
            </div>
            
            {/* 播放量 */}
            <div className="flex items-center gap-1 text-white/80 text-xs">
              <Headphones size={12} />
              {formatNumber(audio.views)}
            </div>
          </div>
        </div>

        {/* 音频信息 */}
        <div className="space-y-1">
          {/* 标题 */}
          <h3 className="font-semibold text-neutral-900 text-sm line-clamp-1 group-hover:text-violet-600 transition-colors duration-300">
            {audio.title}
          </h3>
          
          {/* 描述 */}
          <p className="text-xs text-neutral-500 line-clamp-1">
            {audio.description}
          </p>
          
          {/* 作者和统计 */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <img
                src={audio.author.avatar}
                alt={audio.author.name}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="text-xs text-neutral-500">{audio.author.name}</span>
            </div>
            
            {/* 点赞数 */}
            <div className="flex items-center gap-1 text-xs text-neutral-400">
              <Heart size={12} />
              {formatNumber(audio.likes)}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default AudioCard;
