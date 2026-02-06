import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Calendar, Moon } from 'lucide-react';
import Header from '@/components/Header';
import AudioCard from '@/components/AudioCard';
import { useStore } from '@/store';

const healingFeatures = [
  {
    id: 'single',
    title: '此刻疗愈',
    subtitle: 'INSTANT HEALING',
    description: 'AI 根据你此刻的状态，即时生成专属疗愈音频，快速缓解情绪压力',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    lightGradient: 'from-violet-100/50 via-purple-100/40 to-fuchsia-100/50',
    glowColor: 'rgba(139, 92, 246, 0.15)',
    icon: Sparkles,
    path: '/create/single',
    illustration: '✨',
    badge: '快速见效',
    tags: ['情绪分析', '即时生成', '灵活时长'],
  },
  {
    id: 'plan',
    title: '深度陪伴',
    subtitle: 'DEEP ACCOMPANY',
    description: '定制周期性疗愈计划，系统性提升心理状态，长期改善身心健康',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    lightGradient: 'from-cyan-100/50 via-blue-100/40 to-indigo-100/50',
    glowColor: 'rgba(6, 182, 212, 0.15)',
    icon: Moon,
    path: '/create/plan',
    illustration: '🌙',
    badge: '长期改善',
    tags: ['专业评估', '阶段方案', '进度追踪'],
  },
];

const categories = [
  { id: 'all', label: '全部' },
  { id: '冥想', label: '冥想' },
  { id: '睡眠', label: '睡眠' },
  { id: '焦虑', label: '焦虑' },
  { id: '情感', label: '情感' },
];

