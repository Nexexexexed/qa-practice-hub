import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) return
    axios.get(`http://localhost:3000/api/auth/verify-email?token=${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <div className="max-w-md mx-auto mt-20 text-center">
      {status === 'loading' && <p>Подтверждение email...</p>}
      {status === 'success' && (
        <div>
          <h1 className="text-2xl font-bold text-green-400 mb-4">Email подтверждён!</h1>
          <Link to="/login" className="text-brand hover:underline">Войти</Link>
        </div>
      )}
      {status === 'error' && (
        <div>
          <h1 className="text-2xl font-bold text-red-400 mb-4">Ошибка подтверждения</h1>
          <p>Токен недействителен или истёк.</p>
        </div>
      )}
    </div>
  )
}

export default VerifyEmailPage