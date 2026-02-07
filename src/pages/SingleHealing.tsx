import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Play, Check } from 'lucide-react';
import { formatDuration } from '@/utils';
import { useStore } from '@/store';
import { emotionOptions, scenarioOptions, durationOptions, generateId } from '@/utils';
import type { HealingAudio } from '@/types';

type Step = 'input' | 'analyzing' | 'generating' | 'complete';

const SingleHealing = () => {
  const navigate = useNavigate();
  const { currentUser, addAudio } = useStore();
  
  const [step, setStep] = useState<Step>('input');
  const [input, setInput] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState(600);
  const [intensity, setIntensity] = useState(5);
  const [generatedAudio, setGeneratedAudio] = useState<HealingAudio | null>(null);
  const [progress, setProgress] = useState(0);

  const handleEmotionToggle = (value: string) => {
    setSelectedEmotions(prev => 
      prev.includes(value) ? prev.filter(e => e !== value) : [...prev, value]
    );
  };

  const handleScenarioToggle = (value: string) => {
    setSelectedScenarios(prev => 
      prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
    );
  };

  const handleSubmit = async () => {
    if (!input.trim() && selectedEmotions.length === 0) return;
    
    setStep('analyzing');
    await new Promise(resolve => setTimeout(resolve, 2000));
    setStep('generating');
    
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise(resolve => setTimeout(resolve, 400));
    }
    
    const emotionLabels = selectedEmotions
      .map(e => emotionOptions.find(opt => opt.value === e)?.label)
      .filter((label): label is string => Boolean(label));
    
    const audio: HealingAudio = {
      id: generateId(),
      title: `专属疗愈：${emotionLabels.join('、') || '心灵平静'}`,
      description: input,
      coverUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
      audioUrl: '',
      duration: selectedDuration,
      author: currentUser!,
      tags: emotionLabels,
      category: emotionLabels[0] || '冥想',
      likes: 0,
      views: 0,
      comments: [],
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: 'single',
      waveform: Array.from({ length: 50 }, () => Math.random() * 0.8 + 0.2),
      backgroundColor: 'from-slate-500/20 to-gray-500/20',
    };
    
    setGeneratedAudio(audio);
    addAudio(audio);
    setStep('complete');
  };

  const easeOut = [0.25, 0.1, 0.25, 1];

  const renderInputStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: easeOut }}
      className="max-w-lg mx-auto"
    >
      {/* 情绪选择 */}
      <div className="mb-8">
        <label className="block text-[13px] font-medium text-neutral-500 mb-3">
          当前情绪
        </label>
        <div className="flex flex-wrap gap-2">
          {emotionOptions.map((emotion, i) => (
            <motion.button
              key={emotion.value}
              onClick={() => handleEmotionToggle(emotion.value)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
              whileTap={{ scale: 0.96 }}
              className={`
                px-4 py-2 rounded-full text-[13px] font-medium
                transition-all duration-300 ease-out
                ${selectedEmotions.includes(emotion.value)
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white/60 text-neutral-600 border border-black/[0.04] hover:bg-white/80'
                }
              `}
            >
              {emotion.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* 场景选择 */}
      <div className="mb-8">
        <label className="block text-[13px] font-medium text-neutral-500 mb-3">
          触发原因
        </label>
        <div className="flex flex-wrap gap-2">
          {scenarioOptions.map((scenario, i) => (
            <motion.button
              key={scenario.value}
              onClick={() => handleScenarioToggle(scenario.value)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.02 }}
              whileTap={{ scale: 0.96 }}
              className={`
                px-4 py-2 rounded-full text-[13px] font-medium
                transition-all duration-300 ease-out
                ${selectedScenarios.includes(scenario.value)
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white/60 text-neutral-600 border border-black/[0.04] hover:bg-white/80'
                }
              `}
            >
              {scenario.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* 强度 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <label className="text-[13px] font-medium text-neutral-500">强度</label>
          <span className="text-[15px] font-semibold text-neutral-800">{intensity}</span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
          className="w-full h-1 bg-neutral-200 rounded-full appearance-none cursor-pointer"
          style={{ 
            background: `linear-gradient(to right, #171717 0%, #171717 ${intensity * 10}%, #e5e5e5 ${intensity * 10}%, #e5e5e5 100%)` 
          }}
        />
        <div className="flex justify-between mt-2 text-[11px] text-neutral-400">
          <span>轻微</span>
          <span>强烈</span>
        </div>
      </div>

      {/* 描述 */}
      <div className="mb-8">
        <label className="block text-[13px] font-medium text-neutral-500 mb-3">
          描述你的感受
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="可选：更详细的描述能让 AI 更好地理解你..."
          className="w-full px-4 py-3 bg-white/60 border border-black/[0.04] rounded-2xl text-[14px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:bg-white/80 transition-all duration-200 min-h-[100px] resize-none"
        />
      </div>

      {/* 时长 */}
      <div className="mb-10">
        <label className="block text-[13px] font-medium text-neutral-500 mb-3">
          疗愈时长
        </label>
        <div className="flex gap-2">
          {durationOptions.map((opt) => (
            <motion.button
              key={opt.value}
              onClick={() => setSelectedDuration(opt.value)}
              whileTap={{ scale: 0.96 }}
              className={`
                flex-1 py-3 rounded-xl text-[13px] font-medium
                transition-all duration-300 ease-out
                ${selectedDuration === opt.value
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white/60 text-neutral-600 border border-black/[0.04]'
                }
              `}
            >
              {opt.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* 提交 */}
      <motion.button
        onClick={handleSubmit}
        disabled={selectedEmotions.length === 0 && !input.trim()}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 bg-neutral-900 text-white text-[15px] font-medium rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
      >
        开始生成
      </motion.button>
    </motion.div>
  );

  const renderProcessingStep = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-24"
    >
      <motion.div
        className="w-16 h-16 rounded-2xl bg-neutral-900 flex items-center justify-center mb-6"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 size={24} className="text-white" />
      </motion.div>
      
      {step === 'analyzing' ? (
        <>
          <h3 className="text-[17px] font-semibold text-neutral-800 mb-2">分析情绪中</h3>
          <p className="text-[14px] text-neutral-400">识别情绪模式...</p>
        </>
      ) : (
        <>
          <h3 className="text-[17px] font-semibold text-neutral-800 mb-4">生成音频</h3>
          <div className="w-48">
            <div className="h-1 bg-neutral-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-neutral-900 rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
            <p className="text-center text-[12px] text-neutral-400 mt-3">{progress}%</p>
          </div>
        </>
      )}
    </motion.div>
  );

  const renderCompleteStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: easeOut }}
      className="max-w-sm mx-auto text-center py-12"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="w-16 h-16 rounded-2xl bg-neutral-900 flex items-center justify-center mx-auto mb-6"
      >
        <Check size={28} className="text-white" strokeWidth={2.5} />
      </motion.div>
      
      <h2 className="text-[20px] font-semibold text-neutral-800 mb-2">生成完成</h2>
      <p className="text-[14px] text-neutral-400 mb-8">专属疗愈音频已就绪</p>

      {generatedAudio && (
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-black/[0.04] mb-8 text-left"
        >
          <div className="flex gap-4">
            <img
              src={generatedAudio.coverUrl}
              alt={generatedAudio.title}
              className="w-16 h-16 object-cover rounded-xl"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-[14px] text-neutral-800 truncate mb-1">{generatedAudio.title}</h3>
              <p className="text-[12px] text-neutral-400">{formatDuration(generatedAudio.duration)}</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        <motion.button 
          onClick={() => generatedAudio && navigate(`/audio/${generatedAudio.id}`)}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3.5 bg-neutral-900 text-white text-[14px] font-medium rounded-2xl flex items-center justify-center gap-2"
        >
          <Play size={16} fill="currentColor" />
          播放
        </motion.button>
        <motion.button 
          onClick={() => navigate('/')}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3.5 bg-white/60 text-neutral-600 text-[14px] font-medium rounded-2xl border border-black/[0.04]"
        >
          返回首页
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen pb-32">
      {/* 导航 */}
      <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-black/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 h-14 flex items-center">
          <Link to="/" className="flex items-center gap-2 text-neutral-400 hover:text-neutral-600 transition-colors">
            <ArrowLeft size={18} strokeWidth={1.5} />
          </Link>
          <h1 className="flex-1 text-center text-[15px] font-medium text-neutral-800">
            此刻疗愈
          </h1>
          <div className="w-5" />
        </div>
      </div>

      {/* 内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-6">
        <AnimatePresence mode="wait">
          {step === 'input' && renderInputStep()}
          {(step === 'analyzing' || step === 'generating') && renderProcessingStep()}
          {step === 'complete' && renderCompleteStep()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SingleHealing;
