// Componente Select moderno con glassmorphism y efectos visuales

import React, { forwardRef } from 'react'
import { clsx } from 'clsx'

const Select = forwardRef(({
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  readOnly = false,
  className,
  containerClassName,
  labelClassName,
  errorClassName,
  helperClassName,
  leftIcon,
  rightIcon,
  size = 'md',
  variant = 'default',
  options = [],
  placeholder,
  ...props
}, ref) => {
  const baseClasses = 'select'
  
  const variants = {
    default: 'border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500',
    error: 'border-error-300 dark:border-error-600 focus:border-error-500 focus:ring-error-500',
    success: 'border-success-300 dark:border-success-600 focus:border-success-500 focus:ring-success-500'
  }
  
  const sizes = {
    sm: 'h-9 px-3 text-sm rounded-lg',
    md: 'h-11 px-4 text-sm rounded-xl',
    lg: 'h-12 px-4 text-base rounded-xl'
  }
  
  const selectClasses = clsx(
    baseClasses,
    'w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
    'border transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-opacity-20',
    variants[error ? 'error' : variant],
    sizes[size],
    disabled && 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed',
    readOnly && 'bg-gray-50 dark:bg-gray-800',
    leftIcon && 'pl-10',
    rightIcon && 'pr-10',
    className
  )

  return (
    <div className={clsx('space-y-1', containerClassName)}>
      {label && (
        <label
          className={clsx(
            'block text-sm font-medium text-gray-700 dark:text-gray-300',
            required && "after:content-['*'] after:ml-1 after:text-error-500",
            labelClassName
          )}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
            {leftIcon}
          </div>
        )}
        
        <select
          ref={ref}
          className={selectClasses}
          disabled={disabled}
          readOnly={readOnly}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option, index) => {
            if (typeof option === 'string') {
              return (
                <option key={index} value={option}>
                  {option}
                </option>
              )
            }
            return (
              <option key={option.value ?? index} value={option.value}>
                {option.label}
              </option>
            )
          })}
        </select>
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className={clsx('text-sm text-error-500 dark:text-error-400', errorClassName)}>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className={clsx('text-sm text-gray-500 dark:text-gray-400', helperClassName)}>
          {helperText}
        </p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select

