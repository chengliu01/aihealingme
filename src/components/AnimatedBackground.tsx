import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* 暖色调 mesh 背景（从米白到暖灰） */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#faf8f5] via-[#f5f2ee] to-[#ede9e4]" />

      {/* 轻薄的 mesh 层（高级暗色调光晕） */}
      <div className="absolute inset-0 opacity-[0.4] bg-[radial-gradient(1100px_circle_at_20%_10%,rgba(51,65,85,0.08),transparent_55%),radial-gradient(900px_circle_at_85%_20%,rgba(217,119,6,0.06),transparent_55%),radial-gradient(1000px_circle_at_70%_90%,rgba(148,163,184,0.05),transparent_55%)]" />
      
      {/* 柔和光晕 - 极简 */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(51, 65, 85, 0.06) 0%, transparent 70%)',
          left: '-10%',
          top: '-20%',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.35, 0.55, 0.35],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(217, 119, 6, 0.05) 0%, transparent 70%)',
          right: '-15%',
          bottom: '-10%',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 5,
        }}
      />

      {/* 纵向柔光（让页面更"高级"但不显眼） */}
      <motion.div
        className="absolute -top-24 left-1/2 w-[520px] h-[900px] -translate-x-1/2 rotate-[18deg]"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.0) 70%)',
        }}
        animate={{ opacity: [0.35, 0.5, 0.35] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 微妙的噪点纹理 */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
