import { createContext, useContext, useState, useEffect } from "react"
import api from "../api/axios"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      api.get("/me")
        .then(r => setUser(r.data))
        .catch(() => {
          localStorage.removeItem("token")
          setToken(null)
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = (newToken) => {
    localStorage.setItem("token", newToken)
    setToken(newToken)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f4]">
        <div className="w-8 h-8 border-2 border-[#c8622a] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{
      token, login, logout, user,
      isAuth: !!token,
      isAdmin: user?.is_admin ?? false,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)