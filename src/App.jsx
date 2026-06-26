import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import ScanResult from './components/ScanResult'
import { scanUrl, scanText, scanQR, scanDocument, scanWeb } from './utils/api'

// ── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'url',      label: 'URL / Link',     icon: '🔗' },
  { id: 'email',    label: 'Email',           icon: '✉️' },
  { id: 'sms',      label: 'SMS / WA',        icon: '💬' },
  { id: 'qr',       label: 'QR Code',         icon: '📷' },
  { id: 'web',      label: 'Halaman Web',     icon: '🌐' },
  { id: 'document', label: 'File Dokumen',    icon: '📄' },
]

// ── File dropzone wrapper ─────────────────────────────────────────────────────
function FileDropzone({ onFile, accept, hint }) {
  const [filename, setFilename] = useState(null)
  const onDrop = useCallback(files => {
    if (files[0]) {
      setFilename(files[0].name)
      onFile(files[0])
    }
  }, [onFile])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept, maxFiles: 1,
  })

  return (
    <div {...getRootProps()} style={{
      border: `2px dashed ${isDragActive ? '#2563EB' : '#D1D5DB'}`,
      borderRadius: 12, padding: '36px 20px', textAlign: 'center',
      background: isDragActive ? '#EFF6FF' : '#FAFAFA',
      cursor: 'pointer', transition: 'all 0.15s',
    }}>
      <input {...getInputProps()} />
      <div style={{ fontSize: 32, marginBottom: 10 }}>
        {filename ? '✅' : '📁'}
      </div>
      {filename ? (
        <p style={{ fontSize: 14, color: '#2563EB', fontWeight: 500 }}>{filename}</p>
      ) : (
        <>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 4 }}>
            {isDragActive ? 'Lepas file di sini…' : 'Drag & drop atau klik untuk pilih file'}
          </p>
          <p style={{ fontSize: 12, color: '#9CA3AF' }}>{hint}</p>
        </>
      )}
    </div>
  )
}

// ── Loading spinner ──────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 48 }}>
      <div style={{
        width: 44, height: 44,
        border: '3px solid #E5E7EB',
        borderTopColor: '#2563EB',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ fontSize: 14, color: '#6B7280' }}>Menganalisis…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ── Primary button ────────────────────────────────────────────────────────────
function PrimaryButton({ onClick, disabled, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', padding: '13px 24px',
        background: disabled ? '#9CA3AF' : '#2563EB',
        color: '#fff', border: 'none', borderRadius: 10,
        fontSize: 15, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s',
        letterSpacing: '0.01em',
      }}
      onMouseEnter={e => { if (!disabled) e.target.style.background = '#1D4ED8' }}
      onMouseLeave={e => { if (!disabled) e.target.style.background = '#2563EB' }}
    >
      {children}
    </button>
  )
}

// ── Error box ─────────────────────────────────────────────────────────────────
function ErrorBox({ message }) {
  return (
    <div style={{
      padding: '14px 16px', background: '#FEF2F2',
      border: '1px solid #FECACA', borderRadius: 10,
      fontSize: 13, color: '#991B1B', lineHeight: 1.6,
    }}>
      ⚠️ {message}
    </div>
  )
}

// ── Input textarea ────────────────────────────────────────────────────────────
function TextArea({ value, onChange, placeholder, rows = 6 }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: '100%', padding: '12px 14px',
        border: '1.5px solid #E5E7EB', borderRadius: 10,
        fontSize: 14, color: '#1F2937', lineHeight: 1.6,
        resize: 'vertical', outline: 'none', background: '#fff',
        transition: 'border-color 0.15s', fontFamily: 'Inter, sans-serif',
      }}
      onFocus={e => e.target.style.borderColor = '#2563EB'}
      onBlur={e => e.target.style.borderColor = '#E5E7EB'}
    />
  )
}

function URLInput({ value, onChange }) {
  return (
    <input
      type="url"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="https://contoh-website.com/login"
      style={{
        width: '100%', padding: '12px 14px',
        border: '1.5px solid #E5E7EB', borderRadius: 10,
        fontSize: 14, color: '#1F2937', outline: 'none',
        background: '#fff', transition: 'border-color 0.15s',
        fontFamily: 'JetBrains Mono, monospace',
      }}
      onFocus={e => e.target.style.borderColor = '#2563EB'}
      onBlur={e => e.target.style.borderColor = '#E5E7EB'}
    />
  )
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState('url')
  const [urlVal, setUrlVal] = useState('')
  const [textVal, setTextVal] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const reset = () => {
    setResult(null); setError(null)
    setUrlVal(''); setTextVal(''); setFile(null)
  }

  const handleTabChange = (id) => {
    setActiveTab(id); setResult(null); setError(null)
  }

  const handleScan = async () => {
    setError(null); setLoading(true); setResult(null)
    try {
      let data
      if (activeTab === 'url')      data = await scanUrl(urlVal)
      else if (activeTab === 'email') data = await scanText(textVal, 'email')
      else if (activeTab === 'sms')   data = await scanText(textVal, 'sms')
      else if (activeTab === 'qr')    data = await scanQR(file)
      else if (activeTab === 'web')   data = await scanWeb(urlVal)
      else if (activeTab === 'document') data = await scanDocument(file)
      setResult(data)
    } catch (err) {
      const msg = err?.response?.data?.detail || err.message || 'Terjadi kesalahan. Coba lagi.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const canScan = () => {
    if (loading) return false
    if (activeTab === 'url' || activeTab === 'web') return urlVal.trim().length > 5
    if (activeTab === 'email' || activeTab === 'sms') return textVal.trim().length > 10
    if (activeTab === 'qr' || activeTab === 'document') return !!file
    return false
  }

  const tabLabel = TABS.find(t => t.id === activeTab)?.label || ''

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>

      {/* ── Navbar ── */}
      <nav style={{
        borderBottom: '1px solid #E5E7EB', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 60, position: 'sticky', top: 0, background: '#fff', zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🛡️</span>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#111827', letterSpacing: '-0.01em' }}>
            PhishGuard
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '3px 10px',
            background: '#EFF6FF', color: '#2563EB', borderRadius: 999,
            letterSpacing: '0.03em',
          }}>
            10.000 scan gratis / hari
          </span>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        textAlign: 'center', padding: '56px 24px 40px',
        borderBottom: '1px solid #F3F4F6',
        background: 'linear-gradient(180deg, #F9FAFB 0%, #fff 100%)',
      }}>
        <h1 style={{
          fontSize: 36, fontWeight: 700, color: '#111827',
          letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 14,
        }}>
          Deteksi Phishing Secara <span style={{ color: '#2563EB' }}>Instan</span>
        </h1>
        <p style={{ fontSize: 16, color: '#6B7280', maxWidth: 520, margin: '0 auto' }}>
          Analisis URL, Email, SMS, QR Code, Halaman Web, dan Dokumen menggunakan
          AI + Database Blacklist + NLP Engine.
        </p>
      </section>

      {/* ── Main card ── */}
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px 80px' }}>
        {result ? (
          <ScanResult result={result} onReset={reset} />
        ) : (
          <div style={{
            background: '#fff', border: '1px solid #E5E7EB',
            borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}>
            {/* ── Tabs ── */}
            <div style={{
              display: 'flex', overflowX: 'auto',
              borderBottom: '1px solid #E5E7EB',
              padding: '0 4px',
            }}>
              {TABS.map(tab => {
                const active = tab.id === activeTab
                return (
                  <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: 4, padding: '14px 16px',
                      background: 'none', border: 'none',
                      borderBottom: active ? '2px solid #2563EB' : '2px solid transparent',
                      color: active ? '#2563EB' : '#6B7280',
                      fontWeight: active ? 600 : 400,
                      fontSize: 13, cursor: 'pointer',
                      whiteSpace: 'nowrap', transition: 'all 0.15s',
                      marginBottom: -1,
                    }}>
                    <span style={{ fontSize: 18 }}>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* ── Input area ── */}
            <div style={{ padding: 24 }}>
              {loading ? (
                <Spinner />
              ) : (
                <>
                  {/* URL / Web */}
                  {(activeTab === 'url' || activeTab === 'web') && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                        {activeTab === 'web' ? 'URL Halaman Web' : 'URL / Link yang ingin diperiksa'}
                      </label>
                      <URLInput value={urlVal} onChange={setUrlVal} />
                      <p style={{ fontSize: 12, color: '#9CA3AF' }}>
                        {activeTab === 'web'
                          ? 'Masukkan URL lengkap termasuk https://'
                          : 'Tempel URL yang mencurigakan — termasuk link pendek (bit.ly, s.id, dll)'}
                      </p>
                    </div>
                  )}

                  {/* Email / SMS text */}
                  {(activeTab === 'email' || activeTab === 'sms') && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                        {activeTab === 'email' ? 'Isi Email (salin seluruh teks)' : 'Isi Pesan SMS / WhatsApp'}
                      </label>
                      <TextArea
                        value={textVal}
                        onChange={setTextVal}
                        placeholder={activeTab === 'email'
                          ? 'Salin seluruh isi email yang mencurigakan di sini…'
                          : 'Salin pesan SMS atau WhatsApp yang mencurigakan…'}
                        rows={activeTab === 'email' ? 8 : 5}
                      />
                    </div>
                  )}

                  {/* QR Code */}
                  {activeTab === 'qr' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                        Upload gambar QR Code
                      </label>
                      <FileDropzone
                        onFile={setFile}
                        accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'] }}
                        hint="PNG, JPG, JPEG, WEBP — maks 10 MB"
                      />
                    </div>
                  )}

                  {/* Document */}
                  {activeTab === 'document' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                        Upload file dokumen
                      </label>
                      <FileDropzone
                        onFile={setFile}
                        accept={{
                          'application/pdf': ['.pdf'],
                          'application/msword': ['.doc'],
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                          'text/plain': ['.txt'],
                          'message/rfc822': ['.eml'],
                        }}
                        hint="PDF, DOC, DOCX, TXT, EML — maks 10 MB"
                      />
                    </div>
                  )}

                  {error && <ErrorBox message={error} />}

                  <div style={{ marginTop: 20 }}>
                    <PrimaryButton onClick={handleScan} disabled={!canScan()}>
                      🔍 Analisis {tabLabel}
                    </PrimaryButton>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Info strip ── */}
        {!result && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 24,
          }}>
            {[
              { icon: '🔒', title: 'Privasi', desc: 'Data tidak disimpan permanen' },
              { icon: '⚡', title: 'Real-time', desc: 'Hasil dalam hitungan detik' },
              { icon: '🤖', title: 'AI + Blacklist', desc: 'NLP + Google Safe Browsing' },
            ].map(item => (
              <div key={item.title} style={{
                padding: '16px 14px', background: '#F9FAFB',
                border: '1px solid #E5E7EB', borderRadius: 12, textAlign: 'center',
              }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{item.icon}</div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 2 }}>{item.title}</p>
                <p style={{ fontSize: 12, color: '#9CA3AF' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid #E5E7EB', padding: '20px 24px',
        textAlign: 'center', fontSize: 12, color: '#9CA3AF',
      }}>
        PhishGuard — Open source · Powered by Google Safe Browsing, PhishTank & NLP
      </footer>
    </div>
  )
}
