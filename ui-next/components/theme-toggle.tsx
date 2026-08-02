'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

const options = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'dark', label: 'Dark', icon: Moon }
] as const

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div
        className={cn(
          'inline-flex h-9 min-w-[6.75rem] border border-border bg-muted/40',
          className
        )}
        aria-hidden
      />
    )
  }

  return (
    <div
      role="group"
      aria-label="Theme"
      className={cn(
        'inline-flex h-9 items-stretch border border-border bg-background shadow-sm',
        className
      )}
    >
      {options.map(({ value, label, icon: Icon }) => {
        const active = theme === value
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-label={`${label} theme`}
            aria-pressed={active}
            title={label}
            className={cn(
              'flex items-center justify-center gap-1.5 px-2.5 transition-colors sm:px-3',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset',
              active
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="size-3.5 shrink-0" strokeWidth={2} />
            <span className="hidden text-[11px] font-medium tracking-wide sm:inline">
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
