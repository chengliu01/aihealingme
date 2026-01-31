import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Heart, Music2, Calendar, Play, Headphones } from 'lucide-react';
import { useStore } from '@/store';
import { formatDuration, formatNumber, formatDate } from '@/utils';

const Profile = () => {
  const { currentUser, myAudios, favoriteAudios, plans } = useStore();
  const [activeTab, setActiveTab] = useState<'works' | 'favorites' | 'plans'>('works');

  const stats = [
    { label: '创作', value: myAudios.length },
    { label: '收藏', value: favoriteAudios.length },
    { label: '计划', value: plans.length },
  ];

  const activePlan = plans.find(p => p.status === 'active');

  return (
    <div className="min-h-screen pb-24">
      {/* 头部渐变背景 */}
      <div className="h-48 bg-gradient-to-br from-violet-500 via-purple-500 to-cyan-500 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-400/20 rounded-full blur-2xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
        {/* 个人信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <img 
                src={currentUser?.avatar} 
                alt={currentUser?.name} 
                className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-lg" 
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs">
                ✨
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl font-bold text-neutral-900 mb-1">{currentUser?.name}</h1>
              <p className="text-neutral-500 text-sm mb-4">{currentUser?.email}</p>
              <div className="flex justify-center sm:justify-start gap-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl font-bold text-violet-600">{stat.value}</div>
                    <div className="text-xs text-neutral-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 hover:bg-violet-100 hover:text-violet-600 transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </motion.div>

        {/* 进行中的计划 */}
        {activePlan && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 mb-6 shadow-lg border border-white/50 border-l-4 border-l-violet-500"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm text-violet-600 font-semibold mb-0.5">进行中的疗愈计划</div>
                <h2 className="text-base font-bold text-neutral-900">{activePlan.title}</h2>
              </div>
              <div className="text-2xl font-bold text-violet-600">
                {Math.round((activePlan.currentStage / activePlan.stages.length) * 100)}%
              </div>
            </div>
            <div className="h-2.5 bg-neutral-200/50 rounded-full overflow-hidden mb-4">
              <motion.div 
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full" 
                initial={{ width: 0 }} 
                animate={{ width: `${(activePlan.currentStage / activePlan.stages.length) * 100}%` }} 
                transition={{ duration: 1 }} 
              />
            </div>
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-md">
                <Play size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-neutral-900 text-sm">
                  {activePlan.stages[activePlan.currentStage]?.title}
                </div>
                <div className="text-xs text-neutral-500">
                  {activePlan.stages[activePlan.currentStage]?.description}
                </div>
              </div>
              <button className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-semibold shadow-md">
                开始
              </button>
            </div>
          </motion.div>
        )}

        {/* 标签切换 */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'works', label: '我的作品', icon: Music2 },
            { id: 'favorites', label: '我的收藏', icon: Heart },
            { id: 'plans', label: '疗愈计划', icon: Calendar },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all text-sm ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md' 
                  : 'bg-white/60 text-neutral-600 hover:bg-white border border-neutral-200/50'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* 内容区域 */}
        <motion.div 
          key={activeTab} 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="space-y-3"
        >
          {activeTab === 'works' && (myAudios.length > 0 ? myAudios.map((audio, index) => (
            <motion.div 
              key={audio.id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.05 }} 
              className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 flex gap-4 shadow-sm border border-white/50"
            >
              <div className="relative">
                <img 
                  src={audio.coverUrl} 
                  alt={audio.title} 
                  className="w-20 h-20 object-cover rounded-xl" 
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl opacity-0 hover:opacity-100 transition-opacity">
                  <Play size={20} className="text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-neutral-900 text-sm truncate">{audio.title}</h3>
                <p className="text-xs text-neutral-500 mb-1">{formatDate(audio.createdAt)}</p>
                <div className="flex items-center gap-3 text-xs text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Headphones size={12} />
                    {formatNumber(audio.views)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart size={12} />
                    {formatNumber(audio.likes)}
                  </span>
                </div>
              </div>
              {audio.isPublished ? (
                <span className="px-2 py-1 bg-violet-100 text-violet-600 text-xs rounded-lg h-fit">已发布</span>
              ) : (
                <span className="px-2 py-1 bg-neutral-100 text-neutral-500 text-xs rounded-lg h-fit">草稿</span>
              )}
            </motion.div>
          )) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Music2 size={20} className="text-neutral-400" />
              </div>
              <p className="text-neutral-500 text-sm">还没有创作内容</p>
              <p className="text-neutral-400 text-xs mt-1">去创建你的第一个疗愈音频吧</p>
            </div>
          ))}

          {activeTab === 'favorites' && (favoriteAudios.length > 0 ? favoriteAudios.map((audio, index) => (
            <motion.div 
              key={audio.id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.05 }} 
              className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 flex gap-4 shadow-sm border border-white/50"
            >
              <div className="relative">
                <img 
                  src={audio.coverUrl} 
                  alt={audio.title} 
                  className="w-20 h-20 object-cover rounded-xl" 
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl opacity-0 hover:opacity-100 transition-opacity">
                  <Play size={20} className="text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-neutral-900 text-sm truncate">{audio.title}</h3>
                <p className="text-xs text-neutral-500 mb-1">{audio.author.name}</p>
                <div className="flex items-center gap-3 text-xs text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Headphones size={12} />
                    {formatNumber(audio.views)}
                  </span>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart size={20} className="text-neutral-400" />
              </div>
              <p className="text-neutral-500 text-sm">还没有收藏内容</p>
              <p className="text-neutral-400 text-xs mt-1">去发现喜欢的疗愈音频吧</p>
            </div>
          ))}

          {activeTab === 'plans' && (plans.length > 0 ? plans.map((plan, index) => (
            <motion.div 
              key={plan.id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.05 }} 
              className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-white/50"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-neutral-900 text-sm">{plan.title}</h3>
                <span className={`px-2 py-0.5 text-xs rounded-lg ${
                  plan.status === 'active' 
                    ? 'bg-violet-100 text-violet-600' 
                    : plan.status === 'completed' 
                      ? 'bg-neutral-100 text-neutral-600' 
                      : 'bg-neutral-100 text-neutral-400'
                }`}>
                  {plan.status === 'active' ? '进行中' : plan.status === 'completed' ? '已完成' : '草稿'}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mb-2">{plan.description}</p>
              <div className="flex items-center gap-4 text-xs text-neutral-400">
                <span>{plan.stages.length} 个阶段</span>
                <span>{formatDuration(plan.totalDuration)}</span>
              </div>
            </motion.div>
          )) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar size={20} className="text-neutral-400" />
              </div>
              <p className="text-neutral-500 text-sm">还没有疗愈计划</p>
              <p className="text-neutral-400 text-xs mt-1">制定你的专属疗愈计划</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
