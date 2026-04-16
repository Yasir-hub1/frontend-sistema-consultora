// Componente Button moderno con efectos glassmorphism y gradientes

import React from 'react'
import { clsx } from 'clsx'

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = 'btn'
  
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    warning: 'btn-warning',
    danger: 'btn-error',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    link: 'text-primary-600 hover:text-primary-800 underline focus:ring-primary-500 bg-transparent hover:bg-primary-50 dark:hover:bg-primary-900/20'
  }
  
  const sizes = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
    xl: 'h-14 px-10 text-lg rounded-2xl'
  }
  
  const classes = clsx(
    baseClasses,
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    className
  )
  
  const iconElement = icon && (
    <span className={clsx(
      'flex-shrink-0 transition-transform duration-200',
      iconPosition === 'left' ? 'mr-2' : 'ml-2',
      loading && 'opacity-0'
    )}>
      {icon}
    </span>
  )
  
  const loadingElement = loading && (
    <svg 
      className="animate-spin -ml-1 mr-2 h-4 w-4" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4" 
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
      />
    </svg>
  )
  
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && loadingElement}
      {!loading && iconPosition === 'left' && iconElement}
      <span className={clsx(
        'transition-all duration-200',
        loading && 'opacity-0'
      )}>
        {children}
      </span>
      {!loading && iconPosition === 'right' && iconElement}
    </button>
  )
}

export default Button
