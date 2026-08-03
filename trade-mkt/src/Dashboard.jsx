import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@heroui/react'
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
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Demandas</h2>
          </CardHeader>
          <CardContent>
            <p>{demandas.length} demandas cadastradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Grupos</h2>
          </CardHeader>
          <CardContent>
            <p>{grupos.length} grupos cadastrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Usuários</h2>
          </CardHeader>
          <CardContent>
            <p>{usuarios.length} usuários ativos</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Demandas recentes</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">As últimas demandas aparecem aqui conforme forem cadastradas.</p>
        </CardContent>
      </Card>
    </div>
  )
}
