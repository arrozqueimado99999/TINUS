import { useEffect, useState } from 'react'
import { listDemandas, listGrupos, listUsers } from './firebaseService'

export default function Dashboard() {
  const [demandas, setDemandas] = useState([])
  const [grupos, setGrupos] = useState([])
  const [usuarios, setUsuarios] = useState([])

  useEffect(() => {
    async function load() {
      setDemandas(await listDemandas())
      setGrupos(await listGrupos())
      setUsuarios(await listUsers())
    }
    load()
  }, [])

  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800">Demandas</h2>
          <p className="mt-2 text-slate-600">{demandas.length} demandas cadastradas</p>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800">Grupos</h2>
          <p className="mt-2 text-slate-600">{grupos.length} grupos cadastrados</p>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800">Usuários</h2>
          <p className="mt-2 text-slate-600">{usuarios.length} usuários ativos</p>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800">Demandas recentes</h2>
        <p className="mt-2 text-sm text-slate-500">As últimas demandas aparecem aqui conforme forem cadastradas.</p>
      </section>
    </div>
  )
}
