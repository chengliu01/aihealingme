import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Clock, Play, CheckCircle } from 'lucide-react';
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
      prev.includes(value) 
        ? prev.filter(e => e !== value)
        : [...prev, value]
    );
  };

  const handleScenarioToggle = (value: string) => {
    setSelectedScenarios(prev => 
      prev.includes(value) 
        ? prev.filter(s => s !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async () => {
    if (!input.trim() && selectedEmotions.length === 0) return;
    
    setStep('analyzing');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    setStep('generating');
    
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise(resolve => setTimeout(resolve, 500));
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
      backgroundColor: 'from-violet-500/20 to-purple-500/20',
    };
    
    setGeneratedAudio(audio);
    addAudio(audio);
    setStep('complete');
  };

  const renderInputStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      {/* 情绪选择 */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-neutral-700 mb-3">
          你当前的情绪状态
        </label>
        <div className="flex flex-wrap gap-2">
          {emotionOptions.map((emotion) => (
            <motion.button
              key={emotion.value}
              onClick={() => handleEmotionToggle(emotion.value)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
                ${selectedEmotions.includes(emotion.value)
                  ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md'
                  : 'bg-white/60 text-neutral-600 hover:bg-white border border-neutral-200/50'
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
        <label className="block text-sm font-semibold text-neutral-700 mb-3">
          是什么让你产生这些情绪？
        </label>
        <div className="flex flex-wrap gap-2">
          {scenarioOptions.map((scenario) => (
            <motion.button
              key={scenario.value}
              onClick={() => handleScenarioToggle(scenario.value)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
                ${selectedScenarios.includes(scenario.value)
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
                  : 'bg-white/60 text-neutral-600 hover:bg-white border border-neutral-200/50'
                }
              `}
            >
              {scenario.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* 强度滑块 */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-neutral-700 mb-3">
          情绪强度
        </label>
        <div className="bg-white/60 rounded-2xl p-5 border border-neutral-200/50">
          <input
            type="range"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="w-full h-2 bg-neutral-200 rounded-full appearance-none cursor-pointer"
            style={{ 
              background: `linear-gradient(to right, #8b5cf6 0%, #a855f7 ${intensity * 10}%, #e5e5e5 ${intensity * 10}%, #e5e5e5 100%)` 
            }}
          />
          <div className="flex justify-between mt-3 text-sm text-neutral-500">
            <span>轻微</span>
            <span className="font-semibold text-violet-600 text-lg">{intensity}</span>
            <span>强烈</span>
          </div>
        </div>
      </div>

      {/* 详细描述 */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-neutral-700 mb-3">
          详细描述你的感受（可选）
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="请描述你当前的状态，AI 疗愈师会更好地理解你..."
          className="input-clean min-h-[120px] resize-none"
        />
      </div>

      {/* 时长选择 */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-neutral-700 mb-3">
          期望的疗愈时长
        </label>
        <div className="flex flex-wrap gap-3">
          {durationOptions.map((opt) => (
            <motion.button
              key={opt.value}
              onClick={() => setSelectedDuration(opt.value)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300
                ${selectedDuration === opt.value
                  ? 'bg-neutral-900 text-white shadow-md'
                  : 'bg-white/60 text-neutral-600 hover:bg-white border border-neutral-200/50'
                }
              `}
            >
              <Clock size={16} />
              {opt.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* 提交按钮 */}
      <motion.button
        onClick={handleSubmit}
        disabled={selectedEmotions.length === 0 && !input.trim()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        开始 AI 分析
      </motion.button>
    </motion.div>
  );

  const renderAnalyzingStep = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="relative w-28 h-28 mb-8">
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-400/20 to-purple-400/20"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-2 rounded-full bg-gradient-to-r from-violet-400/30 to-purple-400/30"
          animate={{ scale: [1.1, 1.4, 1.1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
        />
        <motion.div
          className="absolute inset-4 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/30"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Loader2 size={28} className="text-white animate-spin" />
        </motion.div>
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">AI 正在分析你的情绪...</h3>
      <p className="text-neutral-500">识别情绪模式，匹配最佳疗愈方案</p>
    </motion.div>
  );

  const renderGeneratingStep = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="w-72 mb-8">
        <div className="h-3 bg-neutral-200/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-center text-neutral-500 mt-4 font-medium">{progress}% - 生成专属疗愈音频</p>
      </div>
    </motion.div>
  );

  const renderCompleteStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle size={40} className="text-violet-600" />
      </motion.div>
      
      <h2 className="text-xl font-bold text-neutral-900 mb-2">疗愈音频已生成</h2>
      <p className="text-neutral-500 mb-8">你的专属疗愈音频已经准备好了</p>

      {generatedAudio && (
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 mb-6 text-left shadow-lg shadow-neutral-200/30 border border-white/50">
          <div className="flex gap-4">
            <div className="relative">
              <img
                src={generatedAudio.coverUrl}
                alt={generatedAudio.title}
                className="w-24 h-24 object-cover rounded-xl shadow-md"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl opacity-0 hover:opacity-100 transition-opacity">
                <Play size={24} className="text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-900 mb-1">{generatedAudio.title}</h3>
              <p className="text-xs text-neutral-500 mb-2">{formatDuration(generatedAudio.duration)}</p>
              <div className="flex flex-wrap gap-1">
                {generatedAudio.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 bg-violet-100 text-violet-600 rounded-md">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <motion.button 
          onClick={() => generatedAudio && navigate(`/audio/${generatedAudio.id}`)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          <Play size={18} />
          立即播放
        </motion.button>
        <motion.button 
          onClick={() => navigate('/profile')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full btn-secondary flex items-center justify-center gap-2"
        >
          查看我的作品
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex flex-col pb-24">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-50 glass border-b border-white/50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center">
          <Link to="/" className="btn-ghost flex items-center gap-2 -ml-2">
            <ArrowLeft size={20} />
            返回
          </Link>
          <h1 className="flex-1 text-center font-semibold text-lg text-neutral-900 mr-16">
            单次疗愈
          </h1>
        </div>
      </div>

      {/* 主内容 */}
      <div className="flex-1 p-4 py-8">
        <AnimatePresence mode="wait">
          {step === 'input' && renderInputStep()}
          {step === 'analyzing' && renderAnalyzingStep()}
          {step === 'generating' && renderGeneratingStep()}
          {step === 'complete' && renderCompleteStep()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SingleHealing;
