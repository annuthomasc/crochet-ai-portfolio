import jsPDF from 'jspdf'

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 192, g: 57, b: 43 }
}

// Text-based stitch chart — works in all environments
// No canvas, no dynamic imports, no async needed
function renderStitchChartAsText(pattern) {
  try {
    const chartData = pattern.chart_data
    if (!chartData || !chartData.rows || chartData.rows.length === 0) {
      return null
    }
    const symbols = {
      'ch':         '○',
      'sc':         'x',
      'hdc':        'T',
      'dc':         '+',
      'trc':        'X',
      'sl_st':      '.',
      'inc':        'V',
      'dec':        'A',
      'magic_ring': '@',
    }
    const lines = []
    ;[...chartData.rows].reverse().forEach(row => {
      const stitchRow = (row.stitches || [])
        .slice(0, 28)
        .map(s => symbols[s] || 'x')
        .join(' ')
      const label = (row.label || '').padEnd(14)
      const count = `(${row.stitches?.length || 0})`
      lines.push({ label, stitchRow, count })
    })
    return lines
  } catch (e) {
    return null
  }
}

const RED        = '#c0392b'
const RED_DARK   = '#8b1a12'
const RED_LIGHT  = [253, 241, 240]
const RED_TEXT   = [192, 57,  43]
const RED_SUB    = [245, 198, 194]
const DARK_TEXT  = [31,  41,  55]
const GRAY_TEXT  = [107, 107, 107]
const WHITE      = [255, 255, 255]

export function generatePatternPDF(pattern, project, palettes = []) {
  const doc      = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W        = 210
  const margin   = 20
  const contentW = W - margin * 2
  let y          = 20

  // ─── Helpers ─────────────────────────────────────────────────────

  const newPage = () => {
    doc.addPage()
    y = 20
  }

  const checkPage = (needed = 10) => {
    if (y + needed > 280) newPage()
  }

  const colorRect = (x, rectY, w, h, hex) => {
    const { r, g, b } = hexToRgb(hex)
    doc.setFillColor(r, g, b)
    doc.rect(x, rectY, w, h, 'F')
  }

  const addWrappedText = (text, x, maxWidth, lineHeight = 5) => {
    const lines = doc.splitTextToSize(String(text || ''), maxWidth)
    lines.forEach(line => {
      checkPage(lineHeight + 2)
      doc.text(line, x, y)
      y += lineHeight
    })
  }

  const sectionHeader = (title) => {
    checkPage(20)
    colorRect(margin, y, contentW, 9, RED)
    doc.setTextColor(...WHITE)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(title, margin + 4, y + 6.5)
    y += 13
  }

  // ─── COVER ───────────────────────────────────────────────────────

  colorRect(0, 0, W, 55, RED_DARK)
  colorRect(0, 50, W, 8, RED)

  doc.setTextColor(...WHITE)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  const titleLines = doc.splitTextToSize(pattern.title || 'Crochet Pattern', contentW - 20)
  titleLines.forEach((line, i) => {
    doc.text(line, margin, 20 + i * 10)
  })

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...RED_SUB)
  doc.text('AI-Generated Crochet Pattern  •  CrochetAI Portfolio', margin, 48)

  y = 68

  // Description box
  colorRect(margin, y, 3, 28, RED)
  doc.setFillColor(...RED_LIGHT)
  doc.rect(margin + 3, y, contentW - 3, 28, 'F')
  doc.setTextColor(...GRAY_TEXT)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  const descLines = doc.splitTextToSize(pattern.description || '', contentW - 12)
  descLines.slice(0, 3).forEach((line, i) => {
    doc.text(line, margin + 8, y + 9 + i * 7)
  })
  y += 36

  // Stats grid
  const stats = [
    { label: 'DIFFICULTY',    value: pattern.difficulty    || '—' },
    { label: 'HOOK SIZE',     value: pattern.hook_size     || '—' },
    { label: 'YARN WEIGHT',   value: pattern.yarn_weight   || '—' },
    { label: 'GAUGE',         value: pattern.gauge         || '—' },
    { label: 'FINISHED SIZE', value: pattern.finished_size || '—' },
    { label: 'YARN AMOUNT',   value: pattern.yarn_amount   || '—' },
  ]

  const statColW = contentW / 3
  const statRowH = 20
  stats.forEach((stat, i) => {
    const col = i % 3
    const row = Math.floor(i / 3)
    const sx  = margin + col * statColW
    const sy  = y + row * statRowH

    doc.setFillColor(col % 2 === 0 ? 253 : 250, col % 2 === 0 ? 241 : 235, col % 2 === 0 ? 240 : 235)
    doc.rect(sx, sy, statColW - 1, statRowH - 1, 'F')
    colorRect(sx, sy, 2, statRowH - 1, RED)

    doc.setTextColor(...RED_TEXT)
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'bold')
    doc.text(stat.label, sx + 5, sy + 7)

    doc.setTextColor(...DARK_TEXT)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(String(stat.value), sx + 5, sy + 15)
  })

  y += statRowH * 2 + 8

  // AI badge
  doc.setFillColor(...RED_LIGHT)
  doc.roundedRect(margin, y, contentW, 11, 2, 2, 'F')
  doc.setTextColor(...RED_TEXT)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `AI: Generated by ${pattern.ai_model_used || 'Claude AI'}  •  Confidence: ${Math.round((pattern.ai_confidence || 0) * 100)}%  •  For personal use only`,
    margin + 4, y + 7.5
  )
  y += 18

  // ─── MATERIALS ───────────────────────────────────────────────────

  sectionHeader('MATERIALS')
  doc.setTextColor(...DARK_TEXT)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')

  ;(pattern.materials_list || []).forEach(item => {
    checkPage(7)
    doc.setFillColor(...RED_TEXT)
    doc.circle(margin + 2, y - 1, 1, 'F')
    addWrappedText(item, margin + 6, contentW - 6)
    y += 1
  })
  y += 6

  // ─── ABBREVIATIONS ───────────────────────────────────────────────

  sectionHeader('ABBREVIATIONS')
  const abbrevs = Object.entries(pattern.abbreviations || {})
  const abbColW = contentW / 2

  abbrevs.forEach(([abbr, meaning], i) => {
    const col = i % 2
    checkPage(8)

    doc.setFillColor(col === 0 ? 253 : 250, col === 0 ? 241 : 237, col === 0 ? 240 : 237)
    doc.rect(margin + col * abbColW, y, abbColW - 1, 7, 'F')

    doc.setTextColor(...RED_TEXT)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(abbr, margin + col * abbColW + 3, y + 5)

    doc.setTextColor(...GRAY_TEXT)
    doc.setFont('helvetica', 'normal')
    doc.text(`= ${meaning}`, margin + col * abbColW + 18, y + 5)

    if (col === 1) y += 8
  })
  if (abbrevs.length % 2 !== 0) y += 8
  y += 6

  // ─── INSTRUCTIONS ────────────────────────────────────────────────

  sectionHeader('INSTRUCTIONS')
  doc.setTextColor(...DARK_TEXT)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')

  const instructionLines = (pattern.instructions || '').split('\n')
  instructionLines.forEach(line => {
    checkPage(6)
    if (line.trim() === '') {
      y += 3
      return
    }
    if (/^[A-Z\s]+:$/.test(line.trim())) {
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...RED_TEXT)
      addWrappedText(line, margin, contentW)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...DARK_TEXT)
    } else {
      addWrappedText(line, margin, contentW)
    }
    y += 1
  })
  y += 6

  // ─── STITCH CHART ────────────────────────────────────────────────

  sectionHeader('STITCH CHART')

  const chartLines = renderStitchChartAsText(pattern)
  if (chartLines && chartLines.length > 0) {
    // Draw chart header
    doc.setFillColor(245, 235, 233)
    doc.rect(margin, y, contentW, 7, 'F')
    doc.setTextColor(...RED_TEXT)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text('ROW', margin + 2, y + 5)
    doc.text('STITCHES', margin + 40, y + 5)
    doc.text('COUNT', margin + contentW - 15, y + 5)
    y += 9

    // Draw each row
    chartLines.forEach((row, i) => {
      checkPage(7)

      // Alternating backgrounds
      if (i % 2 === 0) {
        doc.setFillColor(253, 248, 247)
        doc.rect(margin, y - 1, contentW, 6, 'F')
      }

      doc.setTextColor(...GRAY_TEXT)
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'bold')
      doc.text(row.label, margin + 2, y + 4)

      doc.setTextColor(...RED_TEXT)
      doc.setFont('helvetica', 'normal')
      doc.text(row.stitchRow, margin + 40, y + 4)

      doc.setTextColor(...GRAY_TEXT)
      doc.text(row.count, margin + contentW - 14, y + 4)

      y += 6
    })

    y += 6

    // Legend
    doc.setFillColor(245, 235, 233)
    doc.rect(margin, y, contentW, 10, 'F')
    doc.setTextColor(...RED_TEXT)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text('SYMBOLS:', margin + 2, y + 4)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...DARK_TEXT)
    doc.text('○=ch  x=sc  T=hdc  +=dc  X=trc  .=sl st  V=inc  A=dec', margin + 22, y + 4)
    doc.setTextColor(...GRAY_TEXT)
    doc.text('Chart reads bottom to top', margin + 2, y + 8.5)
    y += 14

  } else {
    doc.setTextColor(...GRAY_TEXT)
    doc.setFontSize(9)
    doc.text('Stitch chart not available — regenerate pattern for chart data.', margin, y)
    y += 10
  }

  y += 4

  // ─── NOTES ───────────────────────────────────────────────────────

  if (pattern.notes) {
    sectionHeader('NOTES')
    doc.setFillColor(255, 251, 245)
    doc.rect(margin, y, contentW, 4, 'F')
    doc.setTextColor(...GRAY_TEXT)
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    addWrappedText(pattern.notes, margin + 3, contentW - 6)
    y += 6
  }

  // ─── COLOUR PALETTES ─────────────────────────────────────────────

  if (palettes.length > 0) {
    checkPage(60)
    sectionHeader('SUGGESTED COLOUR PALETTES')

    palettes.forEach(palette => {
      checkPage(40)

      doc.setTextColor(...DARK_TEXT)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text(palette.name, margin, y)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...GRAY_TEXT)
      doc.text(`Mood: ${palette.mood}`, margin + 70, y)
      y += 6

      const swatchW = contentW / (palette.colors?.length || 3) - 2
      ;(palette.colors || []).forEach((color, i) => {
        const { r, g, b } = hexToRgb(color)
        doc.setFillColor(r, g, b)
        doc.rect(margin + i * (swatchW + 2), y, swatchW, 14, 'F')

        doc.setTextColor(...GRAY_TEXT)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')
        doc.text(
          (palette.color_names?.[i] || color).slice(0, 15),
          margin + i * (swatchW + 2),
          y + 18,
          { maxWidth: swatchW }
        )
      })
      y += 28
    })
  }

  // ─── FOOTER on every page ────────────────────────────────────────

  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    colorRect(0, 287, W, 10, RED)
    doc.setTextColor(...WHITE)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `${pattern.title} | CrochetAI Portfolio | Page ${i} of ${pageCount}`,
      margin, 293
    )
    doc.text(
      'AI Generated Pattern — For personal use',
      W - margin, 293,
      { align: 'right' }
    )
  }

  // Save
  const filename = `${(pattern.title || 'pattern').replace(/\s+/g, '-').toLowerCase()}-pattern.pdf`
  doc.save(filename)
}