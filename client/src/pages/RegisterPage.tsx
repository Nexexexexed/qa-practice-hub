import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { registerUser, clearError } from '../store/authSlice'

const RegisterPage = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error } = useAppSelector((state) => state.auth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearError())

    if (password !== confirmPassword) {
      alert('Пароли не совпадают')
      return
    }

    const result = await dispatch(registerUser({ username, email, password }))
    if (registerUser.fulfilled.match(result)) {
      navigate('/')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-6">Регистрация</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-[var(--color-surface-alt)] rounded-xl p-6 border border-[var(--color-border)] space-y-4"
      >
        {error && <div className="text-red-400 text-sm">{error}</div>}

        <div>
          <label className="block text-sm text-[var(--color-text-muted)] mb-1">
            Имя пользователя
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-text)] focus:outline-none focus:border-brand"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-[var(--color-text-muted)] mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-text)] focus:outline-none focus:border-brand"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-[var(--color-text-muted)] mb-1">
            Пароль
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-text)] focus:outline-none focus:border-brand"
            required
            minLength={6}
          />
        </div>

        <div>
          <label className="block text-sm text-[var(--color-text-muted)] mb-1">
            Подтвердите пароль
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-text)] focus:outline-none focus:border-brand"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand hover:bg-brand-dark text-white py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>

        <p className="text-sm text-[var(--color-text-muted)] text-center">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-brand hover:underline">
            Войти
          </Link>
        </p>
      </form>
    </div>
  )
}

export default RegisterPage