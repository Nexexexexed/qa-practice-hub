import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'

interface CommentItem {
  _id: string
  type: 'COMMENT' | 'SOLUTION'
  content: string
  code?: string
  userId: { _id: string; username: string }
  createdAt: string
  likes: string[]
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
  async ({ taskId, content }: { taskId: string; content: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/tasks/${taskId}/comments`, { content })
      return data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Ошибка отправки комментария')
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
      .addCase(addComment.fulfilled, (state) => {}) // после добавления снова fetchComments
      .addCase(publishSolution.fulfilled, (state) => {})
  },
})

export const { setActiveTab } = commentsSlice.actions
export default commentsSlice.reducer