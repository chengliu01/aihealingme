import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Heart, Play, Pause, SkipBack, SkipForward,
  Send, MessageCircle
} from 'lucide-react';
import { useStore } from '@/store';
import { useAuthStore } from '@/store/authStore';
import { formatDuration, formatDate, formatNumber, generateId } from '@/utils';

const generateWaveform = () => Array.from({ length: 40 }, () => Math.random() * 0.6 + 0.2);

const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

const AudioPlayer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    audios, 
    toggleFavorite, 
    favoriteAudios,
    currentlyPlaying,
    isPlaying,
    currentTime,
    isShuffle,
    setCurrentlyPlaying,
    setIsPlaying,
    setCurrentTime,
    currentUser,
    addComment,
    likeComment
  } = useStore();
  const { user: authUser } = useAuthStore();
  
  const audio = audios.find(a => a.id === id);

  // 使用真实用户数据构建评论作者信息
  const commentAuthor: import('@/types').User | null = authUser ? {
    id: (authUser as any)._id || (authUser as any).id || 'unknown',
    name: authUser.nickname || authUser.username || '匿名用户',
    avatar: authUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.username || 'default'}`,
    email: authUser.email || '',
    createdAt: new Date().toISOString(),
  } : currentUser;
  const isFavorite = favoriteAudios.some(a => a.id === id);
  
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [waveform] = useState(generateWaveform());
  const [commentInput, setCommentInput] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (audio && currentlyPlaying?.id !== audio.id) {
      setCurrentlyPlaying(audio);
      setIsPlaying(true);
      setCurrentTime(0);
    }
  }, [audio, currentlyPlaying, setCurrentlyPlaying, setIsPlaying, setCurrentTime]);

  if (!audio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-500 text-[14px]">音频不存在</p>
          <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-xl text-[14px]">
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
    let nextIndex = isShuffle 
      ? Math.floor(Math.random() * audios.length)
      : (currentIndex < audios.length - 1 ? currentIndex + 1 : 0);
    navigate(`/audio/${audios[nextIndex].id}`);
  };

  const handleSubmitComment = () => {
    if (!commentInput.trim() || !commentAuthor || !audio) return;
    
    addComment(audio.id, {
      id: generateId(),
      content: commentInput.trim(),
      author: commentAuthor,
      likes: 0,
      isLikedByCurrentUser: false,
      createdAt: new Date().toISOString(),
    });
    setCommentInput('');
  };

  const progressPercent = (currentTime / audio.duration) * 100;
  const displayedComments = showAllComments ? audio.comments : audio.comments.slice(0, 3);
  const easeOut = [0.25, 0.1, 0.25, 1];

  return (
    <div className="min-h-screen pb-32 relative">
      {/* 背景 */}
      <div className="fixed inset-0 -z-10">
        <img
          src={audio.coverUrl}
          alt=""
          className="w-full h-full object-cover opacity-20 blur-3xl scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#fbfbfe]/90 via-[#f6f7fb]/70 to-[#f2f4f8]" />
      </div>

      {/* 导航 */}
      <div className="sticky top-0 z-50 bg-white/55 backdrop-blur-2xl border-b border-black/[0.03] shadow-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 h-14 flex items-center">
          <motion.button 
            onClick={() => navigate(-1)}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <ArrowLeft size={20} strokeWidth={1.5} />
          </motion.button>
          <p className="flex-1 text-center text-[12px] text-neutral-400 uppercase tracking-wider">正在播放</p>
          <div className="w-9" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-6">
        {/* 封面 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="mb-10 flex justify-center"
        >
          <div className="relative w-64 h-64 md:w-72 md:h-72">
            <div 
              key={audio.id}
              className="w-full h-full rounded-full overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-8 ring-white/50 animate-spin-slow"
              style={{
                animationPlayState: isPlaying ? 'running' : 'paused',
              }}
            >
              <img
                src={audio.coverUrl}
                alt={audio.title}
                className="w-full h-full object-cover"
              />
            </div>
            {/* 中心孔装饰 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm border shadow-inner flex items-center justify-center">
                 <div className="w-4 h-4 rounded-full bg-neutral-200/50" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* 信息 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ease: easeOut }}
          className="text-center mb-8"
        >
          <h1 className="text-[22px] font-semibold text-neutral-800 mb-2">{audio.title}</h1>
          <p className="text-[14px] text-neutral-400">{audio.author.name}</p>
        </motion.div>

        {/* 波形 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-[3px] h-12 mb-4"
        >
          {waveform.map((height, index) => {
            const isPlayed = (index / waveform.length) * 100 <= progressPercent;
            return (
              <motion.div
                key={index}
                className={`w-[3px] rounded-full transition-colors duration-200 ${
                  isPlayed ? 'bg-neutral-800' : 'bg-neutral-200'
                }`}
                style={{ height: `${height * 100}%` }}
                animate={isPlaying && isPlayed ? {
                  height: [`${height * 100}%`, `${(height * 0.6 + Math.random() * 0.4) * 100}%`, `${height * 100}%`],
                } : {}}
                transition={{ duration: 0.4, repeat: Infinity }}
              />
            );
          })}
        </motion.div>

        {/* 进度条 */}
        <div className="mb-8">
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="h-1 bg-neutral-200 rounded-full cursor-pointer group relative hover:h-1.5 transition-all"
          >
            <motion.div
              className="h-full bg-neutral-800 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-neutral-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${progressPercent}%`, transform: 'translate(-50%, -50%)' }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[11px] text-neutral-400">
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(audio.duration)}</span>
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, ease: easeOut }}
            className="flex items-center justify-between px-6 mb-10"
          >
            {/* 倍速 */}
            <div className="relative">
              <motion.button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 flex flex-col items-center justify-center rounded-full text-neutral-400 hover:text-neutral-800 transition-colors"
                title="倍速"
              >
                <span className="text-[13px] font-medium">{playbackSpeed}x</span>
              </motion.button>
              
              {/* 倍速下拉菜单 */}
              <AnimatePresence>
                {showSpeedMenu && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowSpeedMenu(false)}
                      className="fixed inset-0 z-40"
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      className="absolute bottom-full left-0 mb-2 p-1.5 bg-white/95 backdrop-blur-xl rounded-2xl border border-black/[0.06] shadow-xl z-50 min-w-[60px]"
                    >
                      <div className="flex flex-col gap-1">
                        {speedOptions.map((speed) => (
                          <button
                            key={speed}
                            onClick={() => {
                              setPlaybackSpeed(speed);
                              setShowSpeedMenu(false);
                            }}
                            className={`px-3 py-2 rounded-xl text-[12px] font-medium transition-all ${
                              playbackSpeed === speed
                                ? 'bg-neutral-900 text-white'
                                : 'text-neutral-600 hover:bg-neutral-100'
                            }`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* 播放控制核心区 */}
            <div className="flex items-center gap-6">
              <motion.button
                onClick={handlePrev}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <SkipBack size={28} fill="currentColor" />
              </motion.button>

              <motion.button
                onClick={() => setIsPlaying(!isPlaying)}
                whileTap={{ scale: 0.95 }}
                className="w-16 h-16 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-lg shadow-neutral-900/20 hover:scale-105 transition-transform"
              >
                {isPlaying ? (
                  <Pause size={28} fill="currentColor" />
                ) : (
                  <Play size={28} fill="currentColor" className="ml-1" />
                )}
              </motion.button>

              <motion.button
                onClick={handleNext}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <SkipForward size={28} fill="currentColor" />
              </motion.button>
            </div>

            {/* 收藏 */}
            <motion.button
              onClick={() => toggleFavorite(audio.id)}
              whileTap={{ scale: 0.9 }}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                isFavorite 
                  ? 'text-rose-500' 
                  : 'text-neutral-400 hover:text-rose-400'
              }`}
            >
              <Heart size={22} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={2} />
            </motion.button>
          </motion.div>
        </div>

        {/* 评论区 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, ease: easeOut }}
          className="mt-10 card p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle size={18} className="text-neutral-600" strokeWidth={1.5} />
            <h2 className="text-[15px] font-semibold text-neutral-800">评论 ({audio.comments.length})</h2>
          </div>
          
          {/* 评论输入 */}
          <div className="flex gap-3 mb-4">
            <img
              src={commentAuthor?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=default`}
              alt={commentAuthor?.name || '用户'}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="发表你的评论..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                className="w-full input-clean px-4 py-2.5 rounded-xl text-[13px] pr-12"
              />
              <motion.button
                onClick={handleSubmitComment}
                disabled={!commentInput.trim()}
                whileTap={{ scale: 0.95 }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-600 disabled:opacity-40 transition-colors"
              >
                <Send size={16} />
              </motion.button>
            </div>
          </div>

          {/* 评论列表 */}
          {audio.comments.length > 0 ? (
            <div className="space-y-3">
              {displayedComments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[13px] font-medium text-neutral-700">{comment.author.name}</span>
                      <span className="text-[11px] text-neutral-400">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-[13px] text-neutral-600 leading-relaxed">{comment.content}</p>
                    <motion.button
                      onClick={() => likeComment(audio.id, comment.id)}
                      whileTap={{ scale: 0.9 }}
                      className={`flex items-center gap-1 mt-1.5 text-[11px] ${
                        comment.isLikedByCurrentUser ? 'text-rose-500' : 'text-neutral-400 hover:text-rose-500'
                      } transition-colors`}
                    >
                      <Heart size={12} fill={comment.isLikedByCurrentUser ? 'currentColor' : 'none'} />
                      {comment.likes > 0 && formatNumber(comment.likes)}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
              
              {audio.comments.length > 3 && !showAllComments && (
                <button
                  onClick={() => setShowAllComments(true)}
                  className="w-full py-2 text-[13px] text-neutral-500 hover:text-neutral-700 transition-colors"
                >
                  查看全部 {audio.comments.length} 条评论
                </button>
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-[13px] text-neutral-400">暂无评论，来抢沙发吧</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AudioPlayer;
