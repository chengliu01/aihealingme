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
  { label: '冥想', value: '冥想' },
  { label: '睡眠', value: '睡眠' },
  { label: '焦虑', value: '焦虑' },
  { label: '职场', value: '职场' },
  { label: '情感', value: '情感' },
  { label: '学习', value: '学习' },
  { label: '正念', value: '正念' },
];

export const durationOptions = [
  { label: '5分钟', value: 300 },
  { label: '10分钟', value: 600 },
  { label: '15分钟', value: 900 },
  { label: '20分钟', value: 1200 },
  { label: '30分钟', value: 1800 },
];
