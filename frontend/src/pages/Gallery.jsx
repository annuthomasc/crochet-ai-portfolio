import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProjects, getProjectsByCategory } from '../api/projects'

const THEME = {
  red:         '#c0392b',
  redLight:    '#fdf1f0',
  cream:       '#fdfcfb',
  creamDark:   '#f5f0eb',
  creamBorder: '#ede8e3',
  gray:        '#6b6b6b',
  grayLight:   '#f8f7f6',
  dark:        '#1a1a1a',
}

const CATEGORIES = [
  { value: '',           label: 'All'         },
  { value: 'table_mat',  label: 'Table Mats'  },
  { value: 'shawl',      label: 'Shawls'      },
  { value: 'throw',      label: 'Throws'      },
  { value: 'blanket',    label: 'Blankets'    },
  { value: 'amigurumi',  label: 'Amigurumi'   },
  { value: 'bag',        label: 'Bags'        },
  { value: 'clothing',   label: 'Clothing'    },
  { value: 'accessory',  label: 'Accessories' },
  { value: 'other',      label: 'Other'       },
]

function ProjectCard({ project }) {
  return (
    <Link to={`/patterns/${project.id}`} style={{ textDecoration: 'none' }}>
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: `1px solid ${THEME.creamBorder}`,
          overflow: 'hidden',
          transition: 'box-shadow 0.2s, transform 0.2s',
          cursor: 'pointer',
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
          {project.yarn_colors?.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', marginTop: '10px' }}>
              {project.yarn_colors.slice(0, 5).map((color, i) => (
                <div key={i} style={{
                  width: '16px', height: '16px',
                  borderRadius: '50%',
                  backgroundColor: color,
                  border: '1px solid #e0dbd6',
                }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function Gallery() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [category, setCategory] = useState('')
  const [search, setSearch]     = useState('')
  const [totalCount, setTotal]  = useState(0)

  // useEffect(() => {
  //   setLoading(true)
  //   const fetchFn = category
  //     ? getProjectsByCategory(category)
  //     : getProjects({ search })

  //   fetchFn
  //     .then(data => {
  //       setProjects(data.results || data || [])
  //       setTotal(data.count || 0)
  //       setLoading(false)
  //     })
  //     .catch(() => setLoading(false))
  // }, [category])

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (!category) {
  //       setLoading(true)
  //       getProjects({ search })
  //         .then(data => {
  //           setProjects(data.results || [])
  //           setTotal(data.count || 0)
  //           setLoading(false)
  //         })
  //         .catch(() => setLoading(false))
  //     }
  //   }, 500)
  //   return () => clearTimeout(timer)
  // }, [search])
  useEffect(() => {
    let cancelled = false
    setLoading(true)
  
    const fetchProjects = category
      ? getProjectsByCategory(category)
      : getProjects({ search })
  
    fetchProjects
      .then(data => {
        if (!cancelled) {
          setProjects(data.results || data || [])
          setTotal(data.count || 0)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
  
    return () => {
      cancelled = true
    }
  }, [category, search])

  return (
    <div style={{ paddingTop: '40px', paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: THEME.dark,
          marginBottom: '6px',
        }}>
          Project Gallery
        </h1>
        <p style={{ fontSize: '14px', color: THEME.gray }}>
          {totalCount > 0 ? `${totalCount} projects` : 'All crochet projects'}
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '360px',
            border: `1px solid ${THEME.creamBorder}`,
            borderRadius: '10px',
            padding: '12px 16px',
            fontSize: '14px',
            outline: 'none',
            backgroundColor: '#ffffff',
          }}
        />
      </div>

      {/* Category filters */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '32px',
      }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            style={{
              padding: '8px 18px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              border: category === cat.value
                ? `1px solid ${THEME.red}`
                : `1px solid ${THEME.creamBorder}`,
              backgroundColor: category === cat.value
                ? THEME.red
                : '#ffffff',
              color: category === cat.value
                ? '#ffffff'
                : THEME.gray,
              transition: 'all 0.15s',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
        }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: `1px solid ${THEME.creamBorder}`,
              overflow: 'hidden',
            }}>
              <div style={{
                aspectRatio: '1',
                backgroundColor: THEME.creamDark,
              }} />
              <div style={{ padding: '16px' }}>
                <div style={{
                  height: '10px',
                  backgroundColor: THEME.creamDark,
                  borderRadius: '4px',
                  width: '40%',
                  marginBottom: '8px',
                }} />
                <div style={{
                  height: '14px',
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
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
        }}>
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '80px 0',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: `1px solid ${THEME.creamBorder}`,
        }}>
          <span style={{ fontSize: '48px' }}>🔍</span>
          <p style={{ color: THEME.gray, marginTop: '16px', marginBottom: '16px' }}>
            No projects found.
          </p>
          <button
            onClick={() => { setCategory(''); setSearch('') }}
            style={{
              color: THEME.red,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}