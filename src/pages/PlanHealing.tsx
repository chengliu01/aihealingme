import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Loader2, Play, Check, Send,
  Sparkles, Calendar, Clock, Target, Heart, User
} from 'lucide-react';
import { formatDuration } from '@/utils';
import { useStore } from '@/store';
import {
  emotionOptions, scenarioOptions, generateId,
  bodySensationOptions, healingGoalOptions, emotionDurationOptions,
  mbtiGroups, lifeStageOptions, sleepQualityOptions, meditationExpOptions
} from '@/utils';
import type { HealingAudio, HealingPlan } from '@/types';

// ======================== Types ========================

type FlowStep = 'prefill' | 'chat' | 'plan-review' | 'generating' | 'complete';

interface ChatMsg {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: number;
  quickReplies?: string[];
}

// ======================== AI Simulation ========================

function buildPlanGreeting(
  emotions: string[], intensity: number, scenarios: string[],
  emotionDur: string, goals: string[], bodySensations: string[]
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
  const durLabel = emotionDurationOptions.find(o => o.value === emotionDur)?.label;
  const bodyLabels = bodySensations
    .filter(b => b !== 'none')
    .map(b => bodySensationOptions.find(o => o.value === b)?.label)
    .filter(Boolean);

  let text = '你好，欢迎选择深度疗愈计划。相比单次疗愈，计划式疗愈会通过多个阶段循序渐进地帮助你。';

  if (emoLabels.length > 0) {
    text += `\n\n我了解到你现在正在经历「${emoLabels.join('、')}」`;
    if (intensity >= 7) text += '，程度比较强烈';
    if (durLabel) text += `，已经${durLabel}了`;
    text += '。';
  }
  if (scenLabels.length > 0) {
    text += `这主要和「${scenLabels.join('、')}」有关。`;
  }
  if (bodyLabels.length > 0) {
    text += `身体上有「${bodyLabels.join('、')}」的反应。`;
  }
  if (goalLabels.length > 0) {
    text += `\n\n你希望通过疗愈「${goalLabels.join('、')}」。`;
  }

  text += '\n\n为了给你设计最合适的阶段性疗愈方案，我需要更深入地了解你。能跟我聊聊，你觉得这种情绪状态对你的日常生活造成了怎样的影响？';

  return [{
    id: generateId(),
    role: 'ai' as const,
    content: text,
    timestamp: Date.now(),
    quickReplies: [
      '影响了工作效率和注意力',
      '人际关系变得紧张了',
      '睡眠和身体状况都变差了',
      '整体生活质量下降了',
    ],
  }];
}

const PLAN_FOLLOW_UPS: Array<{ content: string; quickReplies?: string[] }> = [
  {
    content: '我能理解这给你带来的困扰。\n\n你之前有没有尝试过什么方法来应对？比如运动、倾诉、冥想、或者其他方式？效果怎么样？',
    quickReplies: [
      '试过运动，有些帮助但坚持不了',
      '会找朋友倾诉，但不想老是打扰别人',
      '试过冥想 App，但不太适合我',
      '基本没怎么尝试过',
    ],
  },
  {
    content: '了解了。每个人适合的方式不同，这也是个性化计划的价值所在。\n\n你希望这个疗愈计划是怎样的节奏？是密集一些快速改善，还是慢慢来比较舒适？',
    quickReplies: [
      '密集一些，我希望尽快好起来',
      '适中的节奏，每隔一两天',
      '慢慢来就好，不想有压力',
    ],
  },
  {
    content: '好的，你的情况和偏好我都记下来了。\n\n我觉得最适合你的是一个 **渐进式疗愈方案**，从情绪觉察开始，逐步深入到放松技巧和积极重建。每个阶段都有专门的引导音频。\n\n你觉得大约一周的计划合适吗？还是需要更长的时间？',
    quickReplies: [
      '一周挺好的',
      '两周比较合适',
      '我想要更长的计划',
    ],
  },
  {
    content: '好的，基于我们的交流，我已经对你的情况有了很好的理解。现在让我为你生成一个个性化的阶段性疗愈方案。\n\n点击下方按钮查看为你定制的计划预览 ✨',
  },
];

