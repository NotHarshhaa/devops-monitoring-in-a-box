import { cn } from '@/lib/utils'
import type { HTMLAttributes, ReactNode } from 'react'

function Corners() {
  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute -top-px -left-px z-10 size-2.5 border-t-2 border-l-2 border-foreground/45 sm:size-3"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -top-px -right-px z-10 size-2.5 border-t-2 border-r-2 border-foreground/45 sm:size-3"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-px -left-px z-10 size-2.5 border-b-2 border-l-2 border-foreground/45 sm:size-3"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-px -bottom-px z-10 size-2.5 border-b-2 border-r-2 border-foreground/45 sm:size-3"
      />
    </>
  )
}

type FrameProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  corners?: boolean
}

export function Frame({
  children,
  className,
  corners = true,
  ...props
}: FrameProps) {
  return (
    <div
      className={cn(
        'relative border border-border bg-background/90',
        className
      )}
      {...props}
    >
      {corners && <Corners />}
      {children}
    </div>
  )
}

type FrameHeaderProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode
  label?: string
}

export function FrameHeader({
  children,
  label,
  className,
  ...props
}: FrameHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-6',
        className
      )}
      {...props}
    >
      {label && (
        <span className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          {label}
        </span>
      )}
      {children}
    </div>
  )
}

export function FrameBody({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-4 py-6 sm:px-6 sm:py-8', className)} {...props}>
      {children}
    </div>
  )
}
