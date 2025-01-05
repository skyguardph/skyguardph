import { ComponentProps } from 'react'
import { classNames } from '@lib/util'

export type Variation = 'default' | 'error' | 'success' | 'warning'
export type Hint = 'important' | 'info'

export const Card = ({
  className = '',
  variation = 'default',
  hint,
  ...props
}: ComponentProps<'div'> & {
  variation?: Variation
  hint?: Hint
}) => {
  const classes = [className]
  classes.push('rounded-lg shadow-lg p-4 transition-all duration-200')

  // Apply variation-specific styles
  switch (variation) {
    case 'error':
      classes.push('bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-200')
      break
    case 'success':
      classes.push('bg-secondary/10 dark:bg-secondary-dark/20 border-l-4 border-secondary text-secondary-dark dark:text-secondary-light')
      break
    case 'warning':
      classes.push('bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200')
      break
    default:
      classes.push('bg-white dark:bg-gray-800 border-l-4 border-primary hover:border-primary-light')
  }

  // Apply hint-specific styles
  if (hint === 'important') {
    classes.push('border-t-2 border-t-primary-light')
  } else if (hint === 'info') {
    classes.push('border-t-2 border-t-secondary-light')
  }

  return <div className={classNames(...classes)} {...props} />
}
