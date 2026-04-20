import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { isLoggedIn, logout, user } = useAuth()
  const location = useLocation()

  const navLinks = [
    { to: '/',         label: 'Home'     },
    { to: '/gallery',  label: 'Gallery'  },
    { to: '/patterns', label: 'Pattern Library' },
  ]

  return (
    <nav style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #ede8e3',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      width: '100%',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>

        {/* Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
        }}>
          <span style={{ fontSize: '24px' }}>🧶</span>
          <span style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#1a1a1a',
            letterSpacing: '-0.3px',
          }}>
            Crochet<span style={{ color: '#c0392b' }}>AI</span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                color: location.pathname === link.to ? '#c0392b' : '#6b6b6b',
                borderBottom: location.pathname === link.to
                  ? '2px solid #c0392b'
                  : '2px solid transparent',
                paddingBottom: '2px',
                transition: 'color 0.2s',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isLoggedIn ? (
            <>
              <Link to="/upload" style={{
                textDecoration: 'none',
                fontSize: '14px',
                color: '#6b6b6b',
                fontWeight: '500',
              }}>
                Upload
              </Link>
              <Link to="/ai-generator" style={{
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
                color: '#ffffff',
                backgroundColor: '#c0392b',
                padding: '8px 16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                🤖 AI Generator
              </Link>
              <span style={{ fontSize: '14px', color: '#9b9b9b' }}>
                {user?.username}
              </span>
              <button
                onClick={logout}
                style={{
                  fontSize: '14px',
                  color: '#9b9b9b',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" style={{
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600',
              color: '#ffffff',
              backgroundColor: '#c0392b',
              padding: '8px 20px',
              borderRadius: '8px',
            }}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}