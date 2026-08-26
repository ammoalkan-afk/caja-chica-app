import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [inactiveMessage, setInactiveMessage] = useState('')

  useEffect(() => {
    let active = true

    async function syncSession(session) {
      const sessionUser = session?.user ?? null

      if (!sessionUser) {
        if (active) {
          setUser(null)
          setPerfil(null)
        }
        return
      }

      const { data, error } = await supabase.from('perfiles').select('*').eq('id', sessionUser.id).single()
      if (!active) return

      if (error) {
        console.error('No se pudo cargar el perfil del usuario:', error)
        setUser(sessionUser)
        setPerfil(null)
        return
      }

      if (data.activo === false) {
        setInactiveMessage('Tu cuenta está inactiva. Contactá a un administrador.')
        setUser(null)
        setPerfil(null)
        await supabase.auth.signOut()
        return
      }

      setInactiveMessage('')
      setUser(sessionUser)
      setPerfil(data)
    }

    supabase.auth.getSession().then(({ data }) => {
      syncSession(data.session).finally(() => {
        if (active) setLoading(false)
      })
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      syncSession(session).finally(() => {
        if (active) setLoading(false)
      })
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function signIn(email, password) {
    setInactiveMessage('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, perfil, loading, inactiveMessage, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de un AuthProvider.')
  return ctx
}