// 根据对话内容模拟生成计划阶段
function generatePlanStages() {
  const stages = [
    {
      title: '情绪觉察与接纳',
      desc: '识别并接纳当下的情绪，不评判、不抗拒，建立对内心的觉察力',
      duration: 600,
      day: 1,
      techniques: ['正念引导', '情绪命名'],
    },
    {
      title: '深度呼吸与放松',
      desc: '通过渐进式呼吸练习，释放身体中积压的紧张与压力',
      duration: 900,
      day: 2,
      techniques: ['4-7-8 呼吸法', '身体扫描'],
    },
    {
      title: '负面思维重构',
      desc: '觉察自动化的负面思维模式，学习以更平衡的视角看待事物',
      duration: 720,
      day: 4,
      techniques: ['认知重评', '自我对话'],
    },
    {
      title: '自我关怀冥想',
      desc: '培养对自我的温暖与善意，学会像对待好朋友一样对待自己',
      duration: 600,
      day: 5,
      techniques: ['慈悲冥想', '内在安抚'],
    },
    {
      title: '积极力量唤醒',
      desc: '聚焦个人优势与美好体验，重建对生活的信心与期待',
      duration: 900,
      day: 7,
      techniques: ['感恩练习', '可视化想象'],
    },
  ];
  return stages;
}

// ======================== Component ========================

