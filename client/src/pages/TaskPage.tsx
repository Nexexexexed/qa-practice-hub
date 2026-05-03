// TaskPage.tsx – замените полностью

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import {
  Play, RotateCcw, MessageSquare, Lightbulb, Send, Lock,
  CheckCircle, XCircle, Flame, X
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  fetchTaskDetail,
  runTaskTest,
  updateCode,
  resetCode as resetReduxCode,
  clearTask,
  setShowPublish
  } from '../store/taskDetailSlice'
import {
  fetchComments,
  addComment,
  publishSolution,
  setActiveTab,
} from '../store/commentsSlice'

const TaskPage = () => {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const { task, code, result, polling, showPublish, loading, error } = useAppSelector(s => s.taskDetail)
  const { items: comments, activeTab, loading: commentsLoading } = useAppSelector(s => s.comments)
  const { user } = useAppSelector(s => s.auth)

  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [publishComment, setPublishComment] = useState('')

  useEffect(() => {
    if (id) dispatch(fetchTaskDetail(id))
    return () => { dispatch(clearTask()) }
  }, [id, dispatch])

  useEffect(() => {
    if (id) dispatch(fetchComments({ taskId: id, type: activeTab === 'comments' ? 'COMMENT' : 'SOLUTION' }))
  }, [id, activeTab, dispatch])


  const handleRun = () => {
    if (!user || !id) return
    dispatch(runTaskTest({ taskId: id, code }))
  }

  const handleReset = () => dispatch(resetReduxCode())

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !id) return
    setSubmitting(true)
    await dispatch(addComment({ taskId: id, content: newComment }))
    setNewComment('')
    setSubmitting(false)
  }

    const handlePublish = async () => {
    if (!publishComment.trim() || !id) return
    setSubmitting(true)
    try {
        await dispatch(publishSolution({ taskId: id, content: publishComment }))
        setSubmitting(false)
        setShowPublishModal(false)
        // Скрываем кнопку после успешной публикации
        dispatch(setShowPublish(false)) // если нужно, добавьте этот экшен в слайс (уже есть clearTask?)
        dispatch(fetchComments({ taskId: id, type: 'SOLUTION' }))
    } catch (err: any) {
        setSubmitting(false)
        alert(err?.message || 'Ошибка при публикации')
    }
    }

  if (loading || !task) return <div className="text-center mt-20">Загрузка...</div>
  if (error) return <div className="text-red-500">{error}</div>

  const isPassed = result !== null && result.totalTests > 0 && result.passedTests === result.totalTests

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Уровень 1: Название */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-xl ${
            task.difficulty === 'BEGINNER' ? 'bg-green-500/10 text-green-400' :
            task.difficulty === 'INTERMEDIATE' ? 'bg-yellow-500/10 text-yellow-400' :
            'bg-red-500/10 text-red-400'
          }`}>
            <Flame size={20} />
          </div>
          <h1 className="text-3xl font-bold">{task.title}</h1>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          task.difficulty === 'BEGINNER' ? 'bg-green-500/10 text-green-400' :
          task.difficulty === 'INTERMEDIATE' ? 'bg-yellow-500/10 text-yellow-400' :
          'bg-red-500/10 text-red-400'
        }`}>
          {task.difficulty === 'BEGINNER' ? 'Начальный' : task.difficulty === 'INTERMEDIATE' ? 'Средний' : 'Высокий'}
        </span>
      </div>

      {/* Уровень 2: Редактор + описание/превью/результат */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 min-h-[300px] border border-[var(--color-border)] rounded-xl overflow-hidden mb-4">
            <Editor
              height="100%"
              language="javascript"
              theme="vs-dark"
              value={code}
              onChange={(val) => dispatch(updateCode(val || ''))}
              options={{ fontSize: 14, minimap: { enabled: false } }}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRun}
              disabled={polling || !user}
              className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg disabled:opacity-50"
            >
              <Play size={16} /> {polling ? 'Выполнение...' : 'Запустить тест'}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 border border-[var(--color-border)] hover:bg-[var(--color-border)] rounded-lg"
            >
              <RotateCcw size={16} /> Сбросить
            </button>
            {!user && (
              <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                <Lock size={14} /> Войдите для запуска
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="bg-[var(--color-surface-alt)] rounded-xl p-5 border border-[var(--color-border)]">
            <h2 className="font-semibold mb-2 text-sm text-[var(--color-text-muted)]">Описание</h2>
            <p className="text-sm text-[var(--color-text)] whitespace-pre-wrap">{task.description}</p>
          </div>

          <div className="border border-[var(--color-border)] rounded-xl overflow-hidden flex-1 min-h-[200px]">
            <div className="bg-[var(--color-surface-alt)] px-4 py-2 text-xs text-[var(--color-text-muted)] border-b">
              Предпросмотр интерфейса
            </div>
            <iframe
              srcDoc={task.htmlContent}
              className="w-full h-[calc(100%-36px)]"
              sandbox="allow-scripts"
              title="preview"
            />
          </div>

        {/* Результат */}
        <div className={`bg-[var(--color-surface-alt)] rounded-xl p-4 border ${
            !result ? 'border-[var(--color-border)]' :
            isPassed ? 'border-green-500/30' : 'border-red-500/30'
            }`}>
            {/* Заголовок состояния */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                {polling ? (
                    <>
                    <div className="w-4 h-4 animate-pulse rounded-full bg-brand/30" />
                    <span className="font-semibold">Тесты выполняются...</span>
                    </>
                ) : result ? (
                    <>
                    {isPassed ? <CheckCircle className="text-green-400" size={18} /> : <XCircle className="text-red-400" size={18} />}
                    <span className="font-semibold">{isPassed ? 'Все тесты пройдены!' : 'Тесты не пройдены'}</span>
                    <span className="text-sm text-[var(--color-text-muted)]">
                        ({result.passedTests}/{result.totalTests})
                    </span>
                    </>
                ) : (
                    <>
                    <div className="w-4 h-4" />
                    <span className="font-semibold">Тесты не запущены</span>
                    </>
                )}
                </div>
                {isPassed && showPublish && !polling && (
                <button
                    onClick={() => setShowPublishModal(true)}
                    className="flex items-center gap-1 px-3 py-1 bg-brand/20 text-brand rounded-lg hover:bg-brand/30 transition-colors text-sm"
                >
                    <Lightbulb size={14} /> Опубликовать решение
                </button>
                )}
            </div>

            {/* Блок логов */}
            <pre className="text-xs text-gray-400 bg-[var(--color-surface)] p-2 rounded mt-2 overflow-auto max-h-24 whitespace-pre-wrap font-mono">
                {result
                ? result.errorLog || result.output || '// здесь будут логи вашего решения'
                : '// здесь будут логи вашего решения'
                }
            </pre>
            </div>
            </div>
        </div>

      {/* Уровень 3: Комментарии и Решения */}
      <div className="bg-[var(--color-surface-alt)] rounded-xl border border-[var(--color-border)] flex flex-col h-[400px]">
        <div className="flex border-b border-[var(--color-border)]">
          <button
            onClick={() => dispatch(setActiveTab('comments'))}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'comments' ? 'text-brand border-b-2 border-brand bg-brand/5' : 'text-[var(--color-text-muted)] hover:text-white'}`}
          >
            <MessageSquare size={16} className="inline mr-2" /> Комментарии
          </button>
          <button
            onClick={() => dispatch(setActiveTab('solutions'))}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'solutions' ? 'text-brand border-b-2 border-brand bg-brand/5' : 'text-[var(--color-text-muted)] hover:text-white'}`}
          >
            <Lightbulb size={16} className="inline mr-2" /> Решения
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {commentsLoading && <p className="text-sm text-[var(--color-text-muted)] text-center">Загрузка...</p>}
          {!commentsLoading && comments.length === 0 && (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-6">
              {activeTab === 'comments' ? 'Пока нет комментариев' : 'Никто ещё не опубликовал решение'}
            </p>
          )}
          {comments.map(c => (
            <div key={c._id} className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-brand/20 flex items-center justify-center text-xs text-brand font-bold">
                    {c.userId?.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <span className="text-sm font-medium">{c.userId?.username}</span>
                  {c.type === 'SOLUTION' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/30">Решение</span>
                  )}
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-[var(--color-text)] whitespace-pre-wrap">{c.content}</p>
              {c.code && (
                <details className="mt-3">
                  <summary className="text-xs text-brand cursor-pointer hover:underline">Показать код решения</summary>
                  <pre className="mt-2 p-3 bg-black/30 rounded-lg text-xs overflow-x-auto"><code>{c.code}</code></pre>
                </details>
              )}
            </div>
          ))}
        </div>
        {user && activeTab === 'comments' && (
          <div className="border-t border-[var(--color-border)] p-4">
            <div className="flex gap-3">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Написать комментарий..."
                rows={2}
                className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-2 text-sm resize-none"
              />
              <button
                onClick={handleSubmitComment}
                disabled={submitting || !newComment.trim()}
                className="self-end px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
              >
                <Send size={16} /> Отправить
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно публикации */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--color-surface-alt)] rounded-xl p-6 w-full max-w-2xl border border-[var(--color-border)]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Публикация решения</h3>
              <button onClick={() => setShowPublishModal(false)}><X size={20} /></button>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] mb-3">Ваш код (будет опубликован вместе с решением):</p>
            <pre className="bg-[var(--color-surface)] p-4 rounded-lg text-sm mb-4 max-h-60 overflow-auto"><code>{code}</code></pre>
            <textarea
              value={publishComment}
              onChange={e => setPublishComment(e.target.value)}
              placeholder="Опишите ваше решение..."
              rows={4}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-3 mb-4 text-sm resize-none"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-border)] transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handlePublish}
                disabled={submitting || !publishComment.trim()}
                className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg disabled:opacity-50"
              >
                {submitting ? 'Публикация...' : 'Опубликовать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskPage