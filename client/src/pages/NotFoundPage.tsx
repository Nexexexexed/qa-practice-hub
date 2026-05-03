import { Link } from 'react-router-dom'

const NotFoundPage = () => (
  <div className="text-center mt-20">
    <h1 className="text-4xl font-bold text-brand mb-4">404</h1>
    <p className="text-[var(--color-text-muted)] mb-6">Страница не найдена</p>
    <Link to="/" className="text-brand hover:underline">На главную</Link>
  </div>
)

export default NotFoundPage