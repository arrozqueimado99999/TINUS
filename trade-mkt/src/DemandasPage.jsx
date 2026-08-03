import { useEffect, useState } from 'react'
import { Button, Input, Label } from '@heroui/react'
import { useAuth } from './AuthProvider'
import { listDemandas, createDemanda, deleteDemanda } from './firebaseService'

export default function DemandasPage() {
  const { perfil } = useAuth()
  const [demandas, setDemandas] = useState([])
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [responsaveis, setResponsaveis] = useState('')

  const cargo = (perfil?.cargo || '').toString().trim().toLowerCase()
  const podeCriar = cargo === 'gerente' || cargo === 'supervisor'

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
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800">Demandas</h2>
        <div className="mt-4">
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
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800">Demandas cadastradas</h2>
        <div className="mt-4">
          {demandas.length === 0 ? (
            <p className="text-sm text-slate-500">Ainda não há demandas cadastradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="px-3 py-2 font-medium">Título</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Responsáveis</th>
                    <th className="px-3 py-2 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {demandas.map(d => (
                    <tr key={d.id}>
                      <td className="px-3 py-2">{d.titulo}</td>
                      <td className="px-3 py-2">{d.status}</td>
                      <td className="px-3 py-2">{(d.responsaveis || []).join(', ')}</td>
                      <td className="px-3 py-2">
                        <Button variant="destructive" onClick={() => handleDelete(d.id)}>
                          Excluir
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
