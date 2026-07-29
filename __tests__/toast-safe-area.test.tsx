import { describe, expect, it } from 'vitest'
import { safeAreaOffset } from '../components/ui/sonner'

describe('toast safe-area offset', () => {
  it('adds the safe-area inset to every edge on top of the base spacing', () => {
    const offset = safeAreaOffset('16px')

    expect(offset).toEqual({
      top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
      right: 'calc(env(safe-area-inset-right, 0px) + 16px)',
      bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
      left: 'calc(env(safe-area-inset-left, 0px) + 16px)',
    })
  })

  it('falls back to 0px so devices without a cutout keep the default spacing', () => {
    for (const value of Object.values(safeAreaOffset('24px'))) {
      expect(value).toContain('env(safe-area-inset')
      expect(value).toContain(', 0px)')
      expect(value).toContain('+ 24px')
    }
  })
})
