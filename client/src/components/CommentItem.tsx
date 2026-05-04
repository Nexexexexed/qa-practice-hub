import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addComment, deleteComment, fetchComments, toggleLike } from "../store/commentsSlice";
import { Heart } from "lucide-react";

export const CommentItem = ({ comment, taskId }: { comment: any; taskId: string }) => {
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(s => s.auth)
  const { activeTab } = useAppSelector(s => s.comments)

  const handleLike = () => {
    dispatch(toggleLike(comment._id))
  }

  const handleDelete = async () => {
    if (confirm('Удалить комментарий?')) {
      await dispatch(deleteComment(comment._id))
      dispatch(fetchComments({ taskId, type: activeTab === 'comments' ? 'COMMENT' : 'SOLUTION' }))
    }
  }

  const submitReply = async () => {
    if (!replyText.trim()) return
    await dispatch(addComment({ taskId, content: replyText, parentId: comment._id }))
    setReplyText('')
    setShowReply(false)
    dispatch(fetchComments({ taskId, type: activeTab === 'comments' ? 'COMMENT' : 'SOLUTION' }))
  }

  return (
    <div className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border)]">
      {/* Заголовок комментария */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-brand/20 flex items-center justify-center text-xs text-brand font-bold">
            {comment.userId?.username?.charAt(0).toUpperCase() || '?'}
          </div>
          <span className="text-sm font-medium">{comment.userId?.username}</span>
          {comment.type === 'SOLUTION' && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/30">Решение</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--color-text-muted)]">{new Date(comment.createdAt).toLocaleDateString()}</span>
          {user && (user.id === comment.userId?._id || user.role === 'admin') && (
            <button onClick={handleDelete} className="text-xs text-red-400 hover:text-red-300">Удалить</button>
          )}
        </div>
      </div>
      
      {/* Содержимое */}
      <p className="text-sm text-[var(--color-text)] whitespace-pre-wrap">{comment.content}</p>
      
      {comment.code && (
        <details className="mt-3">
          <summary className="text-xs text-brand cursor-pointer hover:underline">Показать код решения</summary>
          <pre className="mt-2 p-3 bg-black/30 rounded-lg text-xs overflow-x-auto"><code>{comment.code}</code></pre>
        </details>
      )}
      
      {/* Лайк и Ответить */}
      <div className="flex items-center gap-4 mt-3 pt-2 border-t border-[var(--color-border)]">
        <button onClick={handleLike} className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-brand transition-colors">
          <Heart size={14} className={comment.likes?.includes(user?.id || '') ? 'fill-brand text-brand' : ''} />
          {comment.likes?.length || 0}
        </button>
        {user && (
          <button onClick={() => setShowReply(!showReply)} className="text-xs text-[var(--color-text-muted)] hover:text-brand">
            Ответить
          </button>
        )}
      </div>

      {/* Форма ответа */}
      {showReply && (
        <div className="mt-3 flex gap-2">
          <input
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder="Ваш ответ..."
            className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-xs"
          />
          <button onClick={submitReply} className="text-xs bg-brand hover:bg-brand-dark text-white px-3 py-1 rounded-lg">Отправить</button>
        </div>
      )}

      {/* Ответы */}
      {comment.replies?.map((reply: any) => (
        <div key={reply._id} className="ml-8 mt-3 bg-[var(--color-surface)] rounded-xl p-3 border border-[var(--color-border)]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-full bg-brand/20 flex items-center justify-center text-xs text-brand font-bold">
              {reply.userId?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <span className="text-xs font-medium">{reply.userId?.username}</span>
            <span className="text-xs text-[var(--color-text-muted)]">{new Date(reply.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-xs text-[var(--color-text)]">{reply.content}</p>
        </div>
      ))}
    </div>
  )
}