import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'

export interface Task {
  _id: string
  title: string
  description: string
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  htmlContent: string
  starterCode: string
  status: string
}

interface TasksState {
  items: Task[]
  loading: boolean
  error: string | null
}

const initialState: TasksState = {
  items: [],
  loading: false,
  error: null,
}

export const fetchTasks = createAsyncThunk('tasks/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/tasks')
    return data
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || 'Failed to load tasks')
  }
})

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export default tasksSlice.reducer