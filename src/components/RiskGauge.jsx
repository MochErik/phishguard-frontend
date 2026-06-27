import React from 'react'

const VERDICT_CONFIG = {
  safe:       { color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', label: 'AMAN',          emoji: '✓' },
  suspicious: { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', label: 'MENCURIGAKAN',  emoji: '!' },
  phishing:   { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', label: 'BERBAHAYA',     emoji: '✕' },
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
      padding: '20px 28px',
      background: cfg.bg,
      border: `1.5px solid ${cfg.border}`,
      borderRadius: 16,
      minWidth: 160,
    }}>
      <svg width={130} height={130} viewBox="0 0 130 130">
        <circle cx={65} cy={65} r={radius} fill="none" stroke="#E2E8F0" strokeWidth={10} />
        <circle
          cx={65} cy={65} r={radius} fill="none"
          stroke={cfg.color} strokeWidth={10} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={dashOffset}
          transform="rotate(-90 65 65)"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)' }}
        />
        <text x={65} y={60} textAnchor="middle"
          style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Inter, sans-serif', fill: cfg.color }}>
          {Math.round(score)}
        </text>
        <text x={65} y={78} textAnchor="middle"
          style={{ fontSize: 11, fontFamily: 'Inter, sans-serif', fill: '#94A3B8' }}>
          / 100
        </text>
      </svg>

      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 16px', background: cfg.color,
        color: '#fff', borderRadius: 999,
        fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
      }}>
        <span>{cfg.emoji}</span>
        <span>{cfg.label}</span>
      </div>

      <p style={{ fontSize: 12, color: '#94A3B8' }}>
        Keyakinan: <strong style={{ color: '#475569' }}>{Math.round(confidence * 100)}%</strong>
      </p>
    </div>
  )
}
