import { motion } from 'framer-motion';

// 粒子配置
const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 2,
  duration: Math.random() * 20 + 15,
  delay: Math.random() * 5,
}));

// 波浪配置
const waves = [
  { color: 'from-blue-400/10 to-cyan-400/10', delay: 0, duration: 20 },
  { color: 'from-violet-400/10 to-blue-400/10', delay: 5, duration: 25 },
  { color: 'from-cyan-400/10 to-sky-400/10', delay: 10, duration: 18 },
];

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* 基础渐变背景 */}
      <div 
        className="absolute inset-0 animate-gradient"
        style={{
          background: 'linear-gradient(-45deg, #f0f9ff, #e0f2fe, #dbeafe, #ecfeff, #f0f9ff, #e0f2fe)',
          backgroundSize: '400% 400%',
        }}
      />

      {/* 网格背景 */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(14, 165, 233, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14, 165, 233, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      >
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ['0% 0%', '50px 50px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            backgroundImage: `
              linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* 波浪动画 */}
      {waves.map((wave, index) => (
        <motion.div
          key={`wave-${index}`}
          className={`absolute inset-0 bg-gradient-to-br ${wave.color}`}
          animate={{
            clipPath: [
              'polygon(0% 100%, 0% 0%, 100% 0%, 100% 100%)',
              'polygon(0% 100%, 0% 20%, 100% 10%, 100% 100%)',
              'polygon(0% 100%, 0% 40%, 100% 30%, 100% 100%)',
              'polygon(0% 100%, 0% 20%, 100% 10%, 100% 100%)',
              'polygon(0% 100%, 0% 0%, 100% 0%, 100% 100%)',
            ],
          }}
          transition={{
            duration: wave.duration,
            delay: wave.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)',
          }}
        />
      ))}

      {/* 浮动粒子 */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-br from-blue-400/30 to-cyan-400/30 blur-sm"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            x: [
              Math.random() * 100 - 50,
              Math.random() * 100 - 50,
              Math.random() * 100 - 50,
            ],
            y: [
              Math.random() * 100 - 50,
              Math.random() * 100 - 50,
              Math.random() * 100 - 50,
            ],
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* 大型光晕（增强现有FloatingBubbles效果） */}
      <motion.div
        className="absolute rounded-full bg-gradient-to-br from-violet-400/15 to-blue-400/15 blur-3xl"
        style={{
          width: 400,
          height: 400,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 旋转的光环 */}
      <motion.div
        className="absolute rounded-full border-2 border-blue-300/20"
        style={{
          width: 600,
          height: 600,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      <motion.div
        className="absolute rounded-full border-2 border-cyan-300/20"
        style={{
          width: 500,
          height: 500,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: 45,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
};

export default AnimatedBackground;

