import { useEffect, useState } from 'react'
import { Button, Card, CardContent, CardHeader, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Table, TableCell, TableRow } from '@heroui/react'
import { LogOut, UserCircle } from 'lucide-react'
import { listDemandas, listGrupos, listUsers, signOutUser } from './firebaseService'
import { useAuth } from './AuthProvider'

export default function Dashboard() {
  const { perfil } = useAuth()
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Painel</h1>
          <p className="text-slate-400">Bem-vindo, {perfil?.nome || 'usuário'}.</p>
        </div>

        <Dropdown>
          <DropdownTrigger>
            <Button isIconOnly variant="flat" className="rounded-full">
              <UserCircle size={20} />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Ações do usuário">
            <DropdownItem key="logout" onClick={signOutUser} className="text-danger">
              <div className="flex items-center gap-2">
                <LogOut size={16} />
                <span>Logout</span>
              </div>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

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
          <Table>

          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