const Home = () => {
  const { audios, plans } = useStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const filteredAudios = activeCategory === 'all' 
    ? audios 
    : audios.filter(a => a.category === activeCategory);

  const activePlan = plans.find(p => p.status === 'active');

  return (
    <div className="min-h-screen pb-32">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4">
        {/* Hero - 更有呼吸感 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="pt-10 pb-8"
        >
          <h1 className="text-[28px] font-bold text-neutral-900 leading-tight tracking-tight mb-2">
            每一种情绪，
          </h1>
          <h2 className="text-[24px] font-medium text-neutral-400 leading-tight tracking-tight">
            都值得被温柔对待
          </h2>
        </motion.section>

        {/* 核心功能入口 - 大幅优化突出 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-12"
        >
          <div className="grid grid-cols-1 gap-5">
            {healingFeatures.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 + index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <Link to={feature.path} className="block group">
                  <motion.div 
                    className="relative overflow-hidden rounded-[2rem] p-8 bg-white/70 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 border border-white/60 transition-all duration-700 ease-out"
                    onMouseEnter={() => setHoveredFeature(feature.id)}
                    onMouseLeave={() => setHoveredFeature(null)}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      boxShadow: hoveredFeature === feature.id 
                        ? `0 20px 50px -12px ${feature.glowColor}, 0 0 0 1px rgba(255,255,255,0.8)` 
                        : undefined
                    }}
                  >
                    {/* 动态渐变背景 */}
                    <motion.div 
                      className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-700`}
                      animate={{
                        scale: hoveredFeature === feature.id ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.7 }}
                    />
                    
                    {/* 装饰性光晕 - 增强效果 */}
                    <motion.div 
                      className={`absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br ${feature.lightGradient} rounded-full blur-3xl`}
                      animate={{
                        scale: hoveredFeature === feature.id ? 1.3 : 1,
                        opacity: hoveredFeature === feature.id ? 0.8 : 0.4,
                      }}
                      transition={{ duration: 0.7 }}
                    />
                    
                    {/* 内容 */}
                    <div className="relative">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            {/* 图标 */}
                            <motion.div 
                              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-xl flex-shrink-0`}
                              whileHover={{ rotate: 360, scale: 1.1 }}
                              transition={{ duration: 0.6 }}
                            >
                              <feature.icon size={24} className="text-white" strokeWidth={2} />
                            </motion.div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1.5">
                                <h3 className="text-[19px] font-bold text-neutral-900 tracking-tight">
                                  {feature.title}
                                </h3>
                                {/* Badge */}
                                <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-neutral-600 text-[11px] font-semibold rounded-full border border-neutral-200/60 shadow-sm">
                                  {feature.badge}
                                </span>
                              </div>
                              <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-widest mb-3">
                                {feature.subtitle}
                              </p>
                            </div>
                          </div>
                          
                          <p className="text-[14px] text-neutral-600 leading-relaxed mb-0">
                            {feature.description}
                          </p>
                          
                          {/* 标签 */}
                          <div className="flex flex-wrap gap-2 mt-4">
                            {feature.tags.map((tag, idx) => (
                              <span 
                                key={idx}
                                className="px-3 py-1 bg-white/70 backdrop-blur-sm text-neutral-600 text-[11px] font-medium rounded-full border border-white/60"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {/* 装饰 Emoji 和箭头 */}
                        <div className="flex flex-col items-center gap-3 ml-4">
                          <motion.span 
                            className="text-4xl opacity-40"
                            animate={{ 
                              scale: hoveredFeature === feature.id ? 1.15 : 1,
                              opacity: hoveredFeature === feature.id ? 0.7 : 0.4,
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            {feature.illustration}
                          </motion.span>
                          <motion.div
                            animate={{ 
                              x: hoveredFeature === feature.id ? 4 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <ArrowRight size={20} className="text-neutral-400 group-hover:text-neutral-600 transition-colors" strokeWidth={2} />
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 进行中的计划 */}
        {activePlan && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-10"
          >
            <Link to="/create/plan" className="block group">
              <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-xl border border-white/60 shadow-lg shadow-neutral-200/20 hover:shadow-xl transition-all duration-500">
                {/* 装饰性背景 */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-cyan-100/40 to-blue-100/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-md">
                        <Calendar size={18} className="text-white" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider mb-0.5">进行中的计划</p>
                        <h2 className="text-[16px] font-bold text-neutral-800">{activePlan.title}</h2>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[24px] font-bold text-neutral-800">
                        {Math.round((activePlan.currentStage / activePlan.stages.length) * 100)}%
                      </span>
                      <p className="text-[10px] text-neutral-400 font-medium">已完成</p>
                    </div>
                  </div>
                  
                  {/* 进度条 */}
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-sm"
                      initial={{ width: 0 }}
                      animate={{ width: `${(activePlan.currentStage / activePlan.stages.length) * 100}%` }}
                      transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          </motion.section>
        )}

        {/* 音频推荐标题 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="mb-6"
        >
          <h2 className="text-[20px] font-bold text-neutral-800 tracking-tight">社区疗愈频道</h2>
          <p className="text-[13px] text-neutral-400 mt-1">发现更多疗愈内容，与他人分享你的疗愈体验</p>
        </motion.div>

        {/* 音频推荐 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* 分类 - 优化样式 */}
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-5 -mx-1 px-1">
            {categories.map((cat, index) => (
              <motion.button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.45 + index * 0.04 }}
                className={`
                  px-5 py-2.5 rounded-full text-[13px] font-semibold whitespace-nowrap
                  transition-all duration-400 ease-out
                  ${activeCategory === cat.id 
                    ? 'bg-neutral-900 text-white shadow-lg scale-105' 
                    : 'bg-white/70 text-neutral-500 hover:bg-white hover:text-neutral-700 border border-white/60 shadow-sm hover:shadow-md'
                  }
                `}
              >
                {cat.label}
              </motion.button>
            ))}
          </div>
          
          {/* 音频网格 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredAudios.map((audio, index) => (
              <AudioCard key={audio.id} audio={audio} index={index} />
            ))}
          </div>
          
          {/* 查看更多 */}
          <motion.div 
            className="mt-10 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Link 
              to="/community" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/70 backdrop-blur-xl text-neutral-600 text-[14px] font-medium rounded-full border border-white/60 hover:bg-white hover:text-neutral-800 hover:shadow-lg transition-all duration-300"
            >
              探索更多内容
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
};

export default Home;
