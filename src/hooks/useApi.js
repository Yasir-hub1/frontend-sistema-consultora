// Hook personalizado para peticiones API

import { useState, useEffect, useCallback } from 'react'
import { get, post, put, del } from '../services/api'

/**
 * Hook genérico para peticiones API
 * @param {string} url - URL de la petición
 * @param {object} options - Opciones de la petición
 * @param {object} options.method - Método HTTP (GET, POST, PUT, DELETE)
 * @param {object} options.data - Datos a enviar
 * @param {object} options.params - Parámetros de consulta
 * @param {boolean} options.immediate - Ejecutar inmediatamente
 * @returns {object} Estado y funciones de la petición
 */
export const useApi = (url, options = {}) => {
  const {
    method = 'GET',
    data = null,
    params = {},
    immediate = true
  } = options

  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
    success: false
  })

  const execute = useCallback(async (customData = null, customParams = {}) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      let response

      switch (method.toUpperCase()) {
        case 'GET':
          response = await get(url, { ...params, ...customParams })
          break
        case 'POST':
          response = await post(url, customData || data)
          break
        case 'PUT':
          response = await put(url, customData || data)
          break
        case 'DELETE':
          response = await del(url)
          break
        default:
          throw new Error(`Método HTTP no soportado: ${method}`)
      }

      setState({
        data: response.data,
        loading: false,
        error: null,
        success: true
      })

      return response.data
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error.message || 'Error en la petición',
        success: false
      })
      throw error
    }
  }, [url, method, data, params])

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false
    })
  }, [])

  useEffect(() => {
    if (immediate && method === 'GET') {
      execute()
    }
  }, [execute, immediate, method])

  return {
    ...state,
    execute,
    reset
  }
}

/**
 * Hook para peticiones GET con paginación
 * @param {string} url - URL de la petición
 * @param {object} initialParams - Parámetros iniciales
 * @returns {object} Estado y funciones de la petición paginada
 */
export const usePaginatedApi = (url, initialParams = {}) => {
  const [params, setParams] = useState({
    page: 1,
    per_page: 10,
    search: '',
    sort_by: '',
    sort_direction: 'asc',
    ...initialParams
  })

  const { data, loading, error, success, execute } = useApi(url, {
    method: 'GET',
    params,
    immediate: false
  })

  const fetchData = useCallback(() => {
    execute(null, params)
  }, [execute, params])

  const updateParams = useCallback((newParams) => {
    setParams(prev => ({ ...prev, ...newParams }))
  }, [])

  const goToPage = useCallback((page) => {
    updateParams({ page })
  }, [updateParams])

  const nextPage = useCallback(() => {
    if (data?.data?.current_page < data?.data?.last_page) {
      goToPage(data.data.current_page + 1)
    }
  }, [data, goToPage])

  const prevPage = useCallback(() => {
    if (data?.data?.current_page > 1) {
      goToPage(data.data.current_page - 1)
    }
  }, [data, goToPage])

  const setSearch = useCallback((search) => {
    updateParams({ search, page: 1 })
  }, [updateParams])

  const setSorting = useCallback((sort_by, sort_direction = 'asc') => {
    updateParams({ sort_by, sort_direction })
  }, [updateParams])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data: data?.data,
    loading,
    error,
    success,
    pagination: {
      current_page: data?.data?.current_page || 1,
      last_page: data?.data?.last_page || 1,
      per_page: data?.data?.per_page || 10,
      total: data?.data?.total || 0,
      from: data?.data?.from || 0,
      to: data?.data?.to || 0
    },
    params,
    updateParams,
    goToPage,
    nextPage,
    prevPage,
    setSearch,
    setSorting,
    refetch: fetchData
  }
}

/**
 * Hook para formularios con validación
 * @param {object} initialValues - Valores iniciales
 * @param {object} validationSchema - Esquema de validación
 * @returns {object} Estado y funciones del formulario
 */
export const useForm = (initialValues = {}, validationSchema = {}) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }))
    
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }, [errors])

  const setFieldTouched = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }))
  }, [])

  const validateField = useCallback((name, value) => {
    const validator = validationSchema[name]
    if (validator) {
      const error = validator(value)
      setErrors(prev => ({ ...prev, [name]: error }))
      return error
    }
    return null
  }, [validationSchema])

  const validateForm = useCallback(() => {
    const newErrors = {}
    let isValid = true

    Object.keys(validationSchema).forEach(field => {
      const validator = validationSchema[field]
      if (validator) {
        const error = validator(values[field])
        if (error) {
          newErrors[field] = error
          isValid = false
        }
      }
    })

    setErrors(newErrors)
    return isValid
  }, [values, validationSchema])

  const handleChange = useCallback((name, value) => {
    setValue(name, value)
    validateField(name, value)
  }, [setValue, validateField])

  const handleBlur = useCallback((name) => {
    setFieldTouched(name)
    validateField(name, values[name])
  }, [setFieldTouched, validateField, values])

  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true)
    
    try {
      if (validateForm()) {
        await onSubmit(values)
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [values, validateForm])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  const setFormData = useCallback((newValues) => {
    setValues(newValues)
  }, [])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid: Object.keys(errors).length === 0,
    setValue,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFormData,
    validateField,
    validateForm
  }
}
