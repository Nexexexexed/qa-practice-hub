import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-[var(--color-surface-alt)] rounded-xl p-6 w-full max-w-md border border-[var(--color-border)] shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="p-1 hover:bg-[var(--color-border)] rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

// Готовые варианты использования
export const ConfirmModal = ({ 
  isOpen, onClose, onConfirm, title, message 
}: { 
  isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string 
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title}>
    <p className="text-sm text-[var(--color-text-muted)] mb-6">{message}</p>
    <div className="flex justify-end gap-3">
      <button onClick={onClose} className="px-4 py-2 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-border)] transition-colors">
        Отмена
      </button>
      <button onClick={() => { onConfirm(); onClose() }} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
        Удалить
      </button>
    </div>
  </Modal>
)

export const AlertModal = ({ 
  isOpen, onClose, title, message, type = 'info' 
}: { 
  isOpen: boolean; onClose: () => void; title: string; message: string; type?: 'info' | 'success' | 'error' 
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title}>
    <div className={`mb-6 p-3 rounded-lg text-sm ${
      type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
      type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
      'bg-brand/10 text-brand border border-brand/30'
    }`}>
      {message}
    </div>
    <div className="flex justify-end">
      <button onClick={onClose} className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg transition-colors">
        OK
      </button>
    </div>
  </Modal>
)

export default Modal