import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Calendar, Moon, ChevronDown, ChevronUp } from 'lucide-react';
import Header from '@/components/Header';
import AudioCard from '@/components/AudioCard';
import { useStore } from '@/store';
import { categoryOptions } from '@/utils';

const healingFeatures = [
  {
    id: 'single',
    title: '此刻疗愈',
    subtitle: '不知道从哪开始？这里可以帮到你',
    description: '无论你是感到不知所措、好奇尝试，还是只是想聊聊天，都可以从这里开始。',
    gradient: 'from-neutral-800 via-neutral-700 to-neutral-800',
    lightGradient: 'from-stone-50/50 via-gray-50/40 to-neutral-50/50',
    glowColor: 'rgba(245, 158, 211, 0.15)',
    accentColor: 'rgb(245, 158, 211)', // 粉紫色强调
    icon: Sparkles,
    path: '/create/single',
    chat: {
      messages: [
        { role: 'user', text: '今天压力好大，感觉脑子要炸了...' },
        { role: 'assistant', text: '听起来你很需要放松。我帮你准备一段10分钟的呼吸冥想音频吧？' },
        { role: 'user', text: '好的，现在就需要。' },
      ],
      entryHint: '点击进入，即刻生成专属音频',
    },
  },
  {
    id: 'plan',
    title: '深度陪伴',
    subtitle: '从第一次对话开始，就在寻找模式',
    description: '通过你的想法、感受和行为，逐渐理解你的内心世界，解锁新的认知。',
    gradient: 'from-zinc-800 via-neutral-800 to-stone-800',
    lightGradient: 'from-stone-50/50 via-gray-50/40 to-neutral-50/50',
    glowColor: 'rgba(216, 180, 254, 0.15)',
    accentColor: 'rgb(216, 180, 254)', // 淡紫色强调
    icon: Moon,
    path: '/create/plan',
    chat: {
      messages: [
        { role: 'user', text: '我总是睡不好，已经好几个月了...' },
        { role: 'assistant', text: '让我们一起制定一个21天睡眠改善计划吧。每周3节课程，循序渐进地调理。' },
        { role: 'user', text: '听起来不错，从哪里开始？' },
      ],
      entryHint: '点击进入，定制你的疗愈计划',
    },
  },
];

