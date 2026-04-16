// Componente Input moderno con glassmorphism y efectos visuales

import React, { forwardRef } from 'react'
import { clsx } from 'clsx'

const Input = forwardRef(({
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
  leftAddon,
  rightAddon,
  size = 'md',
  variant = 'default',
  ...props
}, ref) => {
  const baseClasses = 'input'
  
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
  
  const inputClasses = clsx(
    baseClasses,
    variants[error ? 'error' : variant],
    sizes[size],
    disabled && 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed',
    readOnly && 'bg-gray-50 dark:bg-gray-800',
    leftIcon && 'pl-10',
    rightIcon && 'pr-10',
    leftAddon && 'pl-12',
    rightAddon && 'pr-12',
    className
  )
  
  const containerClasses = clsx(
    'space-y-2',
    containerClassName
  )
  
  const labelClasses = clsx(
    'block text-sm font-semibold text-gray-700 dark:text-gray-300',
    error && 'text-error-700 dark:text-error-400',
    disabled && 'text-gray-500 dark:text-gray-400',
    labelClassName
  )
  
  const errorClasses = clsx(
    'text-sm text-error-600 dark:text-error-400 flex items-center gap-1',
    errorClassName
  )
  
  const helperClasses = clsx(
    'text-sm text-gray-500 dark:text-gray-400',
    helperClassName
  )
  
  return (
    <div className={containerClasses}>
      {label && (
        <label className={labelClasses}>
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative group">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className={clsx(
              'text-gray-400 dark:text-gray-500 transition-colors duration-200',
              'group-focus-within:text-primary-500'
            )}>
              {leftIcon}
            </span>
          </div>
        )}
        
        {leftAddon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              {leftAddon}
            </span>
          </div>
        )}
        
        <input
          ref={ref}
          className={inputClasses}
          disabled={disabled}
          readOnly={readOnly}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className={clsx(
              'text-gray-400 dark:text-gray-500 transition-colors duration-200',
              'group-focus-within:text-primary-500'
            )}>
              {rightIcon}
            </span>
          </div>
        )}
        
        {rightAddon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              {rightAddon}
            </span>
          </div>
        )}
      </div>
      
      {error && (
        <p className={errorClasses}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className={helperClasses}>
          {helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
