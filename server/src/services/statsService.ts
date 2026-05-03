import { UserStats } from '../models/UserStats';
import { Task } from '../models/Task';

const POINTS = {
  BEGINNER: 10,
  INTERMEDIATE: 25,
  ADVANCED: 50,
};

export async function updateUserStats(userId: string, taskId: string) {
  const task = await Task.findById(taskId);
  if (!task) return;

  let stats = await UserStats.findOne({ userId });
  if (!stats) {
    stats = new UserStats({ userId });
  }

  if (!stats.solvedTasks.some(id => id.toString() === taskId)) {
    stats.solvedTasks.push(taskId as any);
    stats.totalPoints += POINTS[task.difficulty] || 10;

    // Обновление прогресса по категориям (если есть)
    if (task.categories?.length) {
      for (const catId of task.categories) {
        const key = catId.toString();
        stats.categoryProgress[key] = (stats.categoryProgress[key] || 0) + 1;
      }
    }
  }

  // Стрик дней
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastActivity = new Date(stats.lastActivityDate);
  lastActivity.setHours(0, 0, 0, 0);

  if (lastActivity.getTime() === today.getTime()) {
    // уже активен сегодня
  } else if (lastActivity.getTime() === yesterday.getTime()) {
    stats.currentStreak += 1;
  } else {
    stats.currentStreak = 1;
  }

  if (stats.currentStreak > stats.longestStreak) {
    stats.longestStreak = stats.currentStreak;
  }

  stats.lastActivityDate = new Date();
  await stats.save();
}