import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProjects } from '../api/projects'

const THEME = {
  red:        '#c0392b',
  redLight:   '#fdf1f0',
  redMid:     '#e8c5c2',
  cream:      '#fdfcfb',
  creamDark:  '#f5f0eb',
  creamBorder:'#ede8e3',
  gray:       '#6b6b6b',
  grayLight:  '#f8f7f6',
  dark:       '#1a1a1a',
}

function ProjectCard({ project }) {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: `1px solid ${THEME.creamBorder}`,
      overflow: 'hidden',
      transition: 'box-shadow 0.2s, transform 0.2s',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Image */}
      <div style={{
        aspectRatio: '1',
        backgroundColor: THEME.creamDark,
        overflow: 'hidden',
      }}>
        {project.image_url ? (
          <img
            src={project.image_url}
            alt={project.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '48px',
          }}>🧶</div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '16px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6px',
        }}>
          <span style={{
            fontSize: '11px',
            fontWeight: '600',
            color: THEME.red,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            {project.category?.replace('_', ' ')}
          </span>
          {project.has_pattern && (
            <span style={{
              fontSize: '11px',
              color: '#2d7a4f',
              backgroundColor: '#edf7f2',
              padding: '2px 8px',
              borderRadius: '20px',
              fontWeight: '500',
            }}>
              Pattern ✓
            </span>
          )}
        </div>
        <h3 style={{
          fontSize: '15px',
          fontWeight: '600',
          color: THEME.dark,
          marginBottom: '4px',
        }}>
          {project.title}
        </h3>
        <p style={{
          fontSize: '13px',
          color: THEME.gray,
          textTransform: 'capitalize',
        }}>
          {project.difficulty}
        </p>

        {/* Color swatches */}
        {project.yarn_colors?.length > 0 && (
          <div style={{ display: 'flex', gap: '4px', marginTop: '10px' }}>
            {project.yarn_colors.slice(0, 5).map((color, i) => (
              <div key={i} style={{
                width: '18px', height: '18px',
                borderRadius: '50%',
                backgroundColor: color,
                border: '1px solid #e0dbd6',
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    getProjects()
      .then(data => {
        setProjects(data.results?.slice(0, 6) || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={{ paddingTop: '60px', paddingBottom: '80px' }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '80px' }}>
        <div style={{
          display: 'inline-block',
          backgroundColor: THEME.redLight,
          color: THEME.red,
          fontSize: '13px',
          fontWeight: '600',
          padding: '6px 16px',
          borderRadius: '20px',
          marginBottom: '24px',
          letterSpacing: '0.3px',
        }}>
          🤖 Powered by Claude AI
        </div>

        <h1 style={{
          fontSize: '56px',
          fontWeight: '800',
          color: THEME.dark,
          lineHeight: '1.1',
          letterSpacing: '-1px',
          marginBottom: '24px',
        }}>
          Handcrafted with love,<br />
          <span style={{ color: THEME.red }}>patterned with AI</span>
        </h1>

        <p style={{
          fontSize: '18px',
          color: THEME.gray,
          maxWidth: '520px',
          margin: '0 auto 36px',
          lineHeight: '1.7',
        }}>
          A collection of original crochet projects — each with an
          AI-generated pattern so you can recreate them yourself.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/gallery" style={{
            textDecoration: 'none',
            backgroundColor: THEME.red,
            color: '#ffffff',
            padding: '14px 28px',
            borderRadius: '10px',
            fontWeight: '600',
            fontSize: '15px',
          }}>
            Browse Projects
          </Link>
          <Link to="/patterns" style={{
            textDecoration: 'none',
            backgroundColor: '#ffffff',
            color: THEME.dark,
            padding: '14px 28px',
            borderRadius: '10px',
            fontWeight: '600',
            fontSize: '15px',
            border: `1px solid ${THEME.creamBorder}`,
          }}>
            View Patterns
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        marginBottom: '80px',
      }}>
        {[
          {
            icon: '📸',
            title: 'Photo Portfolio',
            desc: 'Browse completed crochet projects with detailed photos and yarn information.',
            accent: '#fdf1f0',
          },
          {
            icon: '🤖',
            title: 'AI-Generated Patterns',
            desc: 'Claude AI analyzes each project photo and generates a complete written pattern.',
            accent: '#f0f4fd',
          },
          {
            icon: '🎨',
            title: 'Colour Suggestions',
            desc: 'Get beautiful yarn colour combinations suggested by AI for any pattern.',
            accent: '#f0fdf4',
          },
        ].map((feature, i) => (
          <div key={i} style={{
            backgroundColor: feature.accent,
            borderRadius: '16px',
            padding: '28px',
            border: `1px solid ${THEME.creamBorder}`,
          }}>
            <span style={{ fontSize: '36px' }}>{feature.icon}</span>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '700',
              color: THEME.dark,
              margin: '12px 0 8px',
            }}>
              {feature.title}
            </h3>
            <p style={{
              fontSize: '14px',
              color: THEME.gray,
              lineHeight: '1.6',
            }}>
              {feature.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{
        borderTop: `1px solid ${THEME.creamBorder}`,
        marginBottom: '40px',
      }} />

      {/* Latest projects */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: THEME.dark,
            }}>
              Latest Projects
            </h2>
            <p style={{ fontSize: '14px', color: THEME.gray, marginTop: '4px' }}>
              Recently added to the portfolio
            </p>
          </div>
          <Link to="/gallery" style={{
            textDecoration: 'none',
            fontSize: '14px',
            color: THEME.red,
            fontWeight: '500',
          }}>
            View all →
          </Link>
        </div>

        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
          }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: `1px solid ${THEME.creamBorder}`,
                overflow: 'hidden',
              }}>
                <div style={{
                  aspectRatio: '1',
                  backgroundColor: THEME.creamDark,
                  animation: 'pulse 1.5s infinite',
                }} />
                <div style={{ padding: '16px' }}>
                  <div style={{
                    height: '12px',
                    backgroundColor: THEME.creamDark,
                    borderRadius: '4px',
                    width: '40%',
                    marginBottom: '8px',
                  }} />
                  <div style={{
                    height: '16px',
                    backgroundColor: THEME.creamDark,
                    borderRadius: '4px',
                    width: '70%',
                  }} />
                </div>
              </div>
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
          }}>
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '64px 0',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: `1px solid ${THEME.creamBorder}`,
          }}>
            <span style={{ fontSize: '48px' }}>🧶</span>
            <p style={{
              color: THEME.gray,
              marginTop: '16px',
              marginBottom: '20px',
            }}>
              No projects yet.
            </p>
            <Link to="/upload" style={{
              textDecoration: 'none',
              backgroundColor: THEME.red,
              color: '#ffffff',
              padding: '10px 24px',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
            }}>
              Upload your first project
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}