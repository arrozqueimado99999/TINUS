import { useEffect, useState, useMemo } from 'react'
import {
  ListTodo,
  Plus,
  Search,
  Filter,
  Trash2,
  UserRound,
  RefreshCw,
  Clock,
  CheckCircle2,
  X,
  AlertCircle,
  ChevronDown,
  MoreVertical,
  MoreHorizontal
} from 'lucide-react'
import { useAuth } from './AuthProvider'
import { listDemandas, listUsers, createDemanda, updateDemanda, deleteDemanda } from './firebaseService'
import { Button, ButtonGroup, Chip, Dropdown, InputGroup, Popover, TextField } from '@heroui/react'

export default function DemandasPage() {
  const { perfil } = useAuth()
  const [demandas, setDemandas] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('todas')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form states
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [status, setStatus] = useState(false)
  const [selectedResponsaveis, setSelectedResponsaveis] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const cargo = (perfil?.cargo || '').toString().trim().toLowerCase()
  const podeCriar = cargo === 'gerente' || cargo === 'supervisor' || cargo === 'analista' || cargo === 'colaborador' || cargo === ''
  const podeExcluir = cargo === 'gerente' || cargo === 'supervisor'

 async function loadData() {
  setLoading(true)

  try {
    const [dems, users] = await Promise.all([
      listDemandas(),
      listUsers()
    ])

    setDemandas(dems || [])
    setUsuarios(users || [])
  } catch (err) {
    console.error('Erro ao carregar demandas:', err)
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
    loadData()
  }, [])

  const filteredDemandas = useMemo(() => {
  return demandas.filter(d => {
    const termo = search.toLowerCase().trim()

    const matchesSearch =
      !termo ||
      d.titulo?.toLowerCase().includes(termo) ||
      d.descricao?.toLowerCase().includes(termo) ||
      (Array.isArray(d.responsaveis) &&
        d.responsaveis.some(r => {
          const nome = typeof r === 'string' ? r : r?.nome
          return nome?.toLowerCase().includes(termo)
        }))

    // Firebase:
    // true  = concluída
    // false = pendente
    const statusBoolean = d.status === true

    let matchesStatus = true

    if (statusFilter === 'concluida') {
      matchesStatus = statusBoolean === true
    }

    if (statusFilter === 'pendente') {
      matchesStatus = statusBoolean === false
    }

    if (statusFilter === 'paramim') {
      const meuId = perfil?.id

      matchesStatus =
        Array.isArray(d.responsaveis) &&
        d.responsaveis.some(r => {
          if (typeof r === 'string') {
            return r === meuId
          }

          return r?.id === meuId
        })
    }

    return matchesSearch && matchesStatus
  })
}, [demandas, search, statusFilter, perfil])

  async function handleCreate(e) {
    e.preventDefault()
    if (!titulo.trim()) return

    setSubmitting(true)
    try {
      const selectedUsersList = usuarios.filter(u => selectedResponsaveis.includes(u.id))
      await createDemanda({
        titulo,
        descricao,
        status,
        responsaveis: selectedUsersList,
      })

      setTitulo('')
      setDescricao('')
      setStatus(false)
      setSelectedResponsaveis([])
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      console.error('Erro ao criar demanda:', err)
    } finally {
      setSubmitting(false)
    }
  }

  function handleFormKeyDown(e) {
  if (e.key !== 'Enter') return

  // Permite Enter dentro do textarea
  if (e.target.tagName === 'TEXTAREA') return

  e.preventDefault()

  const form = e.currentTarget

  const campos = Array.from(
    form.querySelectorAll(
      'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button[type="button"]'
    )
  ).filter(el => {
    return el.offsetParent !== null
  })

  const indexAtual = campos.indexOf(e.target)

  if (indexAtual === -1) return

  const proximoCampo = campos[indexAtual + 1]

  if (proximoCampo) {
    proximoCampo.focus()
  }
}

  async function handleToggleStatus(demanda) {
    const novoStatus = !demanda.status

    try {
      await updateDemanda(demanda.id, {
        status: novoStatus
      })

      setDemandas(prev =>
        prev.map(d =>
          d.id === demanda.id
            ? { ...d, status: novoStatus }
            : d
        )
      )
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
    }
  }

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

  async function handleDelete(id) {
    if (!window.confirm('Tem certeza que deseja remover esta demanda?')) return
    try {
      await deleteDemanda(id)
      setDemandas(prev => prev.filter(d => d.id !== id))
    } catch (err) {
      console.error('Erro ao excluir demanda:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl bg-white border border-[#1c1c1c]/20 p-6">
        <div className='flex flex-col gap-0'>
          <p className=" text-2xl font-bold text-[#1c1c1c]">Demandas gerais</p>
          <p className="text-xs text-slate-400">
            Cadastre, atribua e monitore todas as tarefas da equipe em tempo real.
          </p>
        </div>
        <div className='flex gap-2'>
        {podeCriar && (
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 text-sm bg-[#1c1c1c]  transition shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <Plus size={14} className="stroke-[2.5]" />
            <span>Nova Demanda</span>
          </Button>
          
        )}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-start rounded-2xl">
        {/* Search Input */}
        <TextField className="w-full sm:max-w-120 flex-1">
          <InputGroup className="w-full text-sm text-slate-500 placeholder:text-slate-500"
>
            <InputGroup.Prefix>
              <Search className="size-4 text-slate-500" />
            </InputGroup.Prefix>

            <InputGroup.Input
              placeholder="Buscar demanda por título, descrição ou responsável..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm text-slate-200 placeholder:text-slate-500"
            />
          </InputGroup>
        </TextField>

        
        {/* Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-xl">
          <Button variant="outline"
            onClick={() => setStatusFilter('todas')}
            className={` transition ${
              statusFilter === 'todas' ? 'bg-[#85be2f] text-white' : 'text-slate-400'
            }`}>
            Todas
          </Button>
          <Button variant="outline"
            onClick={() => setStatusFilter('paramim')}
            className={` transition ${
              statusFilter === 'paramim' ? 'bg-[#85be2f] text-white' : 'text-slate-400 '
            }`}>
            Para mim
          </Button>
          <Button variant="outline"
            onClick={() => setStatusFilter('concluida')}
            className={` transition ${
              statusFilter === 'concluida' ? 'bg-[#85be2f] text-white' : 'text-slate-400 '
            }`}>
            Concluídas
          </Button>
        </div>
      </div>

      {/* Demandas Cards Grid */}
      <div className="space-y-3 scrollbar-none overflow-y-auto">
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
            <RefreshCw size={28} className="animate-spin text-slate-500" />
            <span>Carregando demandas...</span>
          </div>
        ) : filteredDemandas.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-3xl p-8 bg-[#121319]">
            <ListTodo size={40} className="mx-auto mb-3 text-slate-600" />
            <p className="font-bold text-slate-300 text-base">Nenhuma demanda encontrada</p>
            <p className="text-xs text-slate-500 mt-1">Crie uma nova demanda ou altere os termos da pesquisa.</p>
          </div>
        ) : (
          filteredDemandas.map(demanda => {
            const currentStatus = demanda.status === true ? 'Concluída' : 'Pendente'
            const prioridade = demanda.prioridade || 'Média'

            const statusBadgeClass =
            demanda.status === true
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-slate-800 text-slate-300 border-slate-700'

            let priorityBadgeClass = 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            if (prioridade.toLowerCase() === 'urgente') {
              priorityBadgeClass = 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            } else if (prioridade.toLowerCase() === 'alta') {
              priorityBadgeClass = 'bg-orange-500/10 text-orange-400 border-orange-500/30'
            }

            return (
              <div
                key={demanda.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate/20 p-5 hover:shadow-xl hover:shadow-gray-100 hover:border-slate/40 transition sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <p className="text-slate-600">{demanda.titulo}</p>
                  </div>

                  {demanda.descricao && (
                    <p className="text-xs text-slate-400 leading-relaxed">{demanda.descricao}</p>
                  )}

                  {Array.isArray(demanda.responsaveis) && demanda.responsaveis.length > 0 && (
                    <div className="flex items-center gap-2 pt-1 text-xs text-slate-400 flex-wrap">

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {demanda.responsaveis.map((r, index) => {
                          const nome = typeof r === 'string' ? r : r.nome
                          return (
                            <Chip
                              key={index}
                              size="md"
                            >
                              {nome}
                            </Chip>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Popover actions: deletar, editar, marcar como concluido */}
                <div className="flex items-center justify-end gap-3 sm:border-0 sm:pt-0 shrink-0">
                    <Button
                      aria-label="Alterar status da demanda"
                      className={
                        demanda.status
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }
                      onClick={() => handleToggleStatus(demanda)}
                    >
                      {demanda.status ? 'Concluída' : 'Pendente'}
                    </Button>

                    <Dropdown>
                      <Button
                        isIconOnly
                        variant="outline"
                        aria-label="Mais opções"
                      >
                        <MoreHorizontal size={18} />
                      </Button>

                      <Dropdown.Popover
                        className="w-56"
                        placement="bottom end"
                      >
                        <Dropdown.Menu>

                          {/* Editar */}
                          <Dropdown.Item
                            id="editar"
                            textValue="Editar demanda"
                            onAction={() => handleEdit(demanda)}
                          >
                            Editar demanda
                          </Dropdown.Item>

                          {/* Concluir */}
                          {demanda.status !== 'concluida' && (
                            <Dropdown.Item
                              id="concluir"
                              textValue="Marcar como concluída"
                              onAction={() => handleConcluir(demanda.id)}
                            >
                              Marcar como concluída
                            </Dropdown.Item>
                          )}

                          {/* Excluir */}
                          {podeExcluir && (
                            <Dropdown.Item
                              id="excluir"
                              textValue="Excluir demanda"
                              onAction={() => handleDelete(demanda.id)}
                            >
                              Excluir demanda
                            </Dropdown.Item>
                          )}

                        </Dropdown.Menu>
                      </Dropdown.Popover>
                    </Dropdown>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal for Creating New Demanda */}
      {isModalOpen && (
  <div
    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4  animate-[fadeIn_0.2s_ease-out]"
  >
    <div
      className="w-full max-w-lg max-h-[80vh] sm:max-h-[90vh] scrollbar-none overflow-y-auto rounded-3xl border border-slate-200 bg-white animate-[modalEnter_0.25s_ease-out]"
    >

      {/* Cabeçalho */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
        <div>
          <div className="flex items-center gap-1">
            <Plus
              size={20}
              className="text-[#85be2f]"
            />

            <h3 className="text-lg font-bold text-slate-800">
              Cadastrar Nova Demanda
            </h3>
          </div>

          <p className="mt-1 text-xs text-slate-400">
            Preencha as informações da nova demanda.
          </p>
        </div>

        <Button
          isIconOnly
          variant="danger-soft"
          type="button"
          onClick={() => setIsModalOpen(false)}>
          <X size={18} />
        </Button>
      </div>

      {/* Conteúdo */}
      <form
        onSubmit={handleCreate}
        onKeyDown={handleFormKeyDown}
        className="space-y-2 p-4"
      >

        {/* TÍTULO */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Título da demanda *
          </label>

          <TextField className="w-full">
            <InputGroup className="w-full border border-slate-200 ">
              <InputGroup.Input
                required
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                placeholder="Ex: Aplicar adesivo da ponta de gôndola"
                className="w-full text-sm placeholder:text-slate-300 text-base"
              />
            </InputGroup>
          </TextField>
        </div>

        {/* DESCRIÇÃO */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Descrição
          </label>

          <textarea
            rows={2}
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            placeholder="Detalhamento do serviço e requisitos..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-300 outline-none transition focus:ring-2 focus:ring-[#85be2f]/10"
          />
        </div>

        {/* STATUS */}
        <div className="p-2 items-center justify-start gap-2 flex">
          <label className="text-sm mb-1 font-medium text-slate-700">
            Status inicial
          </label>

          <div className="flex bg-red gap-2 justify-start">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStatus(false)}
              className={
                status === false
                  ? "border-slate-400 bg-slate-100 text-slate-700 font-semibold"
                  : "border-slate-200 bg-white text-slate-500"
              }
            >
              Pendente
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setStatus(true)}
              className={
                status === true
                  ? "border-emerald-300 bg-emerald-50 text-emerald-600 font-semibold"
                  : "border-slate-200 bg-white text-slate-500"
              }
            >
              Concluída
            </Button>
          </div>
        </div>

        {/* RESPONSÁVEIS */}
        <div>

          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">
              Responsáveis
            </label>

            {selectedResponsaveis.length > 0 && (
              <Chip
                size="sm"
                className="bg-[#85be2f]/10 text-[#6d9d20] px-2"
              >
                {selectedResponsaveis.length}
                {selectedResponsaveis.length === 1
                  ? " selecionado"
                  : " selecionados"}
              </Chip>
            )}
          </div>

          {usuarios.length > 0 ? (

            <div className="grid sm:grid-cols-2 max-h-64 gap-1 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-2 sm:grid-cols-2">

              {usuarios.map(u => {

                const selecionado =
                  selectedResponsaveis.includes(u.id)

                return (
                  <Button
                    key={u.id}
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedResponsaveis(prev =>
                        prev.includes(u.id)
                          ? prev.filter(id => id !== u.id)
                          : [...prev, u.id]
                      )
                    }}
                    className={`h-auto w-full min-h-16 justify-start rounded-xl p-3 ${
                      selecionado
                        ? "border-[#85be2f] bg-[#85be2f]/10"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >

                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        selecionado
                          ? "bg-[#85be2f] text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {u.nome?.charAt(0)?.toUpperCase() || "?"}
                    </div>

                    <div className="min-w-0 flex-1 text-left">
                      <p
                        className={`truncate text-sm font-medium ${
                          selecionado
                            ? "text-[#6d9d20]"
                            : "text-slate-700"
                        }`}
                      >
                        {u.nome}
                      </p>

                      <p className="truncate text-xs text-slate-400">
                        {u.cargo || "Colaborador"}
                      </p>
                    </div>
                  </Button>
                )
              })}

            </div>

          ) : (

            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
              <p className="text-sm text-slate-500">
                Nenhum usuário encontrado.
              </p>
            </div>

          )}

        </div>

        {/* BOTÕES */}
        <div className="bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-sm">

        <div className="flex items-center justify-end gap-2">

          <Button
            type="button"
            variant="outline"
            onClick={() => setIsModalOpen(false)}
            className="border-slate-200 text-slate-600"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            isDisabled={submitting}
            className="bg-[#85be2f] text-white hover:bg-[#75aa28]"
          >
            {submitting
              ? "Criando..."
              : "Salvar Demanda"}
          </Button>

        </div>

      </div>

      </form>
    </div>
  </div>
)}
    </div>
  )
}
