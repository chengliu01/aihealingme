import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Music2, Calendar, Heart, Wind, Zap, CloudRain, Sun } from 'lucide-react';
import Header from '@/components/Header';
import AudioCard from '@/components/AudioCard';
import { useStore } from '@/store';

// 情绪状态数据 - 用更诗意的方式表达
const emotionStates = [
  { 
    id: 'overwhelmed', 
    title: '有些疲惫', 
    subtitle: '需要片刻喘息',
    icon: CloudRain,
    color: 'from-blue-400 to-cyan-400',
    bgColor: 'bg-blue-50',
  },
  { 
    id: 'anxious', 
    title: '些许焦虑', 
    subtitle: '思绪需要整理',
    icon: Wind,
    color: 'from-violet-400 to-purple-400',
    bgColor: 'bg-violet-50',
  },
  { 
    id: 'tired', 
    title: '身心俱疲', 
    subtitle: '渴望深度放松',
    icon: Zap,
    color: 'from-amber-400 to-orange-400',
    bgColor: 'bg-amber-50',
  },
  { 
    id: 'peaceful', 
    title: '还算平静', 
    subtitle: '想要更好状态',
    icon: Sun,
    color: 'from-emerald-400 to-teal-400',
    bgColor: 'bg-emerald-50',
  },
];

// 疗愈方案数据
const healingFeatures = [
  {
    id: 'single',
    title: '此刻疗愈',
    subtitle: '即时倾诉',
    description: '当下的情绪，当下的疗愈。AI 根据你此刻的状态，生成专属的疗愈音频。',
    icon: Sparkles,
    color: 'from-violet-500 to-purple-600',
    path: '/create/single',
  },
  {
    id: 'plan',
    title: '深度陪伴',
    subtitle: '系统疗愈',
    description: '想要真正的改变？定制周期性疗愈计划，陪你走过每一天的起伏。',
    icon: Calendar,
    color: 'from-cyan-500 to-blue-600',
    path: '/create/plan',
  },
];

// 用户故事 - 更真实、更有共鸣
const userStories = [
  { text: '连续加班三周后，我在这里找回了内心的平静', author: '互联网从业者 · 小林' },
  { text: '失眠三个月，第一次睡了个好觉', author: '大学生 · 阿杰' },
  { text: '比心理咨询更私密，比冥想 App 更懂我', author: '设计师 · 思琪' },
  { text: '每次情绪低落，都有 AI 疗愈师陪着我', author: '自由职业者 · 老周' },
];

const Home = () => {
  const { audios, plans } = useStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  
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
        {/* Hero 区域 - 简洁有力的开场 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-12 md:py-16 text-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 text-violet-600 rounded-full text-sm font-medium mb-6"
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
          
          <p className="text-neutral-500 text-base md:text-lg max-w-xl mx-auto mb-8">
            不是千篇一律的冥想音频，而是真正懂你的 AI 疗愈师。
            <br className="hidden md:block" />
            随时随地，为你的心灵找到出口。
          </p>

          {/* CTA 按钮 */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              to="/create/single" 
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-full font-medium hover:bg-neutral-800 transition-all hover:scale-105"
            >
              <Sparkles size={18} />
              开始疗愈对话
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/community" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-neutral-200 text-neutral-700 rounded-full font-medium hover:bg-white hover:border-neutral-300 transition-all"
            >
              探索疗愈音频
            </Link>
          </div>
        </motion.section>

        {/* 情绪状态选择 - 互动式 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-lg font-semibold text-neutral-900 mb-4 text-center">
            你现在感觉如何？
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {emotionStates.map((emotion, index) => (
              <motion.button
                key={emotion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                onClick={() => setSelectedEmotion(emotion.id)}
                className={`
                  relative p-4 rounded-2xl text-left transition-all duration-300
                  ${selectedEmotion === emotion.id 
                    ? 'bg-gradient-to-br ' + emotion.color + ' text-white shadow-lg scale-105' 
                    : emotion.bgColor + ' text-neutral-700 hover:scale-102'
                  }
                `}
              >
                <emotion.icon 
                  size={24} 
                  className={`mb-3 ${selectedEmotion === emotion.id ? 'text-white' : ''}`}
                />
                <div className="font-semibold text-sm mb-1">{emotion.title}</div>
                <div className={`text-xs ${selectedEmotion === emotion.id ? 'text-white/80' : 'text-neutral-500'}`}>
                  {emotion.subtitle}
                </div>
              </motion.button>
            ))}
          </div>
          
          {selectedEmotion && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 text-center"
            >
              <Link 
                to="/create/single"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors"
              >
                为我定制疗愈音频
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          )}
        </motion.section>

        {/* 核心功能入口 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <div className="grid md:grid-cols-2 gap-4">
            {healingFeatures.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <Link 
                  to={feature.path}
                  className="group block h-full"
                >
                  <div className="relative h-full p-6 rounded-3xl bg-white border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                    {/* 装饰背景 */}
                    <div className={`
                      absolute top-0 right-0 w-32 h-32 rounded-full 
                      bg-gradient-to-br ${feature.color} opacity-5
                      blur-3xl transform translate-x-8 -translate-y-8
                      group-hover:opacity-10 transition-opacity
                    `} />
                    
                    {/* 图标 */}
                    <div className={`
                      w-12 h-12 rounded-2xl mb-4
                      bg-gradient-to-br ${feature.color}
                      flex items-center justify-center text-white
                      shadow-lg transform group-hover:scale-110 transition-transform duration-300
                    `}>
                      <feature.icon size={24} />
                    </div>

                    {/* 标签 */}
                    <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      {feature.subtitle}
                    </span>
                    
                    {/* 标题 */}
                    <h3 className="text-xl font-bold text-neutral-900 mt-1 mb-2">
                      {feature.title}
                    </h3>
                    
                    {/* 描述 */}
                    <p className="text-neutral-600 text-sm leading-relaxed mb-4">
                      {feature.description}
                    </p>

                    {/* 行动按钮 */}
                    <div className="flex items-center gap-2 text-sm font-medium text-neutral-900 group-hover:text-violet-600 transition-colors">
                      开始体验
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 用户真实反馈 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mb-12"
        >
          <div className="bg-gradient-to-r from-violet-50 via-purple-50 to-cyan-50 rounded-3xl p-6 md:p-8">
            <h2 className="text-lg font-semibold text-neutral-900 mb-6 text-center">
              他们的疗愈故事
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {userStories.map((story, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50"
                >
                  <p className="text-neutral-700 text-sm mb-2">"{story.text}"</p>
                  <p className="text-neutral-400 text-xs">—— {story.author}</p>
                </motion.div>
              ))}
            </div>
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

          {/* 音频列表 */}
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
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
            {filteredAudios.slice(0, 8).map((audio, index) => (
              <AudioCard key={audio.id} audio={audio} index={index} />
            ))}
          </div>
        </section>

        {/* 底部 CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="py-8 text-center"
        >
          <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 rounded-3xl p-8 md:p-12 text-white">
            <h3 className="text-xl md:text-2xl font-bold mb-3">
              今天，给自己 10 分钟
            </h3>
            <p className="text-white/80 text-sm md:text-base mb-6 max-w-md mx-auto">
              你不需要等到崩溃才想起照顾自己。
              <br />
              现在就开始，和 AI 疗愈师聊聊天。
            </p>
            <Link 
              to="/create/single"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-violet-600 rounded-full font-semibold hover:bg-white/90 transition-colors shadow-lg"
            >
              <Heart size={18} className="fill-current" />
              开始疗愈之旅
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Home;
