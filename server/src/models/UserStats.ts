import mongoose, { Schema, Document } from 'mongoose';

export interface IUserStats extends Document {
  userId: mongoose.Types.ObjectId;
  solvedTasks: mongoose.Types.ObjectId[];
  totalPoints: number;
  categoryProgress: Record<string, number>;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
}

const userStatsSchema = new Schema<IUserStats>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  solvedTasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  totalPoints: { type: Number, default: 0 },
  categoryProgress: { type: Schema.Types.Mixed, default: {} },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActivityDate: { type: Date, default: Date.now },
});

export const UserStats = mongoose.model<IUserStats>('UserStats', userStatsSchema);