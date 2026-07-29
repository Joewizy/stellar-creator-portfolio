/**
 * Integer (stroop) money math for Stellar amounts.
 *
 * Stellar denominates value in *stroops*, the integer smallest unit:
 * `1 XLM = 10,000,000 stroops` (7 decimal places). On-chain the contracts use
 * `i128`, so JS/TS code that tracks balances or amounts must do the same and
 * work in integer stroops.
 *
 * Tracking money as a floating-point `number` and mutating it with plain
 * `+`/`-` (e.g. an optimistic local balance updated on every tip) accumulates
 * IEEE-754 rounding error, so the tracked balance drifts from the true on-chain
 * value — surfacing as a wrong displayed balance or an incorrect
 * insufficient-balance rejection.
 *
 * Everything here uses `BigInt` stroops; format to a decimal string only for
 * display via {@link fromStroops}.
 */

/** Stroops in one XLM (`10^7`). */
export const STROOPS_PER_XLM = 10_000_000n

/** Number of decimal places a Stellar amount can represent. */
export const STROOP_DECIMALS = 7

const AMOUNT_PATTERN = /^-?\d+(\.\d+)?$/

/**
 * Parse a decimal amount (e.g. `"12.3456789"` XLM) into integer stroops without
 * ever going through a floating-point `number`.
 *
 * A `number` input is accepted for convenience but a string is preferred, since
 * a `number` may already have lost precision before it reaches this function.
 *
 * @throws {RangeError} if the value is malformed or has more than 7 decimals.
 */
export function toStroops(amount: string | number | bigint): bigint {
  if (typeof amount === 'bigint') return amount

  const raw = typeof amount === 'number' ? numberToDecimalString(amount) : amount.trim()

  if (!AMOUNT_PATTERN.test(raw)) {
    throw new RangeError(`Invalid Stellar amount: "${amount}"`)
  }

  const negative = raw.startsWith('-')
  const [intPart, fracPart = ''] = (negative ? raw.slice(1) : raw).split('.')

  if (fracPart.length > STROOP_DECIMALS) {
    throw new RangeError(
      `Stellar amounts support at most ${STROOP_DECIMALS} decimals: "${amount}"`,
    )
  }

  const fracPadded = fracPart.padEnd(STROOP_DECIMALS, '0')
  const stroops = BigInt(intPart) * STROOPS_PER_XLM + BigInt(fracPadded)
  return negative ? -stroops : stroops
}

/**
 * Format integer stroops back into a decimal XLM string for display, trimming
 * trailing zeros (e.g. `12_3456789n -> "1.23456789"` ... `10_000_000n -> "1"`).
 */
export function fromStroops(stroops: bigint): string {
  const negative = stroops < 0n
  const abs = negative ? -stroops : stroops

  const intPart = abs / STROOPS_PER_XLM
  const fracPart = abs % STROOPS_PER_XLM

  let result = intPart.toString()
  if (fracPart > 0n) {
    const frac = fracPart.toString().padStart(STROOP_DECIMALS, '0').replace(/0+$/, '')
    result += `.${frac}`
  }
  return negative ? `-${result}` : result
}

/** Add two stroop amounts. */
export function addStroops(a: bigint, b: bigint): bigint {
  return a + b
}

/** Subtract `amount` stroops from `balance` stroops (result may be negative). */
export function subtractStroops(balance: bigint, amount: bigint): bigint {
  return balance - amount
}

/** Whether `balance` stroops can cover `amount` stroops. */
export function hasSufficientBalance(balance: bigint, amount: bigint): boolean {
  return balance >= amount
}

/**
 * Convert a `number` to its exact decimal string, avoiding the `"1e-7"`
 * scientific notation that `String(n)` produces for small magnitudes.
 */
function numberToDecimalString(n: number): string {
  if (!Number.isFinite(n)) return String(n)
  if (!n.toString().includes('e')) return n.toString()
  // Small/large magnitudes render in scientific notation; expand via toFixed
  // at stroop precision (extra decimals are rejected by the caller's guard).
  return n.toFixed(STROOP_DECIMALS)
}
