import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Code2, LogIn, UserPlus, LogOut, Shield } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { logoutUser } from '../store/authSlice'

const Sidebar = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)
  const location = useLocation()

  const handleLogout = () => {
    dispatch(logoutUser())
    navigate('/login')
  }

  const linkClass = (path: string) =>
    `group relative flex items-center justify-center h-12 w-12 mx-auto rounded-xl transition-all duration-200 ${
      location.pathname === path
        ? 'bg-brand text-white shadow-lg shadow-brand/30'
        : 'text-[var(--color-text-muted)] hover:bg-[var(--color-border)] hover:text-white'
    }`

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
    <Link to={to} className={linkClass(to)}>
      <Icon size={20} />
      <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-[var(--color-surface-alt)] text-[var(--color-text)] text-sm px-3 py-1.5 rounded-lg border border-[var(--color-border)] shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50
        before:content-[''] before:absolute before:left-[-6px] before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-r-[var(--color-border)]">
        {label}
      </span>
    </Link>
  )

  return (
    <aside className="fixed left-0 top-0 h-full w-16 bg-[var(--color-surface-alt)] border-r border-[var(--color-border)] flex flex-col items-center py-4 z-50">
      {/* Логотип */}
      <div className="mb-6">
        <div className="w-11 h-11 rounded-2xl bg-brand/10 border border-brand/30 flex items-center justify-center text-brand text-xl font-bold">
          QA
        </div>
      </div>

      {/* Главная навигация */}
      <nav className="flex-1 flex flex-col items-center space-y-2">
        <NavItem to="/" icon={Code2} label="Задачи" />
        {user?.role === 'admin' && (
          <NavItem to="/admin-panel" icon={Shield} label="Админ-панель" />
        )}
      </nav>

      {/* Нижняя часть */}
      <div className="flex flex-col items-center space-y-2 mt-auto">
        {!user ? (
          <>
            <NavItem to="/login" icon={LogIn} label="Вход" />
            <NavItem to="/register" icon={UserPlus} label="Регистрация" />
          </>
        ) : (
          <>
            <Link to="/profile" className="group relative mb-2" title="Профиль">
              <div className="w-10 h-10 rounded-full bg-brand/20 border-2 border-brand flex items-center justify-center text-white text-sm font-bold hover:bg-brand transition-colors">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span className="absolute left-12 top-1/2 -translate-y-1/2 bg-[var(--color-surface-alt)] text-[var(--color-text)] text-sm px-3 py-1.5 rounded-lg border border-[var(--color-border)] shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50
                before:content-[''] before:absolute before:left-[-6px] before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-r-[var(--color-border)]">
                Профиль
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="group relative flex items-center justify-center h-12 w-12 mx-auto rounded-xl text-[var(--color-text-muted)] hover:bg-red-500/10 hover:text-red-400 transition-all"
              title="Выход"
            >
              <LogOut size={20} />
              <span className="absolute left-12 top-1/2 -translate-y-1/2 bg-[var(--color-surface-alt)] text-[var(--color-text)] text-sm px-3 py-1.5 rounded-lg border border-[var(--color-border)] shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50
                before:content-[''] before:absolute before:left-[-6px] before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-r-[var(--color-border)]">
                Выход
              </span>
            </button>
          </>
        )}
      </div>
    </aside>
  )
}

export default Sidebar