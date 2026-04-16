// Componente Card moderno con glassmorphism y efectos visuales

import React from 'react'
import { clsx } from 'clsx'

const Card = ({
  children,
  title,
  subtitle,
  header,
  footer,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
  titleClassName,
  subtitleClassName,
  shadow = 'soft',
  rounded = '2xl',
  bordered = true,
  padding = 'default',
  hover = true,
  gradient = false,
  ...props
}) => {
  const shadows = {
    none: '',
    sm: 'shadow-sm',
    soft: 'shadow-soft',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    'soft-lg': 'shadow-soft-lg',
    glow: 'shadow-glow',
    'glow-lg': 'shadow-glow-lg'
  }
  
  const roundings = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    '4xl': 'rounded-4xl',
    full: 'rounded-full'
  }
  
  const paddings = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  }
  
  const cardClasses = clsx(
    'card',
    shadows[shadow],
    roundings[rounded],
    bordered && 'border border-gray-200/50 dark:border-gray-700/50',
    hover && 'hover:shadow-soft-lg hover:-translate-y-1',
    gradient && 'bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-800/90 dark:to-gray-900/90',
    className
  )
  
  const headerClasses = clsx(
    'card-header',
    headerClassName
  )
  
  const bodyClasses = clsx(
    'card-content',
    paddings[padding],
    bodyClassName
  )
  
  const footerClasses = clsx(
    'card-footer',
    footerClassName
  )
  
  const titleClasses = clsx(
    'card-title',
    titleClassName
  )
  
  const subtitleClasses = clsx(
    'card-description',
    subtitleClassName
  )
  
  return (
    <div className={cardClasses} {...props}>
      {(header || title || subtitle) && (
        <div className={headerClasses}>
          {header || (
            <>
              {title && <h3 className={titleClasses}>{title}</h3>}
              {subtitle && <p className={subtitleClasses}>{subtitle}</p>}
            </>
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
  )
}

export default Card
