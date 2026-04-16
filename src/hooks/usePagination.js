// Hook personalizado para paginación

import { useState, useCallback, useMemo } from 'react'

/**
 * Hook para manejar lógica de paginación
 * @param {object} options - Opciones de paginación
 * @param {number} options.initialPage - Página inicial
 * @param {number} options.pageSize - Tamaño de página
 * @param {number} options.totalItems - Total de elementos
 * @returns {object} Estado y funciones de paginación
 */
export const usePagination = (options = {}) => {
  const {
    initialPage = 1,
    pageSize = 10,
    totalItems = 0
  } = options

  const [currentPage, setCurrentPage] = useState(initialPage)
  const [itemsPerPage, setItemsPerPage] = useState(pageSize)

  // Calcular valores derivados
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / itemsPerPage)
  }, [totalItems, itemsPerPage])

  const startIndex = useMemo(() => {
    return (currentPage - 1) * itemsPerPage
  }, [currentPage, itemsPerPage])

  const endIndex = useMemo(() => {
    return Math.min(startIndex + itemsPerPage - 1, totalItems - 1)
  }, [startIndex, itemsPerPage, totalItems])

  const hasNextPage = useMemo(() => {
    return currentPage < totalPages
  }, [currentPage, totalPages])

  const hasPrevPage = useMemo(() => {
    return currentPage > 1
  }, [currentPage])

  const isFirstPage = useMemo(() => {
    return currentPage === 1
  }, [currentPage])

  const isLastPage = useMemo(() => {
    return currentPage === totalPages
  }, [currentPage, totalPages])

  // Funciones de navegación
  const goToPage = useCallback((page) => {
    const targetPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(targetPage)
  }, [totalPages])

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1)
    }
  }, [hasNextPage])

  const prevPage = useCallback(() => {
    if (hasPrevPage) {
      setCurrentPage(prev => prev - 1)
    }
  }, [hasPrevPage])

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1)
  }, [])

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages)
  }, [totalPages])

  const changePageSize = useCallback((newPageSize) => {
    setItemsPerPage(newPageSize)
    setCurrentPage(1) // Reset a la primera página
  }, [])

  const reset = useCallback(() => {
    setCurrentPage(initialPage)
    setItemsPerPage(pageSize)
  }, [initialPage, pageSize])

  // Generar array de páginas para mostrar
  const getPageNumbers = useCallback((maxVisible = 5) => {
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
  }, [currentPage, totalPages])

  return {
    // Estado
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    
    // Flags
    hasNextPage,
    hasPrevPage,
    isFirstPage,
    isLastPage,
    
    // Funciones de navegación
    goToPage,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    changePageSize,
    reset,
    getPageNumbers
  }
}

/**
 * Hook para paginación con datos
 * @param {Array} data - Array de datos a paginar
 * @param {object} options - Opciones de paginación
 * @returns {object} Datos paginados y funciones de paginación
 */
export const usePaginatedData = (data = [], options = {}) => {
  const pagination = usePagination({
    totalItems: data.length,
    ...options
  })

  const paginatedData = useMemo(() => {
    return data.slice(pagination.startIndex, pagination.endIndex + 1)
  }, [data, pagination.startIndex, pagination.endIndex])

  return {
    ...pagination,
    data: paginatedData
  }
}
