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
    <div className="space-y-6">
      {/* Welcome Banner Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-texto">
              Olá, <span>{userName}</span>
            </h1>
            <p className="mt-1 text-sm text-texto-sec max-w-xl">
              Acompanhe o andamento das demandas operacionais, distribuição por status e produtividade da equipe.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
            <Button
            isIconOnly
            variant="outline"
              onClick={loadData}
              title="Atualizar dados"
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
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Total Demandas */}
        <div className="rounded-2xl bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-texto-sec">Total Demandas</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-verdi/10 text-verdi border border-verdi/20">
              <ListTodo size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-texto">{totalDemandas}</span>
            <span className="text-xs text-texto-sec">registradas</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-texto-sec border-t border-borda pt-3">
            <span>{pendentesCount} pendentes</span>
          </div>
        </div>

        {/* Card 2: Concluídas & Taxa */}
        <div className="rounded-2xl bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-texto-sec">Concluídas</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success border border-success/20">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-texto">{concluidasCount}</span>
            <span className="text-xs font-semibold text-success">({completionRate}% concluído)</span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 space-y-1.5 border-t border-borda pt-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-background">
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

      {/* Main Content Area: Status Distribution + Demandas Table */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2 cols): Demandas List & Filters */}
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

                  onClick={() => setStatusFilter('todas')}
                  className={`px-3 py-1.5 text-xs font-semibold transition ${
                    statusFilter === 'todas'
                      ? 'bg-verdi-hover text-white border-transparent'
                      : 'text-texto-sec'
                  }`}
                >
                  Todas
                </Button>
                <Button
                                variant="outline"

                  onClick={() => setStatusFilter('pendentes')}
                  className={` px-3 py-1.5 text-xs font-semibold transition ${
                    statusFilter === 'pendentes'
                     ? 'bg-verdi-hover text-white border-transparent'
                      : 'text-texto-sec'
                  }`}
                >
                  Pendentes
                </Button>
                
                <Button
                variant="outline"
                  onClick={() => setStatusFilter('concluidas')}
                  className={` px-3 py-1.5 text-xs font-semibold transition ${
                    statusFilter === 'concluidas'
                      ? 'bg-verdi-hover text-white border-transparent'
                      : 'text-texto-sec'
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
                className="w-full rounded-xl bg-background pl-10 pr-4 py-2.5 text-sm text-texto placeholder-texto-sec outline-none focus:border-verdi focus:ring-1 focus:ring-verdi/30 transition"
              />
            </div>

            {/* Demandas List / Table */}
            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="py-12 text-center text-texto-sec text-sm flex flex-col items-center gap-2">
                  <RefreshCw size={24} className="animate-spin text-marelo-hover" />
                  <span>Carregando demandas...</span>
                </div>
              ) : filteredDemandas.length === 0 ? (
                <div className="py-12 text-center text-texto-sec text-sm border border-dashed border-borda rounded-2xl p-6">
                  <ListTodo size={32} className="mx-auto mb-2 text-texto-sec" />
                  <p className="font-semibold text-texto-sec">Nenhuma demanda encontrada.</p>
                  <p className="text-xs text-texto-sec mt-1">Tente ajustar a busca ou filtro ou crie uma nova demanda.</p>
                </div>
              ) : (
                filteredDemandas.slice(0, 8).map(demanda => {
                  const currentStatus = String(demanda.status || 'Pendente')
                  
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
                            <span>
                              {demanda.responsaveis
                                .map(r => (typeof r === 'string' ? r : r.nome))
                                .join(', ')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Status Selector & Actions */}
                      <div className="flex items-center gap-2 border-t border-borda pt-2 sm:border-0 sm:pt-0 shrink-0">
                        <Chip>
                          {currentStatus}
                        </Chip>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {filteredDemandas.length > 8 && (
              <div className="mt-4 pt-3 border-t border-borda text-center">
                <Link to="/demandas" className="text-xs font-semibold text-marelo-hover hover:underline inline-flex items-center gap-1">
                  Ver todas as demandas ({filteredDemandas.length}) <ArrowUpRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Status Metrics & Team Overview */}
        <div className="space-y-6">
          
          {/* Equipes e Usuários Resumo */}
          <div className="rounded-2xl bg-surface p-5 hover:shadow-lg transition duration-150 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-texto flex items-center gap-2">
                <Users size={18} className="text-marelo-hover" />
                <span>Membros da Equipe</span>
              </h3>
              <Button variant="ghost" to="/usuarios" className="text-xs text-marelo-hover">
                Gerenciar
              </Button>
            </div>

            <div className="space-y-2.5">
              {usuarios.slice(0, 5).map(u => (
                <div key={u.id} className="flex items-center justify-between rounded-xl bg-background p-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-marelo/10 text-xs font-bold text-marelo-hover border border-marelo/20">
                      {u.nome ? u.nome.substring(0, 2).toUpperCase() : 'US'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-texto truncate">{u.nome}</p>
                      <p className="text-[10px] text-texto-sec truncate">{u.cargo || 'Colaborador'}</p>
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

    </div>
  )
}