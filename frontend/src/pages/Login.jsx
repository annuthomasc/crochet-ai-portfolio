import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const THEME = {
  red:        '#c0392b',
  redLight:   '#fdf1f0',
  cream:      '#fdfcfb',
  creamBorder:'#ede8e3',
  gray:       '#6b6b6b',
  dark:       '#1a1a1a',
}

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login }               = useAuth()
  const navigate                = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await login(username, password)
    if (result.success) {
      navigate('/')
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: `1px solid ${THEME.creamBorder}`,
        padding: '48px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span style={{ fontSize: '48px' }}>🧶</span>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: THEME.dark,
            marginTop: '12px',
            marginBottom: '8px',
          }}>
            Welcome back
          </h1>
          <p style={{ fontSize: '14px', color: THEME.gray }}>
            Sign in to manage your portfolio
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            backgroundColor: '#fdf1f0',
            border: '1px solid #f5c6c2',
            color: THEME.red,
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '20px',
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: THEME.dark,
              marginBottom: '6px',
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              style={{
                width: '100%',
                border: `1px solid ${THEME.creamBorder}`,
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: THEME.cream,
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: THEME.dark,
              marginBottom: '6px',
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{
                width: '100%',
                border: `1px solid ${THEME.creamBorder}`,
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: THEME.cream,
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#e8a09a' : THEME.red,
              color: '#ffffff',
              padding: '14px',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: '600',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}