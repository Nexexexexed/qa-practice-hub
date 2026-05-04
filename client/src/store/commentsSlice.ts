import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'

interface CommentItem {
  _id: string
  type: 'COMMENT' | 'SOLUTION'
  content: string
  code?: string
  parentId?: string
  userId: { _id: string; username: string }
  likes: string[]
  replies?: CommentItem[]
  createdAt: string
}

interface CommentsState {
  items: CommentItem[]
  activeTab: 'comments' | 'solutions'
  loading: boolean
  error: string | null
}

const initialState: CommentsState = {
  items: [],
  activeTab: 'comments',
  loading: false,
  error: null,
}

export const fetchComments = createAsyncThunk(
  'comments/fetch',
  async ({ taskId, type }: { taskId: string; type: 'COMMENT' | 'SOLUTION' }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/tasks/${taskId}/comments`, { params: { type } })
      return data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Ошибка загрузки комментариев')
    }
  }
)

export const addComment = createAsyncThunk(
  'comments/add',
  async ({ taskId, content, parentId }: { taskId: string; content: string; parentId?: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/tasks/${taskId}/comments`, { content, parentId })
      return data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Ошибка отправки комментария')
    }
  }
)

export const toggleLike = createAsyncThunk(
  'comments/toggleLike',
  async (commentId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/comments/${commentId}/like`)
      return { commentId, ...data }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Ошибка')
    }
  }
)

export const deleteComment = createAsyncThunk(
  'comments/delete',
  async (commentId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/comments/${commentId}`)
      return commentId
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Ошибка удаления')
    }
  }
)

export const publishSolution = createAsyncThunk(
  'comments/publishSolution',
  async ({ taskId, content }: { taskId: string; content: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/tasks/${taskId}/solutions`, { content })
      return data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Ошибка публикации решения')
    }
  }
)

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    setActiveTab: (state, action) => { state.activeTab = action.payload },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(addComment.fulfilled, (state, action) => {
        if (action.payload.parentId) {
          // добавляем ответ в replies родителя
          const parent = state.items.find(c => c._id === action.payload.parentId)
          if (parent) {
            if (!parent.replies) parent.replies = []
            parent.replies.push(action.payload)
          }
        } else {
          state.items.unshift(action.payload)
        }
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const updateLikes = (comments: any[]) => {
          for (const c of comments) {
            if (c._id === action.payload.commentId) {
              c.likes = action.payload.liked 
                ? [...c.likes, 'current'] // временно, обновится при следующей загрузке
                : c.likes.filter((id: string) => id !== 'current')
            }
            if (c.replies) updateLikes(c.replies)
          }
        }
        updateLikes(state.items)
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.items = state.items.filter(c => c._id !== action.payload)
        for (const c of state.items) {
          if (c.replies) c.replies = c.replies.filter((r: any) => r._id !== action.payload)
        }
      })
  },
})

export const { setActiveTab } = commentsSlice.actions
export default commentsSlice.reducer