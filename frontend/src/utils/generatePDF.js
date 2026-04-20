import jsPDF from 'jspdf'

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 192, g: 57, b: 43 }
}

async function renderStitchChartToImage(pattern) {
  const { parseChartData, parsePatternToChart, STITCH_SYMBOLS } = await import('./generateStitchChart')

  // Level 2 — use AI chart_data first, fall back to text parsing
  const rows = pattern.chart_data && pattern.chart_data.rows?.length > 0
    ? parseChartData(pattern.chart_data)
    : parsePatternToChart(pattern.instructions, pattern.abbreviations)

  if (rows.length === 0) return null

  const SCALE     = 3
  const cellSize  = 24 * SCALE
  const maxStitches = Math.max(...rows.map(r => r.stitches.length))
  const labelW    = 65 * SCALE
  const countW    = 50 * SCALE
  const canvasW   = labelW + maxStitches * cellSize + countW
  const headerH   = 28 * SCALE
  const footerH   = 36 * SCALE
  const canvasH   = rows.length * cellSize + headerH + footerH

  const canvas    = document.createElement('canvas')
  canvas.width    = canvasW
  canvas.height   = canvasH
  const ctx       = canvas.getContext('2d')

  // White background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasW, canvasH)

  // Light grid lines
  ctx.strokeStyle = '#ede8e3'
  ctx.lineWidth   = 0.5 * SCALE

  // Draw rows bottom to top
  ;[...rows].reverse().forEach((row, reversedIndex) => {
    const rowY = headerH + reversedIndex * cellSize

    // Alternating row backgrounds
    if (reversedIndex % 2 === 0) {
      ctx.fillStyle = '#fdf9f7'
      ctx.fillRect(labelW, rowY, maxStitches * cellSize, cellSize)
    }

    // Row label
    ctx.fillStyle  = '#6b6b6b'
    ctx.font       = `${9 * SCALE}px Arial, sans-serif`
    ctx.textAlign  = 'right'
    ctx.fillText(row.label, labelW - 4 * SCALE, rowY + cellSize * 0.65)

    // Draw each stitch
    row.stitches.forEach((stitch, colIndex) => {
      const cellX  = labelW + colIndex * cellSize
      const symbol = STITCH_SYMBOLS[stitch] || STITCH_SYMBOLS['sc']

      // Cell border
      ctx.strokeStyle = '#d1d5db'
      ctx.lineWidth   = 0.8 * SCALE
      ctx.strokeRect(cellX, rowY, cellSize, cellSize)

      // Stitch symbol
      ctx.fillStyle  = symbol.color
      ctx.font       = `bold ${14 * SCALE}px Arial, sans-serif`
      ctx.textAlign  = 'center'
      ctx.fillText(
        symbol.symbol,
        cellX + cellSize / 2,
        rowY + cellSize * 0.72
      )
    })

    // Stitch count
    ctx.fillStyle  = '#9ca3af'
    ctx.font       = `${8 * SCALE}px Arial, sans-serif`
    ctx.textAlign  = 'left'
    ctx.fillText(
      `(${row.stitches.length})`,
      labelW + maxStitches * cellSize + 4 * SCALE,
      rowY + cellSize * 0.65
    )
  })

  // Column numbers at top (every 5)
  ctx.fillStyle  = '#c0392b'
  ctx.font       = `bold ${7 * SCALE}px Arial, sans-serif`
  ctx.textAlign  = 'center'
  for (let i = 0; i < maxStitches; i++) {
    if ((i + 1) % 5 === 0 || i === 0) {
      ctx.fillText(
        String(i + 1),
        labelW + i * cellSize + cellSize / 2,
        headerH - 4 * SCALE
      )
    }
  }

  // Legend at bottom
  const legendY      = headerH + rows.length * cellSize + 8 * SCALE
  const legendItems  = Object.entries(STITCH_SYMBOLS).slice(0, 7)
  const legendItemW  = (canvasW - labelW) / legendItems.length

  legendItems.forEach(([key, val], i) => {
    const lx = labelW + i * legendItemW

    ctx.fillStyle  = val.color
    ctx.font       = `bold ${10 * SCALE}px Arial, sans-serif`
    ctx.textAlign  = 'left'
    ctx.fillText(val.symbol, lx, legendY + 12 * SCALE)

    ctx.fillStyle = '#4b5563'
    ctx.font      = `${6.5 * SCALE}px Arial, sans-serif`
    ctx.fillText(`${key}`, lx + 12 * SCALE, legendY + 12 * SCALE)
  })

  // Outer border
  ctx.strokeStyle = '#ede8e3'
  ctx.lineWidth   = 2 * SCALE
  ctx.strokeRect(1, 1, canvasW - 2, canvasH - 2)

  // Source label
  const isAIChart = pattern.chart_data?.rows?.length > 0
  ctx.fillStyle   = '#9b9b9b'
  ctx.font        = `${6 * SCALE}px Arial, sans-serif`
  ctx.textAlign   = 'right'
  ctx.fillText(
    isAIChart ? 'AI-generated chart data' : 'Parsed from instructions',
    canvasW - 4 * SCALE,
    legendY + 24 * SCALE
  )

  return canvas.toDataURL('image/png', 1.0)
}

