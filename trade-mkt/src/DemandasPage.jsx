import { useEffect, useState, useMemo } from 'react'
import {
  ListTodo,
  Plus,
  Search,
  RefreshCw,
  X,
  MoreHorizontal,
  CheckCheck,
  Check
} from 'lucide-react'
import { useAuth } from './AuthProvider'
import {
  listDemandas,
  listUsers,
  createDemanda,
  updateDemanda,
  deleteDemanda
} from './firebaseService'
import {
  Button,
  Chip,
  Dropdown,
  InputGroup,
  TextField
} from '@heroui/react'

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

  /*
   * ============================================================
   * PERMISSÕES
   * ============================================================
   */

  const cargo = (perfil?.cargo || '')
    .toString()
    .trim()
    .toLowerCase()

  const podeCriar =
    cargo === 'gerente' ||
    cargo === 'supervisor' ||
    cargo === 'analista' ||
    cargo === 'colaborador' ||
    cargo === ''

  const podeExcluir =
    cargo === 'gerente' ||
    cargo === 'supervisor'

  const podeGerenciarTodas =
    cargo === 'gerente' ||
    cargo === 'supervisor'

  /*
   * ID do usuário logado
   *
   * Dependendo de como seu AuthProvider está estruturado,
   * o ID pode estar em perfil.id ou perfil.uid.
   */
  const meuId = perfil?.id || perfil?.uid

  /*
   * Verifica se o usuário pode alterar o status da demanda.
   *
   * Gerente e Supervisor:
   * -> podem alterar qualquer demanda.
   *
   * Demais usuários:
   * -> só podem alterar demandas onde estão como responsáveis.
   */
  function podeAlterarStatus(demanda) {
    // Gerente e Supervisor podem alterar qualquer demanda
    if (podeGerenciarTodas) {
      return true
    }

    // Usuário sem ID não pode alterar
    if (!meuId) {
      return false
    }

    // Demanda sem responsáveis
    if (
      !Array.isArray(demanda?.responsaveis) ||
      demanda.responsaveis.length === 0
    ) {
      return false
    }

    return demanda.responsaveis.some((responsavel) => {
      // Caso o Firebase tenha salvo apenas o ID
      if (typeof responsavel === 'string') {
        return responsavel === meuId
      }

      // Caso tenha salvo o objeto completo do usuário
      if (responsavel && typeof responsavel === 'object') {
        return (
          responsavel.id === meuId ||
          responsavel.uid === meuId
        )
      }

      return false
    })
  }

  /*
   * ============================================================
   * CARREGAR DADOS
   * ============================================================
   */

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

  /*
   * ============================================================
   * FILTROS
   * ============================================================
   */

  const filteredDemandas = useMemo(() => {
    return demandas.filter((d) => {
      const termo = search.toLowerCase().trim()

      const matchesSearch =
        !termo ||
        d.titulo?.toLowerCase().includes(termo) ||
        d.descricao?.toLowerCase().includes(termo) ||
        (
          Array.isArray(d.responsaveis) &&
          d.responsaveis.some((responsavel) => {
            const nome =
              typeof responsavel === 'string'
                ? responsavel
                : responsavel?.nome

            return nome?.toLowerCase().includes(termo)
          })
        )

      // Firebase:
      // true  = concluída
      // false = pendente

      let matchesStatus = true

      if (statusFilter === 'concluida') {
        matchesStatus = d.status === true
      }

      if (statusFilter === 'pendente') {
        matchesStatus = d.status === false
      }

      if (statusFilter === 'paramim') {
        matchesStatus =
          Array.isArray(d.responsaveis) &&
          d.responsaveis.some((responsavel) => {
            if (typeof responsavel === 'string') {
              return responsavel === meuId
            }

            return (
              responsavel?.id === meuId ||
              responsavel?.uid === meuId
            )
          })
      }

      return matchesSearch && matchesStatus
    })
  }, [
    demandas,
    search,
    statusFilter,
    meuId
  ])

  /*
   * ============================================================
   * CRIAR DEMANDA
   * ============================================================
   */

  async function handleCreate(e) {
    e.preventDefault()

    if (!titulo.trim()) {
      return
    }

    setSubmitting(true)

    try {
      const selectedUsersList = usuarios.filter((usuario) =>
        selectedResponsaveis.includes(usuario.id)
      )

      await createDemanda({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        status,
        responsaveis: selectedUsersList
      })

      setTitulo('')
      setDescricao('')
      setStatus(false)
      setSelectedResponsaveis([])
      setIsModalOpen(false)

      await loadData()
    } catch (err) {
      console.error('Erro ao criar demanda:', err)
    } finally {
      setSubmitting(false)
    }
  }

  /*
   * ============================================================
   * ENTER NOS CAMPOS DO FORMULÁRIO
   * ============================================================
   */

  function handleFormKeyDown(e) {
    if (e.key !== 'Enter') {
      return
    }

    // Permite Enter dentro do textarea
    if (e.target.tagName === 'TEXTAREA') {
      return
    }

    e.preventDefault()

    const form = e.currentTarget

    const campos = Array.from(
      form.querySelectorAll(
        'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button[type="button"]'
      )
    ).filter((elemento) => {
      return elemento.offsetParent !== null
    })

    const indexAtual = campos.indexOf(e.target)

    if (indexAtual === -1) {
      return
    }

    const proximoCampo = campos[indexAtual + 1]

    if (proximoCampo) {
      proximoCampo.focus()
    }
  }

  /*
   * ============================================================
   * ALTERAR STATUS
   * ============================================================
   */

  async function handleToggleStatus(demanda) {
    // Bloqueia qualquer tentativa de alteração sem permissão
    if (!podeAlterarStatus(demanda)) {
      console.warn(
        'Usuário sem permissão para alterar esta demanda.'
      )
      return
    }

    const novoStatus = demanda.status !== true

    try {
      await updateDemanda(demanda.id, {
        status: novoStatus
      })

      setDemandas((prev) =>
        prev.map((d) =>
          d.id === demanda.id
            ? {
                ...d,
                status: novoStatus
              }
            : d
        )
      )
    } catch (err) {
      console.error(
        'Erro ao atualizar status:',
        err
      )
    }
  }

  /*
   * ============================================================
   * EXCLUIR
   * ============================================================
   */

  async function handleDelete(id) {
    if (
      !window.confirm(
        'Tem certeza que deseja remover esta demanda?'
      )
    ) {
      return
    }

    try {
      await deleteDemanda(id)

      setDemandas((prev) =>
        prev.filter((d) => d.id !== id)
      )
    } catch (err) {
      console.error(
        'Erro ao excluir demanda:',
        err
      )
    }
  }

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div className="space-y-6 scrollbar-none">

      {/* HEADER */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-texto">
              Demandas gerais
            </h1>

            <p className="mt-1 text-sm text-texto-sec max-w-xl">
              Cadastre, atribua e monitore todas as tarefas da equipe em tempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2 sm:pt-0">

            <Button
              isIconOnly
              variant="outline"
              onClick={loadData}
              title="Atualizar dados"
              className="size-10"
            >
              <RefreshCw
                size={26}
                className={
                  loading
                    ? 'animate-spin'
                    : ''
                }
              />
            </Button>

            {podeCriar && (
              <Button
                onClick={() =>
                  setIsModalOpen(true)
                }
                className="flex items-center gap-2 px-5 py-3 hover:scale-105 bg-verdi-hover transition active:scale-95"
              >
                <Plus
                  size={14}
                  className="stroke-[2.5]"
                />

                <span>
                  Nova Demanda
                </span>
              </Button>
            )}

          </div>
        </div>
      </div>

      {/* BUSCA E FILTROS */}
      <div className="flex flex-col scrollbar-none gap-2 px-6 sm:flex-row sm:items-start sm:justify-start rounded-2xl">

        <TextField className="w-full sm:max-w-120 flex-1">
          <InputGroup className="w-full text-texto">
            <InputGroup.Prefix>
              <Search className="size-4 text-slate-500" />
            </InputGroup.Prefix>

            <InputGroup.Input
              placeholder="Buscar demanda por título, descrição ou responsável..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full text-sm placeholder:text-texto-sec"
            />
          </InputGroup>
        </TextField>

        <div className="flex items-center scrollbar-none gap-2 overflow-x-auto rounded-full">

          <Button
            variant="outline"
            onClick={() =>
              setStatusFilter('todas')
            }
            className={`transition ${
              statusFilter === 'todas'
                ? 'bg-verdi-hover text-white'
                : 'text-texto-sec'
            }`}
          >
            Todas as demandas
          </Button>

          <Button
            variant="outline"
            onClick={() =>
              setStatusFilter('paramim')
            }
            className={`transition ${
              statusFilter === 'paramim'
                ? 'bg-verdi-hover text-white'
                : 'text-texto-sec'
            }`}
          >
            Atribuídas a mim
          </Button>

          <Button
            variant="outline"
            onClick={() =>
              setStatusFilter('concluida')
            }
            className={`transition ${
              statusFilter === 'concluida'
                ? 'bg-verdi-hover text-white'
                : 'text-texto-sec'
            }`}
          >
            Concluídas
          </Button>

          <Button
            variant="outline"
            onClick={() =>
              setStatusFilter('pendente')
            }
            className={`transition ${
              statusFilter === 'pendente'
                ? 'bg-verdi-hover text-white'
                : 'text-texto-sec'
            }`}
          >
            Pendentes
          </Button>

        </div>
      </div>

<<<<<<< HEAD
      {/* DEMANDAS */}
      <div className="space-y-3 px-6">

=======
      {/* Demandas Cards Grid */}
      <div className="space-y-3 scrollbar-none overflow-y-auto">
>>>>>>> 662c33d908a9bcb36f6c47cbc37a4dfdd2fda8cf
        {loading ? (

          <div className="py-16 text-center text-slate-500 text-sm flex flex-col items-center gap-2">

            <RefreshCw
              size={28}
              className="animate-spin text-slate-500"
            />

            <span>
              Carregando demandas...
            </span>

          </div>

        ) : filteredDemandas.length === 0 ? (

          <div className="py-16 text-center text-texto text-sm border border-dashed border-texto-sec rounded-3xl p-8 bg-surface">

            <ListTodo
              size={40}
              className="mx-auto mb-3"
            />

            <p className="font-bold text-base">
              Nenhuma demanda encontrada
            </p>

            <p className="text-xs mt-1">
              Crie uma nova demanda ou altere os termos da pesquisa.
            </p>

          </div>

        ) : (

          filteredDemandas.map((demanda) => {

            const podeAlterar =
              podeAlterarStatus(demanda)

            return (
              <div
                key={demanda.id}
                className="flex flex-col gap-4 rounded-2xl p-5 hover:shadow-xl shadow-texto-sec/5 bg-surface transition sm:flex-row sm:items-center sm:justify-between"
              >

                {/* INFORMAÇÕES */}
                <div className="space-y-2 min-w-0 flex-1">

                  <div className="flex items-center gap-2.5 flex-wrap">
<<<<<<< HEAD

                    <p className="text-slate-800">
                      {demanda.titulo}
                    </p>

                    
=======
                    <p className="text-slate-600">{demanda.titulo}</p>
>>>>>>> 662c33d908a9bcb36f6c47cbc37a4dfdd2fda8cf
                  </div>

                  {demanda.descricao && (
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {demanda.descricao}
                    </p>
                  )}

                  {Array.isArray(
                    demanda.responsaveis
                  ) &&
                    demanda.responsaveis.length > 0 && (

                      <div className="flex items-center gap-2 pt-1 text-xs text-slate-400 flex-wrap">

                        <div className="flex items-center gap-1.5 flex-wrap">

                          {demanda.responsaveis.map(
                            (responsavel, index) => {

                              const nome =
                                typeof responsavel === 'string'
                                  ? responsavel
                                  : responsavel?.nome

                              return (
                                <Chip
                                  key={index}
                                  size="md"
                                >
                                  {nome}
                                </Chip>
                              )
                            }
                          )}

                        </div>

                      </div>
                    )}

                </div>

                {/* AÇÕES */}
                <div className="flex items-center justify-end gap-3 sm:border-0 sm:pt-0 shrink-0">

                  {/*
                   * IMPORTANTE:
                   *
                   * Antes estava:
                   *
                   * podeAlterar ? hidden : flex
                   *
                   * Isso estava invertido.
                   *
                   * Agora:
                   *
                   * podeAlterar = true  -> mostra
                   * podeAlterar = false -> esconde
                   */}

                  <div
                    className={
                      podeAlterar
                        ? 'flex'
                        : 'hidden'
                    }
                  >

                    {demanda.status === true ? (

                      <Button
                        onClick={() =>
                          handleToggleStatus(
                            demanda
                          )
                        }
                        isIconOnly
                        className="bg-success text-white"
                        id="concluida"
                        aria-label="Demanda concluída"
                      >
                        <CheckCheck className="size-[20px]" />
                      </Button>

                    ) : (

                      <Button
                        variant="outline"
                        className="text-texto-sec"
                        id="concluir"
                        onClick={() =>
                          handleToggleStatus(
                            demanda
                          )
                        }
                      >
                        <Check className="stroke-[2.5]" />
                        Concluir demanda
                      </Button>

                    )}

                  </div>

                  {/* MENU */}
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

                        {/* CONCLUIR */}
                        {!demanda.status &&
                          podeAlterar && (
                            <Dropdown.Item
                              id="concluir"
                              textValue="Marcar como concluída"
                              onAction={() =>
                                handleToggleStatus(
                                  demanda
                                )
                              }
                            >
                              Marcar como concluída
                            </Dropdown.Item>
                          )}

                        {/* EXCLUIR */}
                        {podeExcluir && (
                          <Dropdown.Item
                            id="excluir"
                            textValue="Excluir demanda"
                            onAction={() =>
                              handleDelete(
                                demanda.id
                              )
                            }
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

      {/* MODAL */}
      {isModalOpen && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 animate-[fadeIn_0.2s_ease-out]">

          <div className="w-full max-w-lg max-h-[80vh] sm:max-h-[90vh] scrollbar-none overflow-y-auto rounded-3xl border border-slate-200 bg-white animate-[modalEnter_0.25s_ease-out]">

            {/* CABEÇALHO */}
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
                onClick={() =>
                  setIsModalOpen(false)
                }
              >
                <X size={18} />
              </Button>

            </div>

            {/* FORM */}
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

                  <InputGroup className="w-full border border-slate-200">

                    <InputGroup.Input
                      required
                      value={titulo}
                      onChange={(e) =>
                        setTitulo(
                          e.target.value
                        )
                      }
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
                  onChange={(e) =>
                    setDescricao(
                      e.target.value
                    )
                  }
                  placeholder="Detalhamento do serviço e requisitos..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-300 outline-none transition focus:ring-2 focus:ring-[#85be2f]/10"
                />

              </div>

              {/* STATUS */}
              <div className="p-2 items-center justify-start gap-2 flex">

                <label className="text-sm mb-1 font-medium text-slate-700">
                  Status inicial
                </label>

                <div className="flex gap-2 justify-start">

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setStatus(false)
                    }
                    className={
                      status === false
                        ? 'border-slate-400 bg-slate-100 text-slate-700 font-semibold'
                        : 'border-slate-200 bg-white text-slate-500'
                    }
                  >
                    Pendente
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setStatus(true)
                    }
                    className={
                      status === true
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-600 font-semibold'
                        : 'border-slate-200 bg-white text-slate-500'
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
                        ? ' selecionado'
                        : ' selecionados'}
                    </Chip>
                  )}

                </div>

                {usuarios.length > 0 ? (

                  <div className="grid sm:grid-cols-2 max-h-64 gap-1 scrollbar-none overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-2">

                    {usuarios.map((usuario) => {

                      const selecionado =
                        selectedResponsaveis.includes(
                          usuario.id
                        )

                      return (

                        <Button
                          key={usuario.id}
                          type="button"
                          variant="outline"
                          onClick={() => {

                            setSelectedResponsaveis(
                              (prev) =>
                                prev.includes(
                                  usuario.id
                                )
                                  ? prev.filter(
                                      (id) =>
                                        id !==
                                        usuario.id
                                    )
                                  : [
                                      ...prev,
                                      usuario.id
                                    ]
                            )
                          }}
                          className={`h-auto w-full min-h-16 justify-start rounded-xl p-3 ${
                            selecionado
                              ? 'border-[#85be2f] bg-[#85be2f]/10'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >

                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              selecionado
                                ? 'bg-[#85be2f] text-white'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {usuario.nome
                              ?.charAt(0)
                              ?.toUpperCase() ||
                              '?'}
                          </div>

                          <div className="min-w-0 flex-1 text-left">

                            <p
                              className={`truncate text-sm font-medium ${
                                selecionado
                                  ? 'text-[#6d9d20]'
                                  : 'text-slate-700'
                              }`}
                            >
                              {usuario.nome}
                            </p>

                            <p className="truncate text-xs text-slate-400">
                              {usuario.cargo ||
                                'Colaborador'}
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
                    onClick={() =>
                      setIsModalOpen(false)
                    }
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
                      ? 'Criando...'
                      : 'Salvar Demanda'}
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
