import { useEffect, useState, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchUsers, updateUserRole, toggleUserActive, deleteUser } from '../store/adminSlice'
import { fetchTasks } from '../store/tasksSlice'
import type { Task } from '../store/tasksSlice'
import api from '../services/api'
import { Users, Code2, Shield, Trash2, Edit3, Plus, Search, Lock, LockOpen } from 'lucide-react'
import { ConfirmModal, AlertModal } from '../components/Modal'

type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

interface TaskForm {
  title: string
  description: string
  difficulty: Difficulty
  htmlContent: string
  starterCode: string
  testCode: string
}

const emptyForm: TaskForm = {
  title: '', description: '', difficulty: 'BEGINNER',
  htmlContent: '', starterCode: '', testCode: ''
}

const AdminPage = () => {
  const dispatch = useAppDispatch()
  const { users, loading: usersLoading, error: usersError } = useAppSelector(s => s.admin)
  const { items: tasks, loading: tasksLoading, error: tasksError } = useAppSelector(s => s.tasks)
  const { user } = useAppSelector(s => s.auth)
  const [activeTab, setActiveTab] = useState<'users' | 'tasks'>('tasks')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [taskForm, setTaskForm] = useState<TaskForm>(emptyForm)
  const [searchUser, setSearchUser] = useState('')
  const [searchTask, setSearchTask] = useState('')

  // Модальные окна
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'task' | 'user'; id: string } | null>(null)
  const [alert, setAlert] = useState<{ title: string; message: string; type: 'info' | 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (user?.role === 'admin') {
      dispatch(fetchUsers())
      dispatch(fetchTasks())
    }
  }, [dispatch, user])

  const handleCreateTask = async () => {
    if (!taskForm.title || !taskForm.testCode) {
      setAlert({ title: 'Ошибка', message: 'Название и проверочный код обязательны', type: 'error' })
      return
    }
    try {
      await api.post('/tasks', taskForm)
      dispatch(fetchTasks())
      setTaskForm(emptyForm)
      setAlert({ title: 'Успешно', message: 'Задача создана', type: 'success' })
    } catch (err: any) {
      setAlert({ title: 'Ошибка', message: err.response?.data?.error || 'Ошибка создания', type: 'error' })
    }
  }

  const handleUpdateTask = async () => {
    if (!editingTask || !taskForm.title) return
    try {
      await api.put(`/tasks/${editingTask._id}`, taskForm)
      dispatch(fetchTasks())
      setEditingTask(null)
      setTaskForm(emptyForm)
      setAlert({ title: 'Успешно', message: 'Задача обновлена', type: 'success' })
    } catch (err: any) {
      setAlert({ title: 'Ошибка', message: err.response?.data?.error || 'Ошибка обновления', type: 'error' })
    }
  }

  const handleDeleteTask = (id: string) => {
    setConfirmDelete({ type: 'task', id })
  }

  const handleDeleteUser = (id: string) => {
    setConfirmDelete({ type: 'user', id })
  }

  const executeDelete = async () => {
    if (!confirmDelete) return
    try {
      if (confirmDelete.type === 'task') {
        await api.delete(`/tasks/${confirmDelete.id}`)
        dispatch(fetchTasks())
      } else {
        await dispatch(deleteUser(confirmDelete.id))
      }
      setAlert({ title: 'Успешно', message: 'Удалено', type: 'success' })
    } catch (err: any) {
      setAlert({ title: 'Ошибка', message: err.response?.data?.error || 'Ошибка удаления', type: 'error' })
    }
    setConfirmDelete(null)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setTaskForm({
      title: task.title,
      description: task.description,
      difficulty: task.difficulty,
      htmlContent: task.htmlContent,
      starterCode: task.starterCode,
      testCode: task.testCode || ''
    })
  }

  const filteredUsers = useMemo(() => 
    users.filter(u => u.username.toLowerCase().includes(searchUser.toLowerCase())),
    [users, searchUser]
  )

  const filteredTasks = useMemo(() => 
    tasks.filter(t => t.title.toLowerCase().includes(searchTask.toLowerCase())),
    [tasks, searchTask]
  )

  if (user?.role !== 'admin') return <div className="text-center mt-20 text-red-400">Доступ запрещён</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Админ-панель</h1>
      
      <div className="flex gap-4 mb-6">
        <button onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'tasks' ? 'bg-brand text-white' : 'bg-[var(--color-surface-alt)] text-[var(--color-text)]'}`}>
          <Code2 size={16} className="inline mr-2" /> Задачи
        </button>
        <button onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'users' ? 'bg-brand text-white' : 'bg-[var(--color-surface-alt)] text-[var(--color-text)]'}`}>
          <Users size={16} className="inline mr-2" /> Пользователи
        </button>
      </div>

      {activeTab === 'tasks' && (
        <div>
          {/* Форма создания/редактирования */}
          <div className="bg-[var(--color-surface-alt)] rounded-xl p-6 border border-[var(--color-border)] mb-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Plus size={18} /> {editingTask ? 'Редактировать задачу' : 'Создать задачу'}
            </h3>
            <div className="space-y-3">
              <input placeholder="Название *" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})}
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]" />
              <textarea placeholder="Описание" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})}
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]" rows={2} />
              <select value={taskForm.difficulty} onChange={e => setTaskForm({...taskForm, difficulty: e.target.value as Difficulty})}
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-text)]">
                <option value="BEGINNER">Начальный</option>
                <option value="INTERMEDIATE">Средний</option>
                <option value="ADVANCED">Высокий</option>
              </select>
              <textarea placeholder="HTML разметка *" value={taskForm.htmlContent} onChange={e => setTaskForm({...taskForm, htmlContent: e.target.value})}
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] font-mono text-xs" rows={3} />
              <textarea placeholder="Стартовый код" value={taskForm.starterCode} onChange={e => setTaskForm({...taskForm, starterCode: e.target.value})}
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] font-mono text-xs" rows={3} />
              <textarea placeholder="Проверочный код (тесты) *" value={taskForm.testCode} onChange={e => setTaskForm({...taskForm, testCode: e.target.value})}
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] font-mono text-xs" rows={3} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={editingTask ? handleUpdateTask : handleCreateTask}
                className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors">
                {editingTask ? 'Сохранить' : 'Создать'}
              </button>
              {editingTask && (
                <button onClick={() => { setEditingTask(null); setTaskForm(emptyForm) }}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-border)] transition-colors">
                  Отмена
                </button>
              )}
            </div>
          </div>

          {/* Поиск и список задач */}
          <div className="relative mb-4">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              placeholder="Поиск задач..."
              value={searchTask}
              onChange={e => setSearchTask(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)]"
            />
          </div>
          {tasksLoading ? (
            <p className="text-center py-10">Загрузка...</p>
          ) : tasksError ? (
            <p className="text-red-400">{tasksError}</p>
          ) : (
            <div className="bg-[var(--color-surface-alt)] rounded-xl border border-[var(--color-border)]">
              {filteredTasks.map(task => (
                <div key={task._id} className="flex items-center justify-between p-4 border-b border-[var(--color-border)] last:border-0">
                  <div>
                    <span className="font-medium">{task.title}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                      task.difficulty === 'BEGINNER' ? 'bg-green-500/10 text-green-400' :
                      task.difficulty === 'INTERMEDIATE' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {task.difficulty === 'BEGINNER' ? 'Начальный' : task.difficulty === 'INTERMEDIATE' ? 'Средний' : 'Высокий'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditTask(task)} className="p-2 hover:bg-[var(--color-border)] rounded-lg transition-colors"><Edit3 size={16} /></button>
                    <button onClick={() => handleDeleteTask(task._id)} className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
              {filteredTasks.length === 0 && <p className="p-4 text-center text-[var(--color-text-muted)]">Задачи не найдены</p>}
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <div className="relative mb-4">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              placeholder="Поиск пользователей..."
              value={searchUser}
              onChange={e => setSearchUser(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)]"
            />
          </div>
          {usersLoading ? (
            <p className="text-center py-10">Загрузка...</p>
          ) : usersError ? (
            <p className="text-red-400">{usersError}</p>
          ) : (
            <div className="bg-[var(--color-surface-alt)] rounded-xl border border-[var(--color-border)]">
              {filteredUsers.map(u => (
                <div key={u._id} className="flex items-center justify-between p-4 border-b border-[var(--color-border)] last:border-0">
                  <div>
                    <span className="font-medium">{u.username}</span>
                    <span className="ml-2 text-xs text-[var(--color-text-muted)]">{u.email}</span>
                    <span className={`ml-2 text-xs ${u.isActive ? 'text-green-400' : 'text-red-400'}`}>
                      {u.isActive ? 'Активен' : 'Заблокирован'}
                    </span>
                    {u.role === 'admin' && <span className="ml-2 text-xs text-brand">Админ</span>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => dispatch(updateUserRole({ userId: u._id, role: u.role === 'admin' ? 'user' : 'admin' }))}
                      className={`p-2 rounded-lg transition-colors ${u.role === 'admin' ? 'bg-brand/20 text-brand' : 'hover:bg-[var(--color-border)]'}`}
                      title={u.role === 'admin' ? 'Сделать пользователем' : 'Сделать админом'}
                    >
                      <Shield size={16} />
                    </button>
                    <button
                      onClick={() => dispatch(toggleUserActive(u._id))}
                      className={`p-2 rounded-lg transition-colors ${!u.isActive ? 'bg-red-500/10 text-red-400' : 'hover:bg-[var(--color-border)]'}`}
                      title={u.isActive ? 'Заблокировать' : 'Разблокировать'}
                    >
                      {u.isActive ? <Lock size={16} /> : <LockOpen size={16} />}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u._id)}
                      className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && <p className="p-4 text-center text-[var(--color-text-muted)]">Пользователи не найдены</p>}
            </div>
          )}
        </div>
      )}

      {/* Модальное окно подтверждения удаления */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={executeDelete}
        title="Подтверждение удаления"
        message={`Вы уверены, что хотите удалить ${confirmDelete?.type === 'task' ? 'задачу' : 'пользователя'}? Это действие необратимо.`}
      />

      {/* Модальное окно уведомлений */}
      <AlertModal
        isOpen={!!alert}
        onClose={() => setAlert(null)}
        title={alert?.title || ''}
        message={alert?.message || ''}
        type={alert?.type || 'info'}
      />
    </div>
  )
}

export default AdminPage