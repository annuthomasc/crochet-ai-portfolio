import { createContext, useContext, useState, useEffect } from 'react'
import { login as loginApi, logout as logoutApi, isAuthenticated } from '../api/auth'

// Create the context — think of this as creating a "global store"
const AuthContext = createContext(null)

// AuthProvider wraps your entire app and makes auth state available everywhere
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in when app first loads
  // Why? So the user stays logged in after refreshing the page
  useEffect(() => {
    if (isAuthenticated()) {
      // Get stored user info
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const data = await loginApi(username, password)
      const userData = { username }
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed'
      }
    }
  }

  const logout = () => {
    logoutApi()
    setUser(null)
    localStorage.removeItem('user')
  }

  // The value object is what every component gets access to
  const value = {
    user,
    login,
    logout,
    isLoggedIn: !!user,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

// Custom hook — makes using the context cleaner
// Instead of: const { user } = useContext(AuthContext)
// You write:  const { user } = useAuth()
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}