import { Link } from 'react-router-dom'
import type { Task } from '../store/tasksSlice'
import { Flame } from 'lucide-react'

const difficultyConfig = {
  BEGINNER: { label: 'Начальный', color: 'text-green-400' },
  INTERMEDIATE: { label: 'Средний', color: 'text-yellow-400' },
  ADVANCED: { label: 'Высокий', color: 'text-red-400' },
}

const TaskCard = ({ task }: { task: Task }) => {
  const diff = difficultyConfig[task.difficulty]
  return (
    <Link
      to={`/tasks/${task._id}`}
      className="block bg-[var(--color-surface-alt)] rounded-xl p-5 border border-[var(--color-border)] hover:border-brand transition-all hover:shadow-lg hover:shadow-brand/10"
    >
      <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-4 line-clamp-2">{task.description}</p>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${diff.color}`}>
          <Flame size={14} className="inline mr-1" />
          {diff.label}
        </span>
        <span className="text-xs text-[var(--color-text-muted)]">Подробнее →</span>
      </div>
    </Link>
  )
}

export default TaskCard