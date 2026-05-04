import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'

interface User {
  _id: string
  username: string
  email: string
  role: 'user' | 'admin'
  isActive: boolean
  emailVerified: boolean
}

interface AdminState {
  users: User[]
  loading: boolean
  error: string | null
}

const initialState: AdminState = {
  users: [],
  loading: false,
  error: null,
}

export const fetchUsers = createAsyncThunk('admin/fetchUsers', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/admin/users')
    return data
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || 'Ошибка загрузки пользователей')
  }
})

export const updateUserRole = createAsyncThunk(
  'admin/updateRole',
  async ({ userId, role }: { userId: string; role: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/users/${userId}/role`, { role })
      return data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Ошибка')
    }
  }
)

export const toggleUserActive = createAsyncThunk(
  'admin/toggleActive',
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/users/${userId}/toggle-active`)
      return data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Ошибка')
    }
  }
)

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/users/${userId}`)
      return userId
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Ошибка')
    }
  }
)

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const idx = state.users.findIndex(u => u._id === action.payload._id)
        if (idx > -1) state.users[idx] = action.payload
      })
      .addCase(toggleUserActive.fulfilled, (state, action) => {
        const idx = state.users.findIndex(u => u._id === action.payload._id)
        if (idx > -1) state.users[idx].isActive = action.payload.isActive
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u._id !== action.payload)
      })
  },
})

export default adminSlice.reducer