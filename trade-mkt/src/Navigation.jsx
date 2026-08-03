import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Button } from '@heroui/react'
import { Home, ListTodo, LogOut, Menu as MenuIcon, UserRound, Users } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { signOutUser } from './firebaseService'

const links = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/demandas', label: 'Demandas', icon: ListTodo },
  { to: '/grupos', label: 'Grupos', icon: UserRound },
  { to: '/usuarios', label: 'Usuários', icon: Users },
]

const pageMeta = {
  '/': { title: 'Início', description: 'Acompanhe as demandas registradas para a equipe.' },
  '/demandas': { title: 'Demandas', description: 'Cadastre e acompanhe as demandas da operação.' },
  '/grupos': { title: 'Grupos', description: 'Gerencie os grupos e a organização do trabalho.' },
  '/usuarios': { title: 'Usuários', description: 'Cadastre usuários e defina permissões de acesso.' },
}

export default function Navigation() {
  const { perfil } = useAuth()
  const location = useLocation()
  const currentPage = pageMeta[location.pathname] || pageMeta['/']

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-gray-100/90 px-4 py-6 backdrop-blur-sm md:flex">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Trade MKT</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-700">Painel Operacional</h2>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {links.map(link => {
            const Icon = link.icon
            const isActive = location.pathname === link.to

            return (
              <Link
                key={link.to}
                to={link.to}
                aria-label={link.label}
                className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-green-800/80 text-slate-200 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                }`}
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="rounded-2xl border border-slate-200 bg-white/70 p-3 text-sm text-slate-600">
          <p className="font-medium text-slate-700">{perfil?.nome || 'Usuário'}</p>
          <p className="text-slate-500">{perfil?.cargo || 'Colaborador'}</p>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-slate-200 bg-gray-100/60 px-4 py-4 text-slate-700 backdrop-blur-sm sm:px-6 md:ml-64">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="mt-1">
              <h1 className="text-xl font-semibold text-slate-500">{currentPage.title}</h1>
              <p className="text-sm text-slate-400">{currentPage.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden max-w-[140px] truncate text-sm font-medium text-slate-600 sm:block">
              {perfil?.nome || 'Usuário'}
            </span>

            <Menu as="div" className="relative">
              <MenuButton as={Button} isIconOnly variant="flat" className="rounded-full bg-slate-200 text-slate-700">
                <MenuIcon size={18} />
              </MenuButton>

              <MenuItems className="absolute right-0 z-40 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg focus:outline-none">
                <div className="border-b border-slate-100 px-3 py-2">
                  <p className="font-medium text-slate-800">{perfil?.nome || 'Usuário'}</p>
                  <p className="text-sm text-slate-500">{perfil?.cargo || 'Colaborador'}</p>
                </div>

                <MenuItem>
                  {({ close }) => (
                    <button
                      type="button"
                      className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                      onClick={() => {
                        close()
                        signOutUser()
                      }}
                    >
                      <LogOut size={16} />
                      <span>Sair</span>
                    </button>
                  )}
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
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
