import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const token = searchParams.get('token')
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      setStatus('error')
      return
    }
    axios
      .get(`http://localhost:3000/api/auth/verify-email?token=${token}`)
      .then(() => {
        setStatus('success')
        // Перенаправляем на главную через 2 секунды
        setTimeout(() => navigate('/', { replace: true }), 2000)
      })
      .catch(() => setStatus('error'))
  }, [token, navigate])

  return (
    <div className="max-w-md mx-auto mt-20 text-center">
      {status === 'loading' && <p className="text-[var(--color-text-muted)]">Подтверждение email...</p>}

      {status === 'success' && (
        <div>
          <h1 className="text-2xl font-bold text-green-400 mb-2">Email подтверждён!</h1>
          <p className="text-[var(--color-text-muted)]">Сейчас вы будете перенаправлены на главную страницу</p>
          <p className="mt-4">
            <Link to="/" className="text-brand hover:underline">
              Перейти на главную
            </Link>
          </p>
        </div>
      )}

      {status === 'error' && (
        <div>
          <h1 className="text-2xl font-bold text-red-400 mb-4">Ошибка подтверждения</h1>
          <p className="text-[var(--color-text-muted)]">Токен недействителен или истёк.</p>
          <Link to="/login" className="text-brand hover:underline mt-4 inline-block">
            Войти
          </Link>
        </div>
      )}
    </div>
  )
}

export default VerifyEmailPage