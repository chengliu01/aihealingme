import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Music2, Quote, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { userAPI } from '@/services/api';
import AudioCard from '@/components/AudioCard';
import type { HealingAudio } from '@/types';

// 生命周期映射
const lifeStageMap: Record<string, { emoji: string; label: string }> = {
  student: { emoji: '🎓', label: '求学探索期' },
  career_start: { emoji: '🌱', label: '职场适应期' },
  career_mid: { emoji: '🦁', label: '中坚奋斗期' },
  free_life: { emoji: '🧘', label: '自由/慢生活' },
};

const healingPrefMap: Record<string, { emoji: string; label: string }> = {
  rational: { emoji: '🧠', label: '理智重构' },
  warm: { emoji: '❤️', label: '温暖抱持' },
};

interface UserProfileData {
  _id: string;
  username: string;
  nickname?: string;
  avatar?: string;
  bio?: string;
  motto?: string;
  lifeStage?: string;
  healingPreference?: string;
  followers?: any[];
  following?: any[];
  createdAt: string;
}

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  
  const [profileUser, setProfileUser] = useState<UserProfileData | null>(null);
  const [audios, setAudios] = useState<HealingAudio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = currentUser?.id === id;

  useEffect(() => {
    if (isOwnProfile) {
      navigate('/profile', { replace: true });
      return;
    }
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await userAPI.getUserProfile(id);
      setProfileUser(response.data.user);
      
      // 转换后端音频格式为前端格式
      const serverAudios = response.data.audios || [];
      const mappedAudios: HealingAudio[] = serverAudios.map((a: any) => ({
        id: a._id,
        title: a.title,
        description: a.description,
        coverUrl: a.coverImage || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
        audioUrl: a.audioUrl,
        duration: a.duration,
        author: {
          id: a.creator?._id || id,
          name: a.creator?.nickname || a.creator?.username || 'Unknown',
          avatar: a.creator?.avatar || '',
          email: '',
          createdAt: a.createdAt,
        },
        tags: a.tags || [],
        category: a.category || 'other',
        likes: a.likes?.length || 0,
        views: a.listens || 0,
        comments: [],
        isPublished: a.isPublic,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        type: 'single' as const,
        shareText: a.shareText || '',
      }));
      setAudios(mappedAudios);

      // 检查是否已关注
      if (currentUser && response.data.user.followers) {
        const isFollowed = response.data.user.followers.some(
          (f: any) => (f._id || f) === currentUser.id
        );
        setIsFollowing(isFollowed);
      }
    } catch {
      // handle error silently
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!id || !isAuthenticated || followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await userAPI.unfollowUser(id);
        setIsFollowing(false);
        if (profileUser?.followers) {
          setProfileUser({
            ...profileUser,
            followers: profileUser.followers.filter((f: any) => (f._id || f) !== currentUser?.id),
          });
        }
      } else {
        await userAPI.followUser(id);
        setIsFollowing(true);
        if (profileUser) {
          setProfileUser({
            ...profileUser,
            followers: [...(profileUser.followers || []), { _id: currentUser?.id }],
          });
        }
      }
    } catch {
      // handle error silently
    } finally {
      setFollowLoading(false);
    }
  };

  const easeOut = [0.25, 0.1, 0.25, 1];
  const displayName = profileUser?.nickname || profileUser?.username || '用户';
  const displayAvatar = profileUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUser?.username || 'default'}`;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="text-neutral-400 animate-spin" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-[15px] text-neutral-500">用户不存在</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-neutral-900 text-white rounded-2xl text-[14px]"
        >
          返回
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      {/* 导航 */}
      <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-black/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 h-14 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
          </button>
          <h1 className="flex-1 text-center text-[15px] font-medium text-neutral-800">
            {displayName} 的主页
          </h1>
          <div className="w-5" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* 个人信息 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="pt-6 pb-4"
        >
          <div className="flex items-start gap-4">
            <img 
              src={displayAvatar}
              alt={displayName}
              className="w-16 h-16 rounded-2xl object-cover ring-1 ring-black/5"
            />
            <div className="flex-1 pt-1">
              <h1 className="text-[18px] font-semibold text-neutral-800">{displayName}</h1>
              {profileUser.bio && (
                <p className="text-[13px] text-neutral-400 mt-0.5 line-clamp-2">{profileUser.bio}</p>
              )}
            </div>
            
            {/* 关注按钮 */}
            {isAuthenticated && !isOwnProfile && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleFollow}
                disabled={followLoading}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-medium transition-all ${
                  isFollowing
                    ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    : 'bg-neutral-900 text-white hover:bg-neutral-800'
                }`}
              >
                {followLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : isFollowing ? (
                  <>
                    <UserMinus size={14} />
                    已关注
                  </>
                ) : (
                  <>
                    <UserPlus size={14} />
                    关注
                  </>
                )}
              </motion.button>
            )}
          </div>

          {/* 个人签名 */}
          {profileUser.motto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mt-3 flex items-start gap-2 text-[13px] text-neutral-500 italic"
            >
              <Quote size={12} className="text-neutral-300 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{profileUser.motto}</span>
            </motion.div>
          )}

          {/* 个人标签 */}
          {(profileUser.lifeStage || profileUser.healingPreference) && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-2 mt-3 flex-wrap"
            >
              {profileUser.lifeStage && lifeStageMap[profileUser.lifeStage] && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 rounded-xl text-[12px] text-neutral-600 font-medium">
                  <span>{lifeStageMap[profileUser.lifeStage].emoji}</span>
                  {lifeStageMap[profileUser.lifeStage].label}
                </span>
              )}
              {profileUser.healingPreference && healingPrefMap[profileUser.healingPreference] && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 rounded-xl text-[12px] text-neutral-600 font-medium">
                  <span>{healingPrefMap[profileUser.healingPreference].emoji}</span>
                  {healingPrefMap[profileUser.healingPreference].label}
                </span>
              )}
            </motion.div>
          )}

          {/* 统计 */}
          <div className="flex gap-8 mt-5">
            <div>
              <div className="text-[20px] font-semibold text-neutral-800">{audios.length}</div>
              <div className="text-[12px] text-neutral-400">作品</div>
            </div>
            <div>
              <div className="text-[20px] font-semibold text-neutral-800">{profileUser.followers?.length || 0}</div>
              <div className="text-[12px] text-neutral-400">粉丝</div>
            </div>
            <div>
              <div className="text-[20px] font-semibold text-neutral-800">{profileUser.following?.length || 0}</div>
              <div className="text-[12px] text-neutral-400">关注</div>
            </div>
          </div>
        </motion.div>

        {/* 发布的作品标题 */}
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-black/[0.04]">
          <Music2 size={15} strokeWidth={1.5} className="text-neutral-800" />
          <span className="text-[13px] font-medium text-neutral-800">Ta 的作品</span>
          <span className="text-[11px] text-neutral-400 ml-1">{audios.length}</span>
        </div>

        {/* 作品列表 */}
        {audios.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {audios.map((audio, index) => (
              <AudioCard 
                key={audio.id} 
                audio={audio} 
                index={index}
                layout="grid"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <Music2 size={24} className="text-neutral-300" strokeWidth={1.5} />
            </div>
            <p className="text-[15px] text-neutral-600 font-medium">暂无公开作品</p>
            <p className="text-[13px] text-neutral-400 mt-1">Ta 还没有发布任何作品</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
