import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPattern, getColourPalettes, incrementDownload } from '../api/patterns'
import { generatePatternPDF } from '../utils/generatePDF'
import StitchChart from '../components/StitchChart'

const THEME = {
  red:         '#c0392b',
  redLight:    '#fdf1f0',
  cream:       '#fdfcfb',
  creamDark:   '#f5f0eb',
  creamBorder: '#ede8e3',
  gray:        '#6b6b6b',
  dark:        '#1a1a1a',
}

function ColourPaletteCard({ palette }) {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: `1px solid ${THEME.creamBorder}`,
      padding: '16px',
    }}>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
        {palette.colors.map((color, i) => (
          <div key={i} style={{
            flex: 1,
            height: '48px',
            borderRadius: '8px',
            backgroundColor: color,
            border: '1px solid rgba(0,0,0,0.06)',
          }} title={palette.color_names[i]} />
        ))}
      </div>
      <p style={{
        fontSize: '14px',
        fontWeight: '600',
        color: THEME.dark,
        marginBottom: '8px',
      }}>
        {palette.name}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
        {palette.color_names.map((name, i) => (
          <span key={i} style={{
            fontSize: '11px',
            color: THEME.gray,
            backgroundColor: THEME.creamDark,
            padding: '2px 8px',
            borderRadius: '20px',
          }}>
            {name}
          </span>
        ))}
      </div>
      <span style={{
        fontSize: '11px',
        color: THEME.red,
        textTransform: 'capitalize',
        fontWeight: '500',
      }}>
        {palette.mood}
      </span>
    </div>
  )
}

export default function PatternDetail() {
  const { id }                        = useParams()
  const [pattern, setPattern]         = useState(null)
  const [palettes, setPalettes]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [activeTab, setActiveTab]     = useState('instructions')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    Promise.all([
      getPattern(id),
      getColourPalettes(id)
    ])
      .then(([patternData, paletteData]) => {
        setPattern(patternData)
        setPalettes(paletteData)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const handleDownload = async () => {
    setDownloading(true)
    await incrementDownload(id)
    generatePatternPDF(pattern, pattern.project, palettes)
    setDownloading(false)
  }

  if (loading) {
    return (
      <div style={{ paddingTop: '40px' }}>
        <div style={{
          height: '32px',
          backgroundColor: THEME.creamDark,
          borderRadius: '6px',
          width: '40%',
          marginBottom: '16px',
        }} />
        <div style={{
          height: '256px',
          backgroundColor: THEME.creamDark,
          borderRadius: '12px',
        }} />
      </div>
    )
  }

  if (!pattern) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <p style={{ color: THEME.gray }}>Pattern not found.</p>
        <Link to="/gallery" style={{
          color: THEME.red,
          textDecoration: 'none',
          marginTop: '16px',
          display: 'inline-block',
        }}>
          Back to gallery
        </Link>
      </div>
    )
  }

  const TABS = ['instructions', 'stitch chart', 'materials', 'abbreviations', 'notes']

  return (
    <div style={{ paddingTop: '32px', paddingBottom: '80px' }}>

      {/* Back link */}
      <Link to="/gallery" style={{
        textDecoration: 'none',
        fontSize: '14px',
        color: THEME.red,
        display: 'inline-block',
        marginBottom: '24px',
        fontWeight: '500',
      }}>
        ← Back to gallery
      </Link>

      {/* Header card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: `1px solid ${THEME.creamBorder}`,
        padding: '32px',
        marginBottom: '24px',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '32px',
        }}>

          {/* Project image */}
          {pattern.project?.image_url && (
            <div style={{ flexShrink: 0, width: '240px' }}>
              <img
                src={pattern.project.image_url}
                alt={pattern.title}
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  aspectRatio: '1',
                }}
              />
            </div>
          )}

          {/* Pattern info */}
          <div style={{ flex: 1 }}>

            {/* Badges */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '12px',
            }}>
              {pattern.ai_generated && (
                <span style={{
                  fontSize: '12px',
                  backgroundColor: THEME.redLight,
                  color: THEME.red,
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontWeight: '600',
                }}>
                  AI Generated
                </span>
              )}
              <span style={{
                fontSize: '12px',
                backgroundColor: THEME.creamDark,
                color: THEME.gray,
                padding: '4px 10px',
                borderRadius: '20px',
                textTransform: 'capitalize',
              }}>
                {pattern.difficulty}
              </span>
            </div>

            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: THEME.dark,
              marginBottom: '10px',
              lineHeight: '1.2',
            }}>
              {pattern.title}
            </h1>

            <p style={{
              fontSize: '15px',
              color: THEME.gray,
              lineHeight: '1.6',
              marginBottom: '24px',
            }}>
              {pattern.description}
            </p>

            {/* Stats grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              marginBottom: '20px',
            }}>
              {[
                { label: 'Hook Size',     value: pattern.hook_size     || '—' },
                { label: 'Yarn Weight',   value: pattern.yarn_weight   || '—' },
                { label: 'Gauge',         value: pattern.gauge         || '—' },
                { label: 'Finished Size', value: pattern.finished_size || '—' },
              ].map((stat, i) => (
                <div key={i} style={{
                  backgroundColor: THEME.creamDark,
                  borderRadius: '10px',
                  padding: '12px',
                  textAlign: 'center',
                }}>
                  <p style={{
                    fontSize: '11px',
                    color: THEME.red,
                    fontWeight: '600',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                  }}>
                    {stat.label}
                  </p>
                  <p style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    color: THEME.dark,
                  }}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* View + download count */}
            <div style={{
              display: 'flex',
              gap: '20px',
              fontSize: '13px',
              color: THEME.gray,
              marginBottom: '20px',
            }}>
              <span>👁 {pattern.view_count} views</span>
              <span>⬇️ {pattern.download_count} downloads</span>
            </div>

            {/* Download button */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              style={{
                backgroundColor: downloading ? '#e8a09a' : THEME.red,
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                border: 'none',
                cursor: downloading ? 'not-allowed' : 'pointer',
              }}
            >
              {downloading ? 'Preparing PDF...' : '⬇️ Download PDF Pattern'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: `1px solid ${THEME.creamBorder}`,
        overflow: 'hidden',
        marginBottom: '24px',
      }}>
        {/* Tab buttons */}
        <div style={{
          display: 'flex',
          borderBottom: `1px solid ${THEME.creamBorder}`,
          overflowX: 'auto',
        }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: '0 0 auto',
                padding: '16px 20px',
                fontSize: '13px',
                fontWeight: '600',
                textTransform: 'capitalize',
                cursor: 'pointer',
                border: 'none',
                borderBottom: activeTab === tab
                  ? `2px solid ${THEME.red}`
                  : '2px solid transparent',
                backgroundColor: 'transparent',
                color: activeTab === tab ? THEME.red : THEME.gray,
                transition: 'color 0.15s',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ padding: '32px' }}>

          {activeTab === 'instructions' && (
            <pre style={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
              fontSize: '14px',
              color: THEME.dark,
              lineHeight: '1.8',
            }}>
              {pattern.instructions}
            </pre>
          )}

          {activeTab === 'stitch chart' && (
            <StitchChart pattern={pattern} />
          )}

          {activeTab === 'materials' && (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {pattern.materials_list?.map((item, i) => (
                <li key={i} style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start',
                  padding: '8px 0',
                  borderBottom: `1px solid ${THEME.creamBorder}`,
                  fontSize: '14px',
                  color: THEME.dark,
                }}>
                  <span style={{ color: THEME.red, fontWeight: '700' }}>•</span>
                  {item}
                </li>
              ))}
            </ul>
          )}

          {activeTab === 'abbreviations' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
            }}>
              {Object.entries(pattern.abbreviations || {}).map(([abbr, meaning]) => (
                <div key={abbr} style={{
                  backgroundColor: THEME.creamDark,
                  borderRadius: '8px',
                  padding: '12px',
                }}>
                  <span style={{
                    fontWeight: '700',
                    color: THEME.red,
                    fontSize: '14px',
                  }}>
                    {abbr}
                  </span>
                  <span style={{
                    color: THEME.gray,
                    fontSize: '13px',
                  }}>
                    {' '}= {meaning}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'notes' && (
            <p style={{
              fontSize: '14px',
              color: THEME.dark,
              lineHeight: '1.8',
            }}>
              {pattern.notes || 'No additional notes.'}
            </p>
          )}

        </div>
      </div>

      {/* Colour palettes */}
      {palettes.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: THEME.dark,
            marginBottom: '16px',
          }}>
            Suggested Colour Palettes
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
          }}>
            {palettes.map(palette => (
              <ColourPaletteCard key={palette.id} palette={palette} />
            ))}
          </div>
        </div>
      )}

      {/* AI transparency */}
      {pattern.ai_generated && (
        <div style={{
          backgroundColor: THEME.redLight,
          border: `1px solid #f5c6c2`,
          borderRadius: '12px',
          padding: '16px',
          fontSize: '13px',
          color: THEME.red,
          lineHeight: '1.6',
        }}>
          <strong>About this pattern:</strong> Generated by Claude AI
          ({pattern.ai_model_used}) by analyzing the project photo.
          {pattern.ai_confidence && (
            <span> Confidence score: {Math.round(pattern.ai_confidence * 100)}%</span>
          )}
        </div>
      )}

    </div>
  )
}