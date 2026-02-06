import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Check, Play, Loader2 } from 'lucide-react';
import { useStore } from '@/store';
import { generateId } from '@/utils';
import type { ChatMessage, HealingPlan, HealingAudio } from '@/types';

type Step = 'chat' | 'plan-review' | 'generating' | 'complete';

const PlanHealing = () => {
  const navigate = useNavigate();
  const { currentUser, addPlan, addAudio } = useStore();
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const [step, setStep] = useState<Step>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '你好，我是你的 AI 疗愈师。\n\n可以告诉我，最近是什么让你感到困扰吗？',
      timestamp: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const responses = [
        '我理解你的感受。这种情况持续多久了？',
        '谢谢你的分享。你平时怎么缓解这种情绪？',
        '明白了。你希望多长时间内看到改善？',
        '好的，我来为你制定一个个性化的疗愈计划。',
      ];

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: responses[Math.min(messages.length / 2, responses.length - 1)],
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);

      if (messages.length >= 6) {
        setTimeout(() => setStep('plan-review'), 800);
      }
    }, 1200);
  };

  const startPlan = async () => {
    setStep('generating');
    
    for (let i = 0; i <= 100; i += 25) {
      setProgress(i);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    const plan: HealingPlan = {
      id: generateId(),
      title: '焦虑缓解计划',
      description: '定制的4阶段疗愈方案',
      userId: currentUser?.id || '',
      stages: [
        { id: generateId(), title: '情绪觉察', description: '识别和接纳情绪', duration: 600, status: 'ready', scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() },
        { id: generateId(), title: '深度放松', description: '引导式冥想', duration: 900, status: 'pending', scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() },
        { id: generateId(), title: '正念呼吸', description: '提升情绪调节能力', duration: 720, status: 'pending', scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() },
        { id: generateId(), title: '积极暗示', description: '重建内心力量', duration: 600, status: 'pending', scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
      ],
      currentStage: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalDuration: 2820,
    };

    const audio: HealingAudio = {
      id: generateId(),
      title: plan.stages[0].title,
      description: plan.stages[0].description,
      coverUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
      audioUrl: '',
      duration: plan.stages[0].duration,
      author: currentUser!,
      tags: ['疗愈计划'],
      category: '冥想',
      likes: 0,
      views: 0,
      comments: [],
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: 'plan',
      planStage: 0,
      planId: plan.id,
      waveform: Array.from({ length: 50 }, () => Math.random() * 0.8 + 0.2),
      backgroundColor: 'from-violet-500/20 to-purple-500/20',
    };

    addAudio(audio);
    addPlan(plan);
    setStep('complete');
  };

  const easeOut = [0.25, 0.1, 0.25, 1];

  const renderChatStep = () => (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
        {messages.map((msg, index) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.03, ease: easeOut }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-[12px] ${
              msg.role === 'assistant' ? 'bg-neutral-100 text-neutral-600' : 'bg-neutral-900 text-white'
            }`}>
              {msg.role === 'assistant' ? '🤖' : '👤'}
            </div>
            <div className={`max-w-[75%] px-4 py-3 text-[14px] leading-relaxed whitespace-pre-wrap ${
              msg.role === 'assistant' 
                ? 'bg-white/60 backdrop-blur-sm text-neutral-700 rounded-2xl rounded-tl-md' 
                : 'bg-neutral-900 text-white rounded-2xl rounded-tr-md'
            }`}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center text-[12px]">🤖</div>
            <div className="bg-white/60 backdrop-blur-sm px-4 py-3 rounded-2xl rounded-tl-md flex items-center gap-1">
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 bg-neutral-400 rounded-full"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 bg-white/70 backdrop-blur-2xl border-t border-black/[0.04]">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
            placeholder="输入你的情况..." 
            className="flex-1 px-4 py-3 bg-white/60 border border-black/[0.04] rounded-2xl text-[14px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:bg-white/80 transition-all duration-200" 
          />
          <motion.button 
            onClick={handleSend} 
            disabled={!input.trim()} 
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 bg-neutral-900 text-white rounded-2xl flex items-center justify-center disabled:opacity-40"
          >
            <Send size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  );

  const planStages = [
    { title: '情绪觉察', desc: '识别和接纳情绪', duration: '10分钟', day: 1 },
    { title: '深度放松', desc: '引导式冥想', duration: '15分钟', day: 3 },
    { title: '正念呼吸', desc: '提升调节能力', duration: '12分钟', day: 5 },
    { title: '积极暗示', desc: '重建内心力量', duration: '10分钟', day: 7 },
  ];

  const renderPlanReviewStep = () => (
    <motion.div 
      initial={{ opacity: 0, y: 16 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4, ease: easeOut }}
      className="max-w-lg mx-auto px-4 py-6"
    >
      <div className="text-center mb-8">
        <p className="text-[12px] text-neutral-400 font-medium uppercase tracking-wider mb-2">为你定制</p>
        <h2 className="text-[22px] font-semibold text-neutral-800">焦虑缓解计划</h2>
      </div>

      <div className="space-y-2 mb-8">
        {planStages.map((stage, index) => (
          <motion.div 
            key={index} 
            initial={{ opacity: 0, x: -12 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.1 + index * 0.05, ease: easeOut }}
            className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-black/[0.04] flex items-center gap-4"
          >
            <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center text-[13px] font-semibold">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-[14px] text-neutral-800">{stage.title}</h3>
              <p className="text-[12px] text-neutral-400">{stage.desc}</p>
            </div>
            <div className="text-right">
              <p className="text-[13px] text-neutral-600 font-medium">{stage.duration}</p>
              <p className="text-[11px] text-neutral-400">第{stage.day}天</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-3">
        <motion.button 
          onClick={() => setStep('chat')} 
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3.5 bg-white/60 text-neutral-600 text-[14px] font-medium rounded-2xl border border-black/[0.04]"
        >
          继续对话
        </motion.button>
        <motion.button 
          onClick={startPlan} 
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3.5 bg-neutral-900 text-white text-[14px] font-medium rounded-2xl"
        >
          开始计划
        </motion.button>
      </div>
    </motion.div>
  );

  const renderGeneratingStep = () => (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="flex flex-col items-center justify-center py-24 px-6"
    >
      <motion.div
        className="w-14 h-14 rounded-2xl bg-neutral-900 flex items-center justify-center mb-6"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 size={22} className="text-white" />
      </motion.div>
      <div className="w-48">
        <div className="h-1 bg-neutral-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-neutral-900 rounded-full" 
            style={{ width: `${progress}%` }} 
          />
        </div>
        <p className="text-center text-[12px] text-neutral-400 mt-3">生成第一阶段音频</p>
      </div>
    </motion.div>
  );

  const renderCompleteStep = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96 }} 
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: easeOut }}
      className="max-w-sm mx-auto text-center px-4 py-10"
    >
      <motion.div 
        initial={{ scale: 0 }} 
        animate={{ scale: 1 }} 
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="w-16 h-16 rounded-2xl bg-neutral-900 flex items-center justify-center mx-auto mb-6"
      >
        <Check size={28} className="text-white" strokeWidth={2.5} />
      </motion.div>
      
      <h2 className="text-[20px] font-semibold text-neutral-800 mb-2">计划已创建</h2>
      <p className="text-[14px] text-neutral-400 mb-8">第一阶段音频就绪</p>

      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-black/[0.04] mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-neutral-900 flex items-center justify-center">
            <Play size={18} className="text-white ml-0.5" fill="currentColor" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-medium text-[14px] text-neutral-800">情绪觉察</h3>
            <p className="text-[12px] text-neutral-400">10分钟 · 第一阶段</p>
          </div>
        </div>
      </motion.div>

      <motion.button 
        onClick={() => navigate('/profile')} 
        whileTap={{ scale: 0.98 }}
        className="w-full py-3.5 bg-neutral-900 text-white text-[14px] font-medium rounded-2xl"
      >
        开始
      </motion.button>
    </motion.div>
  );

  return (
    <div className="min-h-screen pb-32">
      <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-black/[0.04]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <Link to="/" className="flex items-center gap-2 text-neutral-400 hover:text-neutral-600 transition-colors">
            <ArrowLeft size={18} strokeWidth={1.5} />
          </Link>
          <h1 className="flex-1 text-center text-[15px] font-medium text-neutral-800">
            深度陪伴
          </h1>
          <div className="w-5" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'chat' && renderChatStep()}
        {step === 'plan-review' && renderPlanReviewStep()}
        {step === 'generating' && renderGeneratingStep()}
        {step === 'complete' && renderCompleteStep()}
      </AnimatePresence>
    </div>
  );
};

export default PlanHealing;
