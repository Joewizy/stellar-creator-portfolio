import { describe, expect, it } from 'vitest'
import {
  STROOPS_PER_XLM,
  addStroops,
  fromStroops,
  hasSufficientBalance,
  subtractStroops,
  toStroops,
} from '../lib/stellar-amount'

describe('stellar-amount', () => {
  it('parses decimal XLM into integer stroops', () => {
    expect(toStroops('1')).toBe(10_000_000n)
    expect(toStroops('0.0000001')).toBe(1n)
    expect(toStroops('12.3456789')).toBe(123_456_789n)
    expect(toStroops(STROOPS_PER_XLM)).toBe(10_000_000n) // bigint passthrough
  })

  it('round-trips stroops back to a trimmed decimal string', () => {
    expect(fromStroops(10_000_000n)).toBe('1')
    expect(fromStroops(1n)).toBe('0.0000001')
    expect(fromStroops(123_456_789n)).toBe('12.3456789')
    expect(fromStroops(-5_000_000n)).toBe('-0.5')
  })

  it('does not drift when the same tip is applied repeatedly', () => {
    // The classic float failure: 0.1 + 0.2 !== 0.3, and 0.1 * 10 !== 1.
    let floatBalance = 0
    let stroopBalance = 0n
    const tip = toStroops('0.1')

    for (let i = 0; i < 10; i++) {
      floatBalance = floatBalance + 0.1
      stroopBalance = addStroops(stroopBalance, tip)
    }

    // Float has already drifted...
    expect(floatBalance).not.toBe(1)
    // ...but the stroop-tracked balance is exact.
    expect(stroopBalance).toBe(toStroops('1'))
    expect(fromStroops(stroopBalance)).toBe('1')
  })

  it('debits an optimistic balance exactly across many tips', () => {
    let balance = toStroops('100')
    const tip = toStroops('0.1')
    for (let i = 0; i < 1000; i++) {
      balance = subtractStroops(balance, tip)
    }
    expect(fromStroops(balance)).toBe('0') // 100 - 1000 * 0.1
  })

  it('reports insufficient balance without float rounding', () => {
    const balance = toStroops('0.3')
    expect(hasSufficientBalance(balance, toStroops('0.3'))).toBe(true)
    expect(hasSufficientBalance(balance, toStroops('0.3000001'))).toBe(false)
    // 0.1 + 0.2 in stroops is exactly 0.3, so this is NOT wrongly rejected.
    expect(
      hasSufficientBalance(addStroops(toStroops('0.1'), toStroops('0.2')), balance),
    ).toBe(true)
  })

  it('rejects malformed amounts and sub-stroop precision', () => {
    expect(() => toStroops('abc')).toThrow(RangeError)
    expect(() => toStroops('')).toThrow(RangeError)
    expect(() => toStroops('1.23456789')).toThrow(RangeError) // 8 decimals
  })
})
