import { useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { updateUsername, changePassword } from '../store/authSlice'
import api from '../services/api'
import type { Task } from '../store/tasksSlice'
import { Edit3, Key, Star, Flame, Award, X } from 'lucide-react'

const ProfilePage = () => {
  const dispatch = useAppDispatch()
  const { user, loading, error } = useAppSelector(state => state.auth)
  const [stats, setStats] = useState<any>(null)
  const [solvedTasks, setSolvedTasks] = useState<Task[]>([])
  const [showEditUsername, setShowEditUsername] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [newUsername, setNewUsername] = useState(user?.username || '')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [modalError, setModalError] = useState('')

  useEffect(() => {
    api.get('/auth/stats').then(res => setStats(res.data))
    api.get('/tasks').then(res => {
      // получим все задачи и отфильтруем решенные по stats.solvedTasks
      if (stats?.solvedTasks) {
        const solvedIds = stats.solvedTasks.map((s: any) => s.toString())
        setSolvedTasks(res.data.filter((t: Task) => solvedIds.includes(t._id)))
      }
    })
  }, [stats?.solvedTasks]) // зависит от stats

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

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Профиль</h1>

      {/* Основная информация */}
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-[var(--color-surface)] rounded-lg p-3 text-center">
            <Star className="mx-auto mb-1 text-yellow-400" size={20} />
            <p className="text-lg font-bold">{stats.totalPoints}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Очков</p>
          </div>
          <div className="bg-[var(--color-surface)] rounded-lg p-3 text-center">
            <Flame className="mx-auto mb-1 text-orange-400" size={20} />
            <p className="text-lg font-bold">{stats.currentStreak}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Дней подряд</p>
          </div>
          <div className="bg-[var(--color-surface)] rounded-lg p-3 text-center">
            <Award className="mx-auto mb-1 text-purple-400" size={20} />
            <p className="text-lg font-bold">{stats.longestStreak}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Рекорд</p>
          </div>
          <div className="bg-[var(--color-surface)] rounded-lg p-3 text-center">
            <Flame className="mx-auto mb-1 text-green-400" size={20} />
            <p className="text-lg font-bold">{stats.solvedTasks?.length || 0}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Решено задач</p>
          </div>
        </div>
      </div>

      {/* Решенные задачи */}
      <div className="bg-[var(--color-surface-alt)] rounded-xl p-6 border border-[var(--color-border)]">
        <h3 className="text-lg font-semibold mb-4">Решенные задачи</h3>
        {solvedTasks.length === 0 ? (
          <p className="text-[var(--color-text-muted)]">Пока нет решенных задач</p>
        ) : (
          <ul className="space-y-2">
            {solvedTasks.map(task => (
              <li key={task._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--color-surface)]">
                <span>{task.title}</span>
                <span className="text-xs px-2 py-1 rounded bg-brand/20 text-brand">
                  {task.difficulty === 'BEGINNER' ? 'Начальный' : task.difficulty === 'INTERMEDIATE' ? 'Средний' : 'Высокий'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Модальное окно: изменение имени */}
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
              disabled={loading}
              className="w-full bg-brand hover:bg-brand-dark text-white py-2 rounded-lg transition-colors"
            >
              Сохранить
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно: смена пароля */}
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
              disabled={loading}
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