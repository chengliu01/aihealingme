import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Calendar, ArrowLeft, Sparkles } from 'lucide-react';

const Create = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const options = [
    {
      id: 'single',
      title: '单次疗愈',
      description: '针对当下的情绪状态，快速生成专属疗愈音频',
      icon: MessageCircle,
      gradient: 'from-violet-500 to-primary-500',
      lightGradient: 'from-violet-50 to-primary-50',
      features: ['即时情绪分析', '个性化音频生成', '5-30分钟灵活时长'],
      path: '/create/single',
    },
    {
      id: 'plan',
      title: '规划疗愈',
      description: '与AI疗愈师深入交流，制定阶段性疗愈计划',
      icon: Calendar,
      gradient: 'from-cyan-500 to-blue-500',
      lightGradient: 'from-cyan-50 to-blue-50',
      features: ['多轮需求沟通', '阶段性疗愈方案', '智能进度追踪'],
      path: '/create/plan',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-50 glass border-b border-white/50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center">
          <Link to="/" className="btn-ghost flex items-center gap-2 -ml-2">
            <ArrowLeft size={20} />
            返回
          </Link>
          <h1 className="flex-1 text-center font-semibold text-lg text-neutral-900 mr-16">
            创建疗愈
          </h1>
        </div>
      </div>

      {/* 主内容 */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* 标题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-100 to-primary-100 rounded-full text-violet-700 text-sm font-medium mb-4"
            >
              <Sparkles size={16} />
              选择适合你的疗愈方式
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              开始你的<span className="text-gradient">疗愈之旅</span>
            </h1>
            <p className="text-neutral-500 text-lg max-w-xl mx-auto">
              无论是即时的情绪舒缓还是长期的身心调理，AI 疗愈师都将为你量身定制专属方案
            </p>
          </motion.div>

          {/* 选项卡片 */}
          <div className="grid md:grid-cols-2 gap-6">
            {options.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Link to={option.path}>
                  <motion.div
                    className={`relative overflow-hidden rounded-3xl p-8 bg-white shadow-lg shadow-neutral-200/50 border border-white/50 backdrop-blur-sm transition-all duration-500 ${
                      hoveredCard === option.id 
                        ? 'shadow-2xl scale-[1.02]' 
                        : ''
                    }`}
                    onMouseEnter={() => setHoveredCard(option.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    whileHover={{ y: -8 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* 背景渐变装饰 */}
                    <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${option.lightGradient} opacity-50 blur-3xl`} />
                    
                    {/* 图标 */}
                    <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${option.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                      <option.icon size={28} className="text-white" />
                    </div>

                    {/* 内容 */}
                    <h2 className="relative text-2xl font-bold text-neutral-900 mb-2">{option.title}</h2>
                    <p className="relative text-neutral-500 mb-6">{option.description}</p>

                    {/* 特性列表 */}
                    <ul className="relative space-y-3 mb-8">
                      {option.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-neutral-600 text-sm">
                          <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${option.gradient} flex items-center justify-center`}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* 按钮 */}
                    <div className={`relative inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      hoveredCard === option.id 
                        ? `bg-gradient-to-r ${option.gradient} text-white shadow-lg` 
                        : 'bg-neutral-100 text-neutral-700'
                    }`}>
                      开始创建
                      <motion.span
                        animate={{ x: hoveredCard === option.id ? 4 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        →
                      </motion.span>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Create;
