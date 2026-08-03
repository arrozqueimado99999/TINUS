import { useEffect, useState } from 'react'
import { Button, Card, CardContent, CardHeader, Input, Label, Select, Table, TableBody, TableCell, TableRow } from '@heroui/react'
import { useAuth } from './AuthProvider'
import { listUsers, createAuthUser, createUserProfile, deleteUserProfile } from './firebaseService'

export default function UsuariosPage() {
  const { perfil } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [cargo, setCargo] = useState('colaborador')

  const podeCriar = perfil?.cargo === 'gerente' || perfil?.cargo === 'supervisor'

  useEffect(() => {
    async function load() {
      setUsuarios(await listUsers())
    }
    load()
  }, [])

  async function handleCreate(event) {
    event.preventDefault()
    const newUser = await createAuthUser(email, senha)
    await createUserProfile({ nome, email, ativo: true, cargo, responsaveis: [] }, newUser.uid)
    setNome('')
    setEmail('')
    setSenha('')
    setCargo('colaborador')
    setUsuarios(await listUsers())
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
          {!podeCriar && (
            <p className="text-sm text-slate-500">Apenas gerentes e supervisores podem criar usuários.</p>
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
          <Table>
            <TableBody>
              {usuarios.map(u => (
                <TableRow key={u.id}>
                  <TableCell>{u.nome}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.cargo}</TableCell>
                  <TableCell>{u.ativo ? 'Ativo' : 'Inativo'}</TableCell>
                  <TableCell>
                    {podeCriar && (
                      <Button variant="destructive" onClick={() => handleDelete(u.id)}>
                        Remover
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
