import { useState } from 'react'
import { parseChartData, parsePatternToChart, STITCH_SYMBOLS } from '../utils/generateStitchChart'

const THEME = {
  red:         '#c0392b',
  redLight:    '#fdf1f0',
  cream:       '#fdfcfb',
  creamDark:   '#f5f0eb',
  creamBorder: '#ede8e3',
  gray:        '#6b6b6b',
  dark:        '#1a1a1a',
}

export default function StitchChart({ pattern }) {
  const [zoom, setZoom]         = useState(1)
  const [hoveredCell, setHover] = useState(null)

  // Level 2 — use AI chart_data if available
  // Fall back to text parsing for older patterns
  const rows = pattern.chart_data && pattern.chart_data.rows?.length > 0
    ? parseChartData(pattern.chart_data)
    : parsePatternToChart(pattern.instructions, pattern.abbreviations)

  const construction = pattern.chart_data?.construction || 'rows'

  if (rows.length === 0) {
    return (
      <div style={{
        backgroundColor: THEME.creamDark,
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
      }}>
        <span style={{ fontSize: '32px' }}>📊</span>
        <p style={{ color: THEME.gray, marginTop: '12px', fontSize: '14px' }}>
          Stitch chart not available for this pattern.
        </p>
        <p style={{ color: '#9b9b9b', marginTop: '6px', fontSize: '12px' }}>
          Regenerate the pattern to get an AI-powered stitch chart.
        </p>
      </div>
    )
  }

  const cellSize    = 28 * zoom
  const maxStitches = Math.max(...rows.map(r => r.stitches.length))
  const chartW      = maxStitches * cellSize + 90
  const chartH      = rows.length * cellSize + 50

  return (
    <div>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
      }}>
        <div>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: THEME.dark,
            marginBottom: '4px',
          }}>
            Stitch Chart
          </h3>
          <p style={{ fontSize: '12px', color: THEME.gray }}>
            {construction === 'rounds' ? 'Worked in rounds' : 'Worked in rows'} •{' '}
            {rows.length} rows •{' '}
            reads bottom to top
            {pattern.chart_data?.rows?.length > 0 && (
              <span style={{
                marginLeft: '8px',
                backgroundColor: THEME.redLight,
                color: THEME.red,
                padding: '1px 6px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '600',
              }}>
                AI Generated
              </span>
            )}
          </p>
        </div>

        {/* Zoom controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: THEME.gray }}>Zoom:</span>
          <button
            onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
            style={{
              width: '28px',
              height: '28px',
              backgroundColor: THEME.creamDark,
              border: `1px solid ${THEME.creamBorder}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            −
          </button>
          <span style={{
            fontSize: '13px',
            fontWeight: '600',
            minWidth: '44px',
            textAlign: 'center',
            color: THEME.dark,
          }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(z => Math.min(2.5, z + 0.25))}
            style={{
              width: '28px',
              height: '28px',
              backgroundColor: THEME.creamDark,
              border: `1px solid ${THEME.creamBorder}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Chart container — scrollable */}
      <div style={{
        overflowX: 'auto',
        overflowY: 'auto',
        border: `1px solid ${THEME.creamBorder}`,
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        maxHeight: '500px',
      }}>
        <svg
          width={chartW}
          height={chartH}
          style={{ display: 'block', minWidth: chartW }}
        >
          {/* Grid background pattern */}
          <defs>
            <pattern
              id="grid"
              width={cellSize}
              height={cellSize}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`}
                fill="none"
                stroke="#f0ebe6"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>

          {/* Background */}
          <rect width={chartW} height={chartH} fill="#fdfcfb" />
          <rect width={chartW} height={chartH} fill="url(#grid)" />

          {/* Column numbers at top */}
          {Array.from({ length: Math.min(maxStitches, 30) }).map((_, i) => (
            (i + 1) % 5 === 0 || i === 0 ? (
              <text
                key={i}
                x={88 + i * cellSize + cellSize / 2}
                y={20}
                textAnchor="middle"
                fontSize={9 * zoom}
                fill={THEME.red}
                fontWeight="600"
                fontFamily="monospace"
              >
                {i + 1}
              </text>
            ) : null
          ))}

          {/* Rows — drawn bottom to top */}
          {[...rows].reverse().map((row, reversedIndex) => {
            const rowY = reversedIndex * cellSize + 28

            return (
              <g key={`row-${row.rowNumber}`}>

                {/* Alternating row background */}
                {reversedIndex % 2 === 0 && (
                  <rect
                    x={88}
                    y={rowY}
                    width={maxStitches * cellSize}
                    height={cellSize}
                    fill="#fdf9f7"
                  />
                )}

                {/* Row label */}
                <text
                  x={82}
                  y={rowY + cellSize / 2 + 4}
                  textAnchor="end"
                  fontSize={10 * zoom}
                  fill={THEME.gray}
                  fontFamily="monospace"
                >
                  {row.label}
                </text>

                {/* Row note (if any) */}
                {row.note && (
                  <text
                    x={88 + maxStitches * cellSize + 8}
                    y={rowY + cellSize / 2 + 4}
                    textAnchor="start"
                    fontSize={8 * zoom}
                    fill="#9b9b9b"
                    fontFamily="sans-serif"
                    fontStyle="italic"
                  >
                    {row.note}
                  </text>
                )}

                {/* Stitches */}
                {row.stitches.map((stitch, colIndex) => {
                  const cellX     = 88 + colIndex * cellSize
                  const symbol    = STITCH_SYMBOLS[stitch] || STITCH_SYMBOLS['sc']
                  const isHovered = hoveredCell?.row === row.rowNumber &&
                                    hoveredCell?.col === colIndex

                  return (
                    <g
                      key={`${row.rowNumber}-${colIndex}`}
                      onMouseEnter={() => setHover({
                        row:   row.rowNumber,
                        col:   colIndex,
                        stitch,
                        label: symbol.label,
                        x:     cellX + cellSize,
                        y:     rowY,
                      })}
                      onMouseLeave={() => setHover(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Cell */}
                      <rect
                        x={cellX}
                        y={rowY}
                        width={cellSize}
                        height={cellSize}
                        fill={isHovered ? THEME.redLight : 'transparent'}
                        stroke={isHovered ? THEME.red : '#e5ddd8'}
                        strokeWidth={isHovered ? 1.5 : 0.5}
                      />

                      {/* Stitch symbol */}
                      <text
                        x={cellX + cellSize / 2}
                        y={rowY + cellSize / 2 + 5}
                        textAnchor="middle"
                        fontSize={14 * zoom}
                        fill={symbol.color}
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {symbol.symbol}
                      </text>
                    </g>
                  )
                })}

                {/* Stitch count at end */}
                <text
                  x={88 + row.stitches.length * cellSize + 5}
                  y={rowY + cellSize / 2 + 4}
                  fontSize={9 * zoom}
                  fill="#9b9b9b"
                  fontFamily="monospace"
                >
                  ({row.stitches.length})
                </text>

              </g>
            )
          })}

          {/* Hover tooltip */}
          {hoveredCell && (
            <g>
              <rect
                x={Math.min(hoveredCell.x + 4, chartW - 130)}
                y={hoveredCell.y - 2}
                width={120}
                height={22}
                fill="#1a1a1a"
                rx={4}
                opacity={0.9}
              />
              <text
                x={Math.min(hoveredCell.x + 9, chartW - 125)}
                y={hoveredCell.y + 13}
                fontSize={10}
                fill="white"
                fontFamily="sans-serif"
              >
                {hoveredCell.label}
              </text>
            </g>
          )}

        </svg>
      </div>

      {/* Legend */}
      <div style={{
        marginTop: '16px',
        padding: '16px',
        backgroundColor: THEME.creamDark,
        borderRadius: '10px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <p style={{
          width: '100%',
          fontSize: '11px',
          fontWeight: '700',
          color: THEME.gray,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '4px',
        }}>
          Symbol Legend
        </p>
        {Object.entries(STITCH_SYMBOLS).map(([key, val]) => (
          <div key={key} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <span style={{
              fontSize: '16px',
              fontWeight: 'bold',
              fontFamily: 'monospace',
              color: val.color,
              minWidth: '20px',
              textAlign: 'center',
            }}>
              {val.symbol}
            </span>
            <span style={{ fontSize: '12px', color: THEME.gray }}>
              {val.label} <span style={{ color: '#9b9b9b' }}>({key})</span>
            </span>
          </div>
        ))}
      </div>

      {/* Info note */}
      <p style={{
        marginTop: '10px',
        fontSize: '12px',
        color: '#9b9b9b',
        fontStyle: 'italic',
      }}>
        Hover over any cell to see the stitch name.
        {pattern.chart_data?.rows?.length > 0
          ? ' Chart data was generated directly by Claude AI.'
          : ' Chart was parsed from written instructions (regenerate for AI chart).'}
      </p>

    </div>
  )
}