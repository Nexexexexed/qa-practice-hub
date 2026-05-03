import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'
import axios from 'axios'


interface User {
  id: string
  username: string
  role: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  loading: false,
  error: null,
}

export const refreshAccessToken = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) return rejectWithValue('No refresh token')
    try {
      const { data } = await axios.post('http://localhost:3000/api/auth/refresh', { refreshToken })
      localStorage.setItem('accessToken', data.accessToken)
      // Загружаем профиль пользователя с новым токеном
      const userRes = await api.get('/auth/me')
      return { accessToken: data.accessToken, user: userRes.data.user }
    } catch (err: any) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      return rejectWithValue('Session expired')
    }
  }
)

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', credentials)
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      return data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Login failed')
    }
  }
)


export const updateUsername = createAsyncThunk(
  'auth/updateUsername',
  async (newUsername: string, { rejectWithValue }) => {
    try {
      const { data } = await api.put('/auth/me', { username: newUsername })
      return data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Update failed')
    }
  }
)

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwords: { oldPassword: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/change-password', passwords)
      return data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Password change failed')
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: { username: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register', userData)
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      return data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Registration failed')
    }
  }
)

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  const refreshToken = localStorage.getItem('refreshToken')
  if (refreshToken) {
    await api.post('/auth/logout', { refreshToken })
  }
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.accessToken = null
        state.refreshToken = null
      })
      .addCase(refreshAccessToken.pending, (state) => { state.loading = true })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.refreshToken = localStorage.getItem('refreshToken')
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.loading = false
        state.user = null
        state.accessToken = null
        state.refreshToken = null
      })
      .addCase(updateUsername.fulfilled, (state, action) => {
        if (state.user) state.user.username = action.payload.username
      })
      .addCase(changePassword.fulfilled, (state) => {
        console.log(state)
      })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer