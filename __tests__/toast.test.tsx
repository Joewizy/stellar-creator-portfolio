import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { beforeAll, describe, expect, it } from 'vitest'
import { Toaster } from '../components/ui/toaster'
import { reducer, toast } from '../hooks/use-toast'

// Radix Toast relies on browser APIs that jsdom doesn't implement.
beforeAll(() => {
  ;(globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  if (!window.matchMedia) {
    ;(window as any).matchMedia = () => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
    })
  }
})

describe('toast stacking', () => {
  it('keeps more than one toast so multiple can stack, capped at the limit', () => {
    let state = { toasts: [] as any[] }
    for (let i = 0; i < 5; i++) {
      state = reducer(state, {
        type: 'ADD_TOAST',
        toast: { id: String(i), open: true, description: `msg ${i}` },
      })
    }

    // More than one visible (the scenario the issue is about), but bounded.
    expect(state.toasts.length).toBeGreaterThan(1)
    expect(state.toasts.length).toBeLessThanOrEqual(3)
  })

  it('renders the toast description with wrapping/height guards so long messages do not overflow', () => {
    render(<Toaster />)

    act(() => {
      toast({
        title: 'Heads up',
        description:
          'This is a very long toast message that would previously push a fixed-offset toast into the one beneath it and cause them to overlap.',
      })
    })

    const description = screen.getByText(/very long toast message/i)
    expect(description.className).toContain('break-words')
    expect(description.className).toContain('line-clamp-4')
  })
})
