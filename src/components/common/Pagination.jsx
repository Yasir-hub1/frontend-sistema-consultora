// Componente Pagination reutilizable

import React from 'react'
import { clsx } from 'clsx'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisible = 5,
  className,
  buttonClassName,
  activeButtonClassName,
  disabledButtonClassName,
  ...props
}) => {
  if (totalPages <= 1) return null
  
  const getPageNumbers = () => {
    const pages = []
    const halfVisible = Math.floor(maxVisible / 2)
    
    let startPage = Math.max(1, currentPage - halfVisible)
    let endPage = Math.min(totalPages, currentPage + halfVisible)
    
    // Ajustar si estamos cerca del inicio o final
    if (endPage - startPage + 1 < maxVisible) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxVisible - 1)
      } else {
        startPage = Math.max(1, endPage - maxVisible + 1)
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    
    return pages
  }
  
  const pageNumbers = getPageNumbers()
  
  const baseButtonClasses = clsx(
    'relative inline-flex items-center px-4 py-2 text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
    buttonClassName
  )
  
  const activeButtonClasses = clsx(
    'relative inline-flex items-center px-4 py-2 text-sm font-medium border border-blue-500 bg-blue-50 text-blue-600 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
    activeButtonClassName
  )
  
  const disabledButtonClasses = clsx(
    'relative inline-flex items-center px-4 py-2 text-sm font-medium border border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed',
    disabledButtonClassName
  )
  
  const firstButtonClasses = clsx(
    'relative inline-flex items-center px-2 py-2 text-sm font-medium border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-l-md',
    buttonClassName
  )
  
  const lastButtonClasses = clsx(
    'relative inline-flex items-center px-2 py-2 text-sm font-medium border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-r-md',
    buttonClassName
  )
  
  return (
    <nav className={clsx('flex items-center justify-between', className)} {...props}>
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage === 1}
          className={clsx(
            currentPage === 1 ? disabledButtonClasses : baseButtonClasses,
            'rounded-md'
          )}
        >
          Anterior
        </button>
        <button
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={clsx(
            currentPage === totalPages ? disabledButtonClasses : baseButtonClasses,
            'rounded-md'
          )}
        >
          Siguiente
        </button>
      </div>
      
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Página <span className="font-medium">{currentPage}</span> de{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            {showFirstLast && (
              <button
                onClick={() => onPageChange?.(1)}
                disabled={currentPage === 1}
                className={clsx(
                  currentPage === 1 ? disabledButtonClasses : firstButtonClasses
                )}
              >
                <span className="sr-only">Primera página</span>
                <ChevronsLeft className="h-5 w-5" />
              </button>
            )}
            
            {showPrevNext && (
              <button
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage === 1}
                className={clsx(
                  currentPage === 1 ? disabledButtonClasses : baseButtonClasses
                )}
              >
                <span className="sr-only">Página anterior</span>
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            
            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange?.(page)}
                className={clsx(
                  page === currentPage ? activeButtonClasses : baseButtonClasses
                )}
              >
                {page}
              </button>
            ))}
            
            {showPrevNext && (
              <button
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={clsx(
                  currentPage === totalPages ? disabledButtonClasses : baseButtonClasses
                )}
              >
                <span className="sr-only">Página siguiente</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
            
            {showFirstLast && (
              <button
                onClick={() => onPageChange?.(totalPages)}
                disabled={currentPage === totalPages}
                className={clsx(
                  currentPage === totalPages ? disabledButtonClasses : lastButtonClasses
                )}
              >
                <span className="sr-only">Última página</span>
                <ChevronsRight className="h-5 w-5" />
              </button>
            )}
          </nav>
        </div>
      </div>
    </nav>
  )
}

export default Pagination
