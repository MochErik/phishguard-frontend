import React, { useState } from 'react'
import RiskGauge from './RiskGauge'

const Section = ({ title, children, defaultOpen = false, accent = false }) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{
      border: `1px solid ${accent ? '#C7D2FE' : '#E2E8F0'}`,
      borderRadius: 14, overflow: 'hidden', marginTop: 12,
      boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
    }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '14px 18px',
        background: accent ? '#F5F3FF' : '#F8FAFC',
        border: 'none', cursor: 'pointer',
        fontSize: 14, fontWeight: 700, color: accent ? '#4F46E5' : '#334155',
      }}>
        <span>{title}</span>
        <span style={{
          fontSize: 11, color: '#94A3B8',
          background: '#E2E8F0', borderRadius: 999, padding: '2px 8px',
        }}>{open ? '▲ Tutup' : '▼ Lihat'}</span>
      </button>
      {open && (
        <div style={{ padding: '18px', background: '#fff', fontSize: 14 }}>
          {children}
        </div>
      )}
    </div>
  )
}

const Tag = ({ children, color = '#E2E8F0', textColor = '#334155' }) => (
  <span style={{
    display: 'inline-block', padding: '3px 10px',
    background: color, color: textColor,
    borderRadius: 999, fontSize: 12, fontWeight: 500, margin: '2px 3px',
  }}>{children}</span>
)

const FeatureRow = ({ label, value, highlight, hint }) => (
  <div style={{
    padding: '9px 0', borderBottom: '1px solid #F1F5F9', fontSize: 13,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: '#64748B' }}>{label}</span>
      <span style={{ fontWeight: 600, color: highlight ? '#DC2626' : '#1E293B' }}>{String(value)}</span>
    </div>
    {hint && <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 3 }}>{hint}</p>}
  </div>
)

const RiskBadge = ({ verdict }) => {
  const map = {
    safe:       { color: '#16A34A', bg: '#DCFCE7', text: '✓ AMAN' },
    suspicious: { color: '#D97706', bg: '#FEF3C7', text: '⚠ MENCURIGAKAN' },
    phishing:   { color: '#DC2626', bg: '#FEE2E2', text: '✕ BERBAHAYA' },
  }
  const cfg = map[verdict] || map.safe
  return (
    <span style={{
      padding: '4px 14px', borderRadius: 999, fontSize: 12,
      fontWeight: 700, background: cfg.bg, color: cfg.color,
      letterSpacing: '0.05em',
    }}>{cfg.text}</span>
  )
}

// Plain-language explanation for non-technical users
function WhatDoesThisMean({ verdict, risk_score }) {
  const messages = {
    safe: {
      title: 'Konten ini terlihat aman',
      desc: 'Sistem kami tidak menemukan tanda-tanda penipuan. Namun tetap berhati-hati — tidak ada sistem yang 100% sempurna.',
      color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', emoji: '✅',
    },
    suspicious: {
      title: 'Ada beberapa hal yang mencurigakan',
      desc: 'Konten ini memiliki ciri-ciri yang sering ditemukan pada pesan penipuan. Sebaiknya jangan klik link apapun di dalamnya dan verifikasi ke pihak resmi.',
      color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', emoji: '⚠️',
    },
    phishing: {
      title: 'Ini kemungkinan besar adalah penipuan!',
      desc: 'Sistem kami mendeteksi pola penipuan yang jelas. JANGAN klik link, isi form, atau bagikan data apapun. Hapus pesan ini dan laporkan ke pihak berwenang.',
      color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', emoji: '🚨',
    },
  }
  const msg = messages[verdict] || messages.safe
  return (
    <div style={{
      padding: '16px 18px', borderRadius: 12, marginBottom: 16,
      background: msg.bg, border: `1.5px solid ${msg.border}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 22 }}>{msg.emoji}</span>
        <p style={{ fontSize: 15, fontWeight: 700, color: msg.color }}>{msg.title}</p>
      </div>
      <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7 }}>{msg.desc}</p>
    </div>
  )
}

export default function ScanResult({ result, onReset }) {
  if (!result) return null
  const {
    verdict, risk_score, confidence, summary, recommendations,
    blacklist, url_features, nlp_result, ai_analysis, processing_time_ms
  } = result

  const verdictColor = verdict === 'phishing' ? '#DC2626' : verdict === 'suspicious' ? '#D97706' : '#16A34A'

  return (
    <div style={{ width: '100%', maxWidth: 700, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', marginBottom: 4 }}>HASIL ANALISIS</p>
            <RiskBadge verdict={verdict} />
          </div>
          <p style={{ fontSize: 11, color: '#94A3B8' }}>⏱ {processing_time_ms}ms</p>
        </div>
      </div>

      {/* Plain language explanation */}
      <WhatDoesThisMean verdict={verdict} risk_score={risk_score} />

      {/* Gauge + Summary */}
      <div style={{
        display: 'flex', gap: 20, alignItems: 'flex-start',
        padding: 22, background: '#fff',
        border: '1px solid #E2E8F0', borderRadius: 16,
        boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
        marginBottom: 4,
      }}>
        <RiskGauge score={risk_score} verdict={verdict} confidence={confidence} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, marginBottom: 16 }}>{summary}</p>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', marginBottom: 8 }}>
            APA YANG HARUS DILAKUKAN?
          </p>
          <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
            {recommendations.map((r, i) => (
              <li key={i} style={{
                display: 'flex', gap: 8, alignItems: 'flex-start',
                fontSize: 13, color: '#334155', marginBottom: 8, lineHeight: 1.6,
              }}>
                <span style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  background: verdictColor, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, marginTop: 2,
                }}>{i + 1}</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Blacklist */}
      {blacklist && (
        <Section
          title={`🔍 Blacklist Check — ${blacklist.hit ? '⚠️ Terdeteksi di Database Penipuan' : '✓ Bersih dari Database Penipuan'}`}
          defaultOpen accent={blacklist.hit}
        >
          {blacklist.hit ? (
            <div>
              <div style={{
                padding: '12px 14px', background: '#FEF2F2', borderRadius: 10,
                marginBottom: 12, border: '1px solid #FECACA',
              }}>
                <p style={{ color: '#DC2626', fontWeight: 700, fontSize: 13 }}>
                  Terdeteksi sebagai: {blacklist.threat_type}
                </p>
                <p style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                  Database blacklist menyimpan jutaan alamat situs/konten berbahaya yang sudah diverifikasi.
                </p>
              </div>
              <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>Ditemukan di sumber:</p>
              <div>{blacklist.sources.map(s => <Tag key={s} color="#FEE2E2" textColor="#991B1B">{s}</Tag>)}</div>
            </div>
          ) : (
            <div>
              <p style={{ color: '#16A34A', fontWeight: 600, marginBottom: 8 }}>
                ✓ Tidak ditemukan di database blacklist manapun.
              </p>
              <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6 }}>
                Kami memeriksa ke Google Safe Browsing dan PhishTank — dua database terbesar yang melacak situs phishing dan malware di seluruh dunia.
              </p>
            </div>
          )}
        </Section>
      )}

      {/* URL Features */}
      {url_features && (
        <Section title="🔗 Analisis URL — Detail Teknis Link">
          <p style={{ fontSize: 12, color: '#64748B', marginBottom: 12, lineHeight: 1.6 }}>
            Kami memeriksa struktur URL untuk menemukan tanda-tanda manipulasi yang sering dipakai penipu.
          </p>
          <FeatureRow label="Domain" value={url_features.domain}
            hint="Nama situs utama. Penipu sering pakai domain mirip aslinya, mis. 'g00gle.com'" />
          <FeatureRow label="Ekstensi (TLD)" value={url_features.tld}
            hint="Akhiran domain seperti .com, .id, .net. Domain aneh bisa jadi tanda penipuan" />
          <FeatureRow label="Menggunakan HTTPS" value={url_features.https ? '✓ Ya' : '✕ Tidak'}
            highlight={!url_features.https}
            hint={url_features.https ? 'Bagus — koneksi terenkripsi' : 'Berbahaya! Situs tanpa HTTPS tidak aman untuk input data'} />
          <FeatureRow label="Mengandung Alamat IP" value={url_features.has_ip ? '⚠ Ya' : '✓ Tidak'}
            highlight={url_features.has_ip}
            hint={url_features.has_ip ? 'Mencurigakan! Link normal tidak pakai angka IP langsung' : 'Normal'} />
          <FeatureRow label="Tanda @ di URL" value={url_features.has_at_sign ? '⚠ Ya' : '✓ Tidak'}
            highlight={url_features.has_at_sign}
            hint="Tanda @ di URL bisa menipu browser untuk mengarahkan ke situs lain" />
          <FeatureRow label="Redirect ganda (//)" value={url_features.has_double_slash ? '⚠ Ya' : '✓ Tidak'}
            highlight={url_features.has_double_slash}
            hint="Redirect tersembunyi yang sering digunakan untuk menyamarkan tujuan link" />
          <FeatureRow label="Skor Kerumitan URL" value={url_features.url_entropy}
            highlight={url_features.url_entropy > 4.5}
            hint={url_features.url_entropy > 4.5 ? 'URL terlalu rumit — bisa jadi dibuat untuk menyembunyikan tujuan sebenarnya' : 'Normal'} />
          {url_features.suspicious_keywords?.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>
                Kata kunci mencurigakan ditemukan di URL:
              </p>
              {url_features.suspicious_keywords.map(k => (
                <Tag key={k} color="#FEF3C7" textColor="#92400E">{k}</Tag>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* NLP */}
      {nlp_result && (
        <Section title="📝 Analisis Teks — Pola Bahasa Penipuan">
          <p style={{ fontSize: 12, color: '#64748B', marginBottom: 12, lineHeight: 1.6 }}>
            NLP (Natural Language Processing) membaca pola kata-kata untuk mendeteksi gaya bahasa yang sering dipakai penipu.
          </p>
          <FeatureRow label="Tingkat Urgensi" value={`${Math.round(nlp_result.urgency_score * 100)}%`}
            highlight={nlp_result.urgency_score > 0.5}
            hint="Penipu sering pakai kata seperti 'SEGERA', 'SEKARANG', 'BATAS WAKTU' untuk membuatmu panik" />
          <FeatureRow label="Tingkat Ancaman" value={`${Math.round(nlp_result.threat_score * 100)}%`}
            highlight={nlp_result.threat_score > 0.5}
            hint="Ancaman seperti 'akun diblokir', 'akan dihapus', atau 'kena denda'" />
          <FeatureRow label="Iming-iming / Hadiah" value={`${Math.round(nlp_result.reward_score * 100)}%`}
            highlight={nlp_result.reward_score > 0.5}
            hint="Janji hadiah, cashback, atau menang undian yang tidak masuk akal" />
          <FeatureRow label="Jumlah Link" value={nlp_result.link_count}
            highlight={nlp_result.link_count > 3}
            hint={nlp_result.link_count > 3 ? 'Terlalu banyak link — pesan normal jarang punya banyak link' : 'Normal'} />
          <FeatureRow label="Bahasa" value={nlp_result.language === 'id' ? '🇮🇩 Indonesia' : '🇺🇸 English'} />
          <FeatureRow label="Nada Pesan" value={
            nlp_result.sentiment === 'negative' ? '😰 Negatif / Mengancam'
            : nlp_result.sentiment === 'positive' ? '🎁 Positif / Mengiming-imingi'
            : '😐 Netral'
          } hint="Penipu biasanya pakai nada mengancam ATAU mengiming-imingi" />
          {nlp_result.suspicious_phrases?.length > 0 && (
            <div style={{ marginTop: 12, padding: '12px 14px', background: '#FEF2F2', borderRadius: 10 }}>
              <p style={{ fontSize: 12, color: '#991B1B', fontWeight: 700, marginBottom: 6 }}>
                ⚠ Frasa berbahaya yang ditemukan:
              </p>
              {nlp_result.suspicious_phrases.map((p, i) => (
                <Tag key={i} color="#FEE2E2" textColor="#991B1B">"{p}"</Tag>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* AI */}
      {ai_analysis && (
        <Section title="🤖 Analisis AI — Model Kecerdasan Buatan">
          <p style={{ fontSize: 12, color: '#64748B', marginBottom: 12, lineHeight: 1.6 }}>
            Model AI kami dilatih dengan jutaan contoh pesan phishing nyata untuk mengenali pola yang sulit terdeteksi secara manual.
          </p>
          <FeatureRow label="Model yang digunakan" value={ai_analysis.model_name} />
          <FeatureRow label="Skor Phishing dari AI" value={`${Math.round(ai_analysis.raw_score * 100)}%`}
            highlight={ai_analysis.raw_score > 0.5}
            hint="Persentase seberapa yakin AI bahwa ini adalah konten phishing" />
          <FeatureRow label="Tingkat Keyakinan Model" value={`${Math.round(ai_analysis.confidence * 100)}%`}
            hint="Seberapa percaya diri model AI dengan prediksinya" />
          <div style={{
            marginTop: 14, padding: '14px 16px', background: '#F5F3FF',
            borderRadius: 10, border: '1px solid #C7D2FE',
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#4F46E5', marginBottom: 6 }}>💡 Penjelasan AI:</p>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7 }}>{ai_analysis.explanation}</p>
          </div>
        </Section>
      )}

      {/* Reset */}
      <button onClick={onReset} style={{
        marginTop: 20, width: '100%', padding: '13px',
        background: '#fff', border: '1.5px solid #E2E8F0',
        borderRadius: 12, fontSize: 14, fontWeight: 600,
        color: '#64748B', cursor: 'pointer', transition: 'all 0.15s',
      }}
        onMouseEnter={e => { e.target.style.borderColor = '#6366F1'; e.target.style.color = '#6366F1' }}
        onMouseLeave={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.color = '#64748B' }}
      >
        ← Scan Lagi
      </button>
    </div>
  )
}
