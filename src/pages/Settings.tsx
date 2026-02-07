import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Lock,
  LogOut,
  ChevronRight,
  Save,
  X,
  Check,
  Shield,
  Sparkles,
  Info,
  Upload,
  Camera,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { userAPI, authAPI } from '@/services/api';

// 生命周期映射
const lifeStageOptions = [
  { value: 'student', emoji: '🎓', label: '求学探索期' },
  { value: 'career_start', emoji: '🌱', label: '职场适应期' },
  { value: 'career_mid', emoji: '🦁', label: '中坚奋斗期' },
  { value: 'free_life', emoji: '🧘', label: '自由/慢生活' },
];

const healingPrefOptions = [
  { value: 'rational', emoji: '🧠', label: '理智重构' },
  { value: 'warm', emoji: '❤️', label: '温暖抱持' },
];

type SettingsSection = 'main' | 'profile' | 'password' | 'about';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, getCurrentUser } = useAuthStore();
  const [section, setSection] = useState<SettingsSection>('main');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Avatar upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile edit state
  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    nickname: user?.nickname || '',
    bio: user?.bio || '',
    motto: user?.motto || '',
    lifeStage: user?.lifeStage || '',
    healingPreference: user?.healingPreference || '',
  });

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 4000);
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await userAPI.updateProfile({
        username: profileForm.username,
        nickname: profileForm.nickname,
        bio: profileForm.bio,
        motto: profileForm.motto,
        lifeStage: profileForm.lifeStage,
        healingPreference: profileForm.healingPreference,
      } as any);
      await getCurrentUser();
      showSuccess('资料更新成功');
      setSection('main');
    } catch (err: any) {
      showError(err.message || '更新失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError('两次密码输入不一致');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showError('新密码至少 6 个字符');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    try {
      await authAPI.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      showSuccess('密码修改成功');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSection('main');
    } catch (err: any) {
      showError(err.message || '密码修改失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      showError('请选择图片文件');
      return;
    }

    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      showError('图片大小不能超过 5MB');
      return;
    }

    setSelectedFile(file);
    
    // 生成预览 URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async () => {
    if (!selectedFile) {
      showError('请先选择图片');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');
    try {
      await userAPI.uploadAvatar(selectedFile);
      await getCurrentUser();
      showSuccess('头像更新成功');
      setSelectedFile(null);
      setPreviewUrl('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      showError(err.message || '头像上传失败');
    } finally {
      setIsUploading(false);
    }
  };

  const cancelAvatarUpload = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const easeOut = [0.25, 0.1, 0.25, 1];

  const menuItems = [
    {
      icon: User,
      label: '编辑资料',
      desc: '修改昵称、签名、偏好',
      action: () => setSection('profile'),
    },
    {
      icon: Lock,
      label: '修改密码',
      desc: '更新你的账户密码',
      action: () => setSection('password'),
    },
    {
      icon: Info,
      label: '关于',
      desc: '查看个人信息摘要',
      action: () => setSection('about'),
    },
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#f5f5f0]/80 backdrop-blur-xl border-b border-black/[0.04]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              if (section !== 'main') {
                setSection('main');
                setErrorMsg('');
              } else {
                navigate(-1);
              }
            }}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-neutral-200/50 transition-colors"
          >
            <ArrowLeft size={20} className="text-neutral-700" />
          </motion.button>
          <h1 className="text-[16px] font-semibold text-neutral-800">
            {section === 'main' && '设置'}
            {section === 'profile' && '编辑资料'}
            {section === 'password' && '修改密码'}
            {section === 'about' && '关于'}
          </h1>
        </div>
      </div>

      {/* Toast messages */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-emerald-600 text-white text-[13px] font-medium rounded-2xl shadow-lg flex items-center gap-2"
          >
            <Check size={16} />
            {successMsg}
          </motion.div>
        )}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-rose-600 text-white text-[13px] font-medium rounded-2xl shadow-lg flex items-center gap-2"
          >
            <X size={16} />
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto px-4 pt-6">
        <AnimatePresence mode="wait">
          {/* ===== Main Settings ===== */}
          {section === 'main' && (
            <motion.div
              key="main"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: easeOut }}
              className="space-y-3"
            >
              {/* User card at top */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 border border-black/[0.04]">
                <img
                  src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'default'}`}
                  alt={user?.nickname || user?.username}
                  className="w-14 h-14 rounded-2xl object-cover ring-1 ring-black/5"
                />
                <div className="flex-1 min-w-0">
                  <h2 className="text-[16px] font-semibold text-neutral-800 truncate">
                    {user?.nickname || user?.username || '未设置'}
                  </h2>
                  <p className="text-[12px] text-neutral-400 truncate">{user?.email}</p>
                </div>
              </div>

              {/* Menu items */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-black/[0.04] overflow-hidden divide-y divide-black/[0.04]">
                {menuItems.map((item) => (
                  <motion.button
                    key={item.label}
                    whileTap={{ scale: 0.99 }}
                    onClick={item.action}
                    className="w-full flex items-center gap-4 px-4 py-4 hover:bg-white/80 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center">
                      <item.icon size={17} className="text-neutral-600" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-neutral-800">{item.label}</p>
                      <p className="text-[12px] text-neutral-400">{item.desc}</p>
                    </div>
                    <ChevronRight size={16} className="text-neutral-300" />
                  </motion.button>
                ))}
              </div>

              {/* Logout */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-black/[0.04] text-rose-500 hover:bg-rose-50/60 transition-colors text-[14px] font-medium"
              >
                <LogOut size={17} strokeWidth={1.5} />
                退出登录
              </motion.button>
            </motion.div>
          )}

          {/* ===== Profile Edit ===== */}
          {section === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25, ease: easeOut }}
              className="space-y-6"
            >
              {/* Avatar Upload */}
              <div className="space-y-4">
                <h3 className="text-[13px] text-neutral-400 font-medium uppercase tracking-wider px-1">头像</h3>
                
                <div className="flex items-center gap-4 p-4 bg-white/60 border border-black/[0.06] rounded-xl">
                  <div className="relative">
                    <img
                      src={previewUrl || user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'default'}`}
                      alt="Avatar"
                      className="w-20 h-20 rounded-2xl object-cover ring-1 ring-black/5"
                    />
                    {(isUploading || selectedFile) && (
                      <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center">
                        {isUploading && (
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <p className="text-[12px] text-neutral-500">
                      支持 JPG、PNG、GIF、WebP 格式，最大 5MB
                    </p>
                    
                    <div className="flex gap-2">
                      {!selectedFile ? (
                        <>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="px-3 py-1.5 bg-gradient-to-r from-violet-500 to-primary-500 text-white text-[13px] font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                          >
                            <Camera size={14} />
                            选择图片
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={handleAvatarUpload}
                            disabled={isUploading}
                            className="px-3 py-1.5 bg-gradient-to-r from-violet-500 to-primary-500 text-white text-[13px] font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                          >
                            {isUploading ? (
                              <>
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                上传中...
                              </>
                            ) : (
                              <>
                                <Upload size={14} />
                                上传
                              </>
                            )}
                          </button>
                          <button
                            onClick={cancelAvatarUpload}
                            disabled={isUploading}
                            className="px-3 py-1.5 bg-neutral-100 text-neutral-600 text-[13px] font-medium rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            取消
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic info */}
              <div className="space-y-4">
                <h3 className="text-[13px] text-neutral-400 font-medium uppercase tracking-wider px-1">基本信息</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[12px] text-neutral-500 mb-1.5 px-1">用户名</label>
                    <input
                      type="text"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                      className="w-full px-4 py-3 bg-white/60 border border-black/[0.06] rounded-xl text-[14px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300 transition-all"
                      placeholder="用户名"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] text-neutral-500 mb-1.5 px-1">昵称</label>
                    <input
                      type="text"
                      value={profileForm.nickname}
                      onChange={(e) => setProfileForm({ ...profileForm, nickname: e.target.value })}
                      maxLength={20}
                      className="w-full px-4 py-3 bg-white/60 border border-black/[0.06] rounded-xl text-[14px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300 transition-all"
                      placeholder="你希望被如何称呼"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] text-neutral-500 mb-1.5 px-1">简介</label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      maxLength={200}
                      rows={2}
                      className="w-full px-4 py-3 bg-white/60 border border-black/[0.06] rounded-xl text-[14px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300 transition-all resize-none"
                      placeholder="介绍一下你自己"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] text-neutral-500 mb-1.5 px-1">个人签名 / 座右铭</label>
                    <input
                      type="text"
                      value={profileForm.motto}
                      onChange={(e) => setProfileForm({ ...profileForm, motto: e.target.value })}
                      maxLength={100}
                      className="w-full px-4 py-3 bg-white/60 border border-black/[0.06] rounded-xl text-[14px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300 transition-all"
                      placeholder="一句让你感到力量的话"
                    />
                  </div>
                </div>
              </div>

              {/* Life stage */}
              <div className="space-y-3">
                <h3 className="text-[13px] text-neutral-400 font-medium uppercase tracking-wider px-1">生命周期阶段</h3>
                <div className="grid grid-cols-2 gap-2">
                  {lifeStageOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setProfileForm({ ...profileForm, lifeStage: opt.value })}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all text-[13px] ${
                        profileForm.lifeStage === opt.value
                          ? 'border-neutral-700 bg-neutral-50'
                          : 'border-transparent bg-white/60 hover:bg-white/80'
                      }`}
                    >
                      <span className="text-lg">{opt.emoji}</span>
                      <span className="font-medium text-neutral-700">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Healing preference */}
              <div className="space-y-3">
                <h3 className="text-[13px] text-neutral-400 font-medium uppercase tracking-wider px-1">疗愈偏好</h3>
                <div className="grid grid-cols-2 gap-2">
                  {healingPrefOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setProfileForm({ ...profileForm, healingPreference: opt.value })}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all text-[13px] ${
                        profileForm.healingPreference === opt.value
                          ? 'border-neutral-700 bg-neutral-50'
                          : 'border-transparent bg-white/60 hover:bg-white/80'
                      }`}
                    >
                      <span className="text-lg">{opt.emoji}</span>
                      <span className="font-medium text-neutral-700">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Save button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-neutral-900 text-white rounded-xl text-[14px] font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <Save size={16} />
                )}
                保存修改
              </motion.button>
            </motion.div>
          )}

          {/* ===== Password Change ===== */}
          {section === 'password' && (
            <motion.div
              key="password"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25, ease: easeOut }}
              className="space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-2">
                <Shield size={22} className="text-neutral-600" strokeWidth={1.5} />
              </div>
              <p className="text-center text-[13px] text-neutral-400 mb-6">修改密码后需要重新登录</p>

              <div>
                <label className="block text-[12px] text-neutral-500 mb-1.5 px-1">当前密码</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-white/60 border border-black/[0.06] rounded-xl text-[14px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300 transition-all"
                  placeholder="输入当前密码"
                />
              </div>

              <div>
                <label className="block text-[12px] text-neutral-500 mb-1.5 px-1">新密码</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-white/60 border border-black/[0.06] rounded-xl text-[14px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300 transition-all"
                  placeholder="至少 6 个字符"
                />
              </div>

              <div>
                <label className="block text-[12px] text-neutral-500 mb-1.5 px-1">确认新密码</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-white/60 border border-black/[0.06] rounded-xl text-[14px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300 transition-all"
                  placeholder="再次输入新密码"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleChangePassword}
                disabled={isLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-neutral-900 text-white rounded-xl text-[14px] font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 mt-6"
              >
                {isLoading ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <Lock size={16} />
                )}
                修改密码
              </motion.button>
            </motion.div>
          )}

          {/* ===== About / Info Summary ===== */}
          {section === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25, ease: easeOut }}
              className="space-y-4"
            >
              {/* User info card */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-black/[0.04] p-5 space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'default'}`}
                    alt={user?.nickname || user?.username}
                    className="w-16 h-16 rounded-2xl object-cover ring-1 ring-black/5"
                  />
                  <div>
                    <h2 className="text-[17px] font-semibold text-neutral-800">
                      {user?.nickname || user?.username}
                    </h2>
                    <p className="text-[12px] text-neutral-400">{user?.email}</p>
                  </div>
                </div>

                {user?.bio && (
                  <p className="text-[13px] text-neutral-600 leading-relaxed">{user.bio}</p>
                )}

                {user?.motto && (
                  <div className="flex items-start gap-2 p-3 bg-neutral-50 rounded-xl">
                    <Sparkles size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-[13px] text-neutral-600 italic">{user.motto}</p>
                  </div>
                )}
              </div>

              {/* Detail items */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-black/[0.04] divide-y divide-black/[0.04]">
                <div className="flex items-center justify-between px-4 py-3.5">
                  <span className="text-[13px] text-neutral-500">用户名</span>
                  <span className="text-[13px] text-neutral-800 font-medium">{user?.username || '—'}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3.5">
                  <span className="text-[13px] text-neutral-500">昵称</span>
                  <span className="text-[13px] text-neutral-800 font-medium">{user?.nickname || '—'}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3.5">
                  <span className="text-[13px] text-neutral-500">邮箱</span>
                  <span className="text-[13px] text-neutral-800 font-medium">{user?.email || '—'}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3.5">
                  <span className="text-[13px] text-neutral-500">生命阶段</span>
                  <span className="text-[13px] text-neutral-800 font-medium">
                    {user?.lifeStage
                      ? `${lifeStageOptions.find(o => o.value === user.lifeStage)?.emoji} ${lifeStageOptions.find(o => o.value === user.lifeStage)?.label}`
                      : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-3.5">
                  <span className="text-[13px] text-neutral-500">疗愈偏好</span>
                  <span className="text-[13px] text-neutral-800 font-medium">
                    {user?.healingPreference
                      ? `${healingPrefOptions.find(o => o.value === user.healingPreference)?.emoji} ${healingPrefOptions.find(o => o.value === user.healingPreference)?.label}`
                      : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-3.5">
                  <span className="text-[13px] text-neutral-500">引导问卷</span>
                  <span className={`text-[13px] font-medium ${user?.onboardingCompleted ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {user?.onboardingCompleted ? '✓ 已完成' : '未完成'}
                  </span>
                </div>
              </div>

              {/* App info */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-black/[0.04] p-4 text-center">
                <div className="text-2xl mb-1">🌿</div>
                <p className="text-[14px] font-semibold text-neutral-700">心语疗愈</p>
                <p className="text-[12px] text-neutral-400 mt-0.5">v2.0 · AI 心理疗愈音频平台</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Settings;
