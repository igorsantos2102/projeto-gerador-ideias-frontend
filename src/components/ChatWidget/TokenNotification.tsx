import { useEffect, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

if (typeof document !== 'undefined') {
  const styleId = 'token-notification-animation'
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `
    document.head.appendChild(style)
  }
}

type TokenNotificationProps = {
  tokensRemaining: number
  maxTokens?: number
  onDismiss?: () => void
}

const MAX_TOKENS = 10000
const WARNING_THRESHOLD = 2000 
const CRITICAL_THRESHOLD = 1000 

export function TokenNotification({
  tokensRemaining,
  maxTokens = MAX_TOKENS,
  onDismiss,
}: TokenNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!dismissed && tokensRemaining < WARNING_THRESHOLD) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [tokensRemaining, dismissed])

  const handleDismiss = () => {
    setIsVisible(false)
    setDismissed(true)
    onDismiss?.()
  }

  if (!isVisible) return null

  const isCritical = tokensRemaining < CRITICAL_THRESHOLD
  const percentage = (tokensRemaining / maxTokens) * 100

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 flex items-start gap-3 rounded-lg border p-4 shadow-lg',
        isCritical
          ? 'border-rose-300 bg-rose-50 text-rose-900'
          : 'border-amber-300 bg-amber-50 text-amber-900',
        'max-w-sm'
      )}
      role="alert"
      style={{
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <AlertTriangle className={cn('h-5 w-5 flex-shrink-0', isCritical ? 'text-rose-600' : 'text-amber-600')} />
      <div className="flex-1 min-w-0">
        <h4 className={cn('text-sm font-semibold mb-1', isCritical ? 'text-rose-900' : 'text-amber-900')}>
          {isCritical ? 'Tokens Críticos!' : 'Atenção: Tokens Baixos'}
        </h4>
        <p className="text-xs mb-2">
          {isCritical
            ? `Você tem apenas ${tokensRemaining.toLocaleString('pt-BR')} tokens restantes. O chat será bloqueado quando chegar a zero.`
            : `Você tem ${tokensRemaining.toLocaleString('pt-BR')} tokens restantes (${percentage.toFixed(0)}%). Considere economizar tokens.`}
        </p>
        <div className="w-full h-1.5 bg-white/50 rounded-full overflow-hidden">
          <div
            className={cn('h-full transition-all duration-300', isCritical ? 'bg-rose-500' : 'bg-amber-500')}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        className={cn(
          'flex-shrink-0 rounded p-1 transition hover:bg-white/50',
          isCritical ? 'text-rose-600 hover:text-rose-700' : 'text-amber-600 hover:text-amber-700'
        )}
        aria-label="Fechar notificação"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

