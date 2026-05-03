import mongoose, { Schema, Document } from 'mongoose';

export interface ISolution extends Document {
  userId: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  code: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'TIMEOUT' | 'ERROR';
  result?: {
    totalTests: number;
    passedTests: number;
    output: string;
    errorLog: string;
    executionTimeMs: number;
  };
}

const solutionSchema = new Schema<ISolution>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  code: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'TIMEOUT', 'ERROR'], default: 'PENDING' },
  result: {
    totalTests: Number,
    passedTests: Number,
    output: String,
    errorLog: String,
    executionTimeMs: Number,
  },
}, { timestamps: true });

export const Solution = mongoose.model<ISolution>('Solution', solutionSchema);