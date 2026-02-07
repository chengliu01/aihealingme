import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Loader2, Play, Check, Send,
  ChevronDown, ChevronUp, Sparkles, MessageCircle
} from 'lucide-react';
import { formatDuration } from '@/utils';
import { useStore } from '@/store';
import {
  emotionOptions, scenarioOptions, durationOptions, generateId,
  bodySensationOptions, healingGoalOptions,
  mbtiGroups, lifeStageOptions, sleepQualityOptions, meditationExpOptions
} from '@/utils';
import type { HealingAudio } from '@/types';

// ======================== Types ========================

type FlowStep = 'prefill' | 'chat' | 'generating' | 'complete';

interface ChatMsg {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: number;
  // AI 消息可附带快捷回复选项
  quickReplies?: string[];
}

// ======================== AI Simulation ========================

// 根据预填信息生成 AI 的开场白
function buildGreeting(
  emotions: string[], intensity: number, scenarios: string[],
  bodySensations: string[], goals: string[], extras: Record<string, string>
): ChatMsg[] {
  const emoLabels = emotions
    .map(e => emotionOptions.find(o => o.value === e)?.label)
    .filter(Boolean);
  const scenLabels = scenarios
    .map(s => scenarioOptions.find(o => o.value === s)?.label)
    .filter(Boolean);
  const goalLabels = goals
    .map(g => healingGoalOptions.find(o => o.value === g)?.label)
    .filter(Boolean);

  let greeting = '你好，感谢你愿意在这里停下来关照自己。';

  if (emoLabels.length > 0) {
    greeting += `\n\n我注意到你现在正在经历「${emoLabels.join('、')}」`;
    if (intensity >= 7) {
      greeting += '，而且这种感受似乎还挺强烈的。';
    } else if (intensity <= 3) {
      greeting += '，虽然程度不算太重，但能察觉到自己的情绪已经是很棒的觉察。';
    } else {
      greeting += '。';
    }
  }

  if (scenLabels.length > 0) {
    greeting += `这和「${scenLabels.join('、')}」有关。`;
  }

  if (goalLabels.length > 0) {
    greeting += `\n\n你希望通过这次疗愈「${goalLabels.join('、')}」，我会为你量身设计。`;
  }

  // 身体感受补充
  const bodyLabels = bodySensations
    .filter(b => b !== 'none')
    .map(b => bodySensationOptions.find(o => o.value === b)?.label)
    .filter(Boolean);
  if (bodyLabels.length > 0) {
    greeting += `\n\n你提到身体上有「${bodyLabels.join('、')}」的感觉，这些身心信号我都会考虑进去。`;
  }

  // extras (MBTI, etc.) 作为隐式上下文传递给生成逻辑，不在开场白中展示
  // 但在实际 API 调用中会一并发送
  void extras;

  greeting += '\n\n在为你生成音频之前，我想再了解你多一点——你能跟我说说，最近发生了什么让你有这些感受的吗？不需要很详细，几句话就好。';

  return [{
    id: generateId(),
    role: 'ai' as const,
    content: greeting,
    timestamp: Date.now(),
    quickReplies: [
      '我也说不清楚，就是感觉不太好',
      '工作上遇到了很大的压力',
      '和重要的人之间出了问题',
      '最近睡眠很差，整个人都不好',
    ],
  }];
}

// 模拟 AI 多轮对话回复
const AI_FOLLOW_UPS: Array<{
  content: string;
  quickReplies?: string[];
}> = [
  {
    content: '谢谢你的分享，我能感受到这对你来说并不容易。\n\n你有没有注意到，在这种情绪出现的时候，身体上有什么感觉？比如胸口发紧、呼吸变浅、或者身体很沉重？',
    quickReplies: ['胸口总是闷闷的', '头有点疼或发胀', '身体很疲惫沉重', '没什么特别的身体感觉'],
  },
  {
    content: '了解了。身心是互相连接的，这些身体信号也在提醒你需要被关照。\n\n最后一个问题：你希望这段疗愈音频用什么样的方式来陪伴你？',
    quickReplies: ['温柔的引导，帮我放松下来', '专注呼吸，让思绪安静', '给我一些安慰和力量', '带我做一次身体放松'],
  },
  {
    content: '好的，我已经很好地理解了你此刻的状态和需求。让我为你定制一段专属的疗愈音频吧。\n\n你可以选择一个适合你的时长，然后我就开始生成。准备好了吗？✨',
  },
];

// ======================== Component ========================

const SingleHealing = () => {
  const navigate = useNavigate();
  const { currentUser, addAudio } = useStore();

  // Flow
  const [flowStep, setFlowStep] = useState<FlowStep>('prefill');
  const [progress, setProgress] = useState(0);
  const [generatedAudio, setGeneratedAudio] = useState<HealingAudio | null>(null);

  // Pre-fill state
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [intensity, setIntensity] = useState(5);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [bodySensations, setBodySensations] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  // 可选补充
  const [showExtras, setShowExtras] = useState(false);
  const [mbti, setMbti] = useState('');
  const [lifeStage, setLifeStage] = useState('');
  const [sleepQuality, setSleepQuality] = useState('');
  const [meditationExp, setMeditationExp] = useState('');

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [aiRound, setAiRound] = useState(0);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(600);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Helpers
  const toggleArrayItem = useCallback((setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  }, []);

  // Track whether we should auto-scroll (only after AI messages)
  const shouldAutoScroll = useRef(false);

  const scrollToBottom = useCallback(() => {
    if (!shouldAutoScroll.current) return;
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      shouldAutoScroll.current = false;
    }, 100);
  }, []);

  // Only scroll when AI finishes typing (isAiTyping goes false → new AI message arrived)
  const prevAiTyping = useRef(false);
  useEffect(() => {
    // Scroll on initial greeting load
    if (chatMessages.length === 1 && chatMessages[0].role === 'ai') {
      shouldAutoScroll.current = true;
      scrollToBottom();
    }
    // Scroll when AI finishes responding
    if (prevAiTyping.current && !isAiTyping) {
      shouldAutoScroll.current = true;
      scrollToBottom();
    }
    prevAiTyping.current = isAiTyping;
  }, [isAiTyping, chatMessages, scrollToBottom]);

  // Scroll when duration picker appears
  useEffect(() => {
    if (showDurationPicker) {
      shouldAutoScroll.current = true;
      scrollToBottom();
    }
  }, [showDurationPicker, scrollToBottom]);

  // ======================== Handlers ========================

  const handleEnterChat = () => {
    if (selectedEmotions.length === 0) return;

    const extras: Record<string, string> = {};
    if (mbti) extras.mbti = mbti;
    if (lifeStage) extras.lifeStage = lifeStage;
    if (sleepQuality) extras.sleepQuality = sleepQuality;
    if (meditationExp) extras.meditationExp = meditationExp;

    const greeting = buildGreeting(
      selectedEmotions, intensity, selectedScenarios,
      bodySensations, selectedGoals, extras
    );
    setChatMessages(greeting);
    setFlowStep('chat');
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMsg = {
      id: generateId(),
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAiTyping(true);

    // Simulate AI thinking
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

    const nextRound = aiRound;
    if (nextRound < AI_FOLLOW_UPS.length) {
      const followUp = AI_FOLLOW_UPS[nextRound];
      const aiMsg: ChatMsg = {
        id: generateId(),
        role: 'ai',
        content: followUp.content,
        timestamp: Date.now(),
        quickReplies: followUp.quickReplies,
      };
      setChatMessages(prev => [...prev, aiMsg]);
      setAiRound(nextRound + 1);

      // 最后一轮后显示时长选择
      if (nextRound === AI_FOLLOW_UPS.length - 1) {
        setShowDurationPicker(true);
      }
    }
    setIsAiTyping(false);
  };

  const handleQuickReply = (text: string) => {
    handleSendMessage(text);
  };

  const handleGenerate = async () => {
    setFlowStep('generating');

    for (let i = 0; i <= 100; i += 5) {
      setProgress(i);
      await new Promise(r => setTimeout(r, 250));
    }

    const emotionLabels = selectedEmotions
      .map(e => emotionOptions.find(opt => opt.value === e)?.label)
      .filter((label): label is string => Boolean(label));

    const audio: HealingAudio = {
      id: generateId(),
      title: `专属疗愈：${emotionLabels.join('、') || '心灵平静'}`,
      description: chatMessages.filter(m => m.role === 'user').map(m => m.content).join('；'),
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
    setFlowStep('complete');
  };

  const easeOut = [0.25, 0.1, 0.25, 1];

  // ======================== Reusable Components ========================

  const SectionLabel = ({ label, required = false, hint }: { label: string; required?: boolean; hint?: string }) => (
    <div className="flex items-center gap-2 mb-3">
      <label className="text-[13px] font-semibold text-neutral-700">{label}</label>
      {required ? (
        <span className="text-[10px] font-medium text-white bg-neutral-900 px-1.5 py-0.5 rounded">必填</span>
      ) : (
        <span className="text-[10px] font-medium text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">选填</span>
      )}
      {hint && <span className="text-[11px] text-neutral-400 ml-auto">{hint}</span>}
    </div>
  );

  const CapsuleButton = ({ label, selected, onClick, icon, size = 'md' }: {
    label: string; selected: boolean; onClick: () => void; icon?: string; size?: 'sm' | 'md'
  }) => (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className={`
        ${size === 'sm' ? 'px-3 py-1.5 text-[12px]' : 'px-4 py-2.5 text-[13px]'}
        rounded-full font-medium transition-all duration-300 ease-out flex items-center gap-1.5
        ${selected
          ? 'bg-neutral-900 text-white shadow-md'
          : 'bg-white/70 text-neutral-600 border border-black/[0.06] hover:bg-white hover:border-black/[0.1]'
        }
      `}
    >
      {icon && <span className="text-[14px]">{icon}</span>}
      {label}
    </motion.button>
  );

  // ======================== Pre-fill Page ========================

  const renderPrefill = () => (
    <motion.div
      key="prefill"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: easeOut }}
      className="max-w-2xl mx-auto space-y-7"
    >
      {/* 引导文案 */}
      <div className="text-center mb-2">
        <p className="text-[13px] text-neutral-400">简单选择一下，帮助 AI 更好地与你对话</p>
      </div>

      {/* 情绪选择 */}
      <div>
        <SectionLabel label="此刻的情绪" required hint="可多选" />
        <div className="flex flex-wrap gap-2">
          {emotionOptions.map((emotion) => (
            <CapsuleButton
              key={emotion.value}
              label={emotion.label}
              selected={selectedEmotions.includes(emotion.value)}
              onClick={() => toggleArrayItem(setSelectedEmotions, emotion.value)}
            />
          ))}
        </div>
      </div>

      {/* 情绪强度 */}
      <div>
        <SectionLabel label="情绪强度" required />
        <div className="bg-white/60 rounded-2xl p-4 border border-black/[0.04]">
          <div className="flex items-center justify-between mb-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                onClick={() => setIntensity(n)}
                className={`w-8 h-8 rounded-full text-[11px] font-semibold transition-all duration-200 shrink-0
                  ${intensity === n
                    ? 'bg-neutral-900 text-white scale-110 shadow-md'
                    : intensity >= n
                      ? 'bg-neutral-300 text-neutral-700'
                      : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                  }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-10 gap-0 text-[11px] text-neutral-400 items-center">
            <span className="col-start-1 col-span-2 text-center">😌 轻微</span>
            <span className="col-start-5 col-span-2 text-center">😰 中等</span>
            <span className="col-start-9 col-span-2 text-center">😫 强烈</span>
          </div>
        </div>
      </div>

      {/* 触发原因 */}
      <div>
        <SectionLabel label="可能的原因" hint="可多选" />
        <div className="flex flex-wrap gap-2">
          {scenarioOptions.map((s) => (
            <CapsuleButton
              key={s.value}
              label={s.label}
              selected={selectedScenarios.includes(s.value)}
              onClick={() => toggleArrayItem(setSelectedScenarios, s.value)}
            />
          ))}
        </div>
      </div>

      {/* 疗愈目标 */}
      <div>
        <SectionLabel label="你希望这次疗愈" hint="可多选" />
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {healingGoalOptions.map((goal) => (
            <motion.button
              key={goal.value}
              onClick={() => toggleArrayItem(setSelectedGoals, goal.value)}
              whileTap={{ scale: 0.96 }}
              className={`
                flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl text-center transition-all duration-300 border
                ${selectedGoals.includes(goal.value)
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-md'
                  : 'bg-white/70 text-neutral-600 border-black/[0.06] hover:bg-white'
                }
              `}
            >
              <span className="text-[20px]">{goal.icon}</span>
              <span className="text-[11px] font-medium">{goal.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 可折叠的补充信息 */}
      <div>
        <button
          onClick={() => setShowExtras(!showExtras)}
          className="flex items-center gap-2 text-[12px] text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <span>补充信息（帮助 AI 更懂你）</span>
          {showExtras ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <AnimatePresence>
          {showExtras && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-6">
                {/* 身体感受 */}
                <div>
                  <SectionLabel label="身体感受" hint="有哪些身体反应？" />
                  <div className="flex flex-wrap gap-2">
                    {bodySensationOptions.map((item) => (
                      <CapsuleButton
                        key={item.value}
                        label={item.label}
                        icon={item.icon}
                        size="sm"
                        selected={bodySensations.includes(item.value)}
                        onClick={() => toggleArrayItem(setBodySensations, item.value)}
                      />
                    ))}
                  </div>
                </div>

                {/* 个人背景 */}
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <SectionLabel label="生活阶段" />
                    <div className="flex flex-wrap gap-1.5">
                      {lifeStageOptions.map((opt) => (
                        <CapsuleButton
                          key={opt.value}
                          label={opt.label}
                          icon={opt.icon}
                          size="sm"
                          selected={lifeStage === opt.value}
                          onClick={() => setLifeStage(lifeStage === opt.value ? '' : opt.value)}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <SectionLabel label="近期睡眠" />
                    <div className="flex flex-wrap gap-1.5">
                      {sleepQualityOptions.map((opt) => (
                        <CapsuleButton
                          key={opt.value}
                          label={opt.label}
                          size="sm"
                          selected={sleepQuality === opt.value}
                          onClick={() => setSleepQuality(sleepQuality === opt.value ? '' : opt.value)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <SectionLabel label="MBTI" />
                    <div className="flex flex-wrap gap-1.5">
                      {mbtiGroups.flatMap(g => g.types).map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setMbti(mbti === type.value ? '' : type.value)}
                          className={`
                            px-2 py-1 rounded-lg text-[10px] font-bold transition-all duration-200 border
                            ${mbti === type.value
                              ? 'bg-neutral-900 text-white border-neutral-900'
                              : 'bg-white/70 text-neutral-500 border-black/[0.06] hover:bg-white'
                            }
                          `}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <SectionLabel label="冥想经验" />
                    <div className="flex flex-wrap gap-1.5">
                      {meditationExpOptions.map((opt) => (
                        <CapsuleButton
                          key={opt.value}
                          label={opt.label}
                          size="sm"
                          selected={meditationExp === opt.value}
                          onClick={() => setMeditationExp(meditationExp === opt.value ? '' : opt.value)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 进入对话 */}
      <motion.button
        onClick={handleEnterChat}
        disabled={selectedEmotions.length === 0}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 bg-neutral-900 text-white text-[15px] font-medium rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
      >
        <MessageCircle size={18} />
        开始与 AI 对话
      </motion.button>
    </motion.div>
  );

  // ======================== Chat Page ========================

  const renderChat = () => (
    <motion.div
      key="chat"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-2xl mx-auto flex flex-col"
      style={{ height: 'calc(100vh - 56px - 32px)' }}
    >
      {/* 聊天消息区域 */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto pb-4 space-y-4 scrollbar-hide">
        {chatMessages.map((msg, idx) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx === chatMessages.length - 1 ? 0.1 : 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-1' : 'order-1'}`}>
              {/* Avatar + Bubble */}
              <div className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-[12px]
                  ${msg.role === 'ai' ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-600'}`}
                >
                  {msg.role === 'ai' ? <Sparkles size={14} /> : '我'}
                </div>
                {/* Bubble */}
                <div className={`
                  px-4 py-3 rounded-2xl text-[14px] leading-relaxed whitespace-pre-line
                  ${msg.role === 'ai'
                    ? 'bg-white/80 text-neutral-800 border border-black/[0.04] rounded-tl-md'
                    : 'bg-neutral-900 text-white rounded-tr-md'
                  }
                `}>
                  {msg.content}
                </div>
              </div>

              {/* Quick Replies */}
              {msg.role === 'ai' && msg.quickReplies && idx === chatMessages.length - 1 && !isAiTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-3 ml-11 flex flex-wrap gap-2"
                >
                  {msg.quickReplies.map((reply) => (
                    <button
                      key={reply}
                      onClick={() => handleQuickReply(reply)}
                      className="px-3.5 py-2 bg-white/70 text-neutral-600 text-[12px] font-medium rounded-full border border-black/[0.06] hover:bg-white hover:border-black/[0.1] transition-all duration-200"
                    >
                      {reply}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}

        {/* AI Typing Indicator */}
        {isAiTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
              <Sparkles size={14} />
            </div>
            <div className="px-4 py-3 bg-white/80 border border-black/[0.04] rounded-2xl rounded-tl-md">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Duration Picker (appears after last AI round) */}
        {showDurationPicker && !isAiTyping && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="ml-11 mt-2"
          >
            <div className="p-4 bg-white/80 rounded-2xl border border-black/[0.04] space-y-4">
              <p className="text-[12px] text-neutral-500 font-medium">选择疗愈时长</p>
              <div className="flex gap-2">
                {durationOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedDuration(opt.value)}
                    className={`
                      flex-1 py-2.5 rounded-xl text-[12px] font-medium transition-all duration-200 border
                      ${selectedDuration === opt.value
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-white text-neutral-600 border-black/[0.06] hover:bg-neutral-50'
                      }
                    `}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <motion.button
                onClick={handleGenerate}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 bg-neutral-900 text-white text-[14px] font-medium rounded-xl flex items-center justify-center gap-2"
              >
                <Sparkles size={16} />
                为我生成疗愈音频
              </motion.button>
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* 输入框 */}
      <div className="shrink-0 pt-3 pb-2 border-t border-black/[0.04]">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(chatInput);
                }
              }}
              placeholder={isAiTyping ? 'AI 正在思考...' : '说说你的感受...'}
              disabled={isAiTyping}
              rows={1}
              className="w-full px-4 py-3 bg-white/70 border border-black/[0.06] rounded-2xl text-[14px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-black/[0.1] transition-all duration-200 resize-none disabled:opacity-60"
            />
          </div>
          <motion.button
            onClick={() => handleSendMessage(chatInput)}
            disabled={!chatInput.trim() || isAiTyping}
            whileTap={{ scale: 0.94 }}
            className="w-11 h-11 rounded-xl bg-neutral-900 text-white flex items-center justify-center disabled:opacity-40 transition-all shrink-0"
          >
            <Send size={16} />
          </motion.button>
        </div>
        {!showDurationPicker && (
          <p className="text-center text-[10px] text-neutral-300 mt-2">和 AI 聊聊，它会为你定制最合适的疗愈方案</p>
        )}
      </div>
    </motion.div>
  );

  // ======================== Generating ========================

  const renderGenerating = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-32"
    >
      <motion.div
        className="w-20 h-20 rounded-3xl bg-neutral-900 flex items-center justify-center mb-8"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 size={28} className="text-white" />
      </motion.div>
      <h3 className="text-[20px] font-semibold text-neutral-800 mb-6">正在生成专属音频</h3>
      <div className="w-64">
        <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-neutral-900 rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
        <p className="text-center text-[13px] text-neutral-400 mt-3">{progress}%</p>
      </div>
      <div className="mt-6 space-y-2 text-[12px] text-neutral-400">
        {progress >= 15 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>✓ 分析对话内容与情绪状态</motion.p>}
        {progress >= 40 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>✓ 规划疗愈结构与引导词</motion.p>}
        {progress >= 65 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>✓ 合成音频与背景声效</motion.p>}
        {progress >= 90 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>✓ 最终质量调优中...</motion.p>}
      </div>
    </motion.div>
  );

  // ======================== Complete ========================

  const renderComplete = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: easeOut }}
      className="max-w-md mx-auto text-center py-16"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="w-20 h-20 rounded-3xl bg-neutral-900 flex items-center justify-center mx-auto mb-8"
      >
        <Check size={32} className="text-white" strokeWidth={2.5} />
      </motion.div>

      <h2 className="text-[22px] font-semibold text-neutral-800 mb-2">专属音频已就绪</h2>
      <p className="text-[14px] text-neutral-400 mb-10">基于对话理解为你量身定制</p>

      {generatedAudio && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-black/[0.04] mb-10 text-left"
        >
          <div className="flex gap-4">
            <img
              src={generatedAudio.coverUrl}
              alt={generatedAudio.title}
              className="w-20 h-20 object-cover rounded-xl"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[15px] text-neutral-800 truncate mb-1">{generatedAudio.title}</h3>
              <p className="text-[12px] text-neutral-400 mb-2">{formatDuration(generatedAudio.duration)}</p>
              <div className="flex flex-wrap gap-1">
                {generatedAudio.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-neutral-100 text-neutral-500 text-[10px] rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        <motion.button
          onClick={() => generatedAudio && navigate(`/audio/${generatedAudio.id}`)}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-neutral-900 text-white text-[15px] font-medium rounded-2xl flex items-center justify-center gap-2"
        >
          <Play size={16} fill="currentColor" />
          立即播放
        </motion.button>
        <motion.button
          onClick={() => navigate('/')}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-white/60 text-neutral-600 text-[14px] font-medium rounded-2xl border border-black/[0.04]"
        >
          返回首页
        </motion.button>
      </div>
    </motion.div>
  );

  // ======================== Main Layout ========================

  return (
    <div className="min-h-screen pb-safe">
      {/* 导航 */}
      <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-black/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 h-14 flex items-center">
          {flowStep === 'prefill' ? (
            <Link to="/" className="flex items-center text-neutral-400 hover:text-neutral-600 transition-colors">
              <ArrowLeft size={18} strokeWidth={1.5} />
            </Link>
          ) : flowStep === 'chat' ? (
            <button
              onClick={() => setFlowStep('prefill')}
              className="flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <ArrowLeft size={18} strokeWidth={1.5} />
            </button>
          ) : (
            <div className="w-5" />
          )}
          <h1 className="flex-1 text-center text-[15px] font-medium text-neutral-800">
            {flowStep === 'chat' ? '与 AI 对话' : '此刻疗愈'}
          </h1>
          <div className="w-5" />
        </div>
      </div>

      {/* 内容 */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 md:px-8 ${flowStep === 'chat' ? 'pt-3' : 'pt-6'} ${flowStep !== 'chat' ? 'pb-32' : ''}`}>
        <AnimatePresence mode="wait">
          {flowStep === 'prefill' && renderPrefill()}
          {flowStep === 'chat' && renderChat()}
          {flowStep === 'generating' && renderGenerating()}
          {flowStep === 'complete' && renderComplete()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SingleHealing;