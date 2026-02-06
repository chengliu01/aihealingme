import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, X, SkipBack, SkipForward } from 'lucide-react';
import { useStore } from '@/store';
import { formatDuration } from '@/utils';

const speedOptions = [0.5, 0.8, 1, 1.25, 1.5, 2];

const PlayerBar = () => {
  const navigate = useNavigate();
  const { 
    audios, 
    currentlyPlaying, 
    isPlaying, 
    currentTime,
    isRepeat,
    isShuffle,
    setCurrentlyPlaying, 
    setIsPlaying,
    setCurrentTime
  } = useStore();
  
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [rotation, setRotation] = useState(0);
  const rotationRef = useRef(0);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const progressRef = useRef<HTMLDivElement>(null);

  // 旋转动画
  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (isPlaying) {
        // 8秒转一圈
        rotationRef.current += (deltaTime / 1000) * (360 / 8);
        setRotation(rotationRef.current);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  // 全局播放计时器
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && currentlyPlaying) {
      interval = setInterval(() => {
        setCurrentTime(currentTime + 1);
        
        // 播放结束处理
        if (currentTime >= currentlyPlaying.duration) {
          if (isRepeat) {
            setCurrentTime(0);
          } else {
            handleNext(new MouseEvent('click') as any);
          }
        }
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentlyPlaying, currentTime, playbackSpeed, isRepeat, setCurrentTime]);

  // 获取当前播放音频在列表中的索引
  const currentIndex = audios.findIndex(a => a.id === currentlyPlaying?.id);

  const handleClosePlayer = () => {
    setCurrentlyPlaying(null);
    setIsPlaying(false);
    setCurrentTime(0);
    rotationRef.current = 0;
    setRotation(0);
  };

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentlyPlaying(audios[currentIndex - 1]);
      setIsPlaying(true);
      setCurrentTime(0);
      rotationRef.current = 0;
      setRotation(0);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    let nextIndex = currentIndex;
    if (isShuffle) {
       nextIndex = Math.floor(Math.random() * audios.length);
    } else if (currentIndex < audios.length - 1) {
       nextIndex = currentIndex + 1;
    } else {
       // 列表结束，停止播放或循环列表（这里选择停止）
       setIsPlaying(false);
       setCurrentTime(0);
       return;
    }
    
    setCurrentlyPlaying(audios[nextIndex]);
    setIsPlaying(true);
    setCurrentTime(0);
    rotationRef.current = 0;
    setRotation(0);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  };

  const handleNavigateToDetail = () => {
    if (currentlyPlaying) {
      navigate(`/audio/${currentlyPlaying.id}`);
    }
  };

  const handleProgressClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (progressRef.current && currentlyPlaying) {
      const rect = progressRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = Math.floor(percent * currentlyPlaying.duration);
      setCurrentTime(newTime);
    }
  };

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex >= 0 && currentIndex < audios.length - 1;
  const progressPercent = currentlyPlaying ? (currentTime / currentlyPlaying.duration) * 100 : 0;

  return (
    <AnimatePresence>
      {currentlyPlaying && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[9999]"
        >
          <div className="mx-4 mb-4">
            {/* 主播放器容器 - 可点击跳转 */}
            <div 
              onClick={handleNavigateToDetail}
              className="bg-neutral-900/80 backdrop-blur-2xl rounded-2xl py-2 px-3 shadow-2xl border border-white/10 cursor-pointer hover:bg-neutral-900/85 transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* 旋转的封面图片 */}
                <div 
                  className="relative flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className="w-10 h-10 rounded-lg overflow-hidden shadow-lg"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transition: isPlaying ? 'none' : 'transform 0.3s ease-out',
                    }}
                  >
                    <img
                      src={currentlyPlaying.coverUrl}
                      alt={currentlyPlaying.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* 中心孔装饰 */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-900/80 border border-white/20 shadow-inner" />
                  </div>
                </div>

                {/* 音频信息 */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-medium text-white truncate">
                    {currentlyPlaying.title}
                  </h4>
                  <p className="text-[11px] text-neutral-400 truncate">
                    {currentlyPlaying.author.name} · {formatDuration(currentTime)} / {formatDuration(currentlyPlaying.duration)}
                  </p>
                </div>

                {/* 播放控制区 */}
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  {/* 上一首 */}
                  <button
                    onClick={handlePrev}
                    disabled={!canGoPrev}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      canGoPrev 
                        ? 'text-white/80 hover:text-white hover:bg-white/10' 
                        : 'text-white/20 cursor-not-allowed'
                    }`}
                  >
                    <SkipBack size={16} fill="currentColor" />
                  </button>

                  {/* 播放/暂停 */}
                  <button
                    onClick={handleTogglePlay}
                    className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-neutral-900 shadow-lg hover:scale-105 active:scale-95 transition-transform"
                  >
                    {isPlaying ? (
                      <Pause size={16} fill="currentColor" />
                    ) : (
                      <Play size={16} fill="currentColor" className="ml-0.5" />
                    )}
                  </button>

                  {/* 下一首 */}
                  <button
                    onClick={handleNext}
                    disabled={!canGoNext}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      canGoNext 
                        ? 'text-white/80 hover:text-white hover:bg-white/10' 
                        : 'text-white/20 cursor-not-allowed'
                    }`}
                  >
                    <SkipForward size={16} fill="currentColor" />
                  </button>
                </div>

                {/* 倍速控制 */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="px-2 py-1.5 rounded-lg text-[11px] font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors min-w-[36px]"
                  >
                    {playbackSpeed}x
                  </button>

                  {/* 倍速菜单 */}
                  <AnimatePresence>
                    {showSpeedMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full right-0 mb-2 bg-neutral-800/95 backdrop-blur-xl rounded-xl p-1.5 shadow-2xl border border-white/10"
                      >
                        <div className="flex flex-row gap-1">
                          {speedOptions.map((speed) => (
                            <button
                              key={speed}
                              onClick={() => handleSpeedChange(speed)}
                              className={`
                                px-2 py-1 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap
                                ${playbackSpeed === speed 
                                  ? 'bg-white text-neutral-900' 
                                  : 'text-white/70 hover:text-white hover:bg-white/10'
                                }
                              `}
                            >
                              {speed}x
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 关闭播放器按钮 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClosePlayer();
                  }}
                  className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors"
                  title="关闭播放器"
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </div>

              {/* 进度条 */}
              <div 
                className="mt-2 px-1 pb-1" 
                onClick={handleProgressClick}
              >
                <div 
                  ref={progressRef}
                  className="h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer group hover:h-1.5 transition-all"
                >
                  <div 
                    className="h-full bg-white/60 rounded-full group-hover:bg-white/80 transition-all relative"
                    style={{ width: `${progressPercent}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlayerBar;
