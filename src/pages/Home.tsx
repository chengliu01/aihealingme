import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Calendar } from 'lucide-react';
import Header from '@/components/Header';
import AudioCard from '@/components/AudioCard';
import { useStore } from '@/store';

const healingFeatures = [
  {
    id: 'single',
    title: '此刻疗愈',
    subtitle: 'Instant Healing',
    description: 'AI 根据你此刻的状态，即时生成专属疗愈音频',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    icon: Sparkles,
    path: '/create/single',
    illustration: '✨',
  },
  {
    id: 'plan',
    title: '深度陪伴',
    subtitle: 'Deep Accompany',
    description: '定制周期性疗愈计划，系统性提升心理状态',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    icon: Calendar,
    path: '/create/plan',
    illustration: '🌙',
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

  const filteredAudios = activeCategory === 'all' 
    ? audios 
    : audios.filter(a => a.category === activeCategory);

  const activePlan = plans.find(p => p.status === 'active');

  return (
    <div className="min-h-screen pb-32">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4">
        {/* Hero - 极简 */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="pt-8 pb-8"
        >
          <h1 className="text-[26px] font-semibold text-neutral-800 leading-tight tracking-tight">
            每一种情绪，
            <br />
            <span className="text-neutral-400">都值得被温柔对待</span>
          </h1>
        </motion.section>

        {/* 功能入口 - 高级渐变卡片 */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-10"
        >
          <div className="grid grid-cols-1 gap-4">
            {healingFeatures.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 + index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <Link to={feature.path} className="block group">
                  <div className="relative overflow-hidden rounded-3xl p-6 bg-white/60 backdrop-blur-md shadow-glass border border-white/40 transition-all duration-500 ease-out hover:scale-[1.01] hover:shadow-2xl">
                    {/* 渐变背景 */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-[0.08] group-hover:opacity-[0.12] transition-opacity duration-500`} />
                    
                    {/* 玻璃态背景层 - 无边框避免闪烁 */}
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-md" />
                    
                    {/* 装饰性光晕 */}
                    <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${feature.gradient} opacity-20 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700`} />
                    
                    {/* 内容 */}
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {/* 图标容器 */}
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <feature.icon size={22} className="text-white" strokeWidth={2} />
                          </div>
                          <div>
                            <h3 className="text-[18px] font-bold text-neutral-900 mb-0.5 tracking-tight">
                              {feature.title}
                            </h3>
                            <p className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">
                              {feature.subtitle}
                            </p>
                          </div>
                        </div>
                        {/* 装饰性 Emoji */}
                        <span className="text-3xl opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all duration-300">
                          {feature.illustration}
                        </span>
                      </div>
                      
                      <p className="text-[14px] text-neutral-600 leading-relaxed">
                        {feature.description}
                      </p>
                      
                      {/* 箭头提示 */}
                      <div className="flex items-center gap-1.5 text-neutral-500 mt-4 group-hover:gap-2.5 transition-all duration-300">
                        <span className="text-[13px] font-medium">开始体验</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 进行中的计划 */}
        {activePlan && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-8"
          >
            <Link to="/create/plan" className="block">
              <div className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center">
                      <Calendar size={15} className="text-neutral-600" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-400 font-medium">进行中</p>
                      <h2 className="text-[14px] font-medium text-neutral-800">{activePlan.title}</h2>
                    </div>
                  </div>
                  <span className="text-[20px] font-semibold text-neutral-800">
                    {Math.round((activePlan.currentStage / activePlan.stages.length) * 100)}%
                  </span>
                </div>
                <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-neutral-900 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(activePlan.currentStage / activePlan.stages.length) * 100}%` }}
                    transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                  />
                </div>
              </div>
            </Link>
          </motion.section>
        )}

        {/* 音频推荐 */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          {/* 分类 */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 -mx-1 px-1">
            {categories.map((cat, index) => (
              <motion.button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.03 }}
                className={`
                  px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap
                  transition-all duration-300 ease-out
                  ${activeCategory === cat.id 
                    ? 'bg-neutral-900 text-white' 
                    : 'bg-white/60 text-neutral-500 hover:bg-white/80 border border-black/[0.04]'
                  }
                `}
              >
                {cat.label}
              </motion.button>
            ))}
          </div>
          
          {/* 音频网格 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-2">
            {filteredAudios.map((audio, index) => (
              <AudioCard key={audio.id} audio={audio} index={index} />
            ))}
          </div>
          
          {/* 查看更多 */}
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link 
              to="/community" 
              className="inline-flex items-center gap-1.5 text-neutral-400 text-[13px] hover:text-neutral-600 transition-colors duration-200"
            >
              探索更多
              <ArrowRight size={14} strokeWidth={1.5} />
            </Link>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
};

export default Home;
