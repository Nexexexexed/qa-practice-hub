import { UserStats } from '../models/UserStats';

export async function updateUserStats(userId: string, taskId: string) {
  let stats = await UserStats.findOne({ userId });
  if (!stats) {
    stats = new UserStats({ userId });
  }

  // Добавляем задачу как решённую (без дубликата)
  if (!stats.solvedTasks.some(id => id.toString() === taskId)) {
    stats.solvedTasks.push(taskId as any);
    stats.totalPoints += 10;
  }

  // Стрик дней
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastActivity = new Date(stats.lastActivityDate);
  lastActivity.setHours(0, 0, 0, 0);

  if (lastActivity.getTime() === today.getTime()) {
    // уже сегодня активен — ничего не делаем
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