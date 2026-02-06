import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* 高级 mesh 背景（克制的冷暖过渡） */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#fbfbfe] via-[#f6f7fb] to-[#f2f4f8]" />

      {/* 轻薄的 mesh 层（增加“通透层次”） */}
      <div className="absolute inset-0 opacity-[0.55] bg-[radial-gradient(1100px_circle_at_20%_10%,rgba(139,92,246,0.08),transparent_55%),radial-gradient(900px_circle_at_85%_20%,rgba(6,182,212,0.07),transparent_55%),radial-gradient(1000px_circle_at_70%_90%,rgba(244,63,94,0.05),transparent_55%)]" />
      
      {/* 柔和光晕 - 极简 */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 70%)',
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
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.06) 0%, transparent 70%)',
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

      {/* 纵向柔光（让页面更“高级”但不显眼） */}
      <motion.div
        className="absolute -top-24 left-1/2 w-[520px] h-[900px] -translate-x-1/2 rotate-[18deg]"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.0) 70%)',
        }}
        animate={{ opacity: [0.35, 0.5, 0.35] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 微妙的噪点纹理 */}
      <div 
        className="absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
