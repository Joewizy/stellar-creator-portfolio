'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps } from 'sonner'

// Add each display cutout's safe-area inset on top of Sonner's default edge
// spacing so a toast never renders under the status bar/notch. `env(...)`
// falls back to 0px on devices without a cutout, preserving the default look.
export const safeAreaOffset = (base: string) => ({
  top: `calc(env(safe-area-inset-top, 0px) + ${base})`,
  right: `calc(env(safe-area-inset-right, 0px) + ${base})`,
  bottom: `calc(env(safe-area-inset-bottom, 0px) + ${base})`,
  left: `calc(env(safe-area-inset-left, 0px) + ${base})`,
})

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      offset={safeAreaOffset('24px')}
      mobileOffset={safeAreaOffset('16px')}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
