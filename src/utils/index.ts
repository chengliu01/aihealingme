import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) {
    return `${minutes}分钟`;
  }
  return `${minutes}分${remainingSeconds}秒`;
}

export function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (years > 0) return `${years}年前`;
  if (months > 0) return `${months}个月前`;
  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  return '刚刚';
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export const emotionOptions = [
  { label: '焦虑', value: 'anxiety', color: 'bg-orange-100 text-orange-700' },
  { label: '压力', value: 'stress', color: 'bg-red-100 text-red-700' },
  { label: '失眠', value: 'insomnia', color: 'bg-indigo-100 text-indigo-700' },
  { label: '悲伤', value: 'sadness', color: 'bg-blue-100 text-blue-700' },
  { label: '愤怒', value: 'anger', color: 'bg-rose-100 text-rose-700' },
  { label: '疲惫', value: 'fatigue', color: 'bg-gray-100 text-gray-700' },
  { label: '迷茫', value: 'confusion', color: 'bg-slate-100 text-slate-600' },
  { label: '孤独', value: 'loneliness', color: 'bg-stone-100 text-stone-700' },
];

export const scenarioOptions = [
  { label: '工作压力', value: 'work' },
  { label: '人际关系', value: 'relationship' },
  { label: '学业考试', value: 'study' },
  { label: '情感问题', value: 'love' },
  { label: '家庭关系', value: 'family' },
  { label: '健康问题', value: 'health' },
  { label: '财务压力', value: 'finance' },
  { label: '生活转变', value: 'change' },
];

export const categoryOptions = [
  { label: '全部', value: 'all' },
  { label: '自我探索', value: '自我探索' },
  { label: '依恋关系', value: '依恋关系' },
  { label: '正念冥想', value: '正念冥想' },
  { label: '人际沟通', value: '人际沟通' },
  { label: '亲密关系', value: '亲密关系' },
  { label: '焦虑恐惧', value: '焦虑恐惧' },
  { label: '抑郁疏导', value: '抑郁疏导' },
  { label: '睡眠放松', value: '睡眠放松' },
  { label: '压力管理', value: '压力管理' },
  { label: '自信价值', value: '自信价值' },
  { label: '人际社交', value: '人际社交' },
  { label: '创伤修复', value: '创伤修复' },
  { label: '愤怒冲突', value: '愤怒冲突' },
  { label: '习惯成瘾', value: '习惯成瘾' },
  { label: '人格模式', value: '人格模式' },
];

export const durationOptions = [
  { label: '5分钟', value: 300 },
  { label: '10分钟', value: 600 },
  { label: '15分钟', value: 900 },
  { label: '20分钟', value: 1200 },
  { label: '30分钟', value: 1800 },
];

// ============ 单次疗愈增强选项 ============

// 身体感受选项
export const bodySensationOptions = [
  { label: '头痛/头晕', value: 'headache', icon: '🤕' },
  { label: '胸闷气短', value: 'chest_tightness', icon: '😤' },
  { label: '肩颈紧张', value: 'neck_tension', icon: '😣' },
  { label: '胃部不适', value: 'stomach', icon: '🤢' },
  { label: '心跳加速', value: 'heart_racing', icon: '💓' },
  { label: '全身疲软', value: 'body_fatigue', icon: '😩' },
  { label: '手脚冰凉', value: 'cold_limbs', icon: '🥶' },
  { label: '肌肉酸痛', value: 'muscle_pain', icon: '💪' },
  { label: '无明显不适', value: 'none', icon: '✨' },
];

// 情绪持续时间
export const emotionDurationOptions = [
  { label: '刚刚发生', value: 'just_now' },
  { label: '持续几天', value: 'few_days' },
  { label: '一周以上', value: 'over_week' },
  { label: '一个月以上', value: 'over_month' },
  { label: '长期存在', value: 'long_term' },
];

// 声音偏好
export const voiceOptions = [
  { label: '温柔女声', value: 'female_soft', desc: '柔和亲切，像朋友的陪伴' },
  { label: '沉稳男声', value: 'male_calm', desc: '沉着稳重，给人安全感' },
  { label: '中性自然', value: 'neutral', desc: '平和中性，专注于内容' },
];

// 背景音效
export const soundscapeOptions = [
  { label: '自然白噪音', value: 'white_noise', icon: '🌫️' },
  { label: '森林鸟鸣', value: 'forest', icon: '🌿' },
  { label: '流水溪声', value: 'stream', icon: '💧' },
  { label: '海浪潮声', value: 'ocean', icon: '🌊' },
  { label: '细雨绵绵', value: 'rain', icon: '🌧️' },
  { label: '轻柔钢琴', value: 'piano', icon: '🎹' },
  { label: '古琴禅意', value: 'guqin', icon: '🎶' },
  { label: '静谧无音', value: 'silence', icon: '🤫' },
];

// 疗愈手法
export const healingTechniqueOptions = [
  { label: '正念冥想', value: 'mindfulness', desc: '聚焦当下，培养觉察' },
  { label: '呼吸引导', value: 'breathing', desc: '调节呼吸，平复心绪' },
  { label: '身体扫描', value: 'body_scan', desc: '逐步放松，释放紧张' },
  { label: '渐进式放松', value: 'progressive', desc: '肌肉收放，深度放松' },
  { label: '可视化想象', value: 'visualization', desc: '构建安全空间，内心疗愈' },
  { label: '自我关怀', value: 'self_compassion', desc: '温暖自我，接纳情绪' },
  { label: '感恩冥想', value: 'gratitude', desc: '聚焦美好，提升幸福感' },
  { label: 'AI 推荐', value: 'ai_recommend', desc: '根据你的状态智能推荐' },
];

// 疗愈目标
export const healingGoalOptions = [
  { label: '快速放松', value: 'quick_relax', icon: '🧘' },
  { label: '深度疗愈', value: 'deep_healing', icon: '💖' },
  { label: '提升专注', value: 'focus', icon: '🎯' },
  { label: '助眠安神', value: 'sleep', icon: '🌙' },
  { label: '情绪疏导', value: 'emotional', icon: '🌈' },
  { label: '自我成长', value: 'growth', icon: '🌱' },
];

// 年龄范围
export const ageRangeOptions = [
  { label: '18岁以下', value: 'under_18' },
  { label: '18-24岁', value: '18_24' },
  { label: '25-30岁', value: '25_30' },
  { label: '31-40岁', value: '31_40' },
  { label: '41-50岁', value: '41_50' },
  { label: '50岁以上', value: 'over_50' },
];

// 性别
export const genderOptions = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
  { label: '其他', value: 'other' },
  { label: '不想说', value: 'prefer_not' },
];

// MBTI 类型
export const mbtiGroups = [
  {
    group: '分析家',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    types: [
      { label: 'INTJ', value: 'INTJ', desc: '建筑师' },
      { label: 'INTP', value: 'INTP', desc: '逻辑学家' },
      { label: 'ENTJ', value: 'ENTJ', desc: '指挥官' },
      { label: 'ENTP', value: 'ENTP', desc: '辩论家' },
    ],
  },
  {
    group: '外交家',
    color: 'bg-green-50 text-green-700 border-green-200',
    types: [
      { label: 'INFJ', value: 'INFJ', desc: '提倡者' },
      { label: 'INFP', value: 'INFP', desc: '调停者' },
      { label: 'ENFJ', value: 'ENFJ', desc: '主人公' },
      { label: 'ENFP', value: 'ENFP', desc: '竞选者' },
    ],
  },
  {
    group: '哨兵',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    types: [
      { label: 'ISTJ', value: 'ISTJ', desc: '物流师' },
      { label: 'ISFJ', value: 'ISFJ', desc: '守卫者' },
      { label: 'ESTJ', value: 'ESTJ', desc: '总经理' },
      { label: 'ESFJ', value: 'ESFJ', desc: '执政官' },
    ],
  },
  {
    group: '探险家',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    types: [
      { label: 'ISTP', value: 'ISTP', desc: '鉴赏家' },
      { label: 'ISFP', value: 'ISFP', desc: '探险家' },
      { label: 'ESTP', value: 'ESTP', desc: '企业家' },
      { label: 'ESFP', value: 'ESFP', desc: '表演者' },
    ],
  },
];

// 生活阶段
export const lifeStageOptions = [
  { label: '在校学生', value: 'student', icon: '📚' },
  { label: '职场新人', value: 'new_worker', icon: '💼' },
  { label: '职场中期', value: 'mid_career', icon: '📊' },
  { label: '自由职业', value: 'freelance', icon: '🏠' },
  { label: '全职家庭', value: 'homemaker', icon: '👨‍👩‍👧' },
  { label: '退休生活', value: 'retired', icon: '🌅' },
];

// 近期睡眠质量
export const sleepQualityOptions = [
  { label: '很好', value: 'good', desc: '入睡快，睡得沉' },
  { label: '一般', value: 'average', desc: '偶尔翻来覆去' },
  { label: '较差', value: 'poor', desc: '经常难以入睡' },
  { label: '失眠严重', value: 'insomnia', desc: '长期睡眠困难' },
];

// 冥想经验
export const meditationExpOptions = [
  { label: '从未尝试', value: 'never' },
  { label: '偶尔尝试', value: 'occasional' },
  { label: '有一定经验', value: 'experienced' },
  { label: '长期练习', value: 'advanced' },
];
