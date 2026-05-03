import { useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { updateUsername, changePassword } from '../store/authSlice'
import api from '../services/api'
import type { Task } from '../store/tasksSlice'
import { Edit3, Key, Star, Flame, Award, X, Trophy, Target, CheckCircle2 } from 'lucide-react'

const ProfilePage = () => {
  const dispatch = useAppDispatch()
  const { user, loading: authLoading, error: authError } = useAppSelector(state => state.auth)
  const [stats, setStats] = useState<any>(null)
  const [solvedTasks, setSolvedTasks] = useState<Task[]>([])
  const [allTasksCount, setAllTasksCount] = useState(0)
  const [showEditUsername, setShowEditUsername] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [newUsername, setNewUsername] = useState(user?.username || '')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [modalError, setModalError] = useState('')

  useEffect(() => {
    // Получаем статистику пользователя
    api.get('/auth/stats').then(res => setStats(res.data))
    // Получаем все задачи для подсчёта общего количества и фильтра решённых
    api.get('/tasks').then(res => {
      const allTasks: Task[] = res.data
      setAllTasksCount(allTasks.length)
      // Поскольку stats загружается асинхронно, фильтруем внутри этого эффекта по id
      if (stats?.solvedTasks) {
        const solvedIds = stats.solvedTasks.map((s: any) => s.toString())
        setSolvedTasks(allTasks.filter(t => solvedIds.includes(t._id)))
      }
    })
  }, [stats?.solvedTasks]) // зависит от stats

  // Локально фильтруем решённые задачи при изменении stats
  useEffect(() => {
    if (stats?.solvedTasks && allTasksCount > 0) {
      api.get('/tasks').then(res => {
        const allTasks: Task[] = res.data
        const solvedIds = stats.solvedTasks.map((s: any) => s.toString())
        setSolvedTasks(allTasks.filter(t => solvedIds.includes(t._id)))
      })
    }
  }, [stats, allTasksCount])

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) return
    setModalError('')
    const result = await dispatch(updateUsername(newUsername))
    if (updateUsername.fulfilled.match(result)) {
      setShowEditUsername(false)
    } else {
      setModalError((result.payload as string) || 'Ошибка')
    }
  }

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) return
    setModalError('')
    const result = await dispatch(changePassword({ oldPassword, newPassword }))
    if (changePassword.fulfilled.match(result)) {
      setShowChangePassword(false)
      setOldPassword('')
      setNewPassword('')
    } else {
      setModalError((result.payload as string) || 'Ошибка')
    }
  }

  if (!user || !stats) return <div className="text-center mt-20">Загрузка профиля...</div>

  const solvedCount = stats.solvedTasks?.length || 0
  const totalPoints = stats.totalPoints || 0
  const currentStreak = stats.currentStreak || 0
  const longestStreak = stats.longestStreak || 0
  const progressPercent = allTasksCount > 0 ? Math.round((solvedCount / allTasksCount) * 100) : 0
  const maxStreak = Math.max(longestStreak, 10) // для нормализации индикатора

  return (
    <div className="px-24">
      <h1 className="text-3xl font-bold mb-8">Профиль</h1>

      {/* Основная информация и быстрые действия */}
      <div className="bg-[var(--color-surface-alt)] rounded-xl p-6 border border-[var(--color-border)] mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand flex items-center justify-center text-white text-2xl font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user.username}</h2>
              <p className="text-sm text-[var(--color-text-muted)]">{user.role}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEditUsername(true)}
              className="p-2 rounded-lg hover:bg-[var(--color-border)] transition-colors"
              title="Изменить имя"
            >
              <Edit3 size={18} />
            </button>
            <button
              onClick={() => setShowChangePassword(true)}
              className="p-2 rounded-lg hover:bg-[var(--color-border)] transition-colors"
              title="Сменить пароль"
            >
              <Key size={18} />
            </button>
          </div>
        </div>

        {/* Расширенные карточки статистики */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-[var(--color-surface)] rounded-lg p-4 text-center hover:border-brand/30 border border-transparent transition-colors">
            <Star className="mx-auto mb-2 text-yellow-400" size={24} />
            <p className="text-2xl font-bold">{totalPoints}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Очков</p>
          </div>
          <div className="bg-[var(--color-surface)] rounded-lg p-4 text-center hover:border-brand/30 border border-transparent transition-colors">
            <Flame className="mx-auto mb-2 text-orange-400" size={24} />
            <p className="text-2xl font-bold">{currentStreak}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Дней подряд</p>
          </div>
          <div className="bg-[var(--color-surface)] rounded-lg p-4 text-center hover:border-brand/30 border border-transparent transition-colors">
            <Award className="mx-auto mb-2 text-purple-400" size={24} />
            <p className="text-2xl font-bold">{longestStreak}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Рекорд</p>
          </div>
          <div className="bg-[var(--color-surface)] rounded-lg p-4 text-center hover:border-brand/30 border border-transparent transition-colors">
            <Trophy className="mx-auto mb-2 text-brand" size={24} />
            <p className="text-2xl font-bold">{solvedCount}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Решено задач</p>
          </div>
        </div>

        {/* Индикатор прогресса и стрика */}
        <div className="mt-6 space-y-4">
          {/* Прогресс решения всех задач */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-[var(--color-text-muted)] flex items-center gap-1">
                <Target size={16} /> Общий прогресс
              </span>
              <span className="text-sm font-medium">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-[var(--color-surface)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-dark to-brand rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Визуализация стрика */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-[var(--color-text-muted)] flex items-center gap-1">
                <Flame size={16} /> Текущая серия
              </span>
              <span className="text-sm font-medium">{currentStreak}/{maxStreak}</span>
            </div>
            <div className="w-full h-2 bg-[var(--color-surface)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full transition-all duration-500"
                style={{ width: `${(currentStreak / maxStreak) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-surface-alt)] rounded-xl p-6 border border-[var(--color-border)] mb-6 flex justify-evenly">
        <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target size={20} className="text-brand" /> Прогресс по всем задачам
        </h3>
        <div className="flex items-center justify-center sm:justify-start gap-8">
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2a2a2a" strokeWidth="3" />
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke="#d70147"
                strokeWidth="3"
                strokeDasharray={`${progressPercent} ${100 - progressPercent}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold">{progressPercent}%</span>
              <span className="text-xs text-[var(--color-text-muted)]">прогресс</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-muted)]">
              Решено <span className="text-white font-medium">{solvedCount}</span> из{' '}
              <span className="text-white font-medium">{allTasksCount}</span> задач
            </p>
            {progressPercent === 100 && (
              <p className="text-xs text-green-400 mt-1">🎉 Все задачи решены!</p>
            )}
            {/* Небольшая легенда */}
            <div className="mt-3 space-y-1 text-xs text-[var(--color-text-muted)]">
              <p>Осталось решить: <span className="text-white font-medium">{allTasksCount - solvedCount}</span></p>
              <p>Начислено очков: <span className="text-white font-medium">{totalPoints}</span></p>
            </div>
          </div>
        </div>
        </div>

        <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle2 size={20} className="text-brand" /> Распределение решённых задач
        </h3>
        {solvedCount > 0 ? (
          <div className="flex items-center justify-center sm:justify-start gap-8">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2a2a2a" strokeWidth="3" />
                {(() => {
                  const counts = {
                    BEGINNER: solvedTasks.filter(t => t.difficulty === 'BEGINNER').length,
                    INTERMEDIATE: solvedTasks.filter(t => t.difficulty === 'INTERMEDIATE').length,
                    ADVANCED: solvedTasks.filter(t => t.difficulty === 'ADVANCED').length,
                  };
                  const total = solvedCount;
                  const segments = [
                    { percent: (counts.BEGINNER / total) * 100, color: '#22c55e' },
                    { percent: (counts.INTERMEDIATE / total) * 100, color: '#eab308' },
                    { percent: (counts.ADVANCED / total) * 100, color: '#ef4444' },
                  ];
                  let dashoffset = 0;
                  return segments.map((seg, idx) => {
                    const dasharray = `${seg.percent} ${100 - seg.percent}`;
                    const offset = -dashoffset;
                    dashoffset += seg.percent;
                    return (
                      <circle
                        key={idx}
                        cx="18"
                        cy="18"
                        r="15.9"
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="3"
                        strokeDasharray={dasharray}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold">{solvedCount}</span>
                <span className="text-xs text-[var(--color-text-muted)]">задач</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-[var(--color-text-muted)]">
                  Начальные:{' '}
                  <strong className="text-white">{solvedTasks.filter(t => t.difficulty === 'BEGINNER').length}</strong>
                  {' '}({Math.round((solvedTasks.filter(t => t.difficulty === 'BEGINNER').length / solvedCount) * 100)}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-[var(--color-text-muted)]">
                  Средние:{' '}
                  <strong className="text-white">{solvedTasks.filter(t => t.difficulty === 'INTERMEDIATE').length}</strong>
                  {' '}({Math.round((solvedTasks.filter(t => t.difficulty === 'INTERMEDIATE').length / solvedCount) * 100)}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-[var(--color-text-muted)]">
                  Высокие:{' '}
                  <strong className="text-white">{solvedTasks.filter(t => t.difficulty === 'ADVANCED').length}</strong>
                  {' '}({Math.round((solvedTasks.filter(t => t.difficulty === 'ADVANCED').length / solvedCount) * 100)}%)
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-muted)]">Нет решённых задач</p>
        )}
        </div>
      </div>

      <div className="bg-[var(--color-surface-alt)] rounded-xl p-6 border border-[var(--color-border)]">
        <h3 className="text-lg font-semibold mb-4">Решённые задачи</h3>
        {solvedTasks.length === 0 ? (
          <p className="text-[var(--color-text-muted)]">Пока нет решённых задач</p>
        ) : (
          <ul className="space-y-2">
            {solvedTasks.map(task => (
              <li
                key={task._id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--color-surface)] transition-colors"
              >
                <span className="text-sm">{task.title}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  task.difficulty === 'BEGINNER'
                    ? 'bg-green-500/10 text-green-400'
                    : task.difficulty === 'INTERMEDIATE'
                    ? 'bg-yellow-500/10 text-yellow-400'
                    : 'bg-red-500/10 text-red-400'
                }`}>
                  {task.difficulty === 'BEGINNER' ? 'Начальный' : task.difficulty === 'INTERMEDIATE' ? 'Средний' : 'Высокий'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Модальные окна (без изменений) */}
      {showEditUsername && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--color-surface-alt)] rounded-xl p-6 w-full max-w-md border border-[var(--color-border)]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Изменить имя</h3>
              <button onClick={() => setShowEditUsername(false)}><X size={20} /></button>
            </div>
            {modalError && <p className="text-red-400 text-sm mb-2">{modalError}</p>}
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 mb-4"
              placeholder="Новое имя"
            />
            <button
              onClick={handleUpdateUsername}
              disabled={authLoading}
              className="w-full bg-brand hover:bg-brand-dark text-white py-2 rounded-lg transition-colors"
            >
              Сохранить
            </button>
          </div>
        </div>
      )}

      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--color-surface-alt)] rounded-xl p-6 w-full max-w-md border border-[var(--color-border)]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Сменить пароль</h3>
              <button onClick={() => setShowChangePassword(false)}><X size={20} /></button>
            </div>
            {modalError && <p className="text-red-400 text-sm mb-2">{modalError}</p>}
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 mb-3"
              placeholder="Текущий пароль"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 mb-4"
              placeholder="Новый пароль"
            />
            <button
              onClick={handleChangePassword}
              disabled={authLoading}
              className="w-full bg-brand hover:bg-brand-dark text-white py-2 rounded-lg transition-colors"
            >
              Сменить пароль
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfilePage