import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  htmlContent: string;
  starterCode: string;
  testCode: string;
  categories?: mongoose.Types.ObjectId[];   // <-- добавить
  tags?: string[];
  previewUrl?: string;
  status: 'DRAFT' | 'ON_MODERATION' | 'PUBLISHED' | 'ARCHIVED';
}

const taskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], required: true },
  htmlContent: { type: String, required: true },
  starterCode: { type: String, default: '// ваш код' },
  testCode: { type: String, required: true },
  categories: [{ type: Schema.Types.ObjectId, ref: 'TaskCategory' }],  // <-- добавить
  tags: [String],
  previewUrl: String,
  status: { type: String, enum: ['DRAFT', 'ON_MODERATION', 'PUBLISHED', 'ARCHIVED'], default: 'DRAFT' },
});

export const Task = mongoose.model<ITask>('Task', taskSchema);