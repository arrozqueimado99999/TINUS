import { useState } from 'react'
import { Home, ListTodo, LogOut, Menu, Asterisk, UserRound, Users, X, Shield, Sparkles } from 'lucide-react'
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
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-300 shadow-lg shadow-[#1c1c1c]/10 bg-[#F8F8F8]/60 px-2 py-3 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Abrir menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1c1c1c] font-bold text-[#575c53] shadow-md shadow-amber-500/10">
            <Asterisk size={78} className="animate-slow-spin" />
          </div>
          <div>
            
            <h1 className="text-sm text-gray-600 font-bold">TINUS</h1>
            <p className="text-[10px] text-slate-400">Trade Marketing | Relacionamento</p>
          </div>
        </div>
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
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between border-r border-slate-800/80 bg-[#121215] p-4 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="mb-8 flex items-center justify-between px-2 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 font-black text-slate-950 shadow-lg shadow-amber-500/20">
                <Sparkles size={20} className="fill-slate-950" />
              </div>
              <div>
                <span className="text-base font-bold tracking-wider text-white">TINUS</span>
                <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Sistema Ativo</span>
                </div>
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
          <nav className="flex flex-col gap-1.5">
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Menu Principal
            </p>
            {visibleLinks.map(link => {
              const Icon = link.icon
              const isActive = location.pathname === link.to

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent text-amber-400 border-l-2 border-amber-400 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <Icon
                    size={19}
                    className={`transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="border-t border-slate-800/80 pt-4 mt-auto">
          <div className="flex items-center justify-between rounded-xl bg-slate-900/90 p-3 border border-slate-800/60 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-xs font-bold text-amber-300 border border-amber-500/30">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">{userName}</p>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Shield size={11} className="text-amber-400 shrink-0" />
                  <span className="truncate">{userCargoDisplay}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => signOutUser()}
              title="Sair da conta"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
