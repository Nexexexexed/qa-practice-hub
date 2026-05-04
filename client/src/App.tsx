import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAppDispatch } from './store/hooks'
import { refreshAccessToken } from './store/authSlice'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import NotFoundPage from './pages/NotFoundPage'
import ProfilePage from './pages/ProfilePage'
import TaskPage from './pages/TaskPage'
import AdminPage from './pages/AdminPage'

function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (localStorage.getItem('refreshToken')) {
      dispatch(refreshAccessToken())
    }
  }, [dispatch])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/tasks/:id" element={<TaskPage />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/admin-panel" element={<AdminPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App