export interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
  createdAt: string;
}

// 疗愈音频（替代原来的 HealingVideo）
export interface HealingAudio {
  id: string;
  title: string;
  description: string;
  coverUrl: string;  // 背景图片 URL（类似网易云专辑封面）
  audioUrl: string;  // 音频 URL
  duration: number;  // 时长（秒）
  author: User;
  tags: string[];
  category: string;
  likes: number;
  views: number;
  comments: Comment[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  type: 'single' | 'plan';
  planStage?: number;
  planId?: string;
  // 音频特有属性
  waveform?: number[];  // 音频波形数据
  backgroundColor?: string;  // 主题背景色
}

// 为了兼容，保留别名
export type HealingVideo = HealingAudio;

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  likes: number;
}

export interface HealingPlan {
  id: string;
  title: string;
  description: string;
  userId: string;
  stages: PlanStage[];
  currentStage: number;
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
  totalDuration: number;
}

export interface PlanStage {
  id: string;
  title: string;
  description: string;
  duration: number;
  audio?: HealingAudio;  // 关联音频
  status: 'pending' | 'generating' | 'ready' | 'completed';
  scheduledDate?: string;
}

export interface HealingRequest {
  id: string;
  userId: string;
  type: 'single' | 'plan';
  content: string;
  emotions: string[];
  intensity: number;
  scenarios: string[];
  preferences: {
    duration: number;
    voice: 'male' | 'female' | 'soft';
    bgm: boolean;
    bgmType?: string;
  };
  aiAnalysis?: AIAnalysis;
  createdAt: string;
}

export interface AIAnalysis {
  emotions: string[];
  suggestedTopics: string[];
  approach: string;
  duration: number;
  techniques: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export type TabType = 'home' | 'community' | 'create' | 'profile';
export type CreateType = 'single' | 'plan';

// 播放状态
export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
}
