import { useEffect, useState, useMemo } from 'react'
import {
  ListTodo,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Users,
  UserRound,
  Sparkles,
  TrendingUp,
  Filter,
  ArrowUpRight,
  RefreshCw,
  Trash2,
  Check,
  ChevronDown,
  X,
  Layers
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { listDemandas, listGrupos, listUsers, createDemanda, updateDemanda, deleteDemanda } from './firebaseService'

export default function Dashboard() {
  const { user, perfil } = useAuth()
  const [demandas, setDemandas] = useState([])
  const [grupos, setGrupos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('todas')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // New Demand Form State
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [prioridade, setPrioridade] = useState('Média')
  const [status, setStatus] = useState('Pendente')
  const [selectedResponsaveis, setSelectedResponsaveis] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const cargo = (perfil?.cargo || '').toString().trim().toLowerCase()
  const podeCriar = cargo === 'gerente' || cargo === 'supervisor' || cargo === 'analista' || cargo === 'colaborador' || cargo === ''
  const userName = perfil?.nome || user?.displayName || user?.email?.split('@')[0] || 'Usuário'

  async function loadData() {
    setLoading(true)
    try {
      const [demList, grupList, userList] = await Promise.all([
        listDemandas(),
        listGrupos(),
        listUsers(),
      ])
      setDemandas(demList || [])
      setGrupos(grupList || [])
      setUsuarios(userList || [])
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Stat computations
  const totalDemandas = demandas.length
  const concluidasCount = demandas.filter(d => (d.status || '').toLowerCase() === 'concluída' || (d.status || '').toLowerCase() === 'concluida').length
  const emAndamentoCount = demandas.filter(d => (d.status || '').toLowerCase() === 'em andamento').length
  const pendentesCount = demandas.filter(d => !d.status || (d.status || '').toLowerCase() === 'pendente').length
  const urgentesCount = demandas.filter(d => (d.prioridade || '').toLowerCase() === 'urgente' || (d.prioridade || '').toLowerCase() === 'alta').length

  const completionRate = totalDemandas > 0 ? Math.round((concluidasCount / totalDemandas) * 100) : 0

  // Filtered demands list
  const filteredDemandas = useMemo(() => {
    return demandas.filter(d => {
      const matchesSearch =
        d.titulo?.toLowerCase().includes(search.toLowerCase()) ||
        d.descricao?.toLowerCase().includes(search.toLowerCase()) ||
        (Array.isArray(d.responsaveis) &&
          d.responsaveis.some(r =>
            typeof r === 'string'
              ? r.toLowerCase().includes(search.toLowerCase())
              : r.nome?.toLowerCase().includes(search.toLowerCase())
          ))

      const statusLower = (d.status || 'pendente').toLowerCase()
      let matchesStatus = true
      if (statusFilter === 'pendentes') matchesStatus = statusLower === 'pendente'
      else if (statusFilter === 'em_andamento') matchesStatus = statusLower === 'em andamento'
      else if (statusFilter === 'concluidas') matchesStatus = statusLower === 'concluída' || statusLower === 'concluida'

      return matchesSearch && matchesStatus
    })
  }, [demandas, search, statusFilter])

  async function handleStatusChange(demandaId, newStatus) {
    try {
      await updateDemanda(demandaId, { status: newStatus })
      setDemandas(prev =>
        prev.map(d => (d.id === demandaId ? { ...d, status: newStatus } : d))
      )
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
    }
  }

  async function handleDeleteDemanda(demandaId) {
    if (!window.confirm('Tem certeza que deseja remover esta demanda?')) return
    try {
      await deleteDemanda(demandaId)
      setDemandas(prev => prev.filter(d => d.id !== demandaId))
    } catch (err) {
      console.error('Erro ao remover demanda:', err)
    }
  }

  async function handleCreateQuickDemanda(e) {
    e.preventDefault()
    if (!titulo.trim()) return

    setSubmitting(true)
    try {
      const selectedUsersList = usuarios.filter(u => selectedResponsaveis.includes(u.id))
      await createDemanda({
        titulo,
        descricao,
        prioridade,
        status,
        responsaveis: selectedUsersList,
      })

      setTitulo('')
      setDescricao('')
      setPrioridade('Média')
      setStatus('Pendente')
      setSelectedResponsaveis([])
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      console.error('Erro ao criar demanda:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Olá, <span className="text-[#2v2v2v]">{userName}</span> 👋
            </h1>
            <p className="mt-1 text-sm text-slate-400 max-w-xl">
              Acompanhe o andamento das demandas operacionais, distribuição por status e produtividade da equipe.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
            <button
              onClick={loadData}
              title="Atualizar dados"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800 transition active:scale-95"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition duration-200 active:scale-95"
            >
              <Plus size={18} className="stroke-[2.5]" />
              <span>Nova Demanda</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Demandas */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#121319] p-5 shadow-lg transition hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Demandas</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ListTodo size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{totalDemandas}</span>
            <span className="text-xs text-slate-400">registradas</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60 pt-3">
            <span>{pendentesCount} pendentes</span>
            <span className="text-amber-400 font-medium">{urgentesCount} urgentes/altas</span>
          </div>
        </div>

        {/* Card 2: Concluídas & Taxa */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#121319] p-5 shadow-lg transition hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Concluídas</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{concluidasCount}</span>
            <span className="text-xs font-semibold text-emerald-400">({completionRate}% concluído)</span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 space-y-1.5 border-t border-slate-800/60 pt-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Em Andamento */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#121319] p-5 shadow-lg transition hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Em Andamento</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{emAndamentoCount}</span>
            <span className="text-xs text-amber-400 font-medium">em execução</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60 pt-3">
            <span>Acompanhamento ativo</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <TrendingUp size={12} /> Ativo
            </span>
          </div>
        </div>

        {/* Card 4: Equipe & Grupos */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#121319] p-5 shadow-lg transition hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Grupos & Equipe</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{usuarios.length}</span>
            <span className="text-xs text-slate-400">colaboradores</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60 pt-3">
            <span>{grupos.length} grupos cadastrados</span>
            <Link to="/grupos" className="text-purple-400 hover:underline flex items-center gap-0.5">
              Ver <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area: Status Distribution + Demandas Table */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2 cols): Demandas List & Filters */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-slate-800/80 bg-[#121319] p-5 shadow-lg">
            {/* Header with Search and Status Filter Tabs */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers size={18} className="text-amber-400" />
                  <span>Demandas Recentes</span>
                </h2>
                <p className="text-xs text-slate-400">Gerencie e atualize o status dos trabalhos em andamento</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto rounded-xl bg-slate-900/90 p-1 border border-slate-800">
                <button
                  onClick={() => setStatusFilter('todas')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    statusFilter === 'todas'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Todas ({totalDemandas})
                </button>
                <button
                  onClick={() => setStatusFilter('pendentes')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    statusFilter === 'pendentes'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pendentes ({pendentesCount})
                </button>
                <button
                  onClick={() => setStatusFilter('em_andamento')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    statusFilter === 'em_andamento'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Em Andamento ({emAndamentoCount})
                </button>
                <button
                  onClick={() => setStatusFilter('concluidas')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    statusFilter === 'concluidas'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Concluídas ({concluidasCount})
                </button>
              </div>
            </div>

            {/* Search Bar Input */}
            <div className="mt-4 relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por título, descrição ou responsável..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition"
              />
            </div>

            {/* Demandas List / Table */}
            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="py-12 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
                  <RefreshCw size={24} className="animate-spin text-amber-400" />
                  <span>Carregando demandas...</span>
                </div>
              ) : filteredDemandas.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-2xl p-6">
                  <ListTodo size={32} className="mx-auto mb-2 text-slate-600" />
                  <p className="font-semibold text-slate-400">Nenhuma demanda encontrada.</p>
                  <p className="text-xs text-slate-500 mt-1">Tente ajustar a busca ou filtro ou crie uma nova demanda.</p>
                </div>
              ) : (
                filteredDemandas.slice(0, 8).map(demanda => {
                  const currentStatus = demanda.status || 'Pendente'
                  const prioridade = demanda.prioridade || 'Média'

                  let statusBadgeClass = 'bg-slate-800 text-slate-300 border-slate-700'
                  if (currentStatus.toLowerCase() === 'concluída' || currentStatus.toLowerCase() === 'concluida') {
                    statusBadgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  } else if (currentStatus.toLowerCase() === 'em andamento') {
                    statusBadgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  } else if (currentStatus.toLowerCase() === 'pendente') {
                    statusBadgeClass = 'bg-slate-800/90 text-slate-400 border-slate-700/80'
                  }

                  let priorityBadgeClass = 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  if (prioridade.toLowerCase() === 'urgente') {
                    priorityBadgeClass = 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  } else if (prioridade.toLowerCase() === 'alta') {
                    priorityBadgeClass = 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                  }

                  return (
                    <div
                      key={demanda.id}
                      className="group flex flex-col gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 transition duration-200 hover:border-slate-700 hover:bg-slate-900/90 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-white text-base truncate">{demanda.titulo}</h3>
                          <span className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${priorityBadgeClass}`}>
                            {prioridade}
                          </span>
                        </div>
                        {demanda.descricao && (
                          <p className="text-xs text-slate-400 line-clamp-2">{demanda.descricao}</p>
                        )}
                        {Array.isArray(demanda.responsaveis) && demanda.responsaveis.length > 0 && (
                          <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-400">
                            <UserRound size={12} className="text-amber-400" />
                            <span>
                              {demanda.responsaveis
                                .map(r => (typeof r === 'string' ? r : r.nome))
                                .join(', ')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Status Selector & Actions */}
                      <div className="flex items-center gap-2 border-t border-slate-800/80 pt-2 sm:border-0 sm:pt-0 shrink-0">
                        <select
                          value={currentStatus}
                          onChange={e => handleStatusChange(demanda.id, e.target.value)}
                          className={`rounded-xl border px-3 py-1.5 text-xs font-semibold outline-none transition cursor-pointer ${statusBadgeClass}`}
                        >
                          <option value="Pendente" className="bg-slate-900 text-slate-300">Pendente</option>
                          <option value="Em Andamento" className="bg-slate-900 text-amber-400">Em Andamento</option>
                          <option value="Concluída" className="bg-slate-900 text-emerald-400">Concluída</option>
                          <option value="Cancelada" className="bg-slate-900 text-rose-400">Cancelada</option>
                        </select>

                        <button
                          onClick={() => handleDeleteDemanda(demanda.id)}
                          title="Remover"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-rose-500/20 hover:text-rose-400 transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {filteredDemandas.length > 8 && (
              <div className="mt-4 pt-3 border-t border-slate-800 text-center">
                <Link to="/demandas" className="text-xs font-semibold text-amber-400 hover:underline inline-flex items-center gap-1">
                  Ver todas as demandas ({filteredDemandas.length}) <ArrowUpRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Status Metrics & Team Overview */}
        <div className="space-y-6">
          {/* Status Distribution Panel */}
          <div className="rounded-2xl border border-slate-800/80 bg-[#121319] p-5 shadow-lg space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-amber-400" />
              <span>Distribuição de Status</span>
            </h3>

            <div className="space-y-3">
              {/* Pendentes */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-slate-400">Pendentes</span>
                  <span className="text-slate-300">{pendentesCount} ({totalDemandas > 0 ? Math.round((pendentesCount / totalDemandas) * 100) : 0}%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-slate-500 rounded-full transition-all duration-300"
                    style={{ width: `${totalDemandas > 0 ? (pendentesCount / totalDemandas) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Em Andamento */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-amber-400">Em Andamento</span>
                  <span className="text-amber-300">{emAndamentoCount} ({totalDemandas > 0 ? Math.round((emAndamentoCount / totalDemandas) * 100) : 0}%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${totalDemandas > 0 ? (emAndamentoCount / totalDemandas) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Concluídas */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-emerald-400">Concluídas</span>
                  <span className="text-emerald-300">{concluidasCount} ({completionRate}%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Equipes e Usuários Resumo */}
          <div className="rounded-2xl border border-slate-800/80 bg-[#121319] p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users size={18} className="text-amber-400" />
                <span>Membros da Equipe</span>
              </h3>
              <Link to="/usuarios" className="text-xs text-amber-400 hover:underline">
                Gerenciar
              </Link>
            </div>

            <div className="space-y-2.5">
              {usuarios.slice(0, 5).map(u => (
                <div key={u.id} className="flex items-center justify-between rounded-xl bg-slate-900/60 p-2.5 border border-slate-800/60">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-xs font-bold text-amber-400 border border-amber-500/20">
                      {u.nome ? u.nome.substring(0, 2).toUpperCase() : 'US'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{u.nome}</p>
                      <p className="text-[10px] text-slate-400 truncate">{u.cargo || 'Colaborador'}</p>
                    </div>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" title="Ativo" />
                </div>
              ))}
              {usuarios.length === 0 && (
                <p className="text-xs text-slate-500 py-2 text-center">Nenhum membro listado.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Demanda Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-[#14151c] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="text-amber-400" size={20} />
                <span>Criar Nova Demanda</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateQuickDemanda} className="space-y-4">
              <div>
                <label htmlFor="modal-titulo" className="block text-xs font-medium text-slate-300 mb-1">
                  Título da demanda *
                </label>
                <input
                  id="modal-titulo"
                  type="text"
                  required
                  placeholder="Ex: Campanha de Trade MKT loja Centro"
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label htmlFor="modal-desc" className="block text-xs font-medium text-slate-300 mb-1">
                  Descrição detalhada
                </label>
                <textarea
                  id="modal-desc"
                  rows={3}
                  placeholder="Forneça instruções e metas para esta demanda..."
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-amber-500/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="modal-prioridade" className="block text-xs font-medium text-slate-300 mb-1">
                    Prioridade
                  </label>
                  <select
                    id="modal-prioridade"
                    value={prioridade}
                    onChange={e => setPrioridade(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500/50"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="modal-status" className="block text-xs font-medium text-slate-300 mb-1">
                    Status inicial
                  </label>
                  <select
                    id="modal-status"
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500/50"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Concluída">Concluída</option>
                  </select>
                </div>
              </div>

              {/* Responsáveis Select */}
              {usuarios.length > 0 && (
                <div>
                  <label htmlFor="modal-resp" className="block text-xs font-medium text-slate-300 mb-1">
                    Atribuir a responsáveis
                  </label>
                  <select
                    id="modal-resp"
                    multiple
                    value={selectedResponsaveis}
                    onChange={e => {
                      const values = Array.from(e.target.selectedOptions, opt => opt.value)
                      setSelectedResponsaveis(values)
                    }}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2 text-xs text-slate-200 outline-none focus:border-amber-500/50 h-24"
                  >
                    {usuarios.map(u => (
                      <option key={u.id} value={u.id} className="p-1">
                        {u.nome} ({u.cargo || 'Colaborador'})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">Segure Ctrl (ou Cmd) para selecionar múltiplos membros.</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition disabled:opacity-50"
                >
                  {submitting ? 'Salvando...' : 'Criar Demanda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
