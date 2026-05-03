import { useEffect, useState, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchTasks } from '../store/tasksSlice'
import TaskCard from '../components/TaskCard'
import { Search } from 'lucide-react'

const difficulties = ['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const

const HomePage = () => {
  const dispatch = useAppDispatch()
  const { items, loading, error } = useAppSelector((state) => state.tasks)
  const [filter, setFilter] = useState<string>('ALL')
  const [search, setSearch] = useState('')

  useEffect(() => {
    dispatch(fetchTasks())
  }, [dispatch])

  const filtered = useMemo(() => {
    let result = items
    if (filter !== 'ALL') result = result.filter(t => t.difficulty === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
    }
    return result
  }, [items, filter, search])

  if (loading) return <div className="text-center mt-20 text-[var(--color-text-muted)]">Загрузка задач...</div>
  if (error) return <div className="text-center mt-20 text-red-400">Ошибка: {error}</div>

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Каталог задач</h1>
        <p className="text-[var(--color-text-muted)]">Выберите задачу и отточите навыки автоматизации UI</p>
      </div>

      {/* Поиск и фильтр */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Поиск по названию или описанию..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-brand"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {difficulties.map(d => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === d
                  ? 'bg-brand text-white'
                  : 'bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]'
              }`}
            >
              {d === 'ALL' ? 'Все' : d === 'BEGINNER' ? 'Начальные' : d === 'INTERMEDIATE' ? 'Средние' : 'Высокие'}
            </button>
          ))}
        </div>
      </div>

      {/* Сетка задач */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-[var(--color-text-muted)]">
          Задачи не найдены. Попробуйте изменить параметры поиска.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(task => <TaskCard key={task._id} task={task} />)}
        </div>
      )}
    </div>
  )
}

export default HomePage