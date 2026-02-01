import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Music2, Calendar, Heart, Zap, Clock, Target, TrendingUp, MessageCircle, Users } from 'lucide-react';
import Header from '@/components/Header';
import AudioCard from '@/components/AudioCard';
import { useStore } from '@/store';

// 疗愈方案数据 - 更丰富的描述和特性
const healingFeatures = [
  {
    id: 'single',
    title: '此刻疗愈',
    subtitle: '即时倾诉',
    description: '当下的情绪，当下的疗愈。AI 根据你此刻的状态，生成专属的疗愈音频。',
    detailedDescription: '当你感到焦虑、疲惫或情绪低落时，只需几分钟，AI 就能为你定制专属的疗愈音频。不是千篇一律的模板，而是真正理解你此刻心情的个性化陪伴。',
    icon: Sparkles,
    color: 'from-violet-500 to-purple-600',
    bgColor: 'from-violet-50 to-purple-50',
    path: '/create/single',
    features: [
      { icon: Zap, text: '即时响应，3分钟生成' },
      { icon: Heart, text: '深度理解你的情绪' },
      { icon: Music2, text: '专属定制音频内容' },
    ],
    benefits: ['快速缓解当下情绪', '随时随地可用', '完全个性化'],
    emoji: '✨',
  },
  {
    id: 'plan',
    title: '深度陪伴',
    subtitle: '系统疗愈',
    description: '想要真正的改变？定制周期性疗愈计划，陪你走过每一天的起伏。',
    detailedDescription: '真正的改变需要时间和陪伴。我们为你设计专属的周期性疗愈计划，从情绪管理到心理成长，每一步都有 AI 陪伴和引导，见证你的蜕变。',
    icon: Calendar,
    color: 'from-cyan-500 to-blue-600',
    bgColor: 'from-cyan-50 to-blue-50',
    path: '/create/plan',
    features: [
      { icon: Target, text: '科学规划，循序渐进' },
      { icon: Clock, text: '长期陪伴与追踪' },
      { icon: TrendingUp, text: '见证你的成长变化' },
    ],
    benefits: ['系统性改变', '持续陪伴支持', '可追踪的成长'],
    emoji: '🌱',
  },
];

const Home = () => {
  const { audios, plans } = useStore();
  const [activeCategory, setActiveCategory] = useState('all');
  
  const categories = [
    { id: 'all', label: '全部' },
    { id: '冥想', label: '冥想' },
    { id: '睡眠', label: '睡眠' },
    { id: '焦虑', label: '焦虑' },
    { id: '情感', label: '情感' },
  ];

  const filteredAudios = activeCategory === 'all' 
    ? audios 
    : audios.filter(a => a.category === activeCategory);

  const activePlan = plans.find(p => p.status === 'active');

  return (
    <div className="min-h-screen pb-24">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero 区域 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-10 md:py-14 text-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 text-violet-600 rounded-full text-sm font-medium mb-5"
          >
            <Sparkles size={16} />
            AI 驱动的个性化疗愈体验
          </motion.div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-4 leading-tight">
            每一种情绪
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600">
              都值得被温柔对待
            </span>
          </h1>
          
          <p className="text-neutral-500 text-base md:text-lg max-w-xl mx-auto mb-6">
            不是千篇一律的冥想音频，而是真正懂你的 AI 疗愈师
          </p>

          {/* CTA 按钮 */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              to="/create/single" 
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-full font-medium hover:bg-neutral-800 transition-all hover:scale-105"
            >
              <MessageCircle size={18} />
              开始疗愈对话
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/community" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-neutral-200 text-neutral-700 rounded-full font-medium hover:bg-white hover:border-neutral-300 transition-all"
            >
              <Users size={18} />
              加入疗愈社区
            </Link>
          </div>
        </motion.section>

        {/* 核心功能入口 - 大卡片设计 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="grid md:grid-cols-2 gap-6">
            {healingFeatures.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.15, duration: 0.6 }}
              >
                <Link 
                  to={feature.path}
                  className="group block h-full"
                >
                  <div className={`
                    relative h-full p-8 rounded-3xl 
                    bg-gradient-to-br ${feature.bgColor}
                    border-2 border-transparent
                    hover:border-opacity-50
                    shadow-lg hover:shadow-2xl 
                    transition-all duration-500 hover:-translate-y-2 
                    overflow-hidden
                  `}>
                    {/* 动态渐变光晕背景 */}
                    <motion.div 
                      className={`
                        absolute -top-20 -right-20 w-64 h-64 rounded-full 
                        bg-gradient-to-br ${feature.color} opacity-20
                        blur-3xl
                      `}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.3, 0.2],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.div 
                      className={`
                        absolute -bottom-16 -left-16 w-48 h-48 rounded-full 
                        bg-gradient-to-br ${feature.color} opacity-15
                        blur-2xl
                      `}
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.15, 0.25, 0.15],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                      }}
                    />
                    
                    {/* 顶部装饰 */}
                    <div className="relative flex items-start justify-between mb-6">
                      {/* 图标和标题区域 */}
                      <div className="flex items-center gap-4">
                        <motion.div 
                          className={`
                            w-16 h-16 rounded-2xl
                            bg-gradient-to-br ${feature.color}
                            flex items-center justify-center text-white
                            shadow-xl
                          `}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <feature.icon size={32} />
                        </motion.div>
                        <div>
                          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                            {feature.subtitle}
                          </span>
                          <h3 className="text-2xl font-bold text-neutral-900 mt-0.5 flex items-center gap-2">
                            {feature.title}
                            <span className="text-3xl">{feature.emoji}</span>
                          </h3>
                        </div>
                      </div>
                    </div>
                    
                    {/* 详细描述 */}
                    <p className="relative text-neutral-700 text-base leading-relaxed mb-6 font-medium">
                      {feature.detailedDescription}
                    </p>

                    {/* 特性列表 */}
                    <div className="relative space-y-3 mb-6">
                      {feature.features.map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.15 + idx * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <div className={`
                            w-10 h-10 rounded-xl
                            bg-white/60 backdrop-blur-sm
                            flex items-center justify-center
                            shadow-sm
                          `}>
                            <item.icon 
                              size={18} 
                              className={feature.id === 'single' ? 'text-violet-600' : 'text-cyan-600'} 
                            />
                          </div>
                          <span className="text-sm text-neutral-700 font-medium">{item.text}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* 核心优势标签 */}
                    <div className="relative flex flex-wrap gap-2 mb-6">
                      {feature.benefits.map((benefit, idx) => (
                        <motion.span
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6 + index * 0.15 + idx * 0.1 }}
                          className={`
                            px-3 py-1.5 rounded-full text-xs font-medium
                            bg-white/80 backdrop-blur-sm
                            border border-white/50
                            shadow-sm
                          `}
                        >
                          {benefit}
                        </motion.span>
                      ))}
                    </div>

                    {/* CTA 按钮 */}
                    <motion.div 
                      className={`
                        relative flex items-center justify-between
                        px-6 py-4 rounded-2xl
                        bg-gradient-to-r ${feature.color}
                        text-white font-semibold
                        shadow-lg
                        group-hover:shadow-xl
                      `}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="flex items-center gap-2">
                        立即开始体验
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                      >
                        {feature.emoji}
                      </motion.div>
                    </motion.div>
                  </div>
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
            className="mb-8"
          >
            <div className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-lg shadow-neutral-100/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                    <Calendar size={20} className="text-violet-600" />
                  </div>
                  <div>
                    <div className="text-xs text-violet-600 font-medium mb-0.5">进行中的疗愈计划</div>
                    <h2 className="text-base font-semibold text-neutral-900">{activePlan.title}</h2>
                  </div>
                </div>
                <span className="text-xl font-bold text-violet-600">
                  {Math.round((activePlan.currentStage / activePlan.stages.length) * 100)}%
                </span>
              </div>
              
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden mb-3">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(activePlan.currentStage / activePlan.stages.length) * 100}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
              <div className="flex justify-between text-xs text-neutral-500">
                <span>阶段 {activePlan.currentStage + 1} / {activePlan.stages.length}</span>
                <span>继续加油 💪</span>
              </div>
            </div>
          </motion.section>
        )}

        {/* 疗愈音频推荐 */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <Music2 size={20} className="text-violet-500" />
              精选疗愈音频
            </h2>
            <Link to="/community" className="text-neutral-500 text-sm hover:text-violet-600 flex items-center gap-1 transition-colors">
              查看全部
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* 分类标签 */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`
                  px-5 py-2.5 rounded-full whitespace-nowrap font-medium text-sm
                  transition-all duration-300
                  ${activeCategory === cat.id 
                    ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-900/20' 
                    : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
                  }
                `}
              >
                {cat.label}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAudios.slice(0, 8).map((audio, index) => (
              <AudioCard key={audio.id} audio={audio} index={index} />
            ))}
          </div>
        </section>


      </div>
    </div>
  );
};

export default Home;
