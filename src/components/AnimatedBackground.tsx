import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Sonia 风格柔和米白背景 */}
      <div className="absolute inset-0 bg-[#f5f5f0]" />

      {/* 极淡的渐变层 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#faf9f5] via-transparent to-[#f0efe8] opacity-60" />

      {/* 柔和光晕 - 淡黄绿 */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(200, 220, 200, 0.15) 0%, transparent 70%)',
          left: '-5%',
          top: '-10%',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 柔和光晕 - 淡蓝 */}
      <motion.div
        className="absolute w-[450px] h-[450px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(200, 210, 230, 0.15) 0%, transparent 70%)',
          right: '-10%',
          top: '20%',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.25, 0.45, 0.25],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 3,
        }}
      />

      {/* 柔和光晕 - 淡紫粉 */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(220, 200, 212, 0.15) 0%, transparent 70%)',
          left: '30%',
          bottom: '-5%',
        }}
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 6,
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
