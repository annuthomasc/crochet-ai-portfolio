import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyProjects } from '../api/projects'
import { generatePattern, generateColourSuggestions } from '../api/aiService'

const THEME = {
  red:         '#c0392b',
  redLight:    '#fdf1f0',
  cream:       '#fdfcfb',
  creamDark:   '#f5f0eb',
  creamBorder: '#ede8e3',
  gray:        '#6b6b6b',
  dark:        '#1a1a1a',
}

const MOODS = ['warm','cool','neutral','bold','pastel','earthy','monochrome']

export default function AIGenerator() {
  const { isLoggedIn }                     = useAuth()
  const navigate                           = useNavigate()
  const [projects, setProjects]            = useState([])
  const [selectedProject, setSelected]    = useState(null)
  const [generating, setGenerating]        = useState(false)
  const [generatingColours, setGenColours] = useState(false)
  const [result, setResult]                = useState(null)
  const [colourResult, setColourResult]    = useState(null)
  const [error, setError]                  = useState('')
  const [selectedMood, setMood]            = useState('warm')
  const [step, setStep]                    = useState(1)

  useEffect(() => {
    if (!isLoggedIn) navigate('/login')
  }, [isLoggedIn])

  useEffect(() => {
    if (isLoggedIn) {
      getMyProjects()
        .then(data => setProjects(data.results || data || []))
        .catch(console.error)
    }
  }, [isLoggedIn])

  const handleGeneratePattern = async () => {
    if (!selectedProject) return
    setGenerating(true)
    setError('')
    setResult(null)
    try {
      const data = await generatePattern(selectedProject.id)
      setResult(data)
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate pattern.')
    } finally {
      setGenerating(false)
    }
  }

  const handleGenerateColours = async () => {
    if (!result?.pattern_id) return
    setGenColours(true)
    try {
      const data = await generateColourSuggestions(result.pattern_id, selectedMood)
      setColourResult(data)
      setStep(3)
    } catch (err) {
      setError('Failed to generate colour suggestions.')
    } finally {
      setGenColours(false)
    }
  }

  const steps = [
    { n: 1, label: 'Select project'    },
    { n: 2, label: 'Generate colours'  },
    { n: 3, label: 'Done!'             },
  ]

  return (
    <div style={{
      paddingTop: '40px',
      paddingBottom: '80px',
      maxWidth: '720px',
      margin: '0 auto',
    }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span style={{ fontSize: '48px' }}>🤖</span>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: THEME.dark,
          marginTop: '12px',
          marginBottom: '8px',
        }}>
          AI Pattern Generator
        </h1>
        <p style={{ fontSize: '15px', color: THEME.gray }}>
          Claude AI analyzes your project photo and writes a complete crochet pattern
        </p>
      </div>

      {/* Progress steps */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '40px',
      }}>
        {steps.map((s, i) => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '700',
                backgroundColor: step >= s.n ? THEME.red : THEME.creamDark,
                color: step >= s.n ? '#ffffff' : THEME.gray,
              }}>
                {step > s.n ? '✓' : s.n}
              </div>
              <span style={{
                fontSize: '13px',
                fontWeight: '500',
                color: step >= s.n ? THEME.red : THEME.gray,
              }}>
                {s.label}
              </span>
            </div>
            {i < 2 && (
              <div style={{
                width: '48px',
                height: '1px',
                backgroundColor: step > s.n ? THEME.red : THEME.creamBorder,
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          backgroundColor: THEME.redLight,
          border: `1px solid #f5c6c2`,
          color: THEME.red,
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          marginBottom: '20px',
        }}>
          {error}
        </div>
      )}

      {/* Step 1 — Select project */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: `1px solid ${THEME.creamBorder}`,
        padding: '28px',
        marginBottom: '20px',
      }}>
        <h2 style={{
          fontSize: '16px',
          fontWeight: '700',
          color: THEME.dark,
          marginBottom: '20px',
        }}>
          Step 1: Select a project to generate a pattern for
        </h2>

        {projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <p style={{ color: THEME.gray, marginBottom: '12px' }}>
              No projects yet.
            </p>
            <button
              onClick={() => navigate('/upload')}
              style={{
                backgroundColor: THEME.red,
                color: '#ffffff',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Upload a project first
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '20px',
          }}>
            {projects
              .filter(p => !p.has_pattern)
              .map(project => (
              <button
                key={project.id}
                onClick={() => setSelected(project)}
                style={{
                  border: selectedProject?.id === project.id
                    ? `2px solid ${THEME.red}`
                    : `2px solid ${THEME.creamBorder}`,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  background: 'none',
                  padding: 0,
                  textAlign: 'left',
                  transition: 'border-color 0.15s',
                }}
              >
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
                      justifyContent: 'center', fontSize: '32px',
                    }}>🧶</div>
                  )}
                </div>
                <div style={{ padding: '10px' }}>
                  <p style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: THEME.dark,
                    marginBottom: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {project.title}
                  </p>
                  <p style={{
                    fontSize: '11px',
                    color: THEME.gray,
                    textTransform: 'capitalize',
                  }}>
                    {project.category?.replace('_', ' ')}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {selectedProject && (
          <div style={{
            backgroundColor: THEME.redLight,
            borderRadius: '10px',
            padding: '14px 16px',
            marginBottom: '16px',
            fontSize: '14px',
            color: THEME.red,
          }}>
            Selected: <strong>{selectedProject.title}</strong>
            <span style={{
              display: 'block',
              fontSize: '12px',
              color: '#e07070',
              marginTop: '2px',
            }}>
              Claude will analyze the photo and generate a complete pattern
            </span>
          </div>
        )}

        <button
          onClick={handleGeneratePattern}
          disabled={!selectedProject || generating}
          style={{
            width: '100%',
            backgroundColor: !selectedProject || generating
              ? '#e8a09a'
              : THEME.red,
            color: '#ffffff',
            padding: '14px',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: '600',
            border: 'none',
            cursor: !selectedProject || generating ? 'not-allowed' : 'pointer',
          }}
        >
          {generating
            ? '⚙️ Claude is analyzing your photo... (~10 seconds)'
            : '🤖 Generate Pattern with AI'
          }
        </button>
      </div>

      {/* Step 2 — Pattern result + colour step */}
      {result && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: `1px solid ${THEME.creamBorder}`,
          padding: '28px',
          marginBottom: '20px',
        }}>
          {/* Success message */}
          <div style={{
            backgroundColor: '#edf7f2',
            border: '1px solid #b7e4cc',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '24px',
          }}>
            <p style={{
              fontWeight: '600',
              color: '#2d7a4f',
              marginBottom: '4px',
            }}>
              ✅ Pattern Generated!
            </p>
            <p style={{ fontSize: '14px', color: '#3a8a5f' }}>
              {result.pattern?.title} •
              Difficulty: {result.pattern?.difficulty} •
              Confidence: {Math.round((result.pattern?.ai_confidence || 0) * 100)}%
            </p>
            <p style={{ fontSize: '12px', color: '#5a9a7f', marginTop: '4px' }}>
              {result.message}
            </p>
          </div>

          <h2 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: THEME.dark,
            marginBottom: '16px',
          }}>
            Step 2: Choose a colour mood for palette suggestions
          </h2>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '20px',
          }}>
            {MOODS.map(mood => (
              <button
                key={mood}
                onClick={() => setMood(mood)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  border: selectedMood === mood
                    ? `1px solid ${THEME.red}`
                    : `1px solid ${THEME.creamBorder}`,
                  backgroundColor: selectedMood === mood
                    ? THEME.red
                    : '#ffffff',
                  color: selectedMood === mood ? '#ffffff' : THEME.gray,
                }}
              >
                {mood}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerateColours}
            disabled={generatingColours}
            style={{
              width: '100%',
              backgroundColor: generatingColours ? THEME.creamDark : THEME.creamBorder,
              color: generatingColours ? THEME.gray : THEME.dark,
              padding: '14px',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: '600',
              border: 'none',
              cursor: generatingColours ? 'not-allowed' : 'pointer',
            }}
          >
            {generatingColours
              ? '🎨 Generating colour palettes...'
              : '🎨 Generate Colour Palettes'
            }
          </button>
        </div>
      )}

      {/* Step 3 — Colour results */}
      {colourResult && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: `1px solid ${THEME.creamBorder}`,
          padding: '28px',
        }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: THEME.dark,
            marginBottom: '20px',
          }}>
            🎨 Your Colour Palettes
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {colourResult.palettes?.map((palette, i) => (
              <div key={i} style={{
                border: `1px solid ${THEME.creamBorder}`,
                borderRadius: '12px',
                padding: '16px',
              }}>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                  {palette.colors.map((color, j) => (
                    <div key={j} style={{
                      flex: 1,
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: color,
                    }} title={palette.color_names[j]} />
                  ))}
                </div>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: THEME.dark,
                  marginBottom: '6px',
                }}>
                  {palette.name}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {palette.color_names.map((name, j) => (
                    <span key={j} style={{
                      fontSize: '12px',
                      color: THEME.gray,
                      backgroundColor: THEME.creamDark,
                      padding: '2px 8px',
                      borderRadius: '20px',
                    }}>
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate(`/patterns/${result.pattern_id}`)}
            style={{
              width: '100%',
              backgroundColor: THEME.red,
              color: '#ffffff',
              padding: '14px',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              marginTop: '20px',
            }}
          >
            View Full Pattern →
          </button>
        </div>
      )}
    </div>
  )
}