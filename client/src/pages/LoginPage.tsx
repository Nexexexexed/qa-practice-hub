import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loginUser, clearError } from '../store/authSlice'

const LoginPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error } = useAppSelector((state) => state.auth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearError())
    const result = await dispatch(loginUser({ username, password }))
    if (loginUser.fulfilled.match(result)) {
      navigate('/')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-6">Вход</h1>
      <form onSubmit={handleSubmit} className="bg-[var(--color-surface-alt)] rounded-xl p-6 border border-[var(--color-border)] space-y-4">
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <div>
          <label className="block text-sm text-[var(--color-text-muted)] mb-1">Имя пользователя</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-text)] focus:outline-none focus:border-brand"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--color-text-muted)] mb-1">Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-text)] focus:outline-none focus:border-brand"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand hover:bg-brand-dark text-white py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>
        <p className="text-sm text-[var(--color-text-muted)] text-center">
          Нет аккаунта? <Link to="/register" className="text-brand hover:underline">Зарегистрируйтесь</Link>
        </p>
      </form>
    </div>
  )
}

export default LoginPage