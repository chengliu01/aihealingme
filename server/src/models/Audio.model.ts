import mongoose, { Document, Schema } from 'mongoose';

export interface IAudio extends Document {
  title: string;
  description: string;
  audioUrl: string;
  coverImage: string;
  duration: number;
  category: string;
  tags: string[];
  creator: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  listens: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const audioSchema = new Schema<IAudio>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    audioUrl: {
      type: String,
      required: [true, 'Audio URL is required']
    },
    coverImage: {
      type: String,
      default: ''
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: 0
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['meditation', 'sleep', 'focus', 'relax', 'nature', 'music', 'other']
    },
    tags: [{
      type: String,
      trim: true
    }],
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    listens: {
      type: Number,
      default: 0
    },
    isPublic: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Index for better query performance
audioSchema.index({ title: 'text', description: 'text' });
audioSchema.index({ category: 1, createdAt: -1 });
audioSchema.index({ creator: 1 });

const Audio = mongoose.model<IAudio>('Audio', audioSchema);

export default Audio;
