import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const navigate = useNavigate();
  const { login, register, isLoading, error, clearError } = useAuthStore();
  const [isLoginMode, setIsLoginMode] = React.useState(initialMode === 'login');
  const [showPassword, setShowPassword] = React.useState(false);
  const [formData, setFormData] = React.useState({
    username: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    setIsLoginMode(initialMode === 'login');
  }, [initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      if (isLoginMode) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.username, formData.email, formData.password);
      }
      onClose();
      // Reset form
      setFormData({ username: '', email: '', password: '' });
      
      // Redirect to onboarding if needed (new registration or login without completed onboarding)
      const state = useAuthStore.getState();
      if (state.needsOnboarding) {
        navigate('/onboarding');
      }
    } catch (err) {
      // Error is handled by the store
      console.error('Auth error:', err);
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

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute -top-4 -right-4 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all z-10 border border-white/20"
              >
                <X size={20} />
              </button>

              {/* Card */}
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
                {/* Header with gradient */}
                <div className="relative h-32 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="text-white text-center"
                  >
                    <div className="text-4xl mb-2">🌿</div>
                    <h2 className="text-2xl font-bold">心语疗愈</h2>
                  </motion.div>
                  
                  {/* Decorative circles */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-16 -mt-16" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-400/10 rounded-full -ml-12 -mb-12" />
                </div>

                {/* Form */}
                <div className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {isLoginMode ? '欢迎回来' : '创建账户'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {isLoginMode ? '登录继续使用' : '开始你的疗愈之旅'}
                    </p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <AnimatePresence mode="wait">
                      {!isLoginMode && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type="text"
                              name="username"
                              value={formData.username}
                              onChange={handleChange}
                              required={!isLoginMode}
                              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                              placeholder="用户名"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                        placeholder="邮箱地址"
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                        className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                        placeholder="密码"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {!isLoginMode && (
                      <p className="text-xs text-gray-500">
                        密码至少需要 6 个字符
                      </p>
                    )}

                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 text-white font-semibold rounded-xl hover:from-slate-900 hover:to-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-500/30"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          处理中...
                        </span>
                      ) : (
                        isLoginMode ? '登录' : '注册'
                      )}
                    </motion.button>
                  </form>

                  <div className="mt-6 text-center">
                    <button
                      onClick={toggleMode}
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {isLoginMode ? (
                        <>
                          还没有账户？
                          <span className="font-semibold text-slate-700 ml-1">立即注册</span>
                        </>
                      ) : (
                        <>
                          已有账户？
                          <span className="font-semibold text-slate-700 ml-1">立即登录</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
