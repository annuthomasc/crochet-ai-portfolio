// Stitch symbols used in crochet charts
// Why these symbols? They follow the Craft Yarn Council standard
// which is the international standard for crochet diagrams
export const STITCH_SYMBOLS = {
  'ch':         { symbol: '○', label: 'Chain',           color: '#c0392b' },
  'sc':         { symbol: '×', label: 'Single Crochet',  color: '#2563eb' },
  'hdc':        { symbol: 'T', label: 'Half Double',     color: '#059669' },
  'dc':         { symbol: '†', label: 'Double Crochet',  color: '#d97706' },
  'trc':        { symbol: '‡', label: 'Triple Crochet',  color: '#7c3aed' },
  'sl_st':      { symbol: '•', label: 'Slip Stitch',     color: '#c0392b' },
  'inc':        { symbol: 'V', label: 'Increase',        color: '#059669' },
  'dec':        { symbol: 'Λ', label: 'Decrease',        color: '#dc2626' },
  'magic_ring': { symbol: '@', label: 'Magic Ring',      color: '#c0392b' },
}

// Level 2 — uses AI-generated chart_data directly
// Why better than parsing? Claude already knows exactly which
// stitches are in each row — no guessing needed
export function parseChartData(chartData) {
  if (!chartData || !chartData.rows || chartData.rows.length === 0) {
    return []
  }

  return chartData.rows
    .slice(0, 20)  // max 20 rows
    .map(row => ({
      rowNumber:  row.row,
      label:      row.label || `Row ${row.row}`,
      stitches:   (row.stitches || []).slice(0, 30),  // max 30 stitches
      isRound:    chartData.construction === 'rounds',
      note:       row.note || '',
    }))
}

// Fallback — used when chart_data is not available
// (for patterns generated before Level 2 update)
export function parsePatternToChart(instructions, abbreviations = {}) {
  if (!instructions) return []

  const lines = instructions.split('\n').filter(l => l.trim())
  const rows  = []

  lines.forEach(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.endsWith(':') || trimmed.length < 5) return

    const isRow   = /^row\s*\d+/i.test(trimmed)
    const isRound = /^rnd\s*\d+|^round\s*\d+/i.test(trimmed)

    if (isRow || isRound) {
      const rowNum   = (trimmed.match(/\d+/) || [rows.length + 1])[0]
      const stitches = parseRow(trimmed)
      if (stitches.length > 0) {
        rows.push({
          rowNumber: parseInt(rowNum),
          label:     isRound ? `Rnd ${rowNum}` : `Row ${rowNum}`,
          stitches,
          isRound,
          note: '',
        })
      }
    } else if (rows.length === 0 && trimmed.toLowerCase().includes('ch')) {
      const stitches = parseRow(trimmed)
      if (stitches.length > 0) {
        rows.push({
          rowNumber: 0,
          label:     'Foundation',
          stitches,
          isRound:   false,
          note: '',
        })
      }
    }
  })

  return rows.slice(0, 20)
}

function parseRow(rowText) {
  const stitches = []
  const lower    = rowText.toLowerCase()

  const countMatch = rowText.match(/\((\d+)\s*(sc|dc|hdc|trc|st)s?\)/i)
  if (countMatch) {
    const count  = parseInt(countMatch[1])
    const stitch = countMatch[2].toLowerCase()
    for (let i = 0; i < Math.min(count, 30); i++) {
      stitches.push(stitch)
    }
    return stitches
  }

  if (lower.includes('chain') || / ch\s*\d/.test(lower)) {
    const n = (lower.match(/ch\s*(\d+)/i) || [])[1] || 10
    for (let i = 0; i < Math.min(parseInt(n), 30); i++) stitches.push('ch')
  } else if (lower.includes('single') || /\bsc\b/.test(lower)) {
    const n = (lower.match(/(\d+)\s*sc/i) || [])[1] || 8
    for (let i = 0; i < Math.min(parseInt(n), 30); i++) stitches.push('sc')
  } else if (lower.includes('double') || /\bdc\b/.test(lower)) {
    const n = (lower.match(/(\d+)\s*dc/i) || [])[1] || 8
    for (let i = 0; i < Math.min(parseInt(n), 30); i++) stitches.push('dc')
  } else if (lower.includes('half double') || /\bhdc\b/.test(lower)) {
    const n = (lower.match(/(\d+)\s*hdc/i) || [])[1] || 8
    for (let i = 0; i < Math.min(parseInt(n), 30); i++) stitches.push('hdc')
  } else {
    for (let i = 0; i < 8; i++) stitches.push('sc')
  }

  return stitches
}