'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle, Warning, ShoppingCart, Gift } from 'phosphor-react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  type?: 'default' | 'buy' | 'trial' | 'warning' | 'danger'
  loading?: boolean
  scriptName?: string
  scriptPrice?: string
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'default',
  loading = false,
  scriptName,
  scriptPrice,
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!mounted || !isOpen) return null

  const getTypeStyles = () => {
    switch (type) {
      case 'buy':
        return {
          icon: <ShoppingCart size={32} weight="fill" />,
          iconBg: 'from-cyan-500/30 to-blue-500/30',
          iconColor: 'text-cyan-400',
          confirmBg: 'from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500',
          confirmShadow: 'hover:shadow-cyan-500/25',
        }
      case 'trial':
        return {
          icon: <Gift size={32} weight="fill" />,
          iconBg: 'from-emerald-500/30 to-teal-500/30',
          iconColor: 'text-emerald-400',
          confirmBg: 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500',
          confirmShadow: 'hover:shadow-emerald-500/25',
        }
      case 'warning':
        return {
          icon: <Warning size={32} weight="fill" />,
          iconBg: 'from-yellow-500/30 to-orange-500/30',
          iconColor: 'text-yellow-400',
          confirmBg: 'from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500',
          confirmShadow: 'hover:shadow-yellow-500/25',
        }
      case 'danger':
        return {
          icon: <Warning size={32} weight="fill" />,
          iconBg: 'from-red-500/30 to-pink-500/30',
          iconColor: 'text-red-400',
          confirmBg: 'from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500',
          confirmShadow: 'hover:shadow-red-500/25',
        }
      default:
        return {
          icon: <CheckCircle size={32} weight="fill" />,
          iconBg: 'from-cyan-500/30 to-blue-500/30',
          iconColor: 'text-cyan-400',
          confirmBg: 'from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500',
          confirmShadow: 'hover:shadow-cyan-500/25',
        }
    }
  }

  const styles = getTypeStyles()

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md transform transition-all duration-300 animate-scale-in">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl shadow-cyan-500/10">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-10"
          >
            <X size={20} />
          </button>

          {/* Content */}
          <div className="p-6 pt-8 text-center">
            {/* Icon */}
            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${styles.iconBg} flex items-center justify-center`}>
              <div className={styles.iconColor}>
                {styles.icon}
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>

            {/* Script Info (if provided) */}
            {scriptName && (
              <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm text-slate-300 font-medium">{scriptName}</p>
                {scriptPrice && (
                  <p className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mt-1">
                    {scriptPrice}
                  </p>
                )}
              </div>
            )}

            {/* Description */}
            {description && (
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">{description}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-300 disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r ${styles.confirmBg} transition-all duration-300 hover:shadow-lg ${styles.confirmShadow} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                    Processing...
                  </span>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>

          {/* Decorative gradient line */}
          <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500"></div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { 
            opacity: 0; 
            transform: scale(0.95) translateY(10px); 
          }
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default ConfirmModal

