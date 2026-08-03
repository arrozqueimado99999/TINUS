import { useEffect, useState } from 'react'
import { Button, Input, Label } from '@heroui/react'
import { Plus, UserRoundPlus } from 'lucide-react'
import { useAuth } from './AuthProvider'
import { listUsers, createUserProfile, deleteUserProfile } from './firebaseService'

export default function UsuariosPage() {
  const { perfil } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [cargo, setCargo] = useState('colaborador')
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const podeCriar = true
  const podeGerenciar = true

  useEffect(() => {
    async function load() {
      setUsuarios(await listUsers())
    }
    load()
  }, [])

  async function handleCreate(event) {
    event.preventDefault()
    try {
      setError('')
      await createUserProfile({ nome, email, senha, ativo: true, cargo, responsaveis: [] })
      setNome('')
      setEmail('')
      setSenha('')
      setCargo('colaborador')
      setUsuarios(await listUsers())
      setIsModalOpen(false)
    } catch (err) {
      setError(err.message || 'Não foi possível criar o usuário.')
    }
  }

  async function handleDelete(id) {
    await deleteUserProfile(id)
    setUsuarios(await listUsers())
  }

  return (
    <div className="p-6 space-y-6">
      <section>
        <div className="flex items-start justify-start gap-2">
          <div>
            {!podeGerenciar && (
              <p className="mt-2 text-sm text-slate-500">Apenas gerentes e supervisores podem remover usuários.</p>
            )}
          </div>
          {podeCriar && (
            <Button color="primary" onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
              <UserRoundPlus size={16} />
              <span>Criar usuário</span>
            </Button>
          )}
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Criar usuário</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleCreate}>
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" value={nome} onChange={e => setNome(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  list="cargos-ferreira-costa"
                  value={cargo}
                  onChange={e => setCargo(e.target.value)}
                  placeholder="Digite ou selecione o cargo"
                />
                <datalist id="cargos-ferreira-costa">
                  <option value="Colaborador" />
                  <option value="Supervisor" />
                  <option value="Gerente" />
                  <option value="Analista de Trade Marketing" />
                  <option value="Coordenador de Trade Marketing" />
                  <option value="Analista Comercial" />
                  <option value="Coordenador Comercial" />
                  <option value="Assistente Comercial" />
                  <option value="Operador de Campo" />
                </datalist>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="light" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Criar usuário</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800">Usuários cadastrados</h2>
        <div className="mt-4">
          <div className="space-y-3">
            {usuarios.map(u => (
              <div key={u.id} className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{u.nome}</p>
                  <p className="text-sm text-slate-500">{u.email}</p>
                  <p className="text-sm text-slate-500">{u.cargo} • {u.ativo ? 'Ativo' : 'Inativo'}</p>
                </div>
                {podeGerenciar && (
                  <Button variant="destructive" onClick={() => handleDelete(u.id)}>
                    Remover
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