// ─── Color helpers ────────────────────────────────────────────────────────────

// Our website theme colors
const RED        = '#c0392b'
const RED_DARK   = '#8b1a12'
const RED_LIGHT  = [253, 241, 240]   // rgb for light red background
const RED_TEXT   = [192, 57,  43]    // rgb for red text
const RED_SUB    = [245, 198, 194]   // rgb for light red subtitle text
const DARK_TEXT  = [31,  41,  55]    // rgb for dark body text
const GRAY_TEXT  = [107, 107, 107]   // rgb for gray text
const WHITE      = [255, 255, 255]

export async function generatePatternPDF(pattern, project, palettes = []) {
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

  const addWrappedText = (text, x, textY, maxWidth, lineHeight = 5) => {
    const lines = doc.splitTextToSize(text || '', maxWidth)
    lines.forEach(line => {
      checkPage(lineHeight + 2)
      doc.text(line, x, textY || y)
      if (!textY) y += lineHeight
    })
    return lines.length * lineHeight
  }

  // Draws a section header bar in red
  const sectionHeader = (title) => {
    checkPage(20)
    colorRect(margin, y, contentW, 9, RED)
    doc.setTextColor(...WHITE)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(title, margin + 4, y + 6.5)
    y += 13
  }

  // ─── COVER PAGE ──────────────────────────────────────────────────

  // Dark red top bar
  colorRect(0, 0, W, 55, RED_DARK)
  colorRect(0, 50, W, 8, RED)

  // Pattern title
  doc.setTextColor(...WHITE)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  const titleLines = doc.splitTextToSize(pattern.title || 'Crochet Pattern', contentW - 20)
  titleLines.forEach((line, i) => {
    doc.text(line, margin, 20 + i * 10)
  })

  // Subtitle
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

  // Stats grid — 3 columns x 2 rows
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
    const col  = i % 3
    const row  = Math.floor(i / 3)
    const sx   = margin + col * statColW
    const sy   = y + row * statRowH

    // Alternating light red backgrounds
    doc.setFillColor(
      col % 2 === 0 ? 253 : 250,
      col % 2 === 0 ? 241 : 235,
      col % 2 === 0 ? 240 : 235
    )
    doc.rect(sx, sy, statColW - 1, statRowH - 1, 'F')

    // Red left accent
    colorRect(sx, sy, 2, statRowH - 1, RED)

    // Label
    doc.setTextColor(...RED_TEXT)
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'bold')
    doc.text(stat.label, sx + 5, sy + 7)

    // Value
    doc.setTextColor(...DARK_TEXT)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(String(stat.value), sx + 5, sy + 15)
  })

  y += statRowH * 2 + 8

  // AI confidence badge
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

  const materials = pattern.materials_list || []
  materials.forEach(item => {
    checkPage(7)
    // Red bullet
    doc.setFillColor(...RED_TEXT)
    doc.circle(margin + 2, y - 1, 1, 'F')
    addWrappedText(item, margin + 6, null, contentW - 6)
    y += 1
  })
  y += 6

  // ─── ABBREVIATIONS ───────────────────────────────────────────────

  sectionHeader('ABBREVIATIONS')

  const abbrevs = Object.entries(pattern.abbreviations || {})
  const abbColW = contentW / 2

  abbrevs.forEach(([abbr, meaning], i) => {
    const col  = i % 2
    checkPage(8)

    doc.setFillColor(
      col === 0 ? 253 : 250,
      col === 0 ? 241 : 237,
      col === 0 ? 240 : 237
    )
    doc.rect(margin + col * abbColW, y, abbColW - 1, 7, 'F')

    doc.setTextColor(...RED_TEXT)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(abbr, margin + col * abbColW + 3, y + 5)

    doc.setTextColor(...GRAY_TEXT)
    doc.setFont('helvetica', 'normal')
    doc.text(`= ${meaning}`, margin + col * abbColW + 15, y + 5)

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
    if (line.trim().endsWith(':') || /^[A-Z\s]+:$/.test(line.trim())) {
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...RED_TEXT)
      addWrappedText(line, margin, null, contentW)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...DARK_TEXT)
    } else {
      addWrappedText(line, margin, null, contentW)
    }
    y += 1
  })
  y += 6

  // ─── STITCH CHART ────────────────────────────────────────────────

  // sectionHeader('STITCH CHART')

  try {
    sectionHeader('STITCH CHART')
    const chartImage = await renderStitchChartToImage(pattern)
    if (chartImage) {
      // Use a fixed generous height for good readability
      const imgH = 100
      checkPage(imgH + 20)
      doc.addImage(chartImage, 'PNG', margin, y, contentW, imgH)
      y += imgH + 8

      doc.setTextColor(...GRAY_TEXT)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'italic')
      doc.text(
        'Chart reads bottom to top. Each symbol represents one stitch. Column numbers shown every 5 stitches.',
        margin, y
      )
      y += 10
    } else {
      doc.setTextColor(...GRAY_TEXT)
      doc.setFontSize(9)
      doc.text('Stitch chart not available for this pattern type.', margin, y)
      y += 10
    }
  } catch (e) {
    doc.setTextColor(...GRAY_TEXT)
    doc.setFontSize(9)
    doc.text('Stitch chart could not be rendered.', margin, y)
    y += 10
  }

  y += 4

  // ─── NOTES ───────────────────────────────────────────────────────

  if (pattern.notes) {
    sectionHeader('NOTES')

    // Warm cream notes box
    doc.setFillColor(255, 251, 245)
    doc.rect(margin, y, contentW, 4, 'F')

    doc.setTextColor(...GRAY_TEXT)
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    addWrappedText(pattern.notes, margin + 3, null, contentW - 6)
    y += 6
  }

  // ─── COLOUR PALETTES ─────────────────────────────────────────────

  if (palettes.length > 0) {
    checkPage(60)
    sectionHeader('SUGGESTED COLOUR PALETTES')

    palettes.forEach(palette => {
      checkPage(40)

      // Palette name + mood
      doc.setTextColor(...DARK_TEXT)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text(palette.name, margin, y)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...GRAY_TEXT)
      doc.text(`Mood: ${palette.mood}`, margin + 70, y)
      y += 6

      // Color swatches
      const swatchW = contentW / palette.colors.length - 2
      palette.colors.forEach((color, i) => {
        const { r, g, b } = hexToRgb(color)
        doc.setFillColor(r, g, b)
        doc.rect(margin + i * (swatchW + 2), y, swatchW, 14, 'F')

        // Color name below swatch
        doc.setTextColor(...GRAY_TEXT)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')
        doc.text(
          palette.color_names[i] || color,
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