import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, isLoading, error, clearError } = useAuthStore();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      if (isLoginMode) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.username, formData.email, formData.password);
      }
      navigate('/');
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    clearError();
    setFormData({ username: '', email: '', password: '' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden bg-[#faf8f5]">
      {/* 装饰背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -right-[20%] w-[600px] h-[600px] bg-stone-200/40 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] bg-orange-100/30 rounded-full blur-[100px]" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-[420px] relative z-10"
      >
        {/* 返回按钮 */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            返回
          </Link>
        </motion.div>

        {/* 卡片 */}
        <div className="bg-white rounded-3xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] p-8 border border-stone-100">
          {/* 头部 */}
          <div className="mb-8">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center mb-5"
            >
              <span className="text-2xl">🌿</span>
            </motion.div>
            <h1 className="text-2xl font-semibold text-stone-800 mb-2 tracking-tight">
              {isLoginMode ? '欢迎回来' : '创建账户'}
            </h1>
            <p className="text-stone-500 text-sm">
              {isLoginMode ? '登录以继续你的疗愈之旅' : '开启一段心灵成长之旅'}
            </p>
          </div>

          {/* 错误提示 */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-5"
              >
                <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLoginMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400" size={18} />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required={!isLoginMode}
                      className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border-0 rounded-xl text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all duration-200"
                      placeholder="用户名"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400" size={18} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border-0 rounded-xl text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all duration-200"
                placeholder="邮箱地址"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full pl-11 pr-12 py-3.5 bg-stone-50 border-0 rounded-xl text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all duration-200"
                placeholder="密码"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {!isLoginMode && (
              <p className="text-xs text-stone-400 pl-1">密码至少6个字符</p>
            )}

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 bg-stone-800 text-white font-medium rounded-xl hover:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  处理中...
                </span>
              ) : (
                isLoginMode ? '登录' : '创建账户'
              )}
            </motion.button>
          </form>

          {/* 切换模式 */}
          <div className="mt-6 pt-6 border-t border-stone-100 text-center">
            <button
              onClick={toggleMode}
              className="text-sm text-stone-500 hover:text-stone-800 transition-colors"
            >
              {isLoginMode ? '还没有账户？' : '已有账户？'}
              <span className="font-medium ml-1 text-stone-800">
                {isLoginMode ? '立即注册' : '立即登录'}
              </span>
            </button>
          </div>
        </div>

        {/* 底部版权 */}
        <p className="mt-8 text-center text-xs text-stone-400">
          登录即表示你同意我们的服务条款和隐私政策
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
