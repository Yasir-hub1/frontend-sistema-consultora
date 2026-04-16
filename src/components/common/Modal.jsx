// Componente Modal reutilizable

import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { clsx } from 'clsx'
import { X } from 'lucide-react'

const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
  overlayClassName,
  headerClassName,
  bodyClassName,
  footerClassName,
  footer
}) => {
  // Manejar tecla Escape
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeOnEscape, onClose])
  
  // Prevenir scroll del body cuando el modal está abierto
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
  
  if (!isOpen) return null
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  }
  
  const overlayClasses = clsx(
    'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50',
    overlayClassName
  )
  
  const modalClasses = clsx(
    'bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-h-[90vh] flex flex-col',
    sizes[size],
    className
  )
  
  const headerClasses = clsx(
    'flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0',
    headerClassName
  )
  
  const bodyClasses = clsx(
    'p-6 flex-1 min-h-0 overflow-y-auto',
    bodyClassName
  )
  
  const footerClasses = clsx(
    'flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0',
    footerClassName
  )
  
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose?.()
    }
  }
  
  const modalContent = (
    <div className={overlayClasses} onClick={handleOverlayClick}>
      <div className={modalClasses}>
        {(title || showCloseButton) && (
          <div className={headerClasses}>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            )}
          </div>
        )}
        
        <div className={bodyClasses}>
          {children}
        </div>
        
        {footer && (
          <div className={footerClasses}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
  
  return createPortal(modalContent, document.body)
}

export default Modal
