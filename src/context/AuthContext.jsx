import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadPerfil(userId) {
    if (!userId) {
      setPerfil(null)
      return
    }
    const { data, error } = await supabase.from('perfiles').select('*').eq('id', userId).single()
    if (error) {
      console.error('No se pudo cargar el perfil del usuario:', error)
      setPerfil(null)
      return
    }
    setPerfil(data)
  }

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(async ({ data }) => {
      const sessionUser = data.session?.user ?? null
      if (!active) return
      setUser(sessionUser)
      await loadPerfil(sessionUser?.id)
      if (active) setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user ?? null
      setUser(sessionUser)
      await loadPerfil(sessionUser?.id)
      setLoading(false)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, perfil, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de un AuthProvider.')
  return ctx
}
