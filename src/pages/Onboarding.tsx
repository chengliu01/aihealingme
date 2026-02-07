import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const TOTAL_STEPS = 4;

const lifeStageOptions = [
  {
    value: 'student',
    emoji: '🎓',
    label: '求学探索期',
    desc: '学业压力、同伴关系、未来迷茫',
  },
  {
    value: 'career_start',
    emoji: '🌱',
    label: '职场适应期',
    desc: '初入职场、生存焦虑、自我怀疑',
  },
  {
    value: 'career_mid',
    emoji: '🦁',
    label: '中坚奋斗期',
    desc: '事业攀升、家庭责任、精力透支',
  },
  {
    value: 'free_life',
    emoji: '🧘',
    label: '自由/慢生活',
    desc: '自我实现、孤独感、寻找意义',
  },
];

const healingPreferenceOptions = [
  {
    value: 'rational',
    emoji: '🧠',
    label: '理智重构',
    desc: '请帮我分析逻辑，拆解问题，提供认知的改变。',
  },
  {
    value: 'warm',
    emoji: '❤️',
    label: '温暖抱持',
    desc: '不需要道理，请给我无条件的共情、安抚与温柔。',
  },
];

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { completeOnboarding, isLoading, user } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [nickname, setNickname] = useState('');
  const [lifeStage, setLifeStage] = useState('');
  const [healingPreference, setHealingPreference] = useState('');
  const [motto, setMotto] = useState('');
  const [direction, setDirection] = useState(1);

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return nickname.trim().length > 0;
      case 1:
        return lifeStage !== '';
      case 2:
        return healingPreference !== '';
      case 3:
        return true; // motto is optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  };

  const handleFinish = async () => {
    try {
      await completeOnboarding({
        nickname: nickname.trim(),
        lifeStage,
        healingPreference,
        motto: motto.trim() || undefined,
      });
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Onboarding error:', err);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-neutral-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-amber-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-slate-200/40 rounded-full blur-3xl" />
        <div className="absolute top-10 right-1/4 w-40 h-40 bg-rose-100/30 rounded-full blur-2xl" />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center relative z-10"
      >
        <div className="text-4xl mb-2">🌿</div>
        <h1 className="text-2xl font-bold text-slate-800">心语疗愈</h1>
      </motion.div>

      {/* Progress bar */}
      <div className="w-full max-w-md mb-8 relative z-10">
        <div className="flex justify-between mb-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 mx-1 rounded-full transition-all duration-500 ${
                i <= currentStep
                  ? 'bg-gradient-to-r from-slate-700 to-slate-500'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-slate-400 text-center">
          {currentStep + 1} / {TOTAL_STEPS}
        </p>
      </div>

      {/* Card container */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 overflow-hidden min-h-[420px] flex flex-col">
          {/* Content area */}
          <div className="flex-1 p-8 relative overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              {/* Step 0: Nickname */}
              {currentStep === 0 && (
                <motion.div
                  key="step0"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">
                      很高兴遇见你 ✨
                    </h2>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      在此刻，我该如何称呼你？
                    </p>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      maxLength={20}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all text-lg"
                      placeholder="输入你的昵称"
                      autoFocus
                    />
                    <p className="text-xs text-slate-400 mt-3 pl-1">
                      你可以使用真名，或者任何让你感到安全的代称。
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 1: Life Stage */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="space-y-5"
                >
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">
                      生命周期 🌱
                    </h2>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      为了更精准地理解你的压力来源，你目前处于哪个人生阶段？
                    </p>
                  </div>

                  <div className="space-y-3">
                    {lifeStageOptions.map((option) => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setLifeStage(option.value)}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                          lifeStage === option.value
                            ? 'border-slate-700 bg-slate-50 shadow-md'
                            : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{option.emoji}</span>
                          <div>
                            <p className="font-medium text-slate-800">
                              {option.label}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {option.desc}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Healing Preference */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="space-y-5"
                >
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">
                      确定疗愈偏好 💫
                    </h2>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      当负面情绪来袭，你更希望我如何陪伴你？
                    </p>
                  </div>

                  <div className="space-y-4">
                    {healingPreferenceOptions.map((option) => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setHealingPreference(option.value)}
                        className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                          healingPreference === option.value
                            ? 'border-slate-700 bg-slate-50 shadow-md'
                            : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl mt-0.5">{option.emoji}</span>
                          <div>
                            <p className="font-semibold text-slate-800">
                              {option.label}
                            </p>
                            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                              {option.desc}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Motto */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">
                      你最喜欢的一句话 📝
                    </h2>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      一句座右铭、一段歌词，或任何让你感到力量的文字。
                    </p>
                  </div>

                  <div>
                    <textarea
                      value={motto}
                      onChange={(e) => setMotto(e.target.value)}
                      maxLength={100}
                      rows={3}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all resize-none"
                      placeholder="可选填写，也可以跳过~"
                    />
                    <p className="text-xs text-slate-400 mt-2 pl-1 flex justify-between">
                      <span>这将作为你的个人签名展示</span>
                      <span>{motto.length}/100</span>
                    </p>
                  </div>

                  {/* Summary preview */}
                  <div className="bg-gradient-to-br from-slate-50 to-stone-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-xs text-slate-400 mb-3 font-medium">
                      你的个人档案预览
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">昵称：</span>
                        <span className="text-slate-700 font-medium">
                          {nickname}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">阶段：</span>
                        <span className="text-slate-700">
                          {lifeStageOptions.find((o) => o.value === lifeStage)
                            ?.emoji}{' '}
                          {lifeStageOptions.find((o) => o.value === lifeStage)
                            ?.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">偏好：</span>
                        <span className="text-slate-700">
                          {healingPreferenceOptions.find(
                            (o) => o.value === healingPreference
                          )?.emoji}{' '}
                          {healingPreferenceOptions.find(
                            (o) => o.value === healingPreference
                          )?.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer actions */}
          <div className="p-6 pt-0 flex items-center justify-between">
            {currentStep > 0 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBack}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors px-4 py-2 rounded-xl hover:bg-slate-100"
              >
                <ChevronLeft size={16} />
                上一步
              </motion.button>
            ) : (
              <div />
            )}

            {currentStep < TOTAL_STEPS - 1 ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-1 px-6 py-3 bg-gradient-to-r from-slate-800 to-slate-700 text-white font-medium rounded-xl hover:from-slate-900 hover:to-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-slate-500/20"
              >
                继续
                <ChevronRight size={16} />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleFinish}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 text-white font-medium rounded-xl hover:from-slate-900 hover:to-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-500/20"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    保存中...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    开始疗愈之旅
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Skip button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={() => {
          // Allow skipping by submitting with defaults
          completeOnboarding({
            nickname: user?.username || 'Friend',
            lifeStage: 'student',
            healingPreference: 'warm',
          }).then(() => navigate('/', { replace: true }));
        }}
        className="mt-6 text-xs text-slate-400 hover:text-slate-600 transition-colors relative z-10"
      >
        暂时跳过，稍后完善
      </motion.button>
    </div>
  );
};

export default Onboarding;
