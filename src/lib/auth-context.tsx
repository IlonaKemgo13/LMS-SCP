"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { type User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

export type Profile = {
  id: string
  full_name: string
  email: string
  role: string
  avatar_url: string | null
  created_at: string
}

type AuthContextValue = {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  isLoading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, avatar_url, created_at")
        .eq("id", userId)
        .single()
      return data ?? null
    },
    [supabase]
  )

  const initialize = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      setUser(user)
      const p = await fetchProfile(user.id)
      setProfile(p)
    }
    setIsLoading(false)
  }, [supabase, fetchProfile])

  useEffect(() => {
    initialize()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        const p = await fetchProfile(session.user.id)
        setProfile(p)
      } else {
        setUser(null)
        setProfile(null)
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    window.location.href = "/"
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    const p = await fetchProfile(user.id)
    setProfile(p)
  }, [user, fetchProfile])

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
