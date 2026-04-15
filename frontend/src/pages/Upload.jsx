import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createProject } from '../api/projects'

const THEME = {
  red:         '#c0392b',
  redLight:    '#fdf1f0',
  cream:       '#fdfcfb',
  creamDark:   '#f5f0eb',
  creamBorder: '#ede8e3',
  gray:        '#6b6b6b',
  dark:        '#1a1a1a',
}

const CATEGORIES  = [
  'table_mat','shawl','throw','blanket',
  'amigurumi','bag','clothing','accessory','other'
]
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced']

const inputStyle = {
  width: '100%',
  border: `1px solid ${THEME.creamBorder}`,
  borderRadius: '8px',
  padding: '12px 16px',
  fontSize: '14px',
  outline: 'none',
  backgroundColor: THEME.cream,
  boxSizing: 'border-box',
  color: THEME.dark,
}

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '600',
  color: THEME.dark,
  marginBottom: '6px',
}

export default function Upload() {
  const { isLoggedIn } = useAuth()
  const navigate       = useNavigate()

  const [form, setForm] = useState({
    title:       '',
    description: '',
    category:    'other',
    difficulty:  'beginner',
    yarn_brand:  '',
    yarn_weight: '',
    hook_size:   '',
    is_public:   true,
  })
  const [image, setImage]     = useState(null)
  const [preview, setPreview] = useState(null)
  const [colors, setColors]   = useState(['#c0392b'])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  if (!isLoggedIn) {
    navigate('/login')
    return null
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleColorChange = (index, value) => {
    const updated = [...colors]
    updated[index] = value
    setColors(updated)
  }

  const addColor    = () => setColors([...colors, '#c0392b'])
  const removeColor = (i) => setColors(colors.filter((_, idx) => idx !== i))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await createProject({
        ...form,
        yarn_colors: colors.filter(c => c.trim() !== ''),
        image,
      })
      navigate('/ai-generator')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload project.')
      setLoading(false)
    }
  }

  return (
    <div style={{ paddingTop: '40px', paddingBottom: '80px', maxWidth: '640px' }}>

      <h1 style={{
        fontSize: '32px',
        fontWeight: '700',
        color: THEME.dark,
        marginBottom: '6px',
      }}>
        Upload a Project
      </h1>
      <p style={{ fontSize: '14px', color: THEME.gray, marginBottom: '36px' }}>
        Add a new crochet project to your portfolio
      </p>

      {error && (
        <div style={{
          backgroundColor: THEME.redLight,
          border: `1px solid #f5c6c2`,
          color: THEME.red,
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          marginBottom: '24px',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* Image upload */}
        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>Project Photo</label>
          <div style={{
            border: `2px dashed ${THEME.creamBorder}`,
            borderRadius: '12px',
            padding: '32px',
            textAlign: 'center',
            backgroundColor: THEME.cream,
            cursor: 'pointer',
            position: 'relative',
          }}>
            {preview ? (
              <div>
                <img
                  src={preview}
                  alt="Preview"
                  style={{
                    maxHeight: '200px',
                    margin: '0 auto 12px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                <button
                  type="button"
                  onClick={() => { setImage(null); setPreview(null) }}
                  style={{
                    color: THEME.red,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  Remove photo
                </button>
              </div>
            ) : (
              <div>
                <span style={{ fontSize: '36px' }}>📸</span>
                <p style={{
                  color: THEME.gray,
                  fontSize: '14px',
                  marginTop: '8px',
                }}>
                  Click to upload a photo
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Title *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="e.g. Autumn Harvest Shawl"
            style={inputStyle}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Tell us about this project..."
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        {/* Category + Difficulty */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '20px',
        }}>
          <div>
            <label style={labelStyle}>Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              style={inputStyle}
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>
                  {c.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Difficulty</label>
            <select
              name="difficulty"
              value={form.difficulty}
              onChange={handleChange}
              style={inputStyle}
            >
              {DIFFICULTIES.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Yarn details */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '16px',
          marginBottom: '20px',
        }}>
          {[
            { name: 'yarn_brand',  label: 'Yarn Brand',  placeholder: 'e.g. Lion Brand' },
            { name: 'yarn_weight', label: 'Yarn Weight',  placeholder: 'e.g. DK, Worsted' },
            { name: 'hook_size',   label: 'Hook Size',    placeholder: 'e.g. 5mm' },
          ].map(field => (
            <div key={field.name}>
              <label style={labelStyle}>{field.label}</label>
              <input
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                style={{ ...inputStyle, fontSize: '13px' }}
              />
            </div>
          ))}
        </div>

        {/* Yarn colors */}
        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>Yarn Colors</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {colors.map((color, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <input
                  type="color"
                  value={color || '#c0392b'}
                  onChange={e => handleColorChange(i, e.target.value)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: `1px solid ${THEME.creamBorder}`,
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                />
                <input
                  type="text"
                  value={color}
                  onChange={e => handleColorChange(i, e.target.value)}
                  placeholder="#c0392b"
                  style={{ ...inputStyle, flex: 1, fontSize: '13px' }}
                />
                {colors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeColor(i)}
                    style={{
                      color: '#9b9b9b',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '18px',
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addColor}
            style={{
              marginTop: '8px',
              color: THEME.red,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
            }}
          >
            + Add another color
          </button>
        </div>

        {/* Public toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '32px',
        }}>
          <input
            type="checkbox"
            id="is_public"
            name="is_public"
            checked={form.is_public}
            onChange={handleChange}
            style={{ width: '16px', height: '16px', accentColor: THEME.red }}
          />
          <label
            htmlFor="is_public"
            style={{ fontSize: '14px', color: THEME.gray, cursor: 'pointer' }}
          >
            Make this project public (visible to everyone)
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !form.title}
          style={{
            width: '100%',
            backgroundColor: loading || !form.title ? '#e8a09a' : THEME.red,
            color: '#ffffff',
            padding: '14px',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: '600',
            border: 'none',
            cursor: loading || !form.title ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Uploading...' : '⬆️ Upload Project'}
        </button>

      </form>
    </div>
  )
}