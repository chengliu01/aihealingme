import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  content: string;
  author: mongoose.Types.ObjectId;
  audio: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  parentComment?: mongoose.Types.ObjectId; // 支持回复
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    audio: {
      type: Schema.Types.ObjectId,
      ref: 'Audio',
      required: true
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null
    }
  },
  {
    timestamps: true
  }
);

commentSchema.index({ audio: 1, createdAt: -1 });
commentSchema.index({ author: 1 });

const Comment = mongoose.model<IComment>('Comment', commentSchema);

export default Comment;
