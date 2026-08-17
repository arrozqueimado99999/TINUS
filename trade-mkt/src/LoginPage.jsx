import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Input, Label, TextField } from '@heroui/react'
import { signIn } from './firebaseService'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    try {
      setError('')
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 text-slate-700 backdrop-blur-sm">
      <Card className="w-full max-w-md p-6 bg-gray-100/60 border border-slate-200 rounded-2xl">
        <Card.Header>
          <Card.Title className="text-2xl font-bold">Entrar</Card.Title>
        </Card.Header>
        <Card.Content className="mt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField className="flex flex-col gap-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </TextField>
            <TextField className="flex flex-col gap-1">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </TextField>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary">
                Entrar
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>
    </div>
  )
}
