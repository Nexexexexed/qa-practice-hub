import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  htmlContent: string;          // HTML-разметка для тестовой страницы
  starterCode: string;          // код, который видит пользователь в редакторе
  testCode: string;             // эталонный проверочный код
}

const taskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], required: true },
  htmlContent: { type: String, required: true },
  starterCode: { type: String, default: '// ваш код' },
  testCode: { type: String, required: true },
});

export const Task = mongoose.model<ITask>('Task', taskSchema);