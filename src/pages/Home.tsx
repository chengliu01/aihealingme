import { useState, useEffect, useRef } from 'react';
// useState 已导入
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';
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
  
  // 鼠标位置追踪 - 用于探照灯效果
  const heroRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 720);
  const mouseY = useMotionValue(300);
  
  // 使用弹簧动画让追踪更平滑
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  
  // 组件挂载时设置初始位置为屏幕中心
  useEffect(() => {
    const updateInitialPosition = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        mouseX.set(rect.width / 2);
        mouseY.set(rect.height / 2);
      }
    };
    
    // 延迟一点确保 ref 已经绑定
    const timer = setTimeout(updateInitialPosition, 100);
    
    // 窗口大小改变时重新计算
    window.addEventListener('resize', updateInitialPosition);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateInitialPosition);
    };
  }, []);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (heroRef.current) {
      const rect = heroRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    }
  };
  
  const handleMouseLeave = () => {
    // 鼠标离开时，缓慢回到中心
    if (heroRef.current) {
      const rect = heroRef.current.getBoundingClientRect();
      mouseX.set(rect.width / 2);
      mouseY.set(rect.height / 2);
    }
  };

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
    <div className="min-h-screen pb-32 bg-[#f5f5f0]">
      <Header />
      
      {/* 首页封面 - Hero Banner */}
      <motion.section
        ref={heroRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative overflow-hidden bg-[#f5f5f0]"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* 渐变背景 */}
        <div className="relative min-h-[500px] sm:min-h-[600px] flex items-center justify-center">
          {/* 柔和的背景色 */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#faf9f5] via-[#f5f5f0] to-[#f0efe8]" />
          
          {/* 背景图案层 - 水彩花瓣式有机形状 */}
          <div className="absolute inset-0">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice">
              <defs>
                {/* 柔和渐变 - 温暖疗愈色系 */}
                {/* 薄荷绿 - 平静、疗愈 */}
                <linearGradient id="petal-sage" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c5d8c0" stopOpacity="0.55" />
                  <stop offset="50%" stopColor="#d0e0c8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#b8d0b0" stopOpacity="0.25" />
                </linearGradient>
                {/* 薰衣草紫 - 放松、冥想 */}
                <linearGradient id="petal-lavender" x1="20%" y1="0%" x2="80%" y2="100%">
                  <stop offset="0%" stopColor="#d4c0dd" stopOpacity="0.5" />
                  <stop offset="50%" stopColor="#cbb8d8" stopOpacity="0.38" />
                  <stop offset="100%" stopColor="#bfb0cc" stopOpacity="0.22" />
                </linearGradient>
                {/* 玫瑰暖粉 - 关爱、温柔 */}
                <linearGradient id="petal-rose" x1="0%" y1="20%" x2="100%" y2="80%">
                  <stop offset="0%" stopColor="#e8ccd8" stopOpacity="0.45" />
                  <stop offset="50%" stopColor="#e0c0d0" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#d8b8c8" stopOpacity="0.2" />
                </linearGradient>
                {/* 天空蓝 - 宁静、呼吸 */}
                <linearGradient id="petal-sky" x1="0%" y1="0%" x2="80%" y2="100%">
                  <stop offset="0%" stopColor="#c0d4e4" stopOpacity="0.48" />
                  <stop offset="50%" stopColor="#b8cce0" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#aec4d8" stopOpacity="0.2" />
                </linearGradient>
                {/* 暖杏色 - 温暖、拥抱 */}
                <linearGradient id="petal-peach" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#edd8c8" stopOpacity="0.45" />
                  <stop offset="50%" stopColor="#e8d0be" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#e0c8b0" stopOpacity="0.18" />
                </linearGradient>
                
                {/* 高斯模糊 - 水彩边缘效果 */}
                <filter id="watercolor">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
                </filter>
                <filter id="watercolor-soft">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="12" />
                </filter>
              </defs>
              
              {/* ========= 左侧区域 ========= */}
              {/* 大片薄荷叶 - 左上角，向右下延伸 */}
              <path
                d="M-40,80 Q120,-30 320,60 Q400,100 360,220 Q320,340 140,300 Q-20,260 -60,160 Z"
                fill="url(#petal-sage)"
                filter="url(#watercolor)"
                opacity="0.7"
              />
              
              {/* 薰衣草花瓣 - 左中偏上，优雅弧形 */}
              <path
                d="M80,200 Q200,100 350,180 Q440,240 380,360 Q300,440 160,380 Q60,320 80,200 Z"
                fill="url(#petal-lavender)"
                filter="url(#watercolor)"
                opacity="0.65"
              />
              
              {/* 小玫瑰花瓣 - 左下 */}
              <path
                d="M60,380 Q180,320 260,400 Q320,470 240,520 Q140,540 60,480 Q20,440 60,380 Z"
                fill="url(#petal-rose)"
                filter="url(#watercolor-soft)"
                opacity="0.5"
              />

              {/* ========= 中间区域 ========= */}
              {/* 大天空蓝色弧叶 - 中上方 */}
              <path
                d="M500,20 Q680,-40 820,60 Q920,130 860,240 Q780,320 620,280 Q460,240 440,120 Q430,60 500,20 Z"
                fill="url(#petal-sky)"
                filter="url(#watercolor)"
                opacity="0.6"
              />
              
              {/* 暖杏色水滴 - 中间偏下 */}
              <path
                d="M520,320 Q620,260 740,310 Q830,360 790,460 Q730,530 600,510 Q480,480 460,400 Q450,350 520,320 Z"
                fill="url(#petal-peach)"
                filter="url(#watercolor)"
                opacity="0.5"
              />
              
              {/* 薄荷绿圆叶 - 中间 */}
              <path
                d="M600,160 Q720,120 780,200 Q830,280 740,340 Q640,370 580,300 Q530,230 600,160 Z"
                fill="url(#petal-sage)"
                filter="url(#watercolor-soft)"
                opacity="0.45"
              />

              {/* ========= 右侧区域 ========= */}
              {/* 大薰衣草花瓣 - 右上角 */}
              <path
                d="M1050,0 Q1200,-30 1340,80 Q1460,180 1380,300 Q1280,380 1140,320 Q1020,260 1000,140 Q990,60 1050,0 Z"
                fill="url(#petal-lavender)"
                filter="url(#watercolor)"
                opacity="0.65"
              />
              
              {/* 天空蓝弧线 - 右侧中间 */}
              <path
                d="M1100,220 Q1240,180 1360,260 Q1460,330 1400,420 Q1320,490 1180,450 Q1060,410 1060,310 Q1060,250 1100,220 Z"
                fill="url(#petal-sky)"
                filter="url(#watercolor)"
                opacity="0.55"
              />
              
              {/* 玫瑰暖粉 - 右下角延伸 */}
              <path
                d="M1150,400 Q1280,360 1400,430 Q1500,500 1440,580 Q1360,640 1220,600 Q1100,560 1080,470 Q1070,420 1150,400 Z"
                fill="url(#petal-rose)"
                filter="url(#watercolor-soft)"
                opacity="0.5"
              />
              
              {/* 薄荷绿 - 底部右侧 */}
              <path
                d="M900,450 Q1020,400 1100,470 Q1160,530 1080,590 Q980,620 900,560 Q850,510 900,450 Z"
                fill="url(#petal-sage)"
                filter="url(#watercolor-soft)"
                opacity="0.4"
              />

              {/* ========= 点缀细节 ========= */}
              {/* 底部大弧线 - 暖杏 */}
              <path
                d="M300,480 Q500,420 700,470 Q860,520 800,590 Q680,640 480,610 Q280,580 260,520 Q250,490 300,480 Z"
                fill="url(#petal-peach)"
                filter="url(#watercolor-soft)"
                opacity="0.35"
              />
              
              {/* 顶部中间薄荷点缀 */}
              <path
                d="M380,30 Q460,-10 520,40 Q560,90 500,130 Q420,150 380,100 Q350,60 380,30 Z"
                fill="url(#petal-sage)"
                filter="url(#watercolor-soft)"
                opacity="0.4"
              />
            </svg>
          </div>
          
          {/* 探照灯遮罩层 - 半透明覆盖 + 径向渐变挖孔 */}
          <SpotlightOverlay x={smoothX} y={smoothY} />
          
          {/* 内容区 */}
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 md:px-8 text-center py-16 sm:py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <h1 className="text-[40px] sm:text-[52px] md:text-[64px] font-bold text-neutral-900 leading-tight tracking-tight mb-4">
                世界吵闹，
                <br />
                但你的每声叹息都值得被听见
              </h1>
              <p className="text-[16px] sm:text-[18px] text-neutral-600/80 mb-10 max-w-2xl mx-auto leading-relaxed">
                24/7 情绪共振, 是这一刻的温柔出口，也是每一天的生长力量。
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
                  开启AI疗愈
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
                  发现情绪社区
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Hero 底部分割线 + 柔和过渡 */}
      <div className="relative">
        {/* 渐变消失分割线 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="h-px bg-gradient-to-r from-transparent via-neutral-300/40 to-transparent"
          />
        </div>
        
        {/* 柔和过渡渐变 */}
        <div className="h-16 bg-gradient-to-b from-[#f0efe8]/20 to-[#f5f5f0]" />
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
            在这里，你的每一种频率都会有专属智能疗愈师的回响。
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

// 探照灯遮罩组件 - 用半透明覆盖层 + 径向渐变挖孔实现
interface SpotlightOverlayProps {
  x: ReturnType<typeof useSpring>;
  y: ReturnType<typeof useSpring>;
}

const SpotlightOverlay = ({ x, y }: SpotlightOverlayProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const update = () => {
      if (!overlayRef.current) return;
      const px = x.get();
      const py = y.get();
      
      // 径向渐变：中心完全透明（露出清晰图案），向外逐渐显示遮罩色（盖住图案）
      overlayRef.current.style.background = `radial-gradient(
        circle 420px at ${px}px ${py}px,
        transparent 0%,
        transparent 30%,
        rgba(245, 245, 240, 0.45) 55%,
        rgba(245, 245, 240, 0.72) 75%,
        rgba(245, 245, 240, 0.88) 100%
      )`;
    };
    
    const unsX = x.on('change', update);
    const unsY = y.on('change', update);
    update();
    
    return () => { unsX(); unsY(); };
  }, [x, y]);
  
  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 pointer-events-none z-[5]"
    />
  );
};

export default Home;
