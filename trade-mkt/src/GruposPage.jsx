import { useEffect, useState } from 'react'
import { Button, Input, Label } from '@heroui/react'
import { useAuth } from './AuthProvider'
import { listGrupos, createGrupo, deleteGrupo } from './firebaseService'

export default function GruposPage() {
  const { perfil } = useAuth()
  const [grupos, setGrupos] = useState([])
  const [nome, setNome] = useState('')

  const cargo = (perfil?.cargo || '').toString().trim().toLowerCase()
  const podeEditar = cargo === 'gerente' || cargo === 'supervisor'

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
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800">Grupos</h2>
        <div className="mt-4">
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
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800">Grupos cadastrados</h2>
        <div className="mt-4">
          {grupos.length === 0 ? (
            <p className="text-sm text-slate-500">Ainda não há grupos cadastrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="px-3 py-2 font-medium">Nome</th>
                    <th className="px-3 py-2 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {grupos.map(g => (
                    <tr key={g.id}>
                      <td className="px-3 py-2">{g.nome}</td>
                      <td className="px-3 py-2">
                        {podeEditar && (
                          <Button variant="destructive" onClick={() => handleDelete(g.id)}>
                            Excluir
                          </Button>
                        )}
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
