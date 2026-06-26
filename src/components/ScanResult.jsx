import React, { useState } from 'react'
import RiskGauge from './RiskGauge'

const Section = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{
      border: '1px solid #E5E7EB', borderRadius: 10,
      overflow: 'hidden', marginTop: 12,
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', padding: '12px 16px',
          background: '#F9FAFB', border: 'none', cursor: 'pointer',
          fontSize: 14, fontWeight: 600, color: '#374151',
        }}
      >
        <span>{title}</span>
        <span style={{ color: '#9CA3AF', fontSize: 12 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ padding: '16px', background: '#fff', fontSize: 14 }}>
          {children}
        </div>
      )}
    </div>
  )
}

const Tag = ({ children, color = '#E5E7EB', textColor = '#374151' }) => (
  <span style={{
    display: 'inline-block', padding: '2px 10px',
    background: color, color: textColor,
    borderRadius: 999, fontSize: 12, fontWeight: 500, margin: '2px 3px',
  }}>
    {children}
  </span>
)

const FeatureRow = ({ label, value, highlight }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between',
    padding: '7px 0', borderBottom: '1px solid #F3F4F6',
    fontSize: 13,
  }}>
    <span style={{ color: '#6B7280' }}>{label}</span>
    <span style={{
      fontWeight: 500,
      color: highlight ? '#DC2626' : '#1F2937',
    }}>{String(value)}</span>
  </div>
)

export default function ScanResult({ result, onReset }) {
  if (!result) return null
  const { verdict, risk_score, confidence, summary, recommendations,
          blacklist, url_features, nlp_result, ai_analysis, processing_time_ms } = result

  const verdictColor = verdict === 'phishing' ? '#DC2626'
    : verdict === 'suspicious' ? '#D97706' : '#16A34A'

  return (
    <div style={{ width: '100%', maxWidth: 680, margin: '0 auto' }}>
      {/* Header result */}
      <div style={{
        display: 'flex', gap: 24, alignItems: 'flex-start',
        padding: 24, background: '#fff',
        border: '1px solid #E5E7EB', borderRadius: 14,
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      }}>
        <RiskGauge score={risk_score} verdict={verdict} confidence={confidence} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.6, marginBottom: 16 }}>
            {summary}
          </p>

          <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 8, fontWeight: 600, letterSpacing: '0.05em' }}>
            REKOMENDASI
          </p>
          <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
            {recommendations.map((r, i) => (
              <li key={i} style={{
                display: 'flex', gap: 8, alignItems: 'flex-start',
                fontSize: 13, color: '#4B5563', marginBottom: 6, lineHeight: 1.5,
              }}>
                <span style={{ color: verdictColor, marginTop: 2, flexShrink: 0 }}>›</span>
                {r}
              </li>
            ))}
          </ul>

          <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 12 }}>
            Waktu analisis: {processing_time_ms}ms
          </p>
        </div>
      </div>

      {/* Blacklist */}
      {blacklist && (
        <Section title={`🔍 Blacklist Check — ${blacklist.hit ? '⚠️ Terdeteksi' : '✓ Tidak ditemukan'}`} defaultOpen>
          {blacklist.hit ? (
            <div>
              <p style={{ color: '#DC2626', fontWeight: 600, marginBottom: 8 }}>
                Terdeteksi sebagai: <strong>{blacklist.threat_type}</strong>
              </p>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>Sumber:</p>
              <div>{blacklist.sources.map(s => <Tag key={s} color="#FEE2E2" textColor="#991B1B">{s}</Tag>)}</div>
            </div>
          ) : (
            <p style={{ color: '#16A34A' }}>URL tidak ditemukan di database blacklist manapun.</p>
          )}
        </Section>
      )}

      {/* URL Features */}
      {url_features && (
        <Section title="🔗 Analisis URL">
          <FeatureRow label="Domain" value={url_features.domain} />
          <FeatureRow label="TLD" value={url_features.tld} />
          <FeatureRow label="HTTPS" value={url_features.https ? 'Ya' : 'Tidak'} highlight={!url_features.https} />
          <FeatureRow label="Mengandung IP" value={url_features.has_ip ? 'Ya' : 'Tidak'} highlight={url_features.has_ip} />
          <FeatureRow label="Tanda @ di URL" value={url_features.has_at_sign ? 'Ya' : 'Tidak'} highlight={url_features.has_at_sign} />
          <FeatureRow label="Redirect ganda" value={url_features.has_double_slash ? 'Ya' : 'Tidak'} highlight={url_features.has_double_slash} />
          <FeatureRow label="Entropy URL" value={url_features.url_entropy} highlight={url_features.url_entropy > 4.5} />
          <FeatureRow label="Panjang path" value={url_features.path_length} highlight={url_features.path_length > 200} />
          {url_features.suspicious_keywords?.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Kata kunci mencurigakan:</p>
              {url_features.suspicious_keywords.map(k => (
                <Tag key={k} color="#FEF3C7" textColor="#92400E">{k}</Tag>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* NLP Analysis */}
      {nlp_result && (
        <Section title="📝 Analisis Teks (NLP)">
          <FeatureRow label="Skor urgensi" value={`${Math.round(nlp_result.urgency_score * 100)}%`}
            highlight={nlp_result.urgency_score > 0.5} />
          <FeatureRow label="Skor ancaman" value={`${Math.round(nlp_result.threat_score * 100)}%`}
            highlight={nlp_result.threat_score > 0.5} />
          <FeatureRow label="Skor iming-iming" value={`${Math.round(nlp_result.reward_score * 100)}%`}
            highlight={nlp_result.reward_score > 0.5} />
          <FeatureRow label="Jumlah link" value={nlp_result.link_count} highlight={nlp_result.link_count > 3} />
          <FeatureRow label="Bahasa" value={nlp_result.language === 'id' ? 'Indonesia' : 'English'} />
          <FeatureRow label="Sentimen" value={nlp_result.sentiment} />
          {nlp_result.suspicious_phrases?.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Frasa mencurigakan:</p>
              {nlp_result.suspicious_phrases.map((p, i) => (
                <Tag key={i} color="#FEE2E2" textColor="#991B1B">"{p}"</Tag>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* AI Analysis */}
      {ai_analysis && (
        <Section title="🤖 Analisis AI">
          <FeatureRow label="Model" value={ai_analysis.model_name} />
          <FeatureRow label="Skor AI" value={`${Math.round(ai_analysis.raw_score * 100)}%`}
            highlight={ai_analysis.raw_score > 0.5} />
          <FeatureRow label="Keyakinan model" value={`${Math.round(ai_analysis.confidence * 100)}%`} />
          <div style={{ marginTop: 12, padding: 12, background: '#F9FAFB', borderRadius: 8, fontSize: 13, color: '#4B5563' }}>
            💡 {ai_analysis.explanation}
          </div>
        </Section>
      )}

      {/* Reset */}
      <button
        onClick={onReset}
        style={{
          marginTop: 20, width: '100%', padding: '12px',
          background: '#fff', border: '1.5px solid #E5E7EB',
          borderRadius: 10, fontSize: 14, fontWeight: 500,
          color: '#6B7280', cursor: 'pointer',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => e.target.style.borderColor = '#2563EB'}
        onMouseLeave={e => e.target.style.borderColor = '#E5E7EB'}
      >
        ← Scan Lagi
      </button>
    </div>
  )
}
