import { useState, useRef, useEffect } from 'react'
import { MdUpload, MdCheckCircle, MdEdit } from 'react-icons/md'
import PageLoader from '../components/PageLoader/PageLoader'
import './Content.css'

const BASE_URL = 'https://ai-farmer-platform-backend-code.onrender.com/api'
function getToken() {
  return localStorage.getItem('agroflow_token')
}

interface ContentImage {
  id:          string
  key:         string
  label:       string
  description: string
  page:        string
  imageUrl:    string
  previewUrl:  string | null
  file:        File | null
  saved:       boolean
}

const pages = ['All Pages', 'Landing Page', 'Sign In Page', 'Register Page']

export default function Content() {
  const [images, setImages]           = useState<ContentImage[]>([])
  const [pageFilter, setPageFilter]   = useState('All Pages')
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const [loading, setLoading]         = useState(true)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // Load images from backend
  useEffect(() => {
    async function loadImages() {
      try {
        const res  = await fetch(`${BASE_URL}/content`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        })
        const data = await res.json()

        if (data.images && data.images.length > 0) {
          setImages(data.images.map((img: any) => ({
            ...img,
            previewUrl: null,
            file:       null,
            saved:      true,
          })))
        } else {
          // Seed defaults if empty
          await fetch(`${BASE_URL}/content/seed`, {
            method:  'POST',
            headers: { Authorization: `Bearer ${getToken()}` },
          })
          // Reload
          const res2  = await fetch(`${BASE_URL}/content`, {
            headers: { Authorization: `Bearer ${getToken()}` },
          })
          const data2 = await res2.json()
          setImages(data2.images.map((img: any) => ({
            ...img,
            previewUrl: null,
            file:       null,
            saved:      true,
          })))
        }
      } catch (error) {
        console.error('Load content error:', error)
      } finally {
        setLoading(false)
      }
    }
    loadImages()
  }, [])

  const filtered = pageFilter === 'All Pages'
    ? images
    : images.filter(img => img.page === pageFilter)

  function handleFileChange(id: string, file: File | null) {
    if (!file) return
    const previewUrl = URL.createObjectURL(file)
    setImages(prev => prev.map(img =>
      img.id === id ? { ...img, file, previewUrl, saved: false } : img
    ))
  }

  async function handleSave(id: string) {
    const img = images.find(i => i.id === id)
    if (!img || !img.file) return

    try {
      const formData = new FormData()
      formData.append('image',       img.file)
      formData.append('key',         img.key)
      formData.append('label',       img.label)
      formData.append('description', img.description)
      formData.append('page',        img.page)

      const res = await fetch(`${BASE_URL}/content/upload`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body:    formData,
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      setImages(prev => prev.map(i =>
        i.id === id
          ? { ...i, imageUrl: data.image.imageUrl, previewUrl: null, file: null, saved: true }
          : i
      ))

      setSaveSuccess(id)
      setTimeout(() => setSaveSuccess(null), 3000)
    } catch (error) {
      console.error('Save content error:', error)
    }
  }

  function handleDiscard(id: string) {
    setImages(prev => prev.map(img =>
      img.id === id
        ? { ...img, previewUrl: null, file: null, saved: true }
        : img
    ))
  }

  function triggerFileInput(id: string) {
    fileInputRefs.current[id]?.click()
  }

  const pendingCount = images.filter(img => !img.saved).length

if (loading) return <PageLoader />

  return (
    <div className="content-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Content Manager</h2>
          <p className="page-subtitle">
            Manage all brand and marketing images across AgroFlow+
            {pendingCount > 0 && (
              <span className="pending-badge">
                {pendingCount} unsaved change{pendingCount > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="content-tabs">
        {pages.map(p => (
          <button
            key={p}
            className={`content-tab${pageFilter === p ? ' active' : ''}`}
            onClick={() => setPageFilter(p)}
          >
            {p}
            <span className="content-tab-count">
              {p === 'All Pages'
                ? images.length
                : images.filter(img => img.page === p).length}
            </span>
          </button>
        ))}
      </div>

      <div className="content-grid">
        {filtered.map(img => (
          <div key={img.id} className={`content-card${!img.saved ? ' unsaved' : ''}`}>
            <div className="content-card-image-wrap">
              <img
                src={img.previewUrl ?? img.imageUrl}
                alt={img.label}
                className="content-card-image"
              />
              <div className="content-card-overlay">
                <button
                  className="content-upload-overlay-btn"
                  onClick={() => triggerFileInput(img.id)}
                >
                  <MdEdit size={16} />
                  Change Image
                </button>
              </div>
              {!img.saved && <div className="content-unsaved-dot" />}
              <div className="content-page-tag">{img.page}</div>
            </div>

            <div className="content-card-body">
              <p className="content-card-label">{img.label}</p>
              <p className="content-card-desc">{img.description}</p>

              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={el => { fileInputRefs.current[img.id] = el }}
                onChange={e => handleFileChange(img.id, e.target.files?.[0] ?? null)}
              />

              {img.saved ? (
                <button
                  className="content-btn upload"
                  onClick={() => triggerFileInput(img.id)}
                >
                  <MdUpload size={15} />
                  Upload New Image
                </button>
              ) : (
                <div className="content-card-actions">
                  <button
                    className="content-btn save"
                    onClick={() => handleSave(img.id)}
                  >
                    <MdCheckCircle size={15} />
                    {saveSuccess === img.id ? 'Saved!' : 'Save'}
                  </button>
                  <button
                    className="content-btn discard"
                    onClick={() => handleDiscard(img.id)}
                  >
                    Discard
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}