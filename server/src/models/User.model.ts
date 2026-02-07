import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// 生命周期阶段
export type LifeStage = 'student' | 'career_start' | 'career_mid' | 'free_life';

// 疗愈偏好
export type HealingPreference = 'rational' | 'warm';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
  // 注册引导信息
  nickname?: string;
  lifeStage?: LifeStage;
  healingPreference?: HealingPreference;
  motto?: string;
  onboardingCompleted: boolean;
  // 社交
  favoriteAudios: mongoose.Types.ObjectId[];
  createdAudios: mongoose.Types.ObjectId[];
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [30, 'Username cannot exceed 30 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false // Don't include password in queries by default
    },
    avatar: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      maxlength: [200, 'Bio cannot exceed 200 characters'],
      default: ''
    },
    // 注册引导字段
    nickname: {
      type: String,
      trim: true,
      maxlength: [20, 'Nickname cannot exceed 20 characters'],
      default: ''
    },
    lifeStage: {
      type: String,
      enum: ['student', 'career_start', 'career_mid', 'free_life'],
      default: undefined
    },
    healingPreference: {
      type: String,
      enum: ['rational', 'warm'],
      default: undefined
    },
    motto: {
      type: String,
      maxlength: [100, 'Motto cannot exceed 100 characters'],
      default: ''
    },
    onboardingCompleted: {
      type: Boolean,
      default: false
    },
    favoriteAudios: [{
      type: Schema.Types.ObjectId,
      ref: 'Audio'
    }],
    createdAudios: [{
      type: Schema.Types.ObjectId,
      ref: 'Audio'
    }],
    followers: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    following: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
