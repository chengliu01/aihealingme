import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Moon, ArrowLeft } from 'lucide-react';

const Create = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const options = [
    {
      id: 'single',
      title: '此刻疗愈',
      subtitle: 'INSTANT HEALING',
      description: '根据你此刻的状态，即时生成专属疗愈音频。AI 疗愈师通过深度情绪识别与分析，为你量身定制最适合当下的音频内容。',
      icon: Sparkles,
      gradient: 'from-slate-700 via-slate-600 to-slate-800',
      lightGradient: 'from-slate-50/80 via-gray-50/60 to-slate-100/80',
      glowColor: 'rgba(51, 65, 85, 0.25)',
      features: [
        '精准情绪识别与分析',
        'AI 智能音频定制',
        '5-30 分钟灵活时长',
        '多种场景模式选择',
        '即时生成，无需等待'
      ],
      stats: [
        { label: '平均时长', value: '15分钟' },
        { label: '效果评分', value: '4.8/5.0' },
      ],
      badge: '快速见效',
      illustration: '✨',
      path: '/create/single',
    },
    {
      id: 'plan',
      title: '深度陪伴',
      subtitle: 'DEEP ACCOMPANY',
      description: '定制周期性疗愈计划，系统性提升心理状态。通过与 AI 疗愈师的深度对话，制定科学的长期疗愈方案。',
      icon: Moon,
      gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
      lightGradient: 'from-cyan-50/80 via-blue-50/60 to-indigo-50/80',
      glowColor: 'rgba(6, 182, 212, 0.3)',
      features: [
        '专业心理评估问卷',
        '多轮深度需求沟通',
        '分阶段疗愈方案设计',
        '智能进度追踪提醒',
        '疗愈效果数据分析'
      ],
      stats: [
        { label: '平均周期', value: '4-8周' },
        { label: '完成率', value: '89%' },
      ],
      badge: '长期改善',
      illustration: '🌙',
      path: '/create/plan',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-50 glass-soft border-b border-white/30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center">
          <Link to="/" className="btn-ghost flex items-center gap-2 -ml-2 text-neutral-600 hover:text-neutral-900">
            <ArrowLeft size={20} strokeWidth={1.5} />
            返回
          </Link>
          <h1 className="flex-1 text-center font-semibold text-base text-neutral-800 mr-16 tracking-tight">
            开启疗愈之旅
          </h1>
        </div>
      </div>

      {/* 主内容 */}
      <div className="flex-1 flex items-center justify-center p-6 py-12">
        <div className="w-full max-w-6xl">
          {/* 标题区域 - 更优雅 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-slate-100/70 via-gray-100/60 to-slate-100/70 rounded-full text-slate-700 text-sm font-medium mb-6 shadow-sm"
            >
              <Sparkles size={16} strokeWidth={2} />
              <span className="tracking-wide">AI 驱动的个性化疗愈</span>
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-5 tracking-tight leading-tight">
              每一种情绪，
              <br />
              <span className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 bg-clip-text text-transparent">
                都值得被温柔对待
              </span>
            </h1>
            
            <p className="text-neutral-500 text-lg max-w-2xl mx-auto leading-relaxed">
              无论是即刻的情绪舒缓还是长期的身心调理，AI 疗愈师都将为你量身定制专属方案
            </p>
          </motion.div>

          {/* 选项卡片 - 大幅优化 */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {options.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.15, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <Link to={option.path}>
                  <motion.div
                    className="relative overflow-hidden rounded-[2rem] p-10 bg-white/70 backdrop-blur-2xl shadow-2xl shadow-neutral-200/40 border border-white/60 transition-all duration-700 ease-out group"
                    onMouseEnter={() => setHoveredCard(option.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    whileHover={{ y: -12, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      boxShadow: hoveredCard === option.id 
                        ? `0 25px 60px -12px ${option.glowColor}, 0 0 0 1px rgba(255,255,255,0.8)` 
                        : undefined
                    }}
                  >
                    {/* 动态渐变背景 */}
                    <motion.div 
                      className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-700`}
                      animate={{
                        scale: hoveredCard === option.id ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.7 }}
                    />
                    
                    {/* 装饰性光晕 - 动态效果 */}
                    <motion.div 
                      className={`absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br ${option.lightGradient} blur-3xl`}
                      animate={{
                        scale: hoveredCard === option.id ? 1.5 : 1,
                        opacity: hoveredCard === option.id ? 0.6 : 0.3,
                      }}
                      transition={{ duration: 0.7 }}
                    />
                    
                    <motion.div 
                      className={`absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-gradient-to-tr ${option.lightGradient} blur-3xl`}
                      animate={{
                        scale: hoveredCard === option.id ? 1.5 : 1,
                        opacity: hoveredCard === option.id ? 0.4 : 0.2,
                      }}
                      transition={{ duration: 0.7 }}
                    />

                    {/* 内容区 */}
                    <div className="relative">
                      {/* 顶部图标和标识 */}
                      <div className="flex items-start justify-between mb-6">
                        <motion.div 
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${option.gradient} flex items-center justify-center shadow-xl`}
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                        >
                          <option.icon size={28} className="text-white" strokeWidth={2} />
                        </motion.div>
                        
                        {/* Badge */}
                        <span className="px-3 py-1.5 bg-white/80 backdrop-blur-sm text-neutral-600 text-xs font-semibold rounded-full border border-neutral-200/50 shadow-sm">
                          {option.badge}
                        </span>
                      </div>

                      {/* 标题和副标题 */}
                      <div className="mb-5">
                        <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-2 letter-spacing-wide">
                          {option.subtitle}
                        </p>
                        <h2 className="text-2xl font-bold text-neutral-900 mb-3 tracking-tight leading-tight">
                          {option.title}
                        </h2>
                        <p className="text-neutral-600 leading-relaxed text-[14px]">
                          {option.description}
                        </p>
                      </div>

                      {/* 数据统计 */}
                      <div className="grid grid-cols-2 gap-3 mb-5">
                        {option.stats.map((stat, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + index * 0.15 + i * 0.1 }}
                            className="bg-white/50 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/60"
                          >
                            <p className="text-[11px] text-neutral-400 font-medium mb-1">{stat.label}</p>
                            <p className={`text-lg font-bold bg-gradient-to-r ${option.gradient} bg-clip-text text-transparent`}>
                              {stat.value}
                            </p>
                          </motion.div>
                        ))}
                      </div>

                      {/* 特性列表 - 优化样式 */}
                      <ul className="space-y-3 mb-8">
                        {option.features.map((feature, i) => (
                          <motion.li 
                            key={i} 
                            className="flex items-center gap-3 text-neutral-700 text-[13px]"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.15 + i * 0.08 }}
                          >
                            <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${option.gradient} flex items-center justify-center shadow-md flex-shrink-0`}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                            <span className="font-medium">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>

                      {/* 行动按钮 - 高级感 */}
                      <motion.div
                        className="relative overflow-hidden rounded-2xl"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className={`
                          w-full px-6 py-4 rounded-2xl font-semibold text-base
                          flex items-center justify-center gap-2
                          transition-all duration-500
                          ${hoveredCard === option.id 
                            ? `bg-gradient-to-r ${option.gradient} text-white shadow-xl` 
                            : 'bg-neutral-900 text-white'
                          }
                        `}>
                          <span>开始体验</span>
                          <motion.span
                            animate={{ 
                              x: hoveredCard === option.id ? 4 : 0,
                              opacity: hoveredCard === option.id ? 1 : 0.7,
                            }}
                            transition={{ duration: 0.3 }}
                            className="text-xl"
                          >
                            {option.illustration}
                          </motion.span>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* 底部提示 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-center mt-16"
          >
            <p className="text-neutral-400 text-sm">
              不确定选哪个？两种方式可以随时切换体验 💫
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Create;