const Home = () => {
  const { audios, plans } = useStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  const displayedCategories = isCategoryExpanded ? categoryOptions : categoryOptions.slice(0, 5);

  const filteredAudios = activeCategory === 'all' 
    ? audios 
    : audios.filter(a => a.category === activeCategory);

  const activePlan = plans.find(p => p.status === 'active');

  // 使用 Intersection Observer 监听各个区域进入视口
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.05
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('data-section');
          if (sectionId) {
            setVisibleSections(prev => new Set(prev).add(sectionId));
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // 观察所有需要动画的区域
    const sections = document.querySelectorAll('[data-section]');
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  // 平滑滚动到指定区域
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen pb-32 bg-gradient-to-b from-pink-50/40 via-orange-50/20 to-stone-50/10">
      <Header />
      
      {/* 首页封面 - Hero Banner */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative overflow-hidden"
      >
        {/* 渐变背景 */}
        <div className="relative min-h-[500px] sm:min-h-[600px] flex items-center justify-center">
          {/* 多层渐变叠加 - 使用柔和的暖色调，从上到下渐变 */}
          <div className="absolute inset-0 bg-gradient-to-b from-pink-100/50 via-rose-50/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-orange-100/30 via-amber-50/20 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-100/40 via-transparent to-transparent" />
          
          {/* 装饰性模糊圆点 - 更柔和的颜色 */}
          <div className="absolute top-10 left-20 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl" />
          <div className="absolute top-20 right-20 w-80 h-80 bg-orange-200/15 rounded-full blur-3xl" />
          <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[500px] h-64 bg-rose-200/15 rounded-full blur-3xl" />
          
          {/* 内容区 */}
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 md:px-8 text-center py-16 sm:py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <h1 className="text-[40px] sm:text-[52px] md:text-[64px] font-bold text-neutral-900 leading-tight tracking-tight mb-4">
                每一种情绪，
                <br />
                都值得被温柔对待
              </h1>
              <p className="text-[16px] sm:text-[18px] text-neutral-600/80 mb-10 max-w-2xl mx-auto leading-relaxed">
                24/7 情绪支持，陪伴你成长
              </p>
            </motion.div>

            {/* 两个入口按钮 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {/* 开始疗愈 - 主按钮 */}
              <button
                onClick={() => scrollToSection('healing-section')}
                className="group relative px-8 py-4 bg-neutral-900/95 text-white rounded-full text-[15px] font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 min-w-[180px] overflow-hidden"
              >
                {/* 渐变光效背景 */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 via-orange-400/20 to-amber-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* 动态光晕 */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <div className="absolute top-0 left-0 w-20 h-20 bg-white/15 rounded-full blur-xl group-hover:animate-pulse" />
                  <div className="absolute bottom-0 right-0 w-16 h-16 bg-orange-300/15 rounded-full blur-xl group-hover:animate-pulse delay-150" />
                </div>
                
                <span className="relative z-10 flex items-center justify-center gap-2">
                  开始疗愈
                  <Sparkles size={16} className="group-hover:rotate-12 transition-transform duration-300" />
                </span>
              </button>
              
              {/* 探索社区 - 次按钮 */}
              <button
                onClick={() => scrollToSection('community-section')}
                className="group relative px-8 py-4 bg-white/60 backdrop-blur-xl text-neutral-800 rounded-full text-[15px] font-semibold border-2 border-white/80 hover:border-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 min-w-[180px] overflow-hidden"
              >
                {/* 悬停时的渐变背景 */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-50/40 via-amber-50/40 to-yellow-50/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* 光晕效果 */}
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-200/15 via-amber-200/15 to-yellow-200/15 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <span className="relative z-10 flex items-center justify-center gap-2">
                  探索社区
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* 渐变分隔线 */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="h-px bg-gradient-to-r from-transparent via-neutral-200/60 to-transparent"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* 疗愈功能区标题 */}
        <motion.section
          id="healing-section"
          data-section="healing"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: visibleSections.has('healing') ? 1 : 0, 
            y: visibleSections.has('healing') ? 0 : 20 
          }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="pt-12 pb-8"
        >
          <h2 className="text-[32px] font-bold text-neutral-900 leading-tight tracking-tight mb-3 text-center">
            两种愈合，只为你而生
          </h2>
          <p className="text-[15px] text-neutral-500 text-center max-w-2xl mx-auto leading-relaxed">
            无论是即刻的温柔松绑，还是长远的静谧守护，<br className="hidden md:block" />
            在这里，你的每一种频率都有回响。
          </p>
        </motion.section>

        {/* 核心功能入口 - 自然对话式卡片 */}
        <motion.section
          data-section="cards"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: visibleSections.has('cards') ? 1 : 0, 
            y: visibleSections.has('cards') ? 0 : 20 
          }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {healingFeatures.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 + index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <Link to={feature.path} className="block group">
                  <motion.div 
                    className="relative overflow-hidden rounded-[2rem] bg-white/60 backdrop-blur-xl shadow-lg shadow-neutral-200/20 border border-neutral-200/40 transition-all duration-500 ease-out"
                    whileHover={{ scale: 1.005, y: -2 }}
                    whileTap={{ scale: 0.995 }}
                  >
                    {/* 左侧深色互动区 */}
                    <div className="flex flex-col md:flex-row">
                      <div className={`md:w-[45%] p-8 bg-gradient-to-br ${feature.gradient} text-white relative overflow-hidden`}>
                        {/* 装饰性圆环 - 使用粉紫色 */}
                        <div className="absolute -top-20 -left-20 w-40 h-40 border-[20px] border-pink-300/10 rounded-full" />
                        <div className="absolute -bottom-16 -right-16 w-32 h-32 border-[16px] border-pink-300/10 rounded-full" />
                        
                        <div className="relative z-10 h-full flex flex-col justify-between min-h-[320px]">
                          {feature.id === 'single' ? (
                            <>
                              {/* 此刻疗愈 - 三轮对话 */}
                              <div className="space-y-3.5 flex-1 flex flex-col justify-center">
                                {feature.chat.messages.map((msg, idx) => (
                                  <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + idx * 0.2 }}
                                    className={msg.role === 'user' ? 'flex justify-start' : 'flex justify-end'}
                                  >
                                    <div className={`rounded-2xl px-5 py-3 max-w-[88%] ${
                                      msg.role === 'user'
                                        ? 'bg-white/10 backdrop-blur-sm border-2 border-pink-300/40 rounded-tl-sm shadow-sm'
                                        : 'bg-neutral-700/50 backdrop-blur-sm border border-neutral-600/30 rounded-tr-sm'
                                    }`}>
                                      <p className="text-white/95 text-[14px] leading-relaxed">
                                        {msg.text}
                                      </p>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                              
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.2 }}
                                className="pt-4 border-t border-white/10"
                              >
                                <p className="text-white/40 text-[11px]">
                                  {feature.chat.entryHint} →
                                </p>
                              </motion.div>
                            </>
                          ) : (
                            <>
                              {/* 深度陪伴 - 三轮对话 */}
                              <div className="space-y-3.5 flex-1 flex flex-col justify-center">
                                {feature.chat.messages.map((msg, idx) => (
                                  <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + idx * 0.2 }}
                                    className={msg.role === 'user' ? 'flex justify-start' : 'flex justify-end'}
                                  >
                                    <div className={`rounded-2xl px-5 py-3 max-w-[88%] ${
                                      msg.role === 'user'
                                        ? 'bg-white/10 backdrop-blur-sm border-2 border-purple-300/40 rounded-tl-sm shadow-sm'
                                        : 'bg-neutral-700/50 backdrop-blur-sm border border-neutral-600/30 rounded-tr-sm'
                                    }`}>
                                      <p className="text-white/95 text-[14px] leading-relaxed">
                                        {msg.text}
                                      </p>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                              
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.2 }}
                                className="pt-4 border-t border-white/10"
                              >
                                <p className="text-white/40 text-[11px]">
                                  {feature.chat.entryHint} →
                                </p>
                              </motion.div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* 右侧浅色介绍区 */}
                      <div className="md:w-[55%] p-8 bg-gradient-to-br from-stone-50/80 to-neutral-50/60 flex flex-col justify-center">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-sm`}>
                              <feature.icon size={18} className="text-white" strokeWidth={2.5} />
                            </div>
                            <h3 className="text-[22px] font-bold tracking-tight text-neutral-800">
                              {feature.title}
                            </h3>
                          </div>
                          
                          <div className="space-y-2.5">
                            <p className="text-neutral-600 text-[15px] font-medium leading-snug">
                              {feature.subtitle}
                            </p>
                            <p className="text-neutral-500 text-[14px] leading-relaxed">
                              {feature.description}
                            </p>
                          </div>
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
            data-section="plan"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: visibleSections.has('plan') ? 1 : 0, 
              y: visibleSections.has('plan') ? 0 : 20 
            }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
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

        {/* 渐变分隔线 */}
        <motion.div
          data-section="divider"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ 
            opacity: visibleSections.has('divider') ? 1 : 0, 
            scaleX: visibleSections.has('divider') ? 1 : 0 
          }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="h-px bg-gradient-to-r from-transparent via-neutral-200/60 to-transparent my-12"
        />

        {/* 音频推荐标题 */}
        <motion.div
          id="community-section"
          data-section="community"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: visibleSections.has('community') ? 1 : 0, 
            y: visibleSections.has('community') ? 0 : 20 
          }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 pt-4"
        >
          <h2 className="text-[32px] font-bold text-neutral-800 tracking-tight text-center mb-3">于此间，交换温暖的碎片</h2>
          <p className="text-[15px] text-neutral-500 text-center max-w-2xl mx-auto leading-relaxed">
            探索更多触动心弦的疗愈时刻，<br className="hidden md:block" />
            在分享与倾听中，让每一种体验都拥有温柔的回响。
          </p>
        </motion.div>

        {/* 音频推荐 */}
        <motion.section
          data-section="audios"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: visibleSections.has('audios') ? 1 : 0, 
            y: visibleSections.has('audios') ? 0 : 20 
          }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* 分类 - 优化样式 */}
          <div className="flex flex-wrap gap-2.5 mb-5">
            {displayedCategories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`
                  px-5 py-2.5 rounded-full text-[13px] font-semibold whitespace-nowrap
                  transition-all duration-300 ease-out
                  ${activeCategory === cat.value 
                    ? 'bg-neutral-900 text-white shadow-lg' 
                    : 'bg-white/70 text-neutral-500 hover:bg-white hover:text-neutral-700 border border-white/60 shadow-sm hover:shadow-md'
                  }
                `}
              >
                {cat.label}
              </button>
            ))}
            
            {/* 更多按钮 */}
            <button
              onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
              className="px-4 py-2.5 rounded-full bg-white/70 text-neutral-400 hover:text-neutral-600 hover:bg-white border border-white/60 shadow-sm transition-all flex items-center gap-1"
            >
              <span className="text-[12px] font-medium">
                {isCategoryExpanded ? '收起' : '更多'}
              </span>
              {isCategoryExpanded ? (
                <ChevronUp size={14} strokeWidth={2} />
              ) : (
                <ChevronDown size={14} strokeWidth={2} />
              )}
            </button>
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
