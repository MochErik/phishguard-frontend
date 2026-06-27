import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import ScanResult from './components/ScanResult'
import { scanUrl, scanText, scanQR, scanDocument, scanWeb } from './utils/api'

const TABS = [
  { id: 'url',      label: 'URL / Link',     icon: '🔗' },
  { id: 'email',    label: 'Email',           icon: '✉️' },
  { id: 'sms',      label: 'SMS / WA',        icon: '💬' },
  { id: 'qr',       label: 'QR Code',         icon: '📷' },
  { id: 'web',      label: 'Halaman Web',     icon: '🌐' },
  { id: 'document', label: 'File Dokumen',    icon: '📄' },
]

const SCAN_STEPS = [
  { id: 'blacklist', label: 'Google Safe Browsing', icon: '🔍', desc: 'Memeriksa database blacklist...' },
  { id: 'nlp',       label: 'NLP Engine',           icon: '📝', desc: 'Menganalisis pola teks...' },
  { id: 'ai',        label: 'AI Model (HuggingFace)',icon: '🤖', desc: 'Menjalankan model AI...' },
  { id: 'result',    label: 'Kalkulasi Hasil',       icon: '📊', desc: 'Menghitung skor risiko...' },
]

function FileDropzone({ onFile, accept, hint }) {
  const [filename, setFilename] = useState(null)
  const onDrop = useCallback(files => {
    if (files[0]) { setFilename(files[0].name); onFile(files[0]) }
  }, [onFile])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept, maxFiles: 1 })

  return (
    <div {...getRootProps()} style={{
      border: `2px dashed ${isDragActive ? '#6366F1' : '#E2E8F0'}`,
      borderRadius: 14, padding: '40px 20px', textAlign: 'center',
      background: isDragActive ? '#F5F3FF' : '#FAFBFC',
      cursor: 'pointer', transition: 'all 0.2s',
    }}>
      <input {...getInputProps()} />
      <div style={{ fontSize: 36, marginBottom: 12 }}>{filename ? '✅' : '📁'}</div>
      {filename ? (
        <p style={{ fontSize: 14, color: '#6366F1', fontWeight: 600 }}>{filename}</p>
      ) : (
        <>
          <p style={{ fontSize: 14, color: '#64748B', marginBottom: 4 }}>
            {isDragActive ? 'Lepas file di sini…' : 'Drag & drop atau klik untuk pilih file'}
          </p>
          <p style={{ fontSize: 12, color: '#94A3B8' }}>{hint}</p>
        </>
      )}
    </div>
  )
}

// Real-time scan progress UI
function ScanProgress({ currentStep }) {
  return (
    <div style={{ padding: '32px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          border: '3px solid #E2E8F0',
          borderTopColor: '#6366F1',
          animation: 'spin 0.9s linear infinite',
          margin: '0 auto 16px',
        }} />
        <p style={{ fontSize: 15, fontWeight: 600, color: '#1E293B' }}>Menganalisis...</p>
        <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>
          {SCAN_STEPS[currentStep]?.desc}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {SCAN_STEPS.map((step, i) => {
          const done = i < currentStep
          const active = i === currentStep
          const pending = i > currentStep
          return (
            <div key={step.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 10,
              background: active ? '#F5F3FF' : done ? '#F0FDF4' : '#F8FAFC',
              border: `1px solid ${active ? '#C7D2FE' : done ? '#BBF7D0' : '#E2E8F0'}`,
              transition: 'all 0.3s',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: active ? '#6366F1' : done ? '#22C55E' : '#E2E8F0',
                fontSize: 14,
                flexShrink: 0,
              }}>
                {done ? '✓' : active ? (
                  <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                ) : step.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: active ? '#4F46E5' : done ? '#16A34A' : '#94A3B8' }}>
                  {step.label}
                </p>
              </div>
              <span style={{ fontSize: 12, color: active ? '#6366F1' : done ? '#22C55E' : '#CBD5E1' }}>
                {done ? 'Selesai' : active ? 'Proses...' : 'Menunggu'}
              </span>
            </div>
          )
        })}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function PrimaryButton({ onClick, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', padding: '14px 24px',
      background: disabled ? '#CBD5E1' : 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
      color: '#fff', border: 'none', borderRadius: 12,
      fontSize: 15, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s', letterSpacing: '0.01em',
      boxShadow: disabled ? 'none' : '0 4px 14px rgba(99,102,241,0.35)',
    }}
    onMouseEnter={e => { if (!disabled) e.target.style.transform = 'translateY(-1px)' }}
    onMouseLeave={e => { if (!disabled) e.target.style.transform = 'translateY(0)' }}
    >
      {children}
    </button>
  )
}

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

function TextArea({ value, onChange, placeholder, rows = 6 }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} rows={rows} style={{
        width: '100%', padding: '12px 14px',
        border: '1.5px solid #E2E8F0', borderRadius: 10,
        fontSize: 14, color: '#1E293B', lineHeight: 1.6,
        resize: 'vertical', outline: 'none', background: '#fff',
        transition: 'border-color 0.2s', fontFamily: 'Inter, sans-serif',
      }}
      onFocus={e => e.target.style.borderColor = '#6366F1'}
      onBlur={e => e.target.style.borderColor = '#E2E8F0'}
    />
  )
}

function URLInput({ value, onChange }) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔗</span>
      <input type="url" value={value} onChange={e => onChange(e.target.value)}
        placeholder="https://contoh-website.com/login"
        style={{
          width: '100%', padding: '13px 14px 13px 40px',
          border: '1.5px solid #E2E8F0', borderRadius: 10,
          fontSize: 14, color: '#1E293B', outline: 'none',
          background: '#fff', transition: 'border-color 0.2s',
          fontFamily: 'JetBrains Mono, monospace',
        }}
        onFocus={e => e.target.style.borderColor = '#6366F1'}
        onBlur={e => e.target.style.borderColor = '#E2E8F0'}
      />
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState('url')
  const [urlVal, setUrlVal] = useState('')
  const [textVal, setTextVal] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [scanStep, setScanStep] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const reset = () => {
    setResult(null); setError(null)
    setUrlVal(''); setTextVal(''); setFile(null); setScanStep(0)
  }

  const handleTabChange = (id) => {
    setActiveTab(id); setResult(null); setError(null)
  }

  const handleScan = async () => {
    setError(null); setLoading(true); setResult(null); setScanStep(0)

    // Simulate step progression
    const stepTimer = (step, delay) => setTimeout(() => setScanStep(step), delay)
    stepTimer(1, 800)
    stepTimer(2, 1800)
    stepTimer(3, 2800)

    try {
      let data
      if (activeTab === 'url')           data = await scanUrl(urlVal)
      else if (activeTab === 'email')    data = await scanText(textVal, 'email')
      else if (activeTab === 'sms')      data = await scanText(textVal, 'sms')
      else if (activeTab === 'qr')       data = await scanQR(file)
      else if (activeTab === 'web')      data = await scanWeb(urlVal)
      else if (activeTab === 'document') data = await scanDocument(file)
      setScanStep(4)
      setTimeout(() => { setResult(data); setLoading(false) }, 400)
    } catch (err) {
      const msg = err?.response?.data?.detail || err.message || 'Terjadi kesalahan. Coba lagi.'
      setError(msg); setLoading(false); setScanStep(0)
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
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>

      {/* Navbar */}
      <nav style={{
        padding: '0 32px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 64,
        background: '#fff', borderBottom: '1px solid #E2E8F0',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
          }}>🛡️</div>
          <span style={{ fontWeight: 800, fontSize: 19, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Anti<span style={{ color: '#6366F1' }}>Phish</span>
          </span>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '4px 12px',
          background: '#F5F3FF', color: '#6366F1', borderRadius: 999,
          letterSpacing: '0.03em', border: '1px solid #C7D2FE',
        }}>
          10.000 scan gratis / hari
        </span>
      </nav>

      {/* Hero */}
      {!result && (
        <section style={{
          textAlign: 'center', padding: '52px 24px 36px',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 14px', borderRadius: 999,
            background: '#F5F3FF', border: '1px solid #C7D2FE',
            fontSize: 12, fontWeight: 600, color: '#6366F1',
            marginBottom: 20, letterSpacing: '0.04em',
          }}>
            ✦ AI + Google Safe Browsing + NLP Engine
          </div>
          <h1 style={{
            fontSize: 42, fontWeight: 800, color: '#0F172A',
            letterSpacing: '-0.04em', lineHeight: 1.15, marginBottom: 16,
          }}>
            Deteksi Phishing<br />
            <span style={{
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Secara Instan</span>
          </h1>
          <p style={{ fontSize: 16, color: '#64748B', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
            Analisis URL, Email, SMS, QR Code, dan Dokumen menggunakan
            kecerdasan buatan dan database blacklist terpercaya.
          </p>
        </section>
      )}

      {/* Main */}
      <main style={{ maxWidth: 700, margin: '0 auto', padding: result ? '32px 16px 80px' : '0 16px 80px' }}>
        {result ? (
          <ScanResult result={result} onReset={reset} />
        ) : (
          <>
            <div style={{
              background: '#fff', borderRadius: 20,
              boxShadow: '0 4px 32px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)',
              overflow: 'hidden', border: '1px solid #E2E8F0',
            }}>
              {/* Tabs */}
              <div style={{
                display: 'flex', overflowX: 'auto',
                borderBottom: '1px solid #E2E8F0',
                padding: '0 8px',
                scrollbarWidth: 'none',
              }}>
                {TABS.map(tab => {
                  const active = tab.id === activeTab
                  return (
                    <button key={tab.id} onClick={() => handleTabChange(tab.id)} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: 3, padding: '14px 18px',
                      background: 'none', border: 'none',
                      borderBottom: active ? '2.5px solid #6366F1' : '2.5px solid transparent',
                      color: active ? '#6366F1' : '#94A3B8',
                      fontWeight: active ? 700 : 400,
                      fontSize: 12, cursor: 'pointer',
                      whiteSpace: 'nowrap', transition: 'all 0.15s',
                      marginBottom: -1,
                    }}>
                      <span style={{ fontSize: 20 }}>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Input */}
              {loading ? (
                <ScanProgress currentStep={scanStep} />
              ) : (
                <div style={{ padding: '28px 24px' }}>
                  {(activeTab === 'url' || activeTab === 'web') && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <label style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                        {activeTab === 'web' ? 'URL Halaman Web' : 'URL / Link yang ingin diperiksa'}
                      </label>
                      <URLInput value={urlVal} onChange={setUrlVal} />
                      <p style={{ fontSize: 12, color: '#94A3B8' }}>
                        {activeTab === 'web'
                          ? 'Masukkan URL lengkap termasuk https://'
                          : 'Tempel URL yang mencurigakan — termasuk link pendek seperti bit.ly, s.id, dll'}
                      </p>
                    </div>
                  )}
                  {(activeTab === 'email' || activeTab === 'sms') && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <label style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                        {activeTab === 'email' ? 'Isi Email (salin seluruh teks)' : 'Isi Pesan SMS / WhatsApp'}
                      </label>
                      <TextArea value={textVal} onChange={setTextVal}
                        placeholder={activeTab === 'email'
                          ? 'Salin seluruh isi email yang mencurigakan di sini…'
                          : 'Salin pesan SMS atau WhatsApp yang mencurigakan…'}
                        rows={activeTab === 'email' ? 8 : 5}
                      />
                    </div>
                  )}
                  {activeTab === 'qr' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <label style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Upload gambar QR Code</label>
                      <FileDropzone onFile={setFile}
                        accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'] }}
                        hint="PNG, JPG, JPEG, WEBP — maks 10 MB"
                      />
                    </div>
                  )}
                  {activeTab === 'document' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <label style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Upload file dokumen</label>
                      <FileDropzone onFile={setFile}
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
                  {error && <div style={{ marginTop: 12 }}><ErrorBox message={error} /></div>}
                  <div style={{ marginTop: 20 }}>
                    <PrimaryButton onClick={handleScan} disabled={!canScan()}>
                      🔍 Analisis {tabLabel}
                    </PrimaryButton>
                  </div>
                </div>
              )}
            </div>

            {/* Info cards */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 20,
            }}>
              {[
                { icon: '🔒', title: 'Privasi Terjaga', desc: 'Data tidak disimpan permanen di server kami' },
                { icon: '⚡', title: 'Analisis Real-time', desc: 'Hasil lengkap dalam hitungan detik' },
                { icon: '🤖', title: 'Triple Check', desc: 'AI + Google Safe Browsing + NLP Engine' },
              ].map(item => (
                <div key={item.title} style={{
                  padding: '18px 14px', background: '#fff',
                  border: '1px solid #E2E8F0', borderRadius: 14, textAlign: 'center',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>{item.title}</p>
                  <p style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #E2E8F0', padding: '20px 24px',
        textAlign: 'center', fontSize: 12, color: '#94A3B8',
        background: '#fff',
      }}>
        <p>AntiPhish — Open source · Powered by Google Safe Browsing, PhishTank & NLP</p>
        <p style={{ marginTop: 4, color: '#CBD5E1' }}>Dibuat oleh Synergi A.S.A</p>
      </footer>
    </div>
  )
}
