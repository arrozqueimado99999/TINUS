import { useEffect, useState } from 'react'
import { Button, Card, CardContent, CardHeader, Input, Label, Table, TableBody, TableCell, TableRow } from '@heroui/react'
import { useAuth } from './AuthProvider'
import { listGrupos, createGrupo, deleteGrupo } from './firebaseService'

export default function GruposPage() {
  const { perfil } = useAuth()
  const [grupos, setGrupos] = useState([])
  const [nome, setNome] = useState('')

  const podeEditar = perfil?.cargo === 'gerente' || perfil?.cargo === 'supervisor'

  useEffect(() => {
    async function load() {
      setGrupos(await listGrupos())
    }
    load()
  }, [])

  async function handleCreate(event) {
    event.preventDefault()
    await createGrupo({ nome })
    setNome('')
    setGrupos(await listGrupos())
  }

  async function handleDelete(id) {
    await deleteGrupo(id)
    setGrupos(await listGrupos())
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Grupos</h2>
        </CardHeader>
        <CardContent>
          {!podeEditar && (
            <p className="text-sm text-slate-500">Apenas gerentes e supervisores podem criar ou remover grupos.</p>
          )}
          {podeEditar && (
            <form className="space-y-4" onSubmit={handleCreate}>
              <div>
                <Label htmlFor="nome">Nome do grupo</Label>
                <Input id="nome" value={nome} onChange={e => setNome(e.target.value)} required />
              </div>
              <Button type="submit">Criar grupo</Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Grupos cadastrados</h2>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              {grupos.map(g => (
                <TableRow key={g.id}>
                  <TableCell>{g.nome}</TableCell>
                  <TableCell>
                    {podeEditar && (
                      <Button variant="destructive" onClick={() => handleDelete(g.id)}>
                        Excluir
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
