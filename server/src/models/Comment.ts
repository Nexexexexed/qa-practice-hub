import mongoose, { Schema, Document } from 'mongoose';

export type CommentType = 'COMMENT' | 'SOLUTION';

export interface IComment extends Document {
  taskId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: CommentType;
  content: string;
  code?: string;
  isPublic: boolean;
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>({
  taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['COMMENT', 'SOLUTION'], required: true },
  content: { type: String, required: true },
  code: { type: String },
  isPublic: { type: Boolean, default: true },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export const Comment = mongoose.model<IComment>('Comment', commentSchema);