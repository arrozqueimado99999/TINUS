import { Button } from '@heroui/react'
import { Home, ListTodo, Users, UserRound } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { signOutUser } from './firebaseService'

const links = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/demandas', label: 'Demandas', icon: ListTodo },
  { to: '/grupos', label: 'Grupos', icon: UserRound },
  { to: '/usuarios', label: 'Usuários', icon: Users },
]

export default function Navigation() {
  const { perfil } = useAuth()
  const location = useLocation()

  return (
    <>
      <header className="sticky top-0 z-20 hidden items-center justify-between border-b border-slate-200 bg-gray-100/90 px-4 py-3 text-slate-700 shadow-sm backdrop-blur sm:flex sm:px-6">
        <Link to="/" className="text-lg font-semibold text-slate-800">
          Trade MKT
        </Link>
        <div className="flex items-center gap-2">
          <span className="max-w-[120px] truncate text-sm text-slate-600">
            {perfil?.nome || 'Usuário'}
          </span>
          <Button size="sm" variant="flat" onClick={signOutUser} className="bg-slate-200 text-slate-700">
            Sair
          </Button>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-gray-100/30 px-2 py-2 backdrop-blur-sm sm:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around gap-1">
          {links.map(link => {
            const Icon = link.icon
            const isActive = location.pathname === link.to

            return (
              <Link
                key={link.to}
                to={link.to}
                aria-label={link.label}
                className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-medium transition ${
                  isActive
                    ? 'bg-green-800/80 text-slate-200 shadow-xl'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                }`}
              >
                <Icon size={16} />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
