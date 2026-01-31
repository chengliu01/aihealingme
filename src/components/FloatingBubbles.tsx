import { motion } from 'framer-motion';

// 柔和的蓝色系光晕
const blobs = [
  { color: 'from-blue-300/20 to-cyan-300/20', x: '10%', y: '20%', size: 280, delay: 0 },
  { color: 'from-sky-300/20 to-blue-300/20', x: '80%', y: '30%', size: 240, delay: 2 },
  { color: 'from-cyan-300/15 to-sky-300/15', x: '30%', y: '70%', size: 300, delay: 4 },
  { color: 'from-blue-200/20 to-sky-200/20', x: '70%', y: '80%', size: 260, delay: 1 },
];

const FloatingBubbles = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {blobs.map((blob, index) => (
        <motion.div
          key={index}
          className={`absolute rounded-full bg-gradient-to-br ${blob.color} blur-3xl`}
          style={{
            width: blob.size,
            height: blob.size,
            left: blob.x,
            top: blob.y,
          }}
          animate={{
            x: [0, 20, -10, 0],
            y: [0, -20, 10, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 12,
            delay: blob.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export default FloatingBubbles;
