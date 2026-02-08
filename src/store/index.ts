import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  User, 
  HealingAudio, 
  HealingPlan, 
  HealingRequest, 
  ChatMessage,
  Comment 
} from '@/types';

interface AppState {
  // 用户状态
  currentUser: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;

  // 音频状态（替代视频状态）
  audios: HealingAudio[];
  myAudios: HealingAudio[];
  favoriteAudios: HealingAudio[];
  currentlyPlaying: HealingAudio | null;
  isPlaying: boolean;
  currentTime: number;
  isShuffle: boolean;
  isRepeat: boolean;
  addAudio: (audio: HealingAudio) => void;
  updateAudio: (id: string, updates: Partial<HealingAudio>) => void;
  deleteAudio: (id: string) => void;
  toggleFavorite: (audioId: string) => void;
  publishAudio: (audioId: string, tags?: string[], description?: string, shareText?: string) => void;
  setCurrentlyPlaying: (audio: HealingAudio | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;

  // 计划状态
  plans: HealingPlan[];
  currentPlan: HealingPlan | null;
  addPlan: (plan: HealingPlan) => void;
  updatePlan: (id: string, updates: Partial<HealingPlan>) => void;
  setCurrentPlan: (plan: HealingPlan | null) => void;
  completeStage: (planId: string, stageId: string) => void;

  // 请求状态
  currentRequest: HealingRequest | null;
  setCurrentRequest: (request: HealingRequest | null) => void;

  // 聊天状态
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;

  // 评论状态
  addComment: (audioId: string, comment: Comment) => void;
  likeComment: (audioId: string, commentId: string) => void;
}

// 模拟当前用户
const mockUser: User = {
  id: '1',
  name: '心灵旅人',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  email: 'user@example.com',
  createdAt: new Date().toISOString(),
};

// 模拟音频数据（替代视频数据）
const mockAudios: HealingAudio[] = [
  {
    id: '1',
    title: '10分钟缓解焦虑冥想',
    description: '专为焦虑情绪设计的冥想练习，帮助你找回内心的平静',
    coverUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
    audioUrl: '',
    duration: 600,
    author: {
      id: '2',
      name: '静心大师',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
      email: 'master@example.com',
      createdAt: new Date().toISOString(),
    },
    tags: ['焦虑', '冥想', '放松'],
    category: '冥想',
    likes: 1234,
    views: 5678,
    comments: [],
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    type: 'single',
    waveform: Array.from({ length: 50 }, () => Math.random() * 0.8 + 0.2),
    backgroundColor: 'from-slate-500/20 to-gray-500/20',
  },
  {
    id: '2',
    title: '深度睡眠引导音频',
    description: '帮助你快速入睡，享受高质量睡眠',
    coverUrl: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=800&q=80',
    audioUrl: '',
    duration: 1800,
    author: {
      id: '3',
      name: '睡眠专家',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
      email: 'sleep@example.com',
      createdAt: new Date().toISOString(),
    },
    tags: ['睡眠', '失眠', '放松'],
    category: '睡眠',
    likes: 3456,
    views: 12345,
    comments: [],
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    type: 'single',
    waveform: Array.from({ length: 50 }, () => Math.random() * 0.8 + 0.2),
    backgroundColor: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    id: '3',
    title: '工作压力大缓解方案',
    description: '专为职场人士设计，缓解工作压力，提升工作效率',
    coverUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80',
    audioUrl: '',
    duration: 900,
    author: {
      id: '4',
      name: '职场心理师',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
      email: 'work@example.com',
      createdAt: new Date().toISOString(),
    },
    tags: ['职场', '压力', '效率'],
    category: '职场',
    likes: 890,
    views: 3456,
    comments: [],
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    type: 'plan',
    waveform: Array.from({ length: 50 }, () => Math.random() * 0.8 + 0.2),
    backgroundColor: 'from-amber-500/20 to-orange-500/20',
  },
  {
    id: '4',
    title: '失恋疗愈之旅',
    description: '陪伴你度过失恋期，重新找回自我',
    coverUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80',
    audioUrl: '',
    duration: 1200,
    author: {
      id: '5',
      name: '情感导师',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
      email: 'love@example.com',
      createdAt: new Date().toISOString(),
    },
    tags: ['情感', '失恋', '疗愈'],
    category: '情感',
    likes: 2345,
    views: 8901,
    comments: [],
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    type: 'single',
    waveform: Array.from({ length: 50 }, () => Math.random() * 0.8 + 0.2),
    backgroundColor: 'from-rose-500/20 to-pink-500/20',
  },
  {
    id: '5',
    title: '正念入门指南',
    description: '初学者友好的正念冥想入门课程',
    coverUrl: 'https://images.unsplash.com/photo-1447452001602-7090c7ab2db3?w=800&q=80',
    audioUrl: '',
    duration: 720,
    author: {
      id: '2',
      name: '静心大师',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
      email: 'master@example.com',
      createdAt: new Date().toISOString(),
    },
    tags: ['正念', '冥想', '入门'],
    category: '冥想',
    likes: 4567,
    views: 23456,
    comments: [],
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    type: 'single',
    waveform: Array.from({ length: 50 }, () => Math.random() * 0.8 + 0.2),
    backgroundColor: 'from-emerald-500/20 to-teal-500/20',
  },
  {
    id: '6',
    title: '考试焦虑舒缓',
    description: '帮助学生缓解考试压力，提升专注力',
    coverUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
    audioUrl: '',
    duration: 480,
    author: {
      id: '6',
      name: '学习助手',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
      email: 'study@example.com',
      createdAt: new Date().toISOString(),
    },
    tags: ['考试', '焦虑', '学生'],
    category: '学习',
    likes: 567,
    views: 2345,
    comments: [],
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    type: 'single',
    waveform: Array.from({ length: 50 }, () => Math.random() * 0.8 + 0.2),
    backgroundColor: 'from-indigo-500/20 to-blue-500/20',
  },
  {
    id: '7',
    title: '自我接纳练习',
    description: '学会接纳不完美的自己，建立内在自信',
    coverUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&q=80',
    audioUrl: '',
    duration: 900,
    author: {
      id: '7',
      name: '自信教练',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6',
      email: 'confidence@example.com',
      createdAt: new Date().toISOString(),
    },
    tags: ['自信', '自我接纳', '成长'],
    category: '成长',
    likes: 1890,
    views: 6789,
    comments: [],
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    type: 'single',
    waveform: Array.from({ length: 50 }, () => Math.random() * 0.8 + 0.2),
    backgroundColor: 'from-yellow-500/20 to-amber-500/20',
  },
  {
    id: '8',
    title: '情绪释放冥想',
    description: '安全地释放压抑的情绪，让心灵重获自由',
    coverUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80',
    audioUrl: '',
    duration: 1080,
    author: {
      id: '8',
      name: '情绪疗愈师',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=7',
      email: 'emotion@example.com',
      createdAt: new Date().toISOString(),
    },
    tags: ['情绪', '释放', '疗愈'],
    category: '情绪',
    likes: 2341,
    views: 8902,
    comments: [],
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    type: 'single',
    waveform: Array.from({ length: 50 }, () => Math.random() * 0.8 + 0.2),
    backgroundColor: 'from-rose-400/20 to-orange-400/20',
  },
];

// 模拟用户自己创作的音频
const mockMyAudios: HealingAudio[] = [
  {
    id: 'my-1',
    title: '我的放松冥想练习',
    description: '自己录制的放松冥想音频',
    coverUrl: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=800&q=80',
    audioUrl: '',
    duration: 600,
    author: mockUser,
    tags: ['冥想', '放松', '自制'],
    category: '冥想',
    likes: 45,
    views: 123,
    comments: [],
    isPublished: false, // 草稿状态
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'single',
    waveform: Array.from({ length: 50 }, () => Math.random() * 0.8 + 0.2),
    backgroundColor: 'from-blue-500/20 to-slate-500/20',
  },
  {
    id: 'my-2',
    title: '晚安助眠音频',
    description: '帮助快速入睡的音频',
    coverUrl: 'https://images.unsplash.com/photo-1511295742362-92c96b1cf484?w=800&q=80',
    audioUrl: '',
    duration: 1200,
    author: mockUser,
    tags: ['睡眠', '助眠', '自制'],
    category: '睡眠',
    likes: 89,
    views: 234,
    comments: [],
    isPublished: true, // 已发布
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'single',
    waveform: Array.from({ length: 50 }, () => Math.random() * 0.8 + 0.2),
    backgroundColor: 'from-indigo-500/20 to-blue-500/20',
  },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 用户状态
      currentUser: mockUser,
      isAuthenticated: true,
      setUser: (user) => set({ currentUser: user }),
      login: (user) => set({ currentUser: user, isAuthenticated: true }),
      logout: () => set({ currentUser: null, isAuthenticated: false }),

      // 音频状态
      audios: mockAudios,
      myAudios: mockMyAudios,
      favoriteAudios: [],
      currentlyPlaying: null,
      isPlaying: false,
      currentTime: 0,
      isShuffle: false,
      isRepeat: false,
      addAudio: (audio) => {
        set((state) => ({
          audios: [audio, ...state.audios],
          myAudios: audio.author.id === get().currentUser?.id 
            ? [audio, ...state.myAudios] 
            : state.myAudios,
        }));
      },
      updateAudio: (id, updates) => {
        set((state) => ({
          audios: state.audios.map((a) => a.id === id ? { ...a, ...updates } : a),
          myAudios: state.myAudios.map((a) => a.id === id ? { ...a, ...updates } : a),
        }));
      },
      deleteAudio: (id) => {
        set((state) => ({
          audios: state.audios.filter((a) => a.id !== id),
          myAudios: state.myAudios.filter((a) => a.id !== id),
        }));
      },
      toggleFavorite: (audioId) => {
        const audio = get().audios.find((a) => a.id === audioId);
        if (!audio) return;
        
        set((state) => {
          const isFav = state.favoriteAudios.some((a) => a.id === audioId);
          return {
            favoriteAudios: isFav
              ? state.favoriteAudios.filter((a) => a.id !== audioId)
              : [...state.favoriteAudios, audio],
          };
        });
      },
      publishAudio: (audioId, tags, description, shareText) => {
        set((state) => ({
          audios: state.audios.map((a) =>
            a.id === audioId ? { 
              ...a, 
              isPublished: true,
              tags: tags || a.tags,
              description: description || a.description,
              shareText: shareText || a.shareText
            } : a
          ),
          myAudios: state.myAudios.map((a) =>
            a.id === audioId ? { 
              ...a, 
              isPublished: true,
              tags: tags || a.tags,
              description: description || a.description,
              shareText: shareText || a.shareText
            } : a
          ),
        }));
      },
      setCurrentlyPlaying: (audio) => set({ currentlyPlaying: audio, currentTime: 0 }),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setCurrentTime: (time) => set({ currentTime: time }),
      toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
      toggleRepeat: () => set((state) => ({ isRepeat: !state.isRepeat })),

      // 计划状态
      plans: [],
      currentPlan: null,
      addPlan: (plan) => set((state) => ({ plans: [...state.plans, plan] })),
      updatePlan: (id, updates) => {
        set((state) => ({
          plans: state.plans.map((p) => p.id === id ? { ...p, ...updates } : p),
          currentPlan: state.currentPlan?.id === id 
            ? { ...state.currentPlan, ...updates } 
            : state.currentPlan,
        }));
      },
      setCurrentPlan: (plan) => set({ currentPlan: plan }),
      completeStage: (planId, stageId) => {
        set((state) => ({
          plans: state.plans.map((p) => {
            if (p.id !== planId) return p;
            const stages = p.stages.map((s) =>
              s.id === stageId ? { ...s, status: 'completed' as const } : s
            );
            const completedCount = stages.filter((s) => s.status === 'completed').length;
            return {
              ...p,
              stages,
              currentStage: completedCount,
              status: completedCount === stages.length ? 'completed' as const : 'active' as const,
            };
          }),
        }));
      },

      // 请求状态
      currentRequest: null,
      setCurrentRequest: (request) => set({ currentRequest: request }),

      // 聊天状态
      chatMessages: [],
      addChatMessage: (message) => {
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        }));
      },
      clearChat: () => set({ chatMessages: [] }),

      // 评论状态
      addComment: (audioId, comment) => {
        set((state) => ({
          audios: state.audios.map((a) =>
            a.id === audioId
              ? { ...a, comments: [...a.comments, comment] }
              : a
          ),
        }));
      },
      likeComment: (audioId, commentId) => {
        set((state) => ({
          audios: state.audios.map((a) =>
            a.id === audioId
              ? {
                  ...a,
                  comments: a.comments.map((c) =>
                    c.id === commentId ? { ...c, likes: c.likes + 1 } : c
                  ),
                }
              : a
          ),
        }));
      },
    }),
    {
      name: 'healing-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        favoriteAudios: state.favoriteAudios,
        myAudios: state.myAudios,
        audios: state.audios,
        plans: state.plans,
      }),
    }
  )
);
