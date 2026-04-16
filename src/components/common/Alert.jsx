// Componente Alert moderno con glassmorphism y efectos visuales

import React from 'react'
import { clsx } from 'clsx'
import {
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  X,
  Sparkles,
  Shield,
  Zap,
  Star
} from 'lucide-react'

const Alert = ({
  children,
  type = 'info',
  title,
  showIcon = true,
  dismissible = false,
  onDismiss,
  className,
  titleClassName,
  contentClassName,
  iconClassName,
  variant = 'default'
}) => {
  const types = {
    success: {
      bg: 'bg-gradient-to-r from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20',
      border: 'border-success-200/50 dark:border-success-700/50',
      text: 'text-success-800 dark:text-success-200',
      icon: CheckCircle,
      iconColor: 'text-success-500',
      iconBg: 'bg-gradient-to-br from-success-500 to-success-600',
      glow: 'shadow-glow shadow-success-500/25'
    },
    warning: {
      bg: 'bg-gradient-to-r from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20',
      border: 'border-warning-200/50 dark:border-warning-700/50',
      text: 'text-warning-800 dark:text-warning-200',
      icon: AlertTriangle,
      iconColor: 'text-warning-500',
      iconBg: 'bg-gradient-to-br from-warning-500 to-warning-600',
      glow: 'shadow-glow shadow-warning-500/25'
    },
    error: {
      bg: 'bg-gradient-to-r from-error-50 to-error-100 dark:from-error-900/20 dark:to-error-800/20',
      border: 'border-error-200/50 dark:border-error-700/50',
      text: 'text-error-800 dark:text-error-200',
      icon: XCircle,
      iconColor: 'text-error-500',
      iconBg: 'bg-gradient-to-br from-error-500 to-error-600',
      glow: 'shadow-glow shadow-error-500/25'
    },
    info: {
      bg: 'bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20',
      border: 'border-primary-200/50 dark:border-primary-700/50',
      text: 'text-primary-800 dark:text-primary-200',
      icon: Info,
      iconColor: 'text-primary-500',
      iconBg: 'bg-gradient-to-br from-primary-500 to-primary-600',
      glow: 'shadow-glow shadow-primary-500/25'
    }
  }
  
  const alertType = types[type] || types.info
  const IconComponent = alertType.icon
  
  const variants = {
    default: 'rounded-xl border backdrop-blur-sm',
    glass: 'rounded-2xl border backdrop-blur-xl glass-card',
    minimal: 'rounded-lg border-0 bg-transparent'
  }
  
  const alertClasses = clsx(
    variants[variant],
    alertType.bg,
    alertType.border,
    variant !== 'minimal' && 'shadow-soft',
    variant === 'glass' && alertType.glow,
    'transition-all duration-200 hover:shadow-soft-lg',
    className
  )
  
  const titleClasses = clsx(
    'text-sm font-semibold',
    alertType.text,
    titleClassName
  )
  
  const contentClasses = clsx(
    'text-sm',
    alertType.text,
    contentClassName
  )
  
  const iconClasses = clsx(
    'h-5 w-5',
    alertType.iconColor,
    iconClassName
  )
  
  return (
    <div className={alertClasses}>
      <div className="flex items-start">
        {showIcon && (
          <div className="flex-shrink-0">
            {variant === 'glass' ? (
              <div className={`w-8 h-8 rounded-xl ${alertType.iconBg} flex items-center justify-center shadow-glow`}>
                <IconComponent className="h-4 w-4 text-white" />
              </div>
            ) : (
              <IconComponent className={iconClasses} />
            )}
          </div>
        )}
        
        <div className={clsx(showIcon ? 'ml-3' : '', 'flex-1 min-w-0')}>
          {title && (
            <h3 className={titleClasses}>
              {title}
            </h3>
          )}
          
          <div className={clsx(title ? 'mt-2' : '', contentClasses)}>
            {children}
          </div>
        </div>
        
        {dismissible && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={clsx(
                  'inline-flex rounded-xl p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200',
                  'hover:bg-white/50 dark:hover:bg-gray-800/50',
                  'focus:ring-primary-500'
                )}
                onClick={onDismiss}
              >
                <span className="sr-only">Cerrar</span>
                <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Alert
