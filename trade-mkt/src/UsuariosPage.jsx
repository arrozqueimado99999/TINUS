import { useEffect, useState } from 'react'
import { Button, Card, CardContent, CardHeader, Input, Label, Select } from '@heroui/react'
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
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Usuários</h2>
        </CardHeader>
        <CardContent>
          {!podeGerenciar && (
            <p className="text-sm text-slate-500">Apenas gerentes e supervisores podem remover usuários.</p>
          )}
          {podeCriar && (
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
                <Select id="cargo" value={cargo} onChange={e => setCargo(e.target.value)}>
                  <option value="colaborador">Colaborador</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="gerente">Gerente</option>
                </Select>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit">Criar usuário</Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Usuários cadastrados</h2>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  )
}
