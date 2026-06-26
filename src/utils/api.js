import axios from 'axios'

const BASE_URL = 'https://phishguard-backend-production-7826.up.railway.app'

const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 30000,
})

export const scanUrl = (url) =>
  api.post('/scan/url', { url }).then(r => r.data)

export const scanText = (text, scan_type = 'email') =>
  api.post('/scan/text', { text, scan_type }).then(r => r.data)

export const scanQR = (file) => {
  const fd = new FormData()
  fd.append('file', file)
  return api.post('/scan/qr', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}

export const scanDocument = (file) => {
  const fd = new FormData()
  fd.append('file', file)
  return api.post('/scan/document', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}

export const scanWeb = (url) =>
  api.post('/scan/web', { url }).then(r => r.data)

export const getStats = () =>
  api.get('/stats').then(r => r.data)
