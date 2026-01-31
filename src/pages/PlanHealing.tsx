import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, CheckCircle, Play } from 'lucide-react';
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
      content: '你好，我是你的 AI 疗愈师。为了给你制定最适合的疗愈计划，我想先了解一下你的情况。\n\n可以告诉我，最近是什么让你感到困扰吗？',
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
        '我理解你的感受。这种感觉确实让人不舒服。你能具体说说这种情况持续了多久吗？',
        '谢谢你的分享。你平时会通过什么方式来缓解这种情绪呢？',
        '明白了。在制定疗愈计划之前，我想了解一下，你希望多长时间内看到改善？',
        '好的，我了解了。现在我来为你制定一个个性化的疗愈计划。',
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
        setTimeout(() => setStep('plan-review'), 1000);
      }
    }, 1500);
  };

  const startPlan = async () => {
    setStep('generating');
    
    for (let i = 0; i <= 100; i += 20) {
      setProgress(i);
      await new Promise(resolve => setTimeout(resolve, 400));
    }

    const plan: HealingPlan = {
      id: generateId(),
      title: '焦虑缓解与身心平衡计划',
      description: '针对您的情况定制的4阶段疗愈方案',
      userId: currentUser?.id || '',
      stages: [
        { id: generateId(), title: '情绪觉察与接纳', description: '学习识别和接纳当前的情绪状态', duration: 600, status: 'ready', scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() },
        { id: generateId(), title: '深度放松练习', description: '通过引导式冥想达到深度放松状态', duration: 900, status: 'pending', scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() },
        { id: generateId(), title: '正念呼吸训练', description: '掌握正念呼吸技巧，提升情绪调节能力', duration: 720, status: 'pending', scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() },
        { id: generateId(), title: '积极心理暗示', description: '植入积极信念，重建内心力量', duration: 600, status: 'pending', scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
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
      tags: ['疗愈计划', '第一阶段'],
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

  const renderChatStep = () => (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-3xl mx-auto">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg, index) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm ${msg.role === 'assistant' ? 'bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600' : 'bg-neutral-200 text-neutral-600'}`}>
              {msg.role === 'assistant' ? '🤖' : '👤'}
            </div>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'assistant' ? 'bg-white/80 text-neutral-800 rounded-bl-sm shadow-sm' : 'bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-br-sm shadow-md'}`}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-sm">🤖</div>
            <div className="bg-white/80 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 bg-white/50 backdrop-blur-lg border-t border-white/50">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="输入您的情况..." className="flex-1 input-clean" />
          <motion.button onClick={handleSend} disabled={!input.trim()} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
            <Send size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  );

  const renderPlanReviewStep = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto p-4">
      <div className="text-center mb-8">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-100 to-purple-100 rounded-full text-violet-700 text-sm font-semibold mb-4">
          <span className="text-lg">✨</span>
          AI 为你定制的疗愈方案
        </motion.div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">焦虑缓解与身心平衡计划</h2>
        <p className="text-neutral-500">基于你的对话内容，为你量身定制</p>
      </div>

      <div className="space-y-3 mb-8">
        {[
          { title: '情绪觉察与接纳', desc: '学习识别和接纳当前的情绪状态', duration: 10, day: 1 },
          { title: '深度放松练习', desc: '通过引导式冥想达到深度放松状态', duration: 15, day: 3 },
          { title: '正念呼吸训练', desc: '掌握正念呼吸技巧，提升情绪调节能力', duration: 12, day: 5 },
          { title: '积极心理暗示', desc: '植入积极信念，重建内心力量', duration: 10, day: 7 },
        ].map((stage, index) => (
          <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-white/50">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
              {index + 1}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-900">{stage.title}</h3>
              <p className="text-sm text-neutral-500">{stage.desc}</p>
            </div>
            <div className="text-right text-sm">
              <div className="text-neutral-600 font-medium">{stage.duration}分钟</div>
              <div className="text-neutral-400">第{stage.day}天</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-3">
        <motion.button onClick={() => setStep('chat')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 btn-secondary">继续对话</motion.button>
        <motion.button onClick={startPlan} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 btn-primary flex items-center justify-center gap-2">
          <CheckCircle size={18} />
          确认并开始
        </motion.button>
      </div>
    </motion.div>
  );

  const renderGeneratingStep = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
      <div className="w-64 mb-8">
        <div className="h-3 bg-neutral-200/50 rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full" style={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
        </div>
        <p className="text-center text-neutral-500 mt-4 font-medium">{progress}% - 生成第一阶段疗愈音频</p>
      </div>
    </motion.div>
  );

  const renderCompleteStep = () => (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center p-4">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-violet-600" />
      </motion.div>
      
      <h2 className="text-xl font-bold text-neutral-900 mb-2">疗愈计划已创建</h2>
      <p className="text-neutral-500 mb-8">第一阶段音频已生成</p>

      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 mb-6 text-left shadow-lg border border-white/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-md">
            <Play size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900">第一阶段：情绪觉察与接纳</h3>
            <p className="text-sm text-neutral-500">建议明天开始练习</p>
          </div>
          <div className="text-neutral-500 text-sm">10分钟</div>
        </div>
      </div>

      <motion.button onClick={() => navigate('/profile')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full btn-primary">立即开始</motion.button>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex flex-col pb-24">
      <div className="sticky top-0 z-50 glass border-b border-white/50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center">
          <Link to="/" className="btn-ghost flex items-center gap-2 -ml-2">
            <ArrowLeft size={20} />
            返回
          </Link>
          <h1 className="flex-1 text-center font-semibold text-lg text-neutral-900 mr-16">计划疗愈</h1>
        </div>
      </div>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          {step === 'chat' && renderChatStep()}
          {step === 'plan-review' && renderPlanReviewStep()}
          {step === 'generating' && renderGeneratingStep()}
          {step === 'complete' && renderCompleteStep()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PlanHealing;
