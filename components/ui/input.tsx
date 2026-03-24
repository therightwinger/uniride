import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground/50 selection:bg-primary selection:text-primary-foreground bg-black/[0.03] border-black/[0.06] h-14 w-full min-w-0 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:ring-4 focus-visible:ring-primary/20 border-transparent focus-visible:border-transparent',
        'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
