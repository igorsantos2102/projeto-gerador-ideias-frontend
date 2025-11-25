import { useMemo } from 'react'
import { cn } from '@/lib/utils'

type TokenProgressBarProps = {
  tokensRemaining: number
  maxTokens?: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const MAX_TOKENS = 10000

export function TokenProgressBar({
  tokensRemaining,
  maxTokens = MAX_TOKENS,
  showLabel = true,
  size = 'sm',
}: TokenProgressBarProps) {
  const percentage = useMemo(() => {
    return Math.max(0, Math.min(100, (tokensRemaining / maxTokens) * 100))
  }, [tokensRemaining, maxTokens])

  const status = useMemo(() => {
    if (percentage >= 50) return 'good'
    if (percentage >= 20) return 'warning'
    return 'critical'
  }, [percentage])

  const formatTokens = (tokens: number) => {
    return tokens.toLocaleString('pt-BR')
  }

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2',
  }

  const statusColors = {
    good: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-rose-500',
  }

  const bgColors = {
    good: 'bg-emerald-100',
    warning: 'bg-amber-100',
    critical: 'bg-rose-100',
  }

  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
          {formatTokens(tokensRemaining)} / {formatTokens(maxTokens)}
        </span>
      )}
      <div className="flex-1 min-w-[80px]">
        <div className={cn('w-full rounded-full overflow-hidden', bgColors[status], sizeClasses[size])}>
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300 ease-out',
              statusColors[status]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      {showLabel && (
        <span className={cn('text-xs font-semibold whitespace-nowrap', {
          'text-emerald-600': status === 'good',
          'text-amber-600': status === 'warning',
          'text-rose-600': status === 'critical',
        })}>
          {percentage.toFixed(0)}%
        </span>
      )}
    </div>
  )
}

