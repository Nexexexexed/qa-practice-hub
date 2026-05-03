import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'
import type { Task } from './tasksSlice'
import type { RootState } from './store'

interface SolutionResult {
  totalTests: number
  passedTests: number
  output: string
  errorLog: string
  executionTimeMs: number
}

interface TaskDetailState {
  task: Task | null
  code: string
  result: SolutionResult | null
  polling: boolean
  showPublish: boolean
  loading: boolean
  error: string | null
}

const initialState: TaskDetailState = {
  task: null,
  code: '',
  result: null,
  polling: false,
  showPublish: false,
  loading: false,
  error: null,
}

export const fetchTaskDetail = createAsyncThunk(
  'taskDetail/fetch',
  async (taskId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/tasks/${taskId}`)
      return data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Не удалось загрузить задачу')
    }
  }
)

export const runTaskTest = createAsyncThunk<
  SolutionResult,
  { taskId: string; code: string },
  { rejectValue: string }
>(
  'taskDetail/runTest',
  async ({ taskId, code }, { rejectWithValue }) => {
    try {
      const { data: runData } = await api.post(`/tasks/${taskId}/run`, { code })
      const solutionId = runData.solutionId

      let result: SolutionResult | null = null
      while (!result) {
        const { data: sol } = await api.get(`/solutions/${solutionId}`)
        if (sol.status !== 'PENDING' && sol.status !== 'RUNNING') {
          result = sol.result
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      return result
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Ошибка запуска теста')
    }
  }
)

const taskDetailSlice = createSlice({
  name: 'taskDetail',
  initialState,
  reducers: {
    updateCode: (state, action) => { state.code = action.payload },
    resetCode: (state) => { state.code = state.task?.starterCode || '' },
    clearResult: (state) => { state.result = null },
    clearTask: () => initialState,
    setShowPublish: (state, action) => { state.showPublish = action.payload }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTaskDetail.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchTaskDetail.fulfilled, (state, action) => {
        state.loading = false
        state.task = action.payload
        state.code = action.payload.starterCode || ''
        state.result = null
        state.showPublish = false
      })
      .addCase(fetchTaskDetail.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(runTaskTest.pending, (state) => {
        state.polling = true
        state.result = null
        state.showPublish = false
      })
      .addCase(runTaskTest.fulfilled, (state, action) => {
        state.polling = false
        state.result = action.payload
        // Показывать кнопку, если все тесты пройдены
        state.showPublish = action.payload.passedTests === action.payload.totalTests && action.payload.totalTests > 0
      })
      .addCase(runTaskTest.rejected, (state) => {
        state.polling = false
      })
  },
})

export const { updateCode, resetCode, clearResult, clearTask,setShowPublish } = taskDetailSlice.actions
export default taskDetailSlice.reducer