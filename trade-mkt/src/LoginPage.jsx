import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Label } from '@heroui/react'
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
    <div className="min-h-screen flex items-center justify-center p-4 border-slate-200  text-slate-700 backdrop-blur-sm">
      <section className="w-full max-w-md text text-gray-600 rounded-2xl border border-slate-200 bg-gray-100/60 p-6">
        <h1 className="text-2xl font-bold">Entrar</h1>
        <div className="mt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end">
              <Button type="submit" variant="primary">
                Entrar
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}
