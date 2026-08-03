import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authListener, getUserProfile } from './firebaseService'

const AuthContext = createContext({
  user: null,
  perfil: null,
  loading: true,
})

function normalizeCargo(value) {
  return String(value ?? '').trim().toLowerCase()
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = authListener(async user => {
      setUser(user)

      if (user) {
        const perfilData = await getUserProfile(user.uid, user.email)
        setPerfil(
          perfilData
            ? {
                ...perfilData,
                cargo: normalizeCargo(perfilData.cargo || 'colaborador'),
              }
            : {
                nome: user.displayName || user.email?.split('@')[0] || 'Usuário',
                email: user.email,
                cargo: normalizeCargo('colaborador'),
              }
        )
      } else {
        setPerfil(null)
      }

      setLoading(false)
    })
    return unsubscribe
  }, [])

  const value = useMemo(() => ({ user, perfil, loading }), [user, perfil, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
