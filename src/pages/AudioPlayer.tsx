import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Share2, Heart,
  MessageCircle, Send, Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Repeat, Shuffle, ListMusic,
  Clock, Headphones
} from 'lucide-react';
import { useStore } from '@/store';
import { formatDuration, formatNumber, formatDate, generateId } from '@/utils';
import type { Comment } from '@/types';

// 模拟音频波形
const generateWaveform = () => {
  return Array.from({ length: 60 }, () => Math.random() * 0.6 + 0.2);
};

const AudioPlayer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    audios, 
    currentUser, 
    addComment, 
    likeComment, 
    toggleFavorite, 
    favoriteAudios,
    currentlyPlaying,
    isPlaying,
    setCurrentlyPlaying,
    setIsPlaying
  } = useStore();
  
  const audio = audios.find(a => a.id === id);
  const isFavorite = favoriteAudios.some(a => a.id === id);
  
  const [currentTime, setCurrentTime] = useState(0);
const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const [waveform] = useState(generateWaveform());
  const progressRef = useRef<HTMLDivElement>(null);

  // 当打开新音频时，设置为当前播放
  useEffect(() => {
    if (audio && currentlyPlaying?.id !== audio.id) {
      setCurrentlyPlaying(audio);
      setIsPlaying(true);
      setCurrentTime(0);
    }
  }, [audio, currentlyPlaying, setCurrentlyPlaying, setIsPlaying]);

  // 模拟播放进度
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && audio) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= audio.duration) {
            if (isRepeat) return 0;
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, audio, isRepeat, setIsPlaying]);

  if (!audio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <p className="text-neutral-500">音频不存在</p>
          <button onClick={() => navigate(-1)} className="btn-primary mt-4">
            返回
          </button>
        </div>
      </div>
    );
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audio) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setCurrentTime(Math.floor(percent * audio.duration));
  };

  const handlePrev = () => {
    const currentIndex = audios.findIndex(a => a.id === id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : audios.length - 1;
    navigate(`/audio/${audios[prevIndex].id}`);
  };

  const handleNext = () => {
    const currentIndex = audios.findIndex(a => a.id === id);
    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * audios.length);
    } else {
      nextIndex = currentIndex < audios.length - 1 ? currentIndex + 1 : 0;
    }
    navigate(`/audio/${audios[nextIndex].id}`);
  };

  const handleSubmitComment = () => {
    if (!commentInput.trim() || !currentUser) return;

    const newComment: Comment = {
      id: generateId(),
      content: commentInput.trim(),
      author: currentUser,
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    addComment(audio.id, newComment);
    setCommentInput('');
  };

  const displayedComments = showAllComments ? audio.comments : audio.comments.slice(0, 3);
  const progressPercent = audio ? (currentTime / audio.duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* 背景图片 - 毛玻璃效果 */}
      <div className="fixed inset-0 z-0">
        <img
          src={audio.coverUrl}
          alt=""
          className="w-full h-full object-cover opacity-30 blur-3xl scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white/90" />
      </div>

      {/* 顶部导航 */}
      <div className="relative z-10 sticky top-0 glass border-b border-white/50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/50 transition-colors"
          >
            <ArrowLeft size={20} className="text-neutral-700" />
          </button>
          <div className="flex-1 text-center">
            <p className="text-xs text-neutral-500 uppercase tracking-wider">正在播放</p>
          </div>
          <button className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:bg-white/50 rounded-full transition-colors">
            <Share2 size={18} />
          </button>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6">
        {/* 主要播放器区域 */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* 左侧 - 封面 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-neutral-300/50">
              <motion.img
                src={audio.coverUrl}
                alt={audio.title}
                className="w-full h-full object-cover"
                animate={{ scale: isPlaying ? 1.05 : 1 }}
                transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
              />
              {/* 旋转光效 */}
              {isPlaying && (
                <motion.div
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent, rgba(139, 92, 246, 0.1), transparent)',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                />
              )}
            </div>
            
            {/* 音频类型标签 */}
            <div className="absolute top-4 left-4">
              <span className={`
                px-3 py-1.5 rounded-full text-xs font-medium
                ${audio.type === 'single' 
                  ? 'bg-violet-500 text-white' 
                  : 'bg-cyan-500 text-white'
                }
              `}>
                {audio.type === 'single' ? '单次疗愈' : '计划疗愈'}
              </span>
            </div>
          </motion.div>

          {/* 右侧 - 信息和控制 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col justify-center"
          >
            {/* 标题和描述 */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">
                {audio.title}
              </h1>
              <p className="text-neutral-600 leading-relaxed">
                {audio.description}
              </p>
            </div>

            {/* 作者信息 */}
            <div className="flex items-center gap-3 mb-6">
              <img
                src={audio.author.avatar}
                alt={audio.author.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-md"
              />
              <div>
                <div className="font-medium text-neutral-900">{audio.author.name}</div>
                <div className="text-xs text-neutral-500">AI 疗愈创作者</div>
              </div>
              <button className="ml-auto px-4 py-1.5 bg-neutral-900 text-white rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors">
                关注
              </button>
            </div>

            {/* 标签 */}
            <div className="flex flex-wrap gap-2 mb-6">
              {audio.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="px-3 py-1 bg-white/80 text-neutral-600 text-xs rounded-full border border-neutral-200"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* 统计数据 */}
            <div className="flex items-center gap-6 text-sm text-neutral-500 mb-6">
              <span className="flex items-center gap-1.5">
                <Headphones size={16} />
                {formatNumber(audio.views)} 次播放
              </span>
              <span className="flex items-center gap-1.5">
                <Heart size={16} />
                {formatNumber(audio.likes)} 喜欢
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={16} />
                {formatDate(audio.createdAt)}
              </span>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <button
                onClick={() => toggleFavorite(audio.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all
                  ${isFavorite 
                    ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200' 
                    : 'bg-white text-neutral-700 border border-neutral-200 hover:border-rose-300'
                  }
                `}
              >
                <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                {isFavorite ? '已收藏' : '收藏'}
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-neutral-700 rounded-xl font-medium border border-neutral-200 hover:border-neutral-300 transition-colors">
                <Share2 size={18} />
                分享
              </button>
            </div>
          </motion.div>
        </div>

        {/* 播放器控制栏 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 shadow-xl shadow-neutral-200/50 mb-8"
        >
          {/* 波形可视化 */}
          <div className="flex items-center justify-center gap-1 h-16 mb-4">
            {waveform.map((height, index) => {
              const isPlayed = (index / waveform.length) * 100 <= progressPercent;
              return (
                <motion.div
                  key={index}
                  className={`w-1 rounded-full transition-colors duration-300 ${
                    isPlayed ? 'bg-violet-500' : 'bg-neutral-200'
                  }`}
                  style={{
                    height: `${height * 100}%`,
                  }}
                  animate={isPlaying ? {
                    height: [`${height * 100}%`, `${(height * 0.5 + Math.random() * 0.5) * 100}%`, `${height * 100}%`],
                  } : {}}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: index * 0.02,
                  }}
                />
              );
            })}
          </div>

          {/* 进度条 */}
          <div className="mb-4">
            <div 
              ref={progressRef}
              className="h-1.5 bg-neutral-100 rounded-full cursor-pointer group"
              onClick={handleProgressClick}
            >
              <motion.div 
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            </div>
            <div className="flex justify-between text-xs text-neutral-400 mt-2">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(audio.duration)}</span>
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center justify-between">
            {/* 左侧：播放模式 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                className={`p-2 rounded-full transition-colors ${isShuffle ? 'text-violet-600 bg-violet-50' : 'text-neutral-400 hover:text-neutral-600'}`}
              >
                <Shuffle size={18} />
              </button>
              <button
                onClick={() => setIsRepeat(!isRepeat)}
                className={`p-2 rounded-full transition-colors ${isRepeat ? 'text-violet-600 bg-violet-50' : 'text-neutral-400 hover:text-neutral-600'}`}
              >
                <Repeat size={18} />
              </button>
            </div>

            {/* 中间：播放控制 */}
            <div className="flex items-center gap-4">
              <button 
                onClick={handlePrev}
                className="p-3 text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <SkipBack size={24} fill="currentColor" />
              </button>
              
              <motion.button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-violet-500/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isPlaying ? (
                  <Pause size={28} fill="currentColor" />
                ) : (
                  <Play size={28} fill="currentColor" className="ml-1" />
                )}
              </motion.button>
              
              <button 
                onClick={handleNext}
                className="p-3 text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <SkipForward size={24} fill="currentColor" />
              </button>
            </div>

            {/* 右侧：音量和播放列表 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <button
                onClick={() => setShowPlaylist(!showPlaylist)}
                className={`p-2 rounded-full transition-colors ${showPlaylist ? 'text-violet-600 bg-violet-50' : 'text-neutral-400 hover:text-neutral-600'}`}
              >
                <ListMusic size={18} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* 评论区 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-6 shadow-lg shadow-neutral-100"
        >
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle size={20} className="text-neutral-400" />
            <h2 className="font-semibold text-neutral-900">
              评论 ({audio.comments.length})
            </h2>
          </div>

          {/* 评论输入 */}
          <div className="flex gap-3 mb-6">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                placeholder="写下你的感受，与其他听众交流..."
                className="flex-1 px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
              />
              <motion.button
                onClick={handleSubmitComment}
                disabled={!commentInput.trim()}
                className="px-4 py-2.5 bg-violet-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-violet-600 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Send size={18} />
              </motion.button>
            </div>
          </div>

          {/* 评论列表 */}
          <div className="space-y-4">
            {displayedComments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="flex gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors"
              >
                <img
                  src={comment.author.avatar}
                  alt={comment.author.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-neutral-900 text-sm">{comment.author.name}</span>
                    <span className="text-xs text-neutral-400">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-neutral-700 text-sm mb-2 leading-relaxed">{comment.content}</p>
                  <button
                    onClick={() => likeComment(audio.id, comment.id)}
                    className="flex items-center gap-1 text-xs text-neutral-400 hover:text-rose-500 transition-colors"
                  >
                    <Heart size={14} />
                    {comment.likes > 0 && comment.likes}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {audio.comments.length > 3 && !showAllComments && (
            <button
              onClick={() => setShowAllComments(true)}
              className="w-full py-3 text-violet-600 text-sm font-medium mt-4 hover:bg-violet-50 rounded-xl transition-colors"
            >
              查看全部 {audio.comments.length} 条评论
            </button>
          )}

          {audio.comments.length === 0 && (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center mx-auto mb-3">
                <MessageCircle size={24} className="text-violet-400" />
              </div>
              <p className="text-neutral-400 text-sm">暂无评论，来分享你的感受吧</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* 播放列表侧边栏 */}
      <AnimatePresence>
        {showPlaylist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPlaylist(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-neutral-100">
                <h3 className="font-semibold text-neutral-900">播放列表</h3>
                <button 
                  onClick={() => setShowPlaylist(false)}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <ArrowLeft size={20} className="text-neutral-500" />
                </button>
              </div>
              <div className="overflow-y-auto h-[calc(100vh-65px)]">
                {audios.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(`/audio/${item.id}`);
                      setShowPlaylist(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 p-4 hover:bg-neutral-50 transition-colors border-b border-neutral-50
                      ${item.id === audio.id ? 'bg-violet-50' : ''}
                    `}
                  >
                    <span className="text-xs text-neutral-400 w-6 text-center">
                      {item.id === audio.id && isPlaying ? (
                        <span className="flex gap-0.5 justify-center">
                          <span className="w-0.5 h-3 bg-violet-500 animate-pulse" />
                          <span className="w-0.5 h-4 bg-violet-500 animate-pulse delay-75" />
                          <span className="w-0.5 h-2 bg-violet-500 animate-pulse delay-150" />
                        </span>
                      ) : (
                        index + 1
                      )}
                    </span>
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 text-left">
                      <div className={`font-medium text-sm ${item.id === audio.id ? 'text-violet-600' : 'text-neutral-900'}`}>
                        {item.title}
                      </div>
                      <div className="text-xs text-neutral-500">{item.author.name}</div>
                    </div>
                    <span className="text-xs text-neutral-400">{formatDuration(item.duration)}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AudioPlayer;
