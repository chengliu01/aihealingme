import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Heart, Music2, Calendar, Play, Headphones, MoreVertical, Edit, Trash2, Globe, Quote, Camera } from 'lucide-react';
import { useStore } from '@/store';
import { useAuthStore } from '@/store/authStore';
import { formatDuration, formatNumber, formatDate } from '@/utils';
import { userAPI } from '@/services/api';
import Header from '@/components/Header';

// 生命周期映射
const lifeStageMap: Record<string, { emoji: string; label: string }> = {
  student: { emoji: '🎓', label: '求学探索期' },
  career_start: { emoji: '🌱', label: '职场适应期' },
  career_mid: { emoji: '🦁', label: '中坚奋斗期' },
  free_life: { emoji: '🧘', label: '自由/慢生活' },
};

// 疗愈偏好映射
const healingPrefMap: Record<string, { emoji: string; label: string }> = {
  rational: { emoji: '🧠', label: '理智重构' },
  warm: { emoji: '❤️', label: '温暖抱持' },
};

const Profile = () => {
  const { myAudios, favoriteAudios, plans, publishAudio, deleteAudio } = useStore();
  const { user: authUser, isAuthenticated, getCurrentUser } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'works' | 'favorites' | 'plans'>('works');
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // 合并 authStore 用户信息
  const displayName = authUser?.nickname || authUser?.username || '心灵旅人';
  const displayEmail = authUser?.email || '';
  const displayAvatar = authUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser?.username || 'default'}`;

  const stats = [
    { label: '创作', value: myAudios.length },
    { label: '收藏', value: favoriteAudios.length },
    { label: '计划', value: plans.length },
  ];

  const activePlan = plans.find(p => p.status === 'active');
  const easeOut = [0.25, 0.1, 0.25, 1];

  // 头像上传
  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return;

    setIsUploadingAvatar(true);
    try {
      await userAPI.uploadAvatar(file);
      await getCurrentUser();
    } catch {
      // 静默失败
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const tabs = [
    { id: 'works', label: '作品', icon: Music2 },
    { id: 'favorites', label: '收藏', icon: Heart },
    { id: 'plans', label: '计划', icon: Calendar },
  ];

  return (
    <div className="min-h-screen pb-32">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* 个人信息 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="pt-6 pb-4"
        >
          <div className="flex items-start gap-4">
            {/* 头像 - 可点击上传 */}
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <img 
                src={displayAvatar} 
                alt={displayName} 
                className="w-16 h-16 rounded-2xl object-cover ring-1 ring-black/5" 
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-2xl transition-all flex items-center justify-center">
                <Camera size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div className="flex-1 pt-1">
              <h1 className="text-[18px] font-semibold text-neutral-800">{displayName}</h1>
              <p className="text-[13px] text-neutral-400 mt-0.5">{displayEmail}</p>
            </div>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/settings')}
              className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <Settings size={18} strokeWidth={1.5} />
            </motion.button>
          </div>

          {/* 个人签名 */}
          {authUser?.motto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mt-3 flex items-start gap-2 text-[13px] text-neutral-500 italic"
            >
              <Quote size={12} className="text-neutral-300 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{authUser.motto}</span>
            </motion.div>
          )}

          {/* 个人标签：生命阶段 + 疗愈偏好 */}
          {isAuthenticated && authUser?.onboardingCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-2 mt-3 flex-wrap"
            >
              {authUser.lifeStage && lifeStageMap[authUser.lifeStage] && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 rounded-xl text-[12px] text-neutral-600 font-medium">
                  <span>{lifeStageMap[authUser.lifeStage].emoji}</span>
                  {lifeStageMap[authUser.lifeStage].label}
                </span>
              )}
              {authUser.healingPreference && healingPrefMap[authUser.healingPreference] && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 rounded-xl text-[12px] text-neutral-600 font-medium">
                  <span>{healingPrefMap[authUser.healingPreference].emoji}</span>
                  {healingPrefMap[authUser.healingPreference].label}
                </span>
              )}
            </motion.div>
          )}

          {/* 统计 */}
          <div className="flex gap-8 mt-5">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-[20px] font-semibold text-neutral-800">{stat.value}</div>
                <div className="text-[12px] text-neutral-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 进行中的计划 */}
        {activePlan && (
          <Link to={`/plan/${activePlan.id}`}>
            <motion.div 
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1, ease: easeOut }}
              className="card p-4 mb-6 hover:bg-white/80 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">进行中</p>
                  <h2 className="text-[14px] font-medium text-neutral-800">{activePlan.title}</h2>
                </div>
                <span className="text-[18px] font-semibold text-neutral-800">
                  {Math.round((activePlan.currentStage / activePlan.stages.length) * 100)}%
                </span>
              </div>
              <div className="h-1 bg-neutral-100 rounded-full overflow-hidden mb-4">
                <motion.div 
                  className="h-full bg-neutral-900 rounded-full" 
                  initial={{ width: 0 }} 
                  animate={{ width: `${(activePlan.currentStage / activePlan.stages.length) * 100}%` }} 
                  transition={{ duration: 0.8, ease: easeOut }} 
                />
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/45 backdrop-blur-md rounded-2xl border border-white/40 shadow-glass">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center">
                  <Play size={16} className="text-white ml-0.5" fill="currentColor" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-neutral-800 truncate">
                    {activePlan.stages[activePlan.currentStage]?.title}
                  </p>
                  <p className="text-[11px] text-neutral-400 truncate">
                    {activePlan.stages[activePlan.currentStage]?.description}
                  </p>
                </div>
              </div>
            </motion.div>
          </Link>
        )}

        {/* 标签 */}
        <div className="flex gap-6 border-b border-black/[0.04] mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`
                flex items-center gap-2 pb-3 text-[13px] font-medium border-b-2 -mb-px
                transition-colors duration-200
                ${activeTab === tab.id 
                  ? 'text-neutral-800 border-neutral-900' 
                  : 'text-neutral-400 border-transparent hover:text-neutral-600'
                }
              `}
            >
              <tab.icon size={15} strokeWidth={1.5} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* 内容 */}
        <motion.div 
          key={activeTab} 
          initial={{ opacity: 0, y: 8 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: easeOut }}
          className="space-y-3"
        >
          {activeTab === 'works' && (myAudios.length > 0 ? myAudios.map((audio, index) => (
            <motion.div 
              key={audio.id} 
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.04, ease: easeOut }}
              className={`relative ${showActionsMenu === audio.id ? 'z-50' : 'z-0'}`}
            >
              <div className="flex gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-black/[0.04] hover:bg-white/80 transition-all group">
                <Link to={`/audio/${audio.id}`} className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={audio.coverUrl} alt={audio.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Play size={20} className="text-white" fill="currentColor" />
                  </div>
                </Link>
                
                <div className="flex-1 min-w-0 py-0.5">
                  <Link to={`/audio/${audio.id}`}>
                    <h3 className="text-[15px] font-semibold text-neutral-900 line-clamp-1 mb-1 group-hover:text-slate-700 transition-colors">
                      {audio.title}
                    </h3>
                  </Link>
                  
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
                  
                  {/* 统计 */}
                  <div className="flex items-center gap-4 text-[11px] text-neutral-400">
                    <span>{formatDate(audio.createdAt)}</span>
                    <span className="flex items-center gap-1">
                      <Headphones size={11} />
                      {formatNumber(audio.views)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart size={11} />
                      {formatNumber(audio.likes)}
                    </span>
                  </div>
                </div>
                
                {/* 状态和操作 */}
                <div className="flex flex-col items-end justify-between">
                  <div className="relative">
                    <motion.button
                      onClick={() => setShowActionsMenu(showActionsMenu === audio.id ? null : audio.id)}
                      whileTap={{ scale: 0.95 }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all"
                    >
                      <MoreVertical size={16} strokeWidth={1.5} />
                    </motion.button>
                    
                    {/* 操作菜单 */}
                    <AnimatePresence>
                      {showActionsMenu === audio.id && (
                        <>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowActionsMenu(null)}
                            className="fixed inset-0 z-40"
                          />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -8 }}
                            className="absolute right-0 top-10 z-50 w-40 p-1.5 bg-white/95 backdrop-blur-xl rounded-xl border border-black/[0.06] shadow-2xl"
                          >
                            {!audio.isPublished && (
                              <button
                                onClick={() => {
                                  publishAudio(audio.id);
                                  setShowActionsMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                              >
                                <Globe size={14} />
                                发布到社区
                              </button>
                            )}
                            <button
                              onClick={() => setShowActionsMenu(null)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                            >
                              <Edit size={14} />
                              编辑
                            </button>
                            <button
                              onClick={() => {
                                deleteAudio(audio.id);
                                setShowActionsMenu(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={14} />
                              删除
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <span className={`px-3 py-1 text-[11px] font-medium rounded-lg ${
                    audio.isPublished 
                      ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100' 
                      : 'bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200'
                  }`}>
                    {audio.isPublished ? '已发布' : '私密'}
                  </span>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <Music2 size={24} className="text-neutral-300" strokeWidth={1.5} />
              </div>
              <p className="text-[15px] text-neutral-600 font-medium">暂无作品</p>
              <p className="text-[13px] text-neutral-400 mt-1">创建你的第一个疗愈音频</p>
              <Link 
                to="/create/single"
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-neutral-900 text-white rounded-2xl text-[14px] font-medium hover:bg-neutral-800 transition-colors"
              >
                <Music2 size={16} />
                开始创作
              </Link>
            </div>
          ))}

          {activeTab === 'favorites' && (favoriteAudios.length > 0 ? favoriteAudios.map((audio, index) => (
            <motion.div 
              key={audio.id} 
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.04, ease: easeOut }} 
            >
              <Link to={`/audio/${audio.id}`} className="flex gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-black/[0.04] hover:bg-white/80 hover:shadow-lg transition-all group">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={audio.coverUrl} alt={audio.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Play size={20} className="text-white" fill="currentColor" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 py-1">
                  <h3 className="text-[15px] font-semibold text-neutral-900 line-clamp-1 mb-1 group-hover:text-slate-700 transition-colors">
                    {audio.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <img 
                      src={audio.author.avatar} 
                      alt={audio.author.name}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <p className="text-[12px] text-neutral-500">{audio.author.name}</p>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Headphones size={11} />
                      {formatNumber(audio.views)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart size={11} />
                      {formatNumber(audio.likes)}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <Heart size={24} className="text-neutral-300" strokeWidth={1.5} />
              </div>
              <p className="text-[15px] text-neutral-600 font-medium">暂无收藏</p>
              <p className="text-[13px] text-neutral-400 mt-1">发现喜欢的疗愈音频</p>
              <Link 
                to="/community"
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-neutral-900 text-white rounded-2xl text-[14px] font-medium hover:bg-neutral-800 transition-colors"
              >
                <Heart size={16} />
                去发现
              </Link>
            </div>
          ))}

          {activeTab === 'plans' && (plans.length > 0 ? plans.map((plan, index) => (
            <motion.div 
              key={plan.id} 
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.04, ease: easeOut }} 
            >
              <Link 
                to={`/plan/${plan.id}`}
                className="block p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-black/[0.04] hover:bg-white/80 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[14px] font-medium text-neutral-800">{plan.title}</h3>
                  <span className={`px-2 py-0.5 text-[10px] font-medium rounded-lg ${
                    plan.status === 'active' ? 'bg-neutral-900 text-white' : plan.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    {plan.status === 'active' ? '进行中' : plan.status === 'completed' ? '已完成' : '私密'}
                  </span>
                </div>
                <p className="text-[12px] text-neutral-400">{plan.stages.length} 阶段 · {formatDuration(plan.totalDuration)}</p>
              </Link>
            </motion.div>
          )) : (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <Calendar size={22} className="text-neutral-300" strokeWidth={1.5} />
              </div>
              <p className="text-[14px] text-neutral-600 font-medium">暂无计划</p>
              <p className="text-[12px] text-neutral-400 mt-1">制定专属疗愈计划</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
