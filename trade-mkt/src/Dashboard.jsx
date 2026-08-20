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
import { Button, Chip, Input } from '@heroui/react'

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
  const concluidasCount = demandas.filter(d => {
    const s = String(d.status || '').toLowerCase()
    return s === 'concluída' || s === 'concluida'
  }).length
  const emAndamentoCount = demandas.filter(d => String(d.status || '').toLowerCase() === 'em andamento').length
  const pendentesCount = demandas.filter(d => {
    const s = String(d.status || '').toLowerCase()
    return !d.status || s === 'pendente'
  }).length
  const urgentesCount = demandas.filter(d => {
    const p = String(d.prioridade || '').toLowerCase()
    return p === 'urgente' || p === 'alta'
  }).length

  const completionRate = totalDemandas > 0 ? Math.round((concluidasCount / totalDemandas) * 100) : 0

  // Filtered demands list
  const filteredDemandas = useMemo(() => {
    return demandas.filter(d => {
      const termo = search.toLowerCase()

      const matchesSearch =
        d.titulo?.toLowerCase().includes(termo) ||
        d.descricao?.toLowerCase().includes(termo) ||
        (Array.isArray(d.responsaveis) &&
          d.responsaveis.some(r =>
            typeof r === 'string'
              ? r.toLowerCase().includes(termo)
              : r.nome?.toLowerCase().includes(termo)
          ))

      const statusStr = String(d.status || 'pendente').toLowerCase()

      let matchesStatus = true

      if (statusFilter === 'pendentes') {
        matchesStatus = !d.status || statusStr === 'pendente'
      } else if (statusFilter === 'em_andamento') {
        matchesStatus = statusStr === 'em andamento'
      } else if (statusFilter === 'concluidas') {
        matchesStatus = statusStr === 'concluída' || statusStr === 'concluida'
      }

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
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">
      {/* Welcome Banner Header */}
<<<<<<< HEAD
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-texto">
              Olá, <span>{userName}</span>
            </h1>
            <p className="mt-1 text-sm text-texto-sec max-w-xl">
=======
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 lg:p-8">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-100/70 pointer-events-none sm:h-64 sm:w-64" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:mt-3 sm:text-3xl">
              Olá, <span className="text-[#1c1c1c]/70">{userName}</span> 
            </h1>
            <p className="mt-1 text-sm text-slate-500 max-w-xl">
>>>>>>> 662c33d908a9bcb36f6c47cbc37a4dfdd2fda8cf
              Acompanhe o andamento das demandas operacionais, distribuição por status e produtividade da equipe.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
            <Button
            isIconOnly
            variant="outline"
              onClick={loadData}
              title="Atualizar dados"
<<<<<<< HEAD
              className="size-10"
            >
              <RefreshCw size={26} className={loading ? 'animate-spin' : ''} />
            </Button>
            {/*<Button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center h-11 gap-2.5 rounded-2xl bg-verdi px-5 py-3 text-sm font-semibold text-texto hover:bg-verdi-hover transition duration-200 active:scale-95"
            >
              <Plus size={18} className="stroke-[2.5]" />
              <span>Nova Demanda</span>
            </Button>*/}
=======
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100 transition active:scale-95"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            {/*<button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2.5 rounded-2xl py-3 text-sm font-semibold text-slate-900 shadow-lg active:scale-95"
            >
              <Plus size={18} className="stroke-[2.5]" />
              <span>Nova Demanda</span>
            </button>*/}
>>>>>>> 662c33d908a9bcb36f6c47cbc37a4dfdd2fda8cf
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
<<<<<<< HEAD
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Total Demandas */}
        <div className="rounded-2xl bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-texto-sec">Total Demandas</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-verdi/10 text-verdi border border-verdi/20">
=======
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Card 1: Total Demandas */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg transition hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Demandas</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20">
>>>>>>> 662c33d908a9bcb36f6c47cbc37a4dfdd2fda8cf
              <ListTodo size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
<<<<<<< HEAD
            <span className="text-3xl font-extrabold text-texto">{totalDemandas}</span>
            <span className="text-xs text-texto-sec">registradas</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-texto-sec border-t border-borda pt-3">
            <span>{pendentesCount} pendentes</span>
=======
            <span className="text-3xl font-extrabold text-slate-800">{totalDemandas}</span>
            <span className="text-xs text-slate-500">registradas</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200 pt-3">
            <span>{pendentesCount} pendentes</span>
            <span className="text-amber-600 font-medium">{urgentesCount} urgentes/altas</span>
>>>>>>> 662c33d908a9bcb36f6c47cbc37a4dfdd2fda8cf
          </div>
        </div>

        {/* Card 2: Concluídas & Taxa */}
<<<<<<< HEAD
        <div className="rounded-2xl bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-texto-sec">Concluídas</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success border border-success/20">
=======
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg transition hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Concluídas</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
>>>>>>> 662c33d908a9bcb36f6c47cbc37a4dfdd2fda8cf
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
<<<<<<< HEAD
            <span className="text-3xl font-extrabold text-texto">{concluidasCount}</span>
            <span className="text-xs font-semibold text-success">({completionRate}% concluído)</span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 space-y-1.5 border-t border-borda pt-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-background">
=======
            <span className="text-3xl font-extrabold text-slate-800">{concluidasCount}</span>
            <span className="text-xs font-semibold text-emerald-600">({completionRate}% concluído)</span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 space-y-1.5 border-t border-slate-200 pt-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
>>>>>>> 662c33d908a9bcb36f6c47cbc37a4dfdd2fda8cf
              <div
                className="h-full rounded-full bg-success transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>
<div className="rounded-2xl bg-surface p-4">
            <h3 className="text-base font-bold text-texto flex items-center gap-2">
              <TrendingUp size={18} className="text-marelo-hover" />
              <span>Distribuição de Status</span>
            </h3>

<<<<<<< HEAD
            <div className="space-y-3">
              {/* Pendentes */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-texto-sec">Pendentes</span>
                  <span className="text-texto">{pendentesCount} ({totalDemandas > 0 ? Math.round((pendentesCount / totalDemandas) * 100) : 0}%)</span>
                </div>
                <div className="h-2 rounded-full bg-background overflow-hidden">
                  <div
                    className="h-full bg-texto-sec rounded-full transition-all duration-300"
                    style={{ width: `${totalDemandas > 0 ? (pendentesCount / totalDemandas) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Concluídas */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-success">Concluídas</span>
                  <span className="text-success">{concluidasCount} ({completionRate}%)</span>
                </div>
                <div className="h-2 rounded-full bg-background overflow-hidden">
                  <div
                    className="h-full bg-success rounded-full transition-all duration-300"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        
        </div>

=======
        
>>>>>>> 662c33d908a9bcb36f6c47cbc37a4dfdd2fda8cf
      {/* Main Content Area: Status Distribution + Demandas Table */}
      <div className="grid min-w-0 gap-5 xl:grid-cols-3">
        {/* Left Column (2 cols): Demandas List & Filters */}
<<<<<<< HEAD
        <div className="lg:col-span-2 space-y-4 hover:shadow-lg transition duration-150">
          <div className="rounded-2xl bg-surface p-4">
            {/* Header with Search and Status Filter Tabs */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
              <div>
                <h2 className="text-lg font-bold text-texto flex items-center gap-2">
                  <Layers size={18} className="text-marelo-hover" />
                  <span>Demandas Recentes</span>
                </h2>
                <p className="text-xs text-texto-sec">Gerencie e atualize o status dos trabalhos em andamento</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto">
                <Button
                                variant="outline"

=======
        <div className="min-w-0 space-y-4 xl:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            {/* Header with Search and Status Filter Tabs */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 sm:text-lg">
                  <Layers size={18} className="text-amber-600" />
                  <span>Demandas Recentes</span>
                </h2>
                <p className="text-xs text-slate-500">Gerencie e atualize o status dos trabalhos em andamento</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-slate-100 p-1 [scrollbar-width:none]">
                <button
>>>>>>> 662c33d908a9bcb36f6c47cbc37a4dfdd2fda8cf
                  onClick={() => setStatusFilter('todas')}
                  className={`px-3 py-1.5 text-xs font-semibold transition ${
                    statusFilter === 'todas'
<<<<<<< HEAD
                      ? 'bg-verdi-hover text-white border-transparent'
                      : 'text-texto-sec'
=======
                      ? 'bg-amber-500 text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
>>>>>>> 662c33d908a9bcb36f6c47cbc37a4dfdd2fda8cf
                  }`}
                >
                  Todas
                </Button>
                <Button
                                variant="outline"

                  onClick={() => setStatusFilter('pendentes')}
                  className={` px-3 py-1.5 text-xs font-semibold transition ${
                    statusFilter === 'pendentes'
<<<<<<< HEAD
                     ? 'bg-verdi-hover text-white border-transparent'
                      : 'text-texto-sec'
                  }`}
                >
                  Pendentes
                </Button>
                
                <Button
                variant="outline"
=======
                      ? 'bg-amber-500 text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Pendentes ({pendentesCount})
                </button>
                <button
                  onClick={() => setStatusFilter('em_andamento')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    statusFilter === 'em_andamento'
                      ? 'bg-amber-500 text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Em Andamento ({emAndamentoCount})
                </button>
                <button
>>>>>>> 662c33d908a9bcb36f6c47cbc37a4dfdd2fda8cf
                  onClick={() => setStatusFilter('concluidas')}
                  className={` px-3 py-1.5 text-xs font-semibold transition ${
                    statusFilter === 'concluidas'
<<<<<<< HEAD
                      ? 'bg-verdi-hover text-white border-transparent'
                      : 'text-texto-sec'
=======
                      ? 'bg-amber-500 text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
>>>>>>> 662c33d908a9bcb36f6c47cbc37a4dfdd2fda8cf
                  }`}
                >
                  Concluídas
                </Button>
              </div>
            </div>

            {/* Search Bar Input */}
            <div className="mt-4 relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-texto-sec" />
              <Input
                placeholder="Buscar por título, descrição ou responsável..."
                value={search}
                onChange={e => setSearch(e.target.value)}
<<<<<<< HEAD
                className="w-full rounded-xl bg-background pl-10 pr-4 py-2.5 text-sm text-texto placeholder-texto-sec outline-none focus:border-verdi focus:ring-1 focus:ring-verdi/30 transition"
=======
                className="w-full min-w-0 rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition"
>>>>>>> 662c33d908a9bcb36f6c47cbc37a4dfdd2fda8cf
              />
            </div>

            {/* Demandas List / Table */}
            <div className="mt-4 space-y-3">
              {loading ? (
<<<<<<< HEAD
                <div className="py-12 text-center text-texto-sec text-sm flex flex-col items-center gap-2">
                  <RefreshCw size={24} className="animate-spin text-marelo-hover" />
                  <span>Carregando demandas...</span>
                </div>
              ) : filteredDemandas.length === 0 ? (
                <div className="py-12 text-center text-texto-sec text-sm border border-dashed border-borda rounded-2xl p-6">
                  <ListTodo size={32} className="mx-auto mb-2 text-texto-sec" />
                  <p className="font-semibold text-texto-sec">Nenhuma demanda encontrada.</p>
                  <p className="text-xs text-texto-sec mt-1">Tente ajustar a busca ou filtro ou crie uma nova demanda.</p>
=======
                <div className="py-12 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
                  <RefreshCw size={24} className="animate-spin text-amber-600" />
                  <span>Carregando demandas...</span>
                </div>
              ) : filteredDemandas.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm border border-dashed border-slate-200 rounded-2xl p-6">
                  <ListTodo size={32} className="mx-auto mb-2 text-slate-600" />
                  <p className="font-semibold text-slate-500">Nenhuma demanda encontrada.</p>
                  <p className="text-xs text-slate-500 mt-1">Tente ajustar a busca ou filtro ou crie uma nova demanda.</p>
>>>>>>> 662c33d908a9bcb36f6c47cbc37a4dfdd2fda8cf
                </div>
              ) : (
                filteredDemandas.slice(0, 8).map(demanda => {
                  const currentStatus = String(demanda.status || 'Pendente')
<<<<<<< HEAD
                  
                  let statusBadgeClass = 'bg-background text-texto-sec border-borda'
                  const statusLower = currentStatus.toLowerCase()
                 
                  return (
                    <div
                      key={demanda.id}
                      className="group flex flex-col gap-3 rounded-2xl bg-background p-4 transition duration-200 border-none hover:border-2 hover:border-verdi sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-texto text-base truncate">{demanda.titulo}</h3>
                                                  </div>
                        {demanda.descricao && (
                          <p className="text-xs text-texto-sec line-clamp-2">{demanda.descricao}</p>
                        )}
                        {Array.isArray(demanda.responsaveis) && demanda.responsaveis.length > 0 && (
                          <div className="flex items-center gap-1.5 pt-1 text-[11px] text-texto-sec">
                            <UserRound size={12} className="text-marelo-hover" />
=======
                  const prioridade = String(demanda.prioridade || 'Média')

                  let statusBadgeClass = 'bg-slate-100 text-slate-600 border-slate-300'
                  const statusLower = currentStatus.toLowerCase()
                  if (statusLower === 'concluída' || statusLower === 'concluida') {
                    statusBadgeClass = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                  } else if (statusLower === 'em andamento') {
                    statusBadgeClass = 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                  } else if (statusLower === 'pendente') {
                    statusBadgeClass = 'bg-slate-100 text-slate-600 border-slate-300'
                  }

                  let priorityBadgeClass = 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                  const prioridadeLower = prioridade.toLowerCase()
                  if (prioridadeLower === 'urgente') {
                    priorityBadgeClass = 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                  } else if (prioridadeLower === 'alta') {
                    priorityBadgeClass = 'bg-orange-500/10 text-orange-600 border-orange-500/30'
                  }

                  return (
                    <div
                      key={demanda.id}
                      className="group flex min-w-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:border-slate-300 hover:bg-slate-100 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="min-w-0 truncate font-bold text-slate-800 text-sm sm:text-base">{demanda.titulo}</h3>
                          <span className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${priorityBadgeClass}`}>
                            {prioridade}
                          </span>
                        </div>
                        {demanda.descricao && (
                          <p className="text-xs text-slate-500 line-clamp-2">{demanda.descricao}</p>
                        )}
                        {Array.isArray(demanda.responsaveis) && demanda.responsaveis.length > 0 && (
                          <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-500">
                            <UserRound size={12} className="text-amber-600" />
>>>>>>> 662c33d908a9bcb36f6c47cbc37a4dfdd2fda8cf
                            <span>
                              {demanda.responsaveis
                                .map(r => (typeof r === 'string' ? r : r.nome))
                                .join(', ')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Status Selector & Actions */}
<<<<<<< HEAD
                      <div className="flex items-center gap-2 border-t border-borda pt-2 sm:border-0 sm:pt-0 shrink-0">
                        <Chip>
                          {currentStatus}
                        </Chip>
=======
                      <div className="flex items-center gap-2 border-t border-slate-200 pt-2 sm:border-0 sm:pt-0 shrink-0">
                        <select
                          value={currentStatus}
                          onChange={e => handleStatusChange(demanda.id, e.target.value)}
                          className={`rounded-xl border px-3 py-1.5 text-xs font-semibold outline-none transition cursor-pointer ${statusBadgeClass}`}
                        >
                          <option value="Pendente" className="bg-slate-50 text-slate-600">Pendente</option>
                          <option value="Em Andamento" className="bg-slate-50 text-amber-600">Em Andamento</option>
                          <option value="Concluída" className="bg-slate-50 text-emerald-600">Concluída</option>
                          <option value="Cancelada" className="bg-slate-50 text-rose-600">Cancelada</option>
                        </select>

                        <button
                          onClick={() => handleDeleteDemanda(demanda.id)}
                          title="Remover"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-rose-500/20 hover:text-rose-600 transition"
                        >
                          <Trash2 size={15} />
                        </button>
>>>>>>> 662c33d908a9bcb36f6c47cbc37a4dfdd2fda8cf
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {filteredDemandas.length > 8 && (
<<<<<<< HEAD
              <div className="mt-4 pt-3 border-t border-borda text-center">
                <Link to="/demandas" className="text-xs font-semibold text-marelo-hover hover:underline inline-flex items-center gap-1">
=======
              <div className="mt-4 pt-3 border-t border-slate-200 text-center">
                <Link to="/demandas" className="text-xs font-semibold text-amber-600 hover:underline inline-flex items-center gap-1">
>>>>>>> 662c33d908a9bcb36f6c47cbc37a4dfdd2fda8cf
                  Ver todas as demandas ({filteredDemandas.length}) <ArrowUpRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Status Metrics & Team Overview */}
<<<<<<< HEAD
        <div className="space-y-6">
          
          {/* Equipes e Usuários Resumo */}
          <div className="rounded-2xl bg-surface p-5 hover:shadow-lg transition duration-150 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-texto flex items-center gap-2">
                <Users size={18} className="text-marelo-hover" />
                <span>Membros da Equipe</span>
              </h3>
              <Button variant="ghost" to="/usuarios" className="text-xs text-marelo-hover">
=======
        <div className="w-full min-w-0 space-y-5 sm:space-y-6">
          {/* Status Distribution Panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4 sm:p-5">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-amber-600" />
              <span>Distribuição de Status</span>
            </h3>

            <div className="space-y-3">
              {/* Pendentes */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-slate-500">Pendentes</span>
                  <span className="text-slate-600">{pendentesCount} ({totalDemandas > 0 ? Math.round((pendentesCount / totalDemandas) * 100) : 0}%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-slate-500 rounded-full transition-all duration-300"
                    style={{ width: `${totalDemandas > 0 ? (pendentesCount / totalDemandas) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Em Andamento */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-amber-600">Em Andamento</span>
                  <span className="text-amber-600">{emAndamentoCount} ({totalDemandas > 0 ? Math.round((emAndamentoCount / totalDemandas) * 100) : 0}%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${totalDemandas > 0 ? (emAndamentoCount / totalDemandas) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Concluídas */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-emerald-600">Concluídas</span>
                  <span className="text-emerald-600">{concluidasCount} ({completionRate}%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Equipes e Usuários Resumo */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4 sm:p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Users size={18} className="text-amber-600" />
                <span>Membros da Equipe</span>
              </h3>
              <Link to="/usuarios" className="text-xs text-amber-600 hover:underline">
>>>>>>> 662c33d908a9bcb36f6c47cbc37a4dfdd2fda8cf
                Gerenciar
              </Button>
            </div>

            <div className="space-y-2.5">
              {usuarios.slice(0, 5).map(u => (
<<<<<<< HEAD
                <div key={u.id} className="flex items-center justify-between rounded-xl bg-background p-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-marelo/10 text-xs font-bold text-marelo-hover border border-marelo/20">
                      {u.nome ? u.nome.substring(0, 2).toUpperCase() : 'US'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-texto truncate">{u.nome}</p>
                      <p className="text-[10px] text-texto-sec truncate">{u.cargo || 'Colaborador'}</p>
=======
                <div key={u.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-200">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-xs font-bold text-amber-600 border border-amber-500/20">
                      {u.nome ? u.nome.substring(0, 2).toUpperCase() : 'US'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{u.nome}</p>
                      <p className="text-[10px] text-slate-500 truncate">{u.cargo || 'Colaborador'}</p>
>>>>>>> 662c33d908a9bcb36f6c47cbc37a4dfdd2fda8cf
                    </div>
                  </div>
                </div>
              ))}
              {usuarios.length === 0 && (
                <p className="text-xs text-texto-sec py-2 text-center">Nenhum membro listado.</p>
              )}
            </div>
          </div>
        </div>
      </div>

<<<<<<< HEAD
=======
      {/* Quick Demanda Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-3 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl space-y-4 sm:rounded-3xl sm:p-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 sm:text-lg">
                <Plus className="text-amber-600" size={20} />
                <span>Criar Nova Demanda</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateQuickDemanda} className="space-y-4">
              <div>
                <label htmlFor="modal-titulo" className="block text-xs font-medium text-slate-600 mb-1">
                  Título da demanda *
                </label>
                <input
                  id="modal-titulo"
                  type="text"
                  required
                  placeholder="Ex: Campanha de Trade MKT loja Centro"
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label htmlFor="modal-desc" className="block text-xs font-medium text-slate-600 mb-1">
                  Descrição detalhada
                </label>
                <textarea
                  id="modal-desc"
                  rows={3}
                  placeholder="Forneça instruções e metas para esta demanda..."
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-amber-500/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="modal-prioridade" className="block text-xs font-medium text-slate-600 mb-1">
                    Prioridade
                  </label>
                  <select
                    id="modal-prioridade"
                    value={prioridade}
                    onChange={e => setPrioridade(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-amber-500/50"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="modal-status" className="block text-xs font-medium text-slate-600 mb-1">
                    Status inicial
                  </label>
                  <select
                    id="modal-status"
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-amber-500/50"
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
                  <label htmlFor="modal-resp" className="block text-xs font-medium text-slate-600 mb-1">
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-700 outline-none focus:border-amber-500/50 h-24"
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

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-slate-900 hover:bg-amber-400 transition disabled:opacity-50"
                >
                  {submitting ? 'Salvando...' : 'Criar Demanda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
>>>>>>> 662c33d908a9bcb36f6c47cbc37a4dfdd2fda8cf
    </div>
  )
}