import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Play, Pause, SkipBack, SkipForward,
  Heart, Lock, Check, Clock, Calendar, Target,
  ChevronDown, ChevronUp, Send, MessageCircle,
  Pencil, Share2, X as XIcon
} from 'lucide-react';
import { useStore } from '@/store';
import { useAuthStore } from '@/store/authStore';
import { formatDuration, formatDate, formatNumber, generateId, audioTagOptions } from '@/utils';
import type { PlanStage, HealingPlan } from '@/types';

const generateWaveform = () => Array.from({ length: 40 }, () => Math.random() * 0.6 + 0.2);

const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

/** 格式化调度日期为可读格式 */
function formatScheduledDate(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
}

/** 检查某阶段是否已解锁 */
function isStageUnlocked(stage: PlanStage, index: number, plan: HealingPlan): boolean {
  // 第一个阶段始终解锁
  if (index === 0) return true;
  
  // 已完成的阶段已解锁
  if (stage.status === 'completed' || stage.status === 'ready') return true;
  
  const prevStage = plan.stages[index - 1];
  if (!prevStage) return false;
  
  // 必须同时满足两个条件：
  // 1. 前一个阶段已完成
  // 2. 当前时间已达到解锁日期
  const isPrevCompleted = prevStage.status === 'completed';
  const isDateReached = stage.scheduledDate 
    ? new Date() >= new Date(stage.scheduledDate)
    : true; // 如果没有设置日期，只检查前置条件
  
  return isPrevCompleted && isDateReached;
}

/** 获取阶段解锁状态的提示信息 */
function getUnlockHint(stage: PlanStage, index: number, plan: HealingPlan): string {
  if (index === 0) return '';
  if (stage.status === 'completed' || stage.status === 'ready') return '';
  
  const prevStage = plan.stages[index - 1];
  if (!prevStage) return '';
  
  const isPrevCompleted = prevStage.status === 'completed';
  const isDateReached = stage.scheduledDate 
    ? new Date() >= new Date(stage.scheduledDate)
    : true;
  
  if (!isPrevCompleted && !isDateReached) {
    return `需完成上一阶段并等待至${formatScheduledDate(stage.scheduledDate)}`;
  } else if (!isPrevCompleted) {
    return '需完成上一阶段';
  } else if (!isDateReached) {
    return `${formatScheduledDate(stage.scheduledDate)}解锁`;
  }
  
  return '';
}

const PlanDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    plans,
    audios,
    myAudios,
    completeStage,
    currentlyPlaying,
    isPlaying,
    currentTime,
    setCurrentlyPlaying,
    setIsPlaying,
    setCurrentTime,
    toggleFavorite,
    favoriteAudios,
    addComment,
    likeComment,
    updatePlan,
    publishAudio,
    currentUser,
  } = useStore();
  const { user: authUser } = useAuthStore();

  const plan = plans.find(p => p.id === id);
  const [selectedStageIndex, setSelectedStageIndex] = useState(0);
  const [waveform] = useState(generateWaveform);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const [playlistCollapsed, setPlaylistCollapsed] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  // 编辑计划名称
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(plan?.title || '');
  const titleInputRef = useRef<HTMLInputElement>(null);

  // 分享音频模态框
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTags, setShareTags] = useState<string[]>([]);
  const [shareDescription, setShareDescription] = useState('');

  const easeOut = [0.25, 0.1, 0.25, 1];

  // 获取该计划关联的所有音频
  const allAudios = [...audios, ...myAudios];
  const planAudios = allAudios.filter(a => a.planId === id);

  // 当前选中阶段
  const currentStage = plan?.stages[selectedStageIndex];
  // 当前阶段对应的音频
  const stageAudio = planAudios.find(a => a.planStage === selectedStageIndex)
    || (currentStage?.audio)
    || planAudios[0]; // fallback

  // 评论用户
  const commentAuthor = authUser ? {
    id: (authUser as any)._id || (authUser as any).id || 'unknown',
    name: authUser.nickname || authUser.username || '匿名用户',
    avatar: authUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.username || 'default'}`,
    email: authUser.email || '',
    createdAt: new Date().toISOString(),
  } : null;

  const isFavorite = stageAudio ? favoriteAudios.some(a => a.id === stageAudio.id) : false;

  // 自动播放当前阶段音频
  useEffect(() => {
    if (stageAudio && currentlyPlaying?.id !== stageAudio.id) {
      setCurrentlyPlaying(stageAudio);
      setIsPlaying(false);
    }
  }, [stageAudio?.id]);

  // 监听播放完成，自动标记阶段完成
  useEffect(() => {
    if (!stageAudio || !currentStage || !plan) return;
    if (currentStage.status === 'completed') return; // 已完成的不再处理
    
    // 当播放时间达到音频时长（留1秒容错）时，自动完成
    if (currentTime >= stageAudio.duration - 1 && currentTime > 0) {
      completeStage(plan.id, currentStage.id);
      
      // 自动跳到下一个可解锁的阶段
      setTimeout(() => {
        const nextIndex = plan.stages.findIndex((s, i) => {
          if (i <= selectedStageIndex) return false;
          if (s.status === 'completed') return false;
          return isStageUnlocked(s, i, plan);
        });
        if (nextIndex >= 0) {
          setSelectedStageIndex(nextIndex);
        }
      }, 1000);
    }
  }, [currentTime, stageAudio?.duration, currentStage?.status, currentStage?.id, selectedStageIndex, plan, completeStage]);

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-500 text-[14px]">计划不存在</p>
          <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-xl text-[14px]">返回</button>
        </div>
      </div>
    );
  }

  const completedCount = plan.stages.filter(s => s.status === 'completed').length;
  const progressPercent = stageAudio ? (currentTime / stageAudio.duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !stageAudio) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setCurrentTime(Math.floor(percent * stageAudio.duration));
  };

  const handleStageSelect = (index: number) => {
    if (!isStageUnlocked(plan.stages[index], index, plan)) return;
    setSelectedStageIndex(index);
    setShowAllComments(false);
  };

  const handlePrevStage = () => {
    if (selectedStageIndex > 0) {
      const prevIdx = selectedStageIndex - 1;
      if (isStageUnlocked(plan.stages[prevIdx], prevIdx, plan)) {
        setSelectedStageIndex(prevIdx);
      }
    }
  };

  const handleNextStage = () => {
    if (selectedStageIndex < plan.stages.length - 1) {
      const nextIdx = selectedStageIndex + 1;
      if (isStageUnlocked(plan.stages[nextIdx], nextIdx, plan)) {
        setSelectedStageIndex(nextIdx);
      }
    }
  };

  // 编辑标题
  const handleStartEditTitle = () => {
    setEditTitle(plan?.title || '');
    setIsEditingTitle(true);
    setTimeout(() => titleInputRef.current?.focus(), 50);
  };

  const handleSaveTitle = () => {
    if (plan && editTitle.trim()) {
      updatePlan(plan.id, { title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleCancelEditTitle = () => {
    setIsEditingTitle(false);
    setEditTitle(plan?.title || '');
  };

  // 分享音频
  const isMyAudio = stageAudio && currentUser && stageAudio.author.id === currentUser.id;
  const canShare = isMyAudio && stageAudio && !stageAudio.isPublished;

  const handleOpenShare = () => {
    if (stageAudio) {
      setShareTags(stageAudio.tags || []);
      setShareDescription(stageAudio.description || '');
      setShowShareModal(true);
    }
  };

  const handleConfirmShare = () => {
    if (stageAudio && canShare) {
      publishAudio(stageAudio.id, shareTags, shareDescription);
      setShowShareModal(false);
    }
  };

  const toggleShareTag = (tag: string) => {
    setShareTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSubmitComment = () => {
    if (!commentInput.trim() || !commentAuthor || !stageAudio) return;
    addComment(stageAudio.id, {
      id: generateId(),
      content: commentInput.trim(),
      author: commentAuthor,
      likes: 0,
      isLikedByCurrentUser: false,
      createdAt: new Date().toISOString(),
    });
    setCommentInput('');
  };

  const displayedComments = stageAudio
    ? (showAllComments ? stageAudio.comments : stageAudio.comments.slice(0, 3))
    : [];

  return (
    <div className="min-h-screen pb-32 relative">
      {/* 背景 */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f0f2f5] via-[#f6f7fb] to-[#eef1f5]" />
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
          <div className="flex-1 text-center">
            {isEditingTitle ? (
              <div className="flex items-center justify-center gap-2 px-4">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') handleCancelEditTitle();
                  }}
                  onBlur={handleSaveTitle}
                  maxLength={30}
                  className="text-[13px] font-medium text-neutral-700 bg-neutral-100 border border-neutral-200 rounded-lg px-3 py-1 outline-none focus:border-neutral-400 transition-colors w-48 text-center"
                />
              </div>
            ) : (
              <button
                onClick={handleStartEditTitle}
                className="flex items-center justify-center gap-1.5 mx-auto group"
              >
                <p className="text-[13px] font-medium text-neutral-700 truncate">{plan.title}</p>
                <Pencil size={12} className="text-neutral-300 group-hover:text-neutral-500 transition-colors shrink-0" />
              </button>
            )}
          </div>
          <div className="w-9" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-6">
        {/* 计划进度概览 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: easeOut }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center">
                <Target size={18} className="text-white" />
              </div>
              <div>
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle();
                      if (e.key === 'Escape') handleCancelEditTitle();
                    }}
                    onBlur={handleSaveTitle}
                    maxLength={30}
                    className="text-[16px] font-semibold text-neutral-800 bg-neutral-100 border border-neutral-200 rounded-lg px-2 py-0.5 outline-none focus:border-neutral-400 transition-colors w-full"
                  />
                ) : (
                  <button onClick={handleStartEditTitle} className="flex items-center gap-1.5 group text-left">
                    <h1 className="text-[16px] font-semibold text-neutral-800">{plan.title}</h1>
                    <Pencil size={13} className="text-neutral-300 group-hover:text-neutral-500 transition-colors shrink-0" />
                  </button>
                )}
                <p className="text-[12px] text-neutral-400">
                  {completedCount}/{plan.stages.length} 阶段完成 · {formatDuration(plan.totalDuration)}
                </p>
              </div>
            </div>
            <span className="text-[18px] font-bold text-neutral-800">
              {Math.round((completedCount / plan.stages.length) * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-neutral-900 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / plan.stages.length) * 100}%` }}
              transition={{ duration: 0.8, ease: easeOut }}
            />
          </div>
        </motion.div>

        {/* 主体内容：左右布局 */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* ==================== 左侧：播放器和详情 ==================== */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ease: easeOut }}
            className="flex-1 min-w-0"
          >
            {/* 当前阶段信息 */}
            <div className="card p-6 mb-4">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center text-[16px] font-bold shrink-0">
                  {selectedStageIndex + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-[18px] font-semibold text-neutral-800">
                      {currentStage?.title || '未知阶段'}
                    </h2>
                    {currentStage?.status === 'completed' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-medium rounded-lg ring-1 ring-emerald-100">
                        <Check size={10} /> 已完成
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-neutral-500 leading-relaxed">
                    {currentStage?.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {formatDuration(currentStage?.duration || 0)}
                    </span>
                    {currentStage?.scheduledDate && (
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {formatScheduledDate(currentStage.scheduledDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 播放器 - 唱片风格 */}
              {stageAudio ? (
                <>
                  <div className="flex justify-center mb-6">
                    <div className="relative w-48 h-48 md:w-56 md:h-56">
                      <div
                        key={stageAudio.id}
                        className="w-full h-full rounded-full overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.12)] ring-6 ring-white/50 animate-spin-slow"
                        style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
                      >
                        <img src={stageAudio.coverUrl} alt={stageAudio.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border shadow-inner flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-neutral-200/50" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 波形 */}
                  <div className="flex items-center justify-center gap-[3px] h-10 mb-3">
                    {waveform.map((height, index) => {
                      const isPlayed = (index / waveform.length) * 100 <= progressPercent;
                      return (
                        <motion.div
                          key={index}
                          className={`w-[3px] rounded-full transition-colors duration-200 ${isPlayed ? 'bg-neutral-800' : 'bg-neutral-200'}`}
                          style={{ height: `${height * 100}%` }}
                          animate={isPlaying && isPlayed ? {
                            height: [`${height * 100}%`, `${(height * 0.6 + Math.random() * 0.4) * 100}%`, `${height * 100}%`],
                          } : {}}
                          transition={{ duration: 0.4, repeat: Infinity }}
                        />
                      );
                    })}
                  </div>

                  {/* 进度条 */}
                  <div className="mb-6">
                    <div
                      ref={progressRef}
                      onClick={handleProgressClick}
                      className="h-1 bg-neutral-200 rounded-full cursor-pointer group relative hover:h-1.5 transition-all"
                    >
                      <motion.div className="h-full bg-neutral-800 rounded-full" style={{ width: `${progressPercent}%` }} />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-neutral-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ left: `${progressPercent}%`, transform: 'translate(-50%, -50%)' }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-[11px] text-neutral-400">
                      <span>{formatDuration(currentTime)}</span>
                      <span>{formatDuration(stageAudio.duration)}</span>
                    </div>
                  </div>

                  {/* 控制按钮 */}
                  <div className="flex items-center justify-between px-2 mb-4">
                    {/* 倍速 */}
                    <div className="relative">
                      <motion.button
                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 flex flex-col items-center justify-center rounded-full text-neutral-400 hover:text-neutral-800 transition-colors"
                      >
                        <span className="text-[13px] font-medium">{playbackSpeed}x</span>
                      </motion.button>
                      <AnimatePresence>
                        {showSpeedMenu && (
                          <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSpeedMenu(false)} className="fixed inset-0 z-40" />
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.9 }}
                              className="absolute bottom-full left-0 mb-2 p-1.5 bg-white/95 backdrop-blur-xl rounded-2xl border border-black/[0.06] shadow-xl z-50 min-w-[60px]"
                            >
                              {speedOptions.map((speed) => (
                                <button
                                  key={speed}
                                  onClick={() => { setPlaybackSpeed(speed); setShowSpeedMenu(false); }}
                                  className={`px-3 py-2 rounded-xl text-[12px] font-medium transition-all w-full ${playbackSpeed === speed ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
                                >
                                  {speed}x
                                </button>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-5">
                      <motion.button onClick={handlePrevStage} whileTap={{ scale: 0.9 }} className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors disabled:opacity-30" disabled={selectedStageIndex === 0}>
                        <SkipBack size={24} fill="currentColor" />
                      </motion.button>
                      <motion.button
                        onClick={() => setIsPlaying(!isPlaying)}
                        whileTap={{ scale: 0.95 }}
                        className="w-14 h-14 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-lg shadow-neutral-900/20 hover:scale-105 transition-transform"
                      >
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-0.5" />}
                      </motion.button>
                      <motion.button onClick={handleNextStage} whileTap={{ scale: 0.9 }} className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors disabled:opacity-30" disabled={selectedStageIndex >= plan.stages.length - 1}>
                        <SkipForward size={24} fill="currentColor" />
                      </motion.button>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* 分享按钮 */}
                      {canShare && (
                        <motion.button
                          onClick={handleOpenShare}
                          whileTap={{ scale: 0.9 }}
                          className="w-10 h-10 flex items-center justify-center rounded-full transition-colors text-violet-500 hover:text-violet-600 hover:bg-violet-50"
                          title="发布到社区"
                        >
                          <Share2 size={18} strokeWidth={2} />
                        </motion.button>
                      )}
                      {/* 收藏按钮 */}
                      <motion.button
                        onClick={() => stageAudio && toggleFavorite(stageAudio.id)}
                        whileTap={{ scale: 0.9 }}
                        className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isFavorite ? 'text-rose-500' : 'text-neutral-400 hover:text-rose-400'}`}
                      >
                        <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={2} />
                      </motion.button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                    <Play size={24} className="text-neutral-300" />
                  </div>
                  <p className="text-[14px] text-neutral-500">该阶段音频尚未生成</p>
                  <p className="text-[12px] text-neutral-400 mt-1">音频将在计划进行时自动生成</p>
                </div>
              )}
            </div>

            {/* 评论区 */}
            {stageAudio && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, ease: easeOut }}
                className="card p-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle size={18} className="text-neutral-600" strokeWidth={1.5} />
                  <h2 className="text-[15px] font-semibold text-neutral-800">评论 ({stageAudio.comments.length})</h2>
                </div>

                <div className="flex gap-3 mb-4">
                  <img
                    src={commentAuthor?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                    alt="用户"
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

                {stageAudio.comments.length > 0 ? (
                  <div className="space-y-3">
                    {displayedComments.map((comment) => (
                      <motion.div key={comment.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                        <img src={comment.author.avatar} alt={comment.author.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[13px] font-medium text-neutral-700">{comment.author.name}</span>
                            <span className="text-[11px] text-neutral-400">{formatDate(comment.createdAt)}</span>
                          </div>
                          <p className="text-[13px] text-neutral-600 leading-relaxed">{comment.content}</p>
                          <motion.button
                            onClick={() => likeComment(stageAudio.id, comment.id)}
                            whileTap={{ scale: 0.9 }}
                            className={`flex items-center gap-1 mt-1.5 text-[11px] ${comment.isLikedByCurrentUser ? 'text-rose-500' : 'text-neutral-400 hover:text-rose-500'} transition-colors`}
                          >
                            <Heart size={12} fill={comment.isLikedByCurrentUser ? 'currentColor' : 'none'} />
                            {comment.likes > 0 && formatNumber(comment.likes)}
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                    {stageAudio.comments.length > 3 && !showAllComments && (
                      <button onClick={() => setShowAllComments(true)} className="w-full py-2 text-[13px] text-neutral-500 hover:text-neutral-700 transition-colors">
                        查看全部 {stageAudio.comments.length} 条评论
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-[13px] text-neutral-400">暂无评论，来抢沙发吧</p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* ==================== 右侧：阶段播放列表 ==================== */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, ease: easeOut }}
            className="lg:w-[380px] lg:shrink-0"
          >
            <div className="card overflow-hidden lg:sticky lg:top-20">
              {/* 列表头 */}
              <div className="flex items-center justify-between p-4 border-b border-black/[0.04]">
                <div>
                  <h3 className="text-[14px] font-semibold text-neutral-800">疗愈阶段</h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">{plan.stages.length} 个阶段 · {completedCount} 已完成</p>
                </div>
                <button
                  onClick={() => setPlaylistCollapsed(!playlistCollapsed)}
                  className="lg:hidden w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {playlistCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                </button>
              </div>

              {/* 阶段列表 */}
              <AnimatePresence initial={false}>
                {!playlistCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                      {plan.stages.map((stage, index) => {
                        const unlocked = isStageUnlocked(stage, index, plan);
                        const isActive = index === selectedStageIndex;
                        const isCompleted = stage.status === 'completed';
                        const unlockHint = getUnlockHint(stage, index, plan);

                        return (
                          <motion.button
                            key={stage.id}
                            onClick={() => handleStageSelect(index)}
                            disabled={!unlocked}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05, ease: easeOut }}
                            className={`
                              w-full text-left p-4 flex items-start gap-3 transition-all duration-200 border-b border-black/[0.03] last:border-b-0
                              ${isActive
                                ? 'bg-neutral-900/[0.04]'
                                : unlocked
                                  ? 'hover:bg-neutral-50'
                                  : 'opacity-50 cursor-not-allowed'
                              }
                            `}
                          >
                            {/* 序号/状态 */}
                            <div className={`
                              w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-[13px] font-bold transition-all
                              ${isCompleted
                                ? 'bg-emerald-100 text-emerald-600'
                                : isActive
                                  ? 'bg-neutral-900 text-white'
                                  : unlocked
                                    ? 'bg-neutral-100 text-neutral-500'
                                    : 'bg-neutral-100 text-neutral-300'
                              }
                            `}>
                              {isCompleted ? (
                                <Check size={16} strokeWidth={2.5} />
                              ) : unlocked ? (
                                isActive ? <Play size={14} fill="currentColor" className="ml-0.5" /> : index + 1
                              ) : (
                                <Lock size={14} />
                              )}
                            </div>

                            {/* 内容 */}
                            <div className="flex-1 min-w-0 py-0.5">
                              <div className="flex items-center gap-2 mb-0.5">
                                <h4 className={`text-[13px] font-medium truncate ${isActive ? 'text-neutral-900' : unlocked ? 'text-neutral-700' : 'text-neutral-400'}`}>
                                  {stage.title}
                                </h4>
                              </div>
                              <p className={`text-[11px] truncate mb-1.5 ${unlocked ? 'text-neutral-400' : 'text-neutral-300'}`}>
                                {stage.description}
                              </p>
                              <div className="flex items-center gap-3 text-[10px]">
                                <span className={`flex items-center gap-1 ${unlocked ? 'text-neutral-400' : 'text-neutral-300'}`}>
                                  <Clock size={10} /> {formatDuration(stage.duration)}
                                </span>
                                {!unlocked && unlockHint ? (
                                  <span className="flex items-center gap-1 text-amber-600">
                                    <Lock size={10} /> {unlockHint}
                                  </span>
                                ) : stage.scheduledDate ? (
                                  <span className={`flex items-center gap-1 ${unlocked ? 'text-neutral-400' : 'text-neutral-300'}`}>
                                    <Calendar size={10} /> {formatScheduledDate(stage.scheduledDate)}
                                  </span>
                                ) : null}
                              </div>
                            </div>

                            {/* 右侧状态标签 */}
                            <div className="shrink-0 pt-1">
                              {isCompleted ? (
                                <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">已完成</span>
                              ) : isActive ? (
                                <span className="text-[10px] font-medium text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded-md">播放中</span>
                              ) : !unlocked ? (
                                <span className="text-[10px] font-medium text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                                  <Lock size={8} /> 未解锁
                                </span>
                              ) : null}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 分享模态框 */}
      <AnimatePresence>
        {showShareModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareModal(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[480px] sm:max-h-[600px] bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06]">
                <h2 className="text-[16px] font-semibold text-neutral-800">发布到社区</h2>
                <motion.button
                  onClick={() => setShowShareModal(false)}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
                >
                  <XIcon size={18} className="text-neutral-400" />
                </motion.button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-6">
                  <label className="block text-[14px] font-medium text-neutral-700 mb-3">
                    选择标签 <span className="text-[12px] text-neutral-400 font-normal">(可多选)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {audioTagOptions.map((tag) => (
                      <motion.button
                        key={tag.value}
                        onClick={() => toggleShareTag(tag.value)}
                        whileTap={{ scale: 0.96 }}
                        className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 ${
                          shareTags.includes(tag.value)
                            ? 'bg-neutral-900 text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        <span className="mr-1.5">{tag.icon}</span>
                        {tag.label}
                      </motion.button>
                    ))}
                  </div>
                  {shareTags.length === 0 && (
                    <p className="mt-2 text-[12px] text-rose-500">请至少选择一个标签</p>
                  )}
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-neutral-700 mb-3">
                    分享文案 <span className="text-[12px] text-neutral-400 font-normal">(可选)</span>
                  </label>
                  <textarea
                    value={shareDescription}
                    onChange={(e) => setShareDescription(e.target.value)}
                    placeholder="分享一下这个音频的亮点或适用场景..."
                    rows={5}
                    maxLength={500}
                    className="w-full px-4 py-3 bg-neutral-50 border border-black/[0.06] rounded-2xl text-[14px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-neutral-300 transition-all resize-none"
                  />
                  <div className="mt-2 text-right text-[11px] text-neutral-400">
                    {shareDescription.length}/500
                  </div>
                </div>
              </div>
              <div className="flex gap-3 px-6 py-4 border-t border-black/[0.06]">
                <motion.button
                  onClick={() => setShowShareModal(false)}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 rounded-xl bg-neutral-100 text-neutral-600 text-[14px] font-medium hover:bg-neutral-200 transition-colors"
                >
                  取消
                </motion.button>
                <motion.button
                  onClick={handleConfirmShare}
                  disabled={shareTags.length === 0}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 rounded-xl bg-neutral-900 text-white text-[14px] font-medium hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  确认发布
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlanDetail;