const PlanHealing = () => {
  const navigate = useNavigate();
  const { currentUser, addPlan, addAudio } = useStore();

  // Flow
  const [flowStep, setFlowStep] = useState<FlowStep>('prefill');
  const [progress, setProgress] = useState(0);
  const [generatedPlan, setGeneratedPlan] = useState<HealingPlan | null>(null);

  // Pre-fill steps
  const [prefillStep, setPrefillStep] = useState(1);
  const TOTAL_PREFILL_STEPS = 3;
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [intensity, setIntensity] = useState(5);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [emotionDur, setEmotionDur] = useState('');
  const [bodySensations, setBodySensations] = useState<string[]>([]);
  // Personal profile
  const [mbti, setMbti] = useState('');
  const [lifeStage, setLifeStage] = useState('');
  const [sleepQuality, setSleepQuality] = useState('');
  const [meditationExp, setMeditationExp] = useState('');

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [aiRound, setAiRound] = useState(0);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [showPlanButton, setShowPlanButton] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Plan review
  const [planStages] = useState(generatePlanStages);

  // Helpers
  const toggleArrayItem = useCallback(
    (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
      setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
    }, []
  );

  // Smart scroll - only when user is near bottom
  const isNearBottom = useCallback(() => {
    if (!chatContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    return scrollHeight - scrollTop - clientHeight < 100; // within 100px of bottom
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  const prevAiTyping = useRef(false);
  useEffect(() => {
    if (chatMessages.length === 1 && chatMessages[0].role === 'ai') {
      scrollToBottom();
    }
    if (prevAiTyping.current && !isAiTyping && isNearBottom()) {
      scrollToBottom();
    }
    prevAiTyping.current = isAiTyping;
  }, [isAiTyping, chatMessages, scrollToBottom, isNearBottom]);

  useEffect(() => {
    if (showPlanButton && isNearBottom()) {
      scrollToBottom();
    }
  }, [showPlanButton, scrollToBottom, isNearBottom]);

  const easeOut = [0.25, 0.1, 0.25, 1];

  // ======================== Handlers ========================

  const handleEnterChat = () => {
    if (selectedEmotions.length === 0) return;
    const greeting = buildPlanGreeting(
      selectedEmotions, intensity, selectedScenarios,
      emotionDur, selectedGoals, bodySensations
    );
    setChatMessages(greeting);
    setFlowStep('chat');
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMsg = {
      id: generateId(), role: 'user', content: text.trim(), timestamp: Date.now(),
    };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAiTyping(true);

    await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));

    const nextRound = aiRound;
    if (nextRound < PLAN_FOLLOW_UPS.length) {
      const followUp = PLAN_FOLLOW_UPS[nextRound];
      const aiMsg: ChatMsg = {
        id: generateId(), role: 'ai', content: followUp.content,
        timestamp: Date.now(), quickReplies: followUp.quickReplies,
      };
      setChatMessages(prev => [...prev, aiMsg]);
      setAiRound(nextRound + 1);
      if (nextRound === PLAN_FOLLOW_UPS.length - 1) {
        setShowPlanButton(true);
      }
    }
    setIsAiTyping(false);
  };

  const handleViewPlan = () => {
    setFlowStep('plan-review');
  };

  const handleStartPlan = async () => {
    setFlowStep('generating');
    for (let i = 0; i <= 100; i += 4) {
      setProgress(i);
      await new Promise(r => setTimeout(r, 200));
    }

    const plan: HealingPlan = {
      id: generateId(),
      title: '个性化渐进疗愈方案',
      description: chatMessages.filter(m => m.role === 'user').map(m => m.content).join('；'),
      userId: currentUser?.id || '',
      stages: planStages.map((s, i) => ({
        id: generateId(),
        title: s.title,
        description: s.desc,
        duration: s.duration,
        status: i === 0 ? 'ready' as const : 'pending' as const,
        scheduledDate: new Date(Date.now() + s.day * 24 * 60 * 60 * 1000).toISOString(),
      })),
      currentStage: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalDuration: planStages.reduce((sum, s) => sum + s.duration, 0),
    };

    // 为每个阶段生成音频
    const stageCoverUrls = [
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
      'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&q=80',
      'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=800&q=80',
      'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80',
      'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&q=80',
    ];
    const stageBgColors = [
      'from-violet-500/20 to-purple-500/20',
      'from-sky-500/20 to-cyan-500/20',
      'from-amber-500/20 to-orange-500/20',
      'from-emerald-500/20 to-teal-500/20',
      'from-rose-500/20 to-pink-500/20',
    ];

    const stageAudios: HealingAudio[] = planStages.map((s, i) => ({
      id: generateId(),
      title: s.title,
      description: s.desc,
      coverUrl: stageCoverUrls[i % stageCoverUrls.length],
      audioUrl: '',
      duration: s.duration,
      author: currentUser!,
      tags: ['疗愈计划', ...s.techniques],
      category: '冥想',
      likes: 0, views: 0, comments: [],
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: 'plan',
      planStage: i,
      planId: plan.id,
      waveform: Array.from({ length: 50 }, () => Math.random() * 0.8 + 0.2),
      backgroundColor: stageBgColors[i % stageBgColors.length],
    }));

    stageAudios.forEach(audio => addAudio(audio));
    addPlan(plan);
    setGeneratedPlan(plan);
    setFlowStep('complete');
  };

  // ======================== Reusable ========================

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

  // ======================== Pre-fill Steps ========================

  const stepMeta = [
    { icon: Heart, title: '情绪状态', desc: '告诉我你的感受' },
    { icon: Target, title: '原因与目标', desc: '聊聊触发原因和期望' },
    { icon: User, title: '个人画像', desc: '帮助 AI 更好地了解你' },
  ];

  const canGoNextStep = () => {
    if (prefillStep === 1) return selectedEmotions.length > 0;
    if (prefillStep === 2) return selectedScenarios.length > 0;
    return true; // step 3 all optional
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {stepMeta.map((s, i) => {
        const step = i + 1;
        const Icon = s.icon;
        const isActive = prefillStep === step;
        const isDone = prefillStep > step;
        return (
          <div key={step} className="flex items-center gap-2">
            <motion.button
              onClick={() => { if (isDone) setPrefillStep(step); }}
              whileTap={isDone ? { scale: 0.95 } : undefined}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 text-[12px] font-medium
                ${isActive
                  ? 'bg-neutral-900 text-white shadow-md'
                  : isDone
                    ? 'bg-neutral-200 text-neutral-600 cursor-pointer hover:bg-neutral-300'
                    : 'bg-neutral-100 text-neutral-400'
                }`}
            >
              {isDone ? <Check size={13} /> : <Icon size={13} />}
              <span className="hidden sm:inline">{s.title}</span>
              <span className="sm:hidden">{step}</span>
            </motion.button>
            {i < stepMeta.length - 1 && (
              <div className={`w-6 h-[2px] rounded-full transition-colors duration-300
                ${prefillStep > step ? 'bg-neutral-400' : 'bg-neutral-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  const renderPrefill = () => (
    <motion.div
      key="prefill"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: easeOut }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-2">
        <h2 className="text-[18px] font-semibold text-neutral-800 mb-1">深度疗愈计划</h2>
        <p className="text-[13px] text-neutral-400">分步了解你的情况，再与 AI 深入对话</p>
      </div>

      <StepIndicator />

      <AnimatePresence mode="wait">
        {/* ======= Step 1: 情绪状态 ======= */}
        {prefillStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: easeOut }}
            className="space-y-7"
          >
            <div>
              <SectionLabel label="困扰你的情绪" required hint="可多选" />
              <div className="flex flex-wrap gap-2">
                {emotionOptions.map((e) => (
                  <CapsuleButton
                    key={e.value} label={e.label}
                    selected={selectedEmotions.includes(e.value)}
                    onClick={() => toggleArrayItem(setSelectedEmotions, e.value)}
                  />
                ))}
              </div>
            </div>

            <div>
              <SectionLabel label="困扰程度" required />
              <div className="bg-white/60 rounded-2xl p-4 border border-black/[0.04]">
                <div className="flex items-center justify-between mb-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <button
                      key={n} onClick={() => setIntensity(n)}
                      className={`w-8 h-8 rounded-full text-[11px] font-semibold transition-all duration-200
                        ${intensity === n
                          ? 'bg-neutral-900 text-white scale-110 shadow-md'
                          : intensity >= n ? 'bg-neutral-300 text-neutral-700' : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                        }`}
                    >{n}</button>
                  ))}
                </div>
                <div className="grid grid-cols-10 gap-0 text-[11px] text-neutral-400 items-center">
                  <span className="col-start-1 col-span-2 text-center">😌 轻微</span>
                  <span className="col-start-5 col-span-2 text-center">😰 中等</span>
                  <span className="col-start-9 col-span-2 text-center">😫 强烈</span>
                </div>
              </div>
            </div>

            <div>
              <SectionLabel label="持续时间" hint="这种状态持续了多久" />
              <div className="flex flex-wrap gap-2">
                {emotionDurationOptions.map((opt) => (
                  <CapsuleButton
                    key={opt.value} label={opt.label}
                    selected={emotionDur === opt.value}
                    onClick={() => setEmotionDur(emotionDur === opt.value ? '' : opt.value)}
                  />
                ))}
              </div>
            </div>

            <div>
              <SectionLabel label="身体感受" hint="可多选" />
              <div className="flex flex-wrap gap-2">
                {bodySensationOptions.map((item) => (
                  <CapsuleButton key={item.value} label={item.label} icon={item.icon} size="sm"
                    selected={bodySensations.includes(item.value)}
                    onClick={() => toggleArrayItem(setBodySensations, item.value)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ======= Step 2: 原因与目标 ======= */}
        {prefillStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: easeOut }}
            className="space-y-7"
          >
            <div>
              <SectionLabel label="主要原因" required hint="可多选" />
              <div className="flex flex-wrap gap-2">
                {scenarioOptions.map((s) => (
                  <CapsuleButton
                    key={s.value} label={s.label}
                    selected={selectedScenarios.includes(s.value)}
                    onClick={() => toggleArrayItem(setSelectedScenarios, s.value)}
                  />
                ))}
              </div>
            </div>

            <div>
              <SectionLabel label="疗愈目标" hint="你最希望改善什么" />
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {healingGoalOptions.map((goal) => (
                  <motion.button
                    key={goal.value}
                    onClick={() => toggleArrayItem(setSelectedGoals, goal.value)}
                    whileTap={{ scale: 0.96 }}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl text-center transition-all duration-300 border
                      ${selectedGoals.includes(goal.value)
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-md'
                        : 'bg-white/70 text-neutral-600 border-black/[0.06] hover:bg-white'
                      }`}
                  >
                    <span className="text-[20px]">{goal.icon}</span>
                    <span className="text-[11px] font-medium">{goal.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ======= Step 3: 个人画像 ======= */}
        {prefillStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: easeOut }}
            className="space-y-7"
          >
            <div className="p-4 bg-white/50 rounded-2xl border border-black/[0.04]">
              <p className="text-[12px] text-neutral-400 leading-relaxed">💡 以下信息均为选填，但填写越多，AI 制定的疗愈计划越贴合你的实际情况。</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <SectionLabel label="生活阶段" />
                <div className="flex flex-wrap gap-1.5">
                  {lifeStageOptions.map((opt) => (
                    <CapsuleButton key={opt.value} label={opt.label} icon={opt.icon} size="sm"
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
                    <CapsuleButton key={opt.value} label={opt.label} size="sm"
                      selected={sleepQuality === opt.value}
                      onClick={() => setSleepQuality(sleepQuality === opt.value ? '' : opt.value)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <SectionLabel label="MBTI" />
                <div className="flex flex-wrap gap-1.5">
                  {mbtiGroups.flatMap(g => g.types).map((type) => (
                    <button key={type.value}
                      onClick={() => setMbti(mbti === type.value ? '' : type.value)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all duration-200 border
                        ${mbti === type.value
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'bg-white/70 text-neutral-500 border-black/[0.06] hover:bg-white'
                        }`}
                    >{type.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <SectionLabel label="冥想经验" />
                <div className="flex flex-wrap gap-1.5">
                  {meditationExpOptions.map((opt) => (
                    <CapsuleButton key={opt.value} label={opt.label} size="sm"
                      selected={meditationExp === opt.value}
                      onClick={() => setMeditationExp(meditationExp === opt.value ? '' : opt.value)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom nav buttons */}
      <div className="flex gap-3 mt-8">
        {prefillStep > 1 && (
          <motion.button
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            onClick={() => setPrefillStep(prefillStep - 1)}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3.5 bg-white/60 text-neutral-600 text-[14px] font-medium rounded-2xl border border-black/[0.04] flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            上一步
          </motion.button>
        )}
        {prefillStep < TOTAL_PREFILL_STEPS ? (
          <motion.button
            onClick={() => setPrefillStep(prefillStep + 1)}
            disabled={!canGoNextStep()}
            whileTap={{ scale: 0.98 }}
            className={`${prefillStep === 1 ? 'w-full' : 'flex-[2]'} py-3.5 bg-neutral-900 text-white text-[14px] font-medium rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2`}
          >
            下一步
            <ArrowRight size={16} />
          </motion.button>
        ) : (
          <motion.button
            onClick={handleEnterChat}
            disabled={selectedEmotions.length === 0 || selectedScenarios.length === 0}
            whileTap={{ scale: 0.98 }}
            className="flex-[2] py-3.5 bg-neutral-900 text-white text-[14px] font-medium rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            与 AI 深入对话
          </motion.button>
        )}
      </div>
    </motion.div>
  );

  // ======================== Chat ========================

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
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto pb-4 space-y-4 scrollbar-hide">
        {chatMessages.map((msg, idx) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx === chatMessages.length - 1 ? 0.1 : 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="max-w-[85%]">
              <div className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-[12px]
                  ${msg.role === 'ai' ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-600'}`}>
                  {msg.role === 'ai' ? <Sparkles size={14} /> : '我'}
                </div>
                <div className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed whitespace-pre-line
                  ${msg.role === 'ai'
                    ? 'bg-white/80 text-neutral-800 border border-black/[0.04] rounded-tl-md'
                    : 'bg-neutral-900 text-white rounded-tr-md'
                  }`}>
                  {msg.content}
                </div>
              </div>
              {msg.role === 'ai' && msg.quickReplies && idx === chatMessages.length - 1 && !isAiTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-3 ml-11 flex flex-wrap gap-2"
                >
                  {msg.quickReplies.map((reply) => (
                    <button key={reply}
                      onClick={() => handleSendMessage(reply)}
                      className="px-3.5 py-2 bg-white/70 text-neutral-600 text-[12px] font-medium rounded-full border border-black/[0.06] hover:bg-white hover:border-black/[0.1] transition-all duration-200"
                    >{reply}</button>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}

        {isAiTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3">
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

        {showPlanButton && !isAiTyping && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="ml-11 mt-2"
          >
            <motion.button
              onClick={handleViewPlan}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 bg-neutral-900 text-white text-[14px] font-medium rounded-xl flex items-center justify-center gap-2"
            >
              <Target size={16} />
              查看我的疗愈方案
            </motion.button>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="shrink-0 pt-3 pb-2 border-t border-black/[0.04]">
        <div className="flex items-end gap-3">
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(chatInput);
              }
            }}
            placeholder={isAiTyping ? 'AI 正在思考...' : '继续和 AI 聊聊...'}
            disabled={isAiTyping}
            rows={1}
            className="flex-1 px-4 py-3 bg-white/70 border border-black/[0.06] rounded-2xl text-[14px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-black/[0.1] transition-all duration-200 resize-none disabled:opacity-60"
          />
          <motion.button
            onClick={() => handleSendMessage(chatInput)}
            disabled={!chatInput.trim() || isAiTyping}
            whileTap={{ scale: 0.94 }}
            className="w-11 h-11 rounded-xl bg-neutral-900 text-white flex items-center justify-center disabled:opacity-40 transition-all shrink-0"
          >
            <Send size={16} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  // ======================== Plan Review ========================

  const renderPlanReview = () => (
    <motion.div
      key="plan-review"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: easeOut }}
      className="max-w-2xl mx-auto"
    >
      {/* 方案头部 */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-14 h-14 rounded-2xl bg-neutral-900 flex items-center justify-center mx-auto mb-4"
        >
          <Target size={22} className="text-white" />
        </motion.div>
        <h2 className="text-[20px] font-semibold text-neutral-800 mb-1">个性化渐进疗愈方案</h2>
        <p className="text-[13px] text-neutral-400">为你量身定制的 {planStages.length} 阶段疗愈计划</p>
      </div>

      {/* 计划概览 */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="p-3 bg-white/60 rounded-2xl border border-black/[0.04] text-center">
          <Calendar size={16} className="text-neutral-400 mx-auto mb-1" />
          <p className="text-[16px] font-semibold text-neutral-800">{planStages[planStages.length - 1].day}天</p>
          <p className="text-[11px] text-neutral-400">计划周期</p>
        </div>
        <div className="p-3 bg-white/60 rounded-2xl border border-black/[0.04] text-center">
          <Target size={16} className="text-neutral-400 mx-auto mb-1" />
          <p className="text-[16px] font-semibold text-neutral-800">{planStages.length}个</p>
          <p className="text-[11px] text-neutral-400">疗愈阶段</p>
        </div>
        <div className="p-3 bg-white/60 rounded-2xl border border-black/[0.04] text-center">
          <Clock size={16} className="text-neutral-400 mx-auto mb-1" />
          <p className="text-[16px] font-semibold text-neutral-800">
            {formatDuration(planStages.reduce((s, st) => s + st.duration, 0))}
          </p>
          <p className="text-[11px] text-neutral-400">总时长</p>
        </div>
      </div>

      {/* 各阶段 */}
      <div className="space-y-3 mb-8">
        {planStages.map((stage, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.08, ease: easeOut }}
            className="p-4 rounded-2xl bg-white/60 border border-black/[0.04]"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center text-[14px] font-bold shrink-0">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-[14px] text-neutral-800">{stage.title}</h3>
                  <span className="text-[12px] text-neutral-400">第 {stage.day} 天</span>
                </div>
                <p className="text-[12px] text-neutral-500 mb-2 leading-relaxed">{stage.desc}</p>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                    <Clock size={12} /> {formatDuration(stage.duration)}
                  </span>
                  <div className="flex gap-1">
                    {stage.techniques.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-neutral-100 text-neutral-500 text-[10px] rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 操作 */}
      <div className="flex gap-3">
        <motion.button
          onClick={() => setFlowStep('chat')}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3.5 bg-white/60 text-neutral-600 text-[14px] font-medium rounded-2xl border border-black/[0.04] flex items-center justify-center gap-2"
        >
          <ArrowLeft size={16} />
          继续对话
        </motion.button>
        <motion.button
          onClick={handleStartPlan}
          whileTap={{ scale: 0.98 }}
          className="flex-[2] py-3.5 bg-neutral-900 text-white text-[14px] font-medium rounded-2xl flex items-center justify-center gap-2"
        >
          <Play size={16} />
          确认并开始计划
        </motion.button>
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
      <h3 className="text-[20px] font-semibold text-neutral-800 mb-6">正在创建疗愈计划</h3>
      <div className="w-64">
        <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
          <motion.div className="h-full bg-neutral-900 rounded-full" style={{ width: `${progress}%` }} transition={{ duration: 0.2 }} />
        </div>
        <p className="text-center text-[13px] text-neutral-400 mt-3">{progress}%</p>
      </div>
      <div className="mt-6 space-y-2 text-[12px] text-neutral-400">
        {progress >= 10 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>✓ 分析对话内容与情绪画像</motion.p>}
        {progress >= 30 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>✓ 规划各阶段疗愈策略</motion.p>}
        {progress >= 55 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>✓ 生成第一阶段引导音频</motion.p>}
        {progress >= 80 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>✓ 设置日程与提醒</motion.p>}
        {progress >= 95 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>✓ 最终校验中...</motion.p>}
      </div>
    </motion.div>
  );

  // ======================== Complete ========================

  const renderComplete = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: easeOut }}
      className="max-w-md mx-auto text-center py-12"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="w-20 h-20 rounded-3xl bg-neutral-900 flex items-center justify-center mx-auto mb-8"
      >
        <Check size={32} className="text-white" strokeWidth={2.5} />
      </motion.div>

      <h2 className="text-[22px] font-semibold text-neutral-800 mb-2">疗愈计划已创建</h2>
      <p className="text-[14px] text-neutral-400 mb-8">第一阶段音频已就绪，准备开始吧</p>

      {generatedPlan && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-black/[0.04] mb-8 text-left"
        >
          <h3 className="font-semibold text-[15px] text-neutral-800 mb-3">{generatedPlan.title}</h3>
          <div className="space-y-2">
            {generatedPlan.stages.map((stage, i) => (
              <div key={stage.id} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0
                  ${i === 0 ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-400'}`}>
                  {i === 0 ? <Check size={12} /> : i + 1}
                </div>
                <span className={`text-[13px] flex-1 ${i === 0 ? 'text-neutral-800 font-medium' : 'text-neutral-400'}`}>
                  {stage.title}
                </span>
                <span className="text-[11px] text-neutral-400">{formatDuration(stage.duration)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        <motion.button
          onClick={() => generatedPlan && navigate(`/plan/${generatedPlan.id}`)}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-neutral-900 text-white text-[15px] font-medium rounded-2xl flex items-center justify-center gap-2"
        >
          <Play size={16} fill="currentColor" />
          开始第一阶段
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

  // ======================== Layout ========================

  return (
    <div className="min-h-screen pb-safe">
      <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-black/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 h-14 flex items-center">
          {flowStep === 'prefill' ? (
            prefillStep > 1 ? (
              <button onClick={() => setPrefillStep(prefillStep - 1)} className="flex items-center text-neutral-400 hover:text-neutral-600 transition-colors">
                <ArrowLeft size={18} strokeWidth={1.5} />
              </button>
            ) : (
              <Link to="/" className="flex items-center text-neutral-400 hover:text-neutral-600 transition-colors">
                <ArrowLeft size={18} strokeWidth={1.5} />
              </Link>
            )
          ) : flowStep === 'chat' ? (
            <button onClick={() => { setFlowStep('prefill'); setPrefillStep(TOTAL_PREFILL_STEPS); }} className="flex items-center text-neutral-400 hover:text-neutral-600 transition-colors">
              <ArrowLeft size={18} strokeWidth={1.5} />
            </button>
          ) : flowStep === 'plan-review' ? (
            <button onClick={() => setFlowStep('chat')} className="flex items-center text-neutral-400 hover:text-neutral-600 transition-colors">
              <ArrowLeft size={18} strokeWidth={1.5} />
            </button>
          ) : (
            <div className="w-5" />
          )}
          <h1 className="flex-1 text-center text-[15px] font-medium text-neutral-800">
            {flowStep === 'prefill'
              ? `深度疗愈 (${prefillStep}/${TOTAL_PREFILL_STEPS})`
              : flowStep === 'chat' ? '与 AI 对话'
              : flowStep === 'plan-review' ? '方案预览'
              : '深度疗愈'
            }
          </h1>
          <div className="w-5" />
        </div>
      </div>

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 md:px-8 ${flowStep === 'chat' ? 'pt-3' : 'pt-6'} ${flowStep !== 'chat' ? 'pb-32' : ''}`}>
        <AnimatePresence mode="wait">
          {flowStep === 'prefill' && renderPrefill()}
          {flowStep === 'chat' && renderChat()}
          {flowStep === 'plan-review' && renderPlanReview()}
          {flowStep === 'generating' && renderGenerating()}
          {flowStep === 'complete' && renderComplete()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PlanHealing;