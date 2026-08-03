import { useEffect, useState } from 'react'
import { Button, Card, CardContent, CardHeader, Input, Label, Table, TableBody, TableCell, TableRow } from '@heroui/react'
import { useAuth } from './AuthProvider'
import { listDemandas, createDemanda, deleteDemanda } from './firebaseService'

export default function DemandasPage() {
  const { perfil } = useAuth()
  const [demandas, setDemandas] = useState([])
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [responsaveis, setResponsaveis] = useState('')

  const podeCriar = perfil?.cargo === 'gerente' || perfil?.cargo === 'supervisor'

  useEffect(() => {
    async function load() {
      setDemandas(await listDemandas())
    }
    load()
  }, [])

  async function handleCreate(event) {
    event.preventDefault()
    const responsaveisList = responsaveis
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)

    await createDemanda({
      titulo,
      descricao,
      status: 'aberta',
      responsaveis: responsaveisList,
    })
    setTitulo('')
    setDescricao('')
    setResponsaveis('')
    setDemandas(await listDemandas())
  }

  async function handleDelete(id) {
    await deleteDemanda(id)
    setDemandas(await listDemandas())
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Demandas</h2>
        </CardHeader>
        <CardContent>
          {!podeCriar && (
            <p className="text-sm text-slate-500">Apenas gerentes e supervisores podem criar demandas.</p>
          )}
          {podeCriar && (
            <form className="space-y-4" onSubmit={handleCreate}>
              <div>
                <Label htmlFor="titulo">Título</Label>
                <Input id="titulo" value={titulo} onChange={e => setTitulo(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Input id="descricao" value={descricao} onChange={e => setDescricao(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="responsaveis">Responsáveis (separe por vírgula)</Label>
                <Input id="responsaveis" value={responsaveis} onChange={e => setResponsaveis(e.target.value)} required />
              </div>
              <Button type="submit">Criar demanda</Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Demandas cadastradas</h2>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              {demandas.map(d => (
                <TableRow key={d.id}>
                  <TableCell>{d.titulo}</TableCell>
                  <TableCell>{d.status}</TableCell>
                  <TableCell>{(d.responsaveis || []).join(', ')}</TableCell>
                  <TableCell>
                    <Button variant="destructive" onClick={() => handleDelete(d.id)}>
                      Excluir
                    </Button>
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
