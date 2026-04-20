import { Link } from 'react-router-dom'

const THEME = {
  red:         '#c0392b',
  cream:       '#fdfcfb',
  creamBorder: '#ede8e3',
  gray:        '#6b6b6b',
  dark:        '#1a1a1a',
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      marginTop: '80px',
      width: '100%',
    }}>

      {/* Main content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '60px 24px 40px',
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr',
        gap: '48px',
      }}>

        {/* Brand */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
          }}>
            <span style={{ fontSize: '24px' }}>🧶</span>
            <span style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#ffffff',
            }}>
              Crochet<span style={{ color: THEME.red }}>AI</span>
            </span>
          </div>

          <p style={{
            fontSize: '14px',
            color: '#9b9b9b',
            lineHeight: '1.7',
            maxWidth: '280px',
            marginBottom: '24px',
          }}>
            A collection of handcrafted crochet projects, each with
            an AI-generated pattern powered by Claude AI so you can
            recreate them yourself.
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#2a2a2a',
            border: '1px solid #333333',
            borderRadius: '8px',
            padding: '8px 14px',
          }}>
            <span style={{ fontSize: '16px' }}>🤖</span>
            <div>
              <p style={{ fontSize: '11px', color: '#9b9b9b', marginBottom: '1px' }}>
                Powered by
              </p>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
                Claude AI
              </p>
            </div>
          </div>
        </div>

        {/* Navigate */}
        <div>
          <h3 style={{
            fontSize: '13px',
            fontWeight: '700',
            color: '#ffffff',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            marginBottom: '20px',
          }}>
            Navigate
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link to="/"             style={{ textDecoration: 'none', fontSize: '14px', color: '#9b9b9b' }}>Home</Link>
            <Link to="/gallery"      style={{ textDecoration: 'none', fontSize: '14px', color: '#9b9b9b' }}>Project Gallery</Link>
            <Link to="/patterns"     style={{ textDecoration: 'none', fontSize: '14px', color: '#9b9b9b' }}>Pattern Library</Link>
            <Link to="/ai-generator" style={{ textDecoration: 'none', fontSize: '14px', color: '#9b9b9b' }}>AI Generator</Link>
            <Link to="/upload"       style={{ textDecoration: 'none', fontSize: '14px', color: '#9b9b9b' }}>Upload Project</Link>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 style={{
            fontSize: '13px',
            fontWeight: '700',
            color: '#ffffff',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            marginBottom: '20px',
          }}>
            Categories
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link to="/gallery" style={{ textDecoration: 'none', fontSize: '14px', color: '#9b9b9b' }}>Table Mats</Link>
            <Link to="/gallery" style={{ textDecoration: 'none', fontSize: '14px', color: '#9b9b9b' }}>Shawls</Link>
            <Link to="/gallery" style={{ textDecoration: 'none', fontSize: '14px', color: '#9b9b9b' }}>Throws</Link>
            <Link to="/gallery" style={{ textDecoration: 'none', fontSize: '14px', color: '#9b9b9b' }}>Blankets</Link>
            <Link to="/gallery" style={{ textDecoration: 'none', fontSize: '14px', color: '#9b9b9b' }}>Amigurumi</Link>
            <Link to="/gallery" style={{ textDecoration: 'none', fontSize: '14px', color: '#9b9b9b' }}>Accessories</Link>
          </div>
        </div>

        {/* About */}
        <div>
          <h3 style={{
            fontSize: '13px',
            fontWeight: '700',
            color: '#ffffff',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            marginBottom: '20px',
          }}>
            About
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '18px' }}>🧶</span>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '2px' }}>Handcrafted</p>
                <p style={{ fontSize: '12px', color: '#9b9b9b', lineHeight: '1.5' }}>Every project is made by hand with care</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '18px' }}>🤖</span>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '2px' }}>AI Patterns</p>
                <p style={{ fontSize: '12px', color: '#9b9b9b', lineHeight: '1.5' }}>Claude analyzes photos to write patterns</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '18px' }}>🎨</span>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '2px' }}>Colour Palettes</p>
                <p style={{ fontSize: '12px', color: '#9b9b9b', lineHeight: '1.5' }}>AI suggests beautiful yarn combinations</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Divider */}
      <div style={{
        borderTop: '1px solid #2a2a2a',
        maxWidth: '1200px',
        margin: '0 auto',
      }} />

      {/* Bottom bar */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <p style={{ fontSize: '13px', color: '#9b9b9b' }}>
          © {year} CrochetAI Portfolio. All rights reserved.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '13px', color: '#9b9b9b' }}>Built with</span>
          <span style={{ fontSize: '13px', color: THEME.red, fontWeight: '600' }}>Django + React</span>
          <span style={{ fontSize: '13px', color: '#9b9b9b' }}>&amp; powered by</span>
          <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: '600' }}>Claude AI</span>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <a href="#" style={{ textDecoration: 'none', fontSize: '13px', color: '#9b9b9b' }}>GitHub</a>
          <a href="#" style={{ textDecoration: 'none', fontSize: '13px', color: '#9b9b9b' }}>Contact</a>
        </div>
      </div>

    </footer>
  )
}