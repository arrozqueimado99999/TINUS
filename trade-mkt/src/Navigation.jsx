import { useState } from 'react'
import { Home, ListTodo, LogOut, Menu, Asterisk, UserRound, Users, X, Shield, Sparkles, BetweenVerticalEnd } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { signOutUser } from './firebaseService'
import { Button } from '@heroui/react'

const links = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/demandas', label: 'Demandas', icon: ListTodo },
  { to: '/usuarios', label: 'Usuários', icon: Users },
]

export default function Navigation() {
  const { user, perfil } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const cargo = (perfil?.cargo || '').toString().trim().toLowerCase()
  const podeGerenciarUsuarios = cargo === 'gerente' || cargo === 'supervisor'
  const visibleLinks = links.filter(link => link.to !== '/usuarios' || podeGerenciarUsuarios)

  const userName = perfil?.nome || user?.displayName || user?.email?.split('@')[0] || 'Usuário'
  const userInitials = userName.substring(0, 2).toUpperCase()
  const userCargoDisplay = perfil?.cargo ? perfil.cargo.charAt(0).toUpperCase() + perfil.cargo.slice(1) : 'Colaborador'

  return (
    <>
      {/* Top bar for Mobile screens */}
      <header className="sticky top-0 z-30 flex items-center px-6 justify-between border-b border-borda shadow-lg shadow-borda/20 bg-surface/30 px-2 py-3 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2 ">
          <Button isIconOnly variant="ghost" onClick={() => setMobileOpen(!mobileOpen)}
>
        <BetweenVerticalEnd size={30} className="fill-texto-sec text-texto-sec" />

          </Button>
          <div>
<h1 className="text-sm text-gray-600 font-bold">TINUS</h1>
            <p className="text-[10px] text-texto-sec">Trade Marketing | Realcionamento</p>
          </div>
        </div>
        <Button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Abrir menu"
              isIconOnly
              className="bg-borda text-texto"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
<<<<<<< HEAD
=======
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1c1c1c] font-bold text-[#575c53] shadow-md shadow-amber-500/10">
            <Asterisk size={78} className="animate-slow-spin" />
          </div>
          <div>
            
            <h1 className="text-sm text-gray-600 font-bold">TINUS</h1>
            <p className="text-[10px] text-slate-400">Trade Marketing | Relacionamento</p>
          </div>
        </div>
>>>>>>> 662c33d908a9bcb36f6c47cbc37a4dfdd2fda8cf
      </header>

      {/* Mobile Menu Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between bg-texto p-4 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="mb-8 flex items-center justify-between px-2 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex bg-texto-sec h-10 w-10 items-center justify-center rounded-2xl bg-borda text-texto shadow-lg">
                <BetweenVerticalEnd size={20} className="fill-texto" />
              </div>
              <div>
                <span className="text-base font-bold tracking-wider text-white">TINUS</span>
<<<<<<< HEAD

=======
                <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Sistema Ativo</span>
                </div>
>>>>>>> 662c33d908a9bcb36f6c47cbc37a4dfdd2fda8cf
              </div>
            </div>

            {/* Close button on mobile drawer */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Fechar menu"
              className="text-slate-400 hover:text-white md:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col px-2 gap-1.5">
            
            {visibleLinks.map(link => {
              const Icon = link.icon
              const isActive = location.pathname === link.to

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`group flex items-center gap-3 rounded-full px-3.5 py-3 text-sm text-borda transition-all duration-200 ${
                    isActive
                      ? 'bg-verdi font-bold text-texto'
                      : 'text-borda/50 font-light  hover:text-slate-200'
                  }`}
                >
                  <Icon
                    size={19}
                    className={`transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-texto' : 'text-borda/50 group-hover:text-white'
                    }`}
                  />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className=" pt-4 mt-auto">
          <div className="flex items-center justify-between rounded-full p-3 border border-borda/20 shadow-lg">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-verdi bg-verdi-hover/40 text-verdi">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">{userName}</p>
                <div className="flex items-center gap-1 text-[11px] text-borda">
                  <span className="truncate">{userCargoDisplay}</span>
                </div>
              </div>
            </div>

            <Button
            isIconOnly
              onClick={() => signOutUser()}
              title="Sair da conta"
              className="bg-red-300 text-danger"
            >
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
