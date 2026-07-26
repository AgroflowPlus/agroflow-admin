import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { MdClose } from 'react-icons/md'
import './Drawer.css'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function Drawer({ open, onClose, title, children }: DrawerProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleKey)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return createPortal(
    <>
      <div
        className={`drawer-overlay${open ? ' open' : ''}`}
        onClick={onClose}
      />
      <div className={`drawer${open ? ' open' : ''}`}>
        <div className="drawer-header">
          <h4 className="drawer-title">{title}</h4>
          <button className="drawer-close" onClick={onClose}>
            <MdClose size={20} />
          </button>
        </div>
        <div className="drawer-body">
          {children}
        </div>
      </div>
    </>,
    document.body
  )
}