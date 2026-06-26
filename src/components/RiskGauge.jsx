import React from 'react'

const VERDICT_CONFIG = {
  safe:       { color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', label: 'AMAN', emoji: '✓' },
  suspicious: { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', label: 'MENCURIGAKAN', emoji: '!' },
  phishing:   { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', label: 'BERBAHAYA', emoji: '✕' },
}

export default function RiskGauge({ score, verdict, confidence }) {
  const cfg = VERDICT_CONFIG[verdict] || VERDICT_CONFIG.safe
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(Math.max(score, 0), 100) / 100
  const dashOffset = circumference * (1 - pct)

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      padding: '24px 32px',
      background: cfg.bg,
      border: `1.5px solid ${cfg.border}`,
      borderRadius: 16,
    }}>
      {/* SVG gauge */}
      <svg width={130} height={130} viewBox="0 0 130 130">
        {/* track */}
        <circle
          cx={65} cy={65} r={radius}
          fill="none" stroke="#E5E7EB" strokeWidth={10}
        />
        {/* progress */}
        <circle
          cx={65} cy={65} r={radius}
          fill="none"
          stroke={cfg.color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 65 65)"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)' }}
        />
        {/* center text */}
        <text x={65} y={60} textAnchor="middle"
          style={{ fontSize: 26, fontWeight: 700, fontFamily: 'Inter, sans-serif', fill: cfg.color }}>
          {Math.round(score)}
        </text>
        <text x={65} y={78} textAnchor="middle"
          style={{ fontSize: 11, fontFamily: 'Inter, sans-serif', fill: '#9CA3AF' }}>
          / 100
        </text>
      </svg>

      {/* Verdict badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 14px',
        background: cfg.color,
        color: '#fff',
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: '0.05em',
      }}>
        <span>{cfg.emoji}</span>
        <span>{cfg.label}</span>
      </div>

      {/* Confidence */}
      <p style={{ fontSize: 12, color: '#9CA3AF' }}>
        Keyakinan: {Math.round(confidence * 100)}%
      </p>
    </div>
  )
}
