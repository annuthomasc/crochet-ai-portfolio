import api from './axios'

// Login — sends username/password, gets back JWT tokens
export const login = async (username, password) => {
  const response = await api.post('/auth/login/', { username, password })
  // Save tokens to localStorage so they persist on page refresh
  localStorage.setItem('access_token',  response.data.access)
  localStorage.setItem('refresh_token', response.data.refresh)
  return response.data
}

// Logout — clears tokens from localStorage
export const logout = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

// Check if user is currently logged in
export const isAuthenticated = () => {
  return !!localStorage.getItem('access_token')
}