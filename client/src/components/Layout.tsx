import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

const Layout = () => (
  <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-text)]">
    <Sidebar />
    <main className="pl-16">
      <div className="p-6">
        <Outlet />
      </div>
    </main>
  </div>
)

export default Layout