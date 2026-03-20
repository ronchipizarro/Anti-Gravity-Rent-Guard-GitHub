// ─────────────────────────────────────────────────────────────────────────────
// RentGuard Fee Calculator
//
// GREEN tier:
//   - Base: 5% of annual rent
//   - If tenant income >= 5× monthly rent: 4% of annual rent
//
// YELLOW tier:
//   - Range: 6%–10% of annual rent (underwriter sets in 1% steps)
//   - Default: 8%
//   - Optional deposit (returned after agreement end)
//
// RED tier:
//   - No fee (requires cosigner; fee calculated after cosigner approved)
//
// Fee formula: (monthlyRent × 12 × feePercent) / 12 = annual_fee / 12
// ─────────────────────────────────────────────────────────────────────────────

export type FeeTier = 'GREEN' | 'YELLOW' | 'RED'

export interface FeeInput {
    monthlyRent: number        // USD
    monthlyGrossIncome: number // USD (effective income after co-app)
    tier: FeeTier
    uwFeePercent?: number      // Underwriter override (0.04 to 0.15). If set, takes precedence.
    depositMonths?: number     // Underwriter-set deposit (number of monthly fees). 0 = no deposit.
}

export interface FeeResult {
    feePercent: number    // e.g. 0.05 for 5%
    feePercentDisplay: string  // e.g. "5%"
    monthlyFee: number    // USD — monthly cost to payer
    annualFee: number     // USD
    depositAmount: number // USD — 0 if no deposit requested
    totalDueAtSigning: number // monthlyFee + depositAmount (first payment + deposit)
    feeLabel: string      // Human-readable label
    breakdown: string     // Short explanation of why this rate
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const FEE_GREEN_BASE = 0.05
const FEE_GREEN_HIGH_INCOME = 0.04
const FEE_GREEN_HIGH_INCOME_THRESHOLD = 5 // income >= 5× monthly rent → 4%
const FEE_YELLOW_MIN = 0.06
const FEE_YELLOW_MAX = 0.10
const FEE_YELLOW_DEFAULT = 0.08
const FEE_UW_OVERRIDE_MIN = 0.04
const FEE_UW_OVERRIDE_MAX = 0.15

// ─────────────────────────────────────────────────────────────────────────────
// Fee Calculator
// ─────────────────────────────────────────────────────────────────────────────

export function calculateFee(input: FeeInput): FeeResult {
    const { monthlyRent, monthlyGrossIncome, tier, uwFeePercent, depositMonths = 0 } = input

    let feePercent: number
    let breakdown: string
    let feeLabel: string

    // Underwriter override takes precedence over automatic calculation
    if (uwFeePercent !== undefined) {
        const clamped = Math.max(FEE_UW_OVERRIDE_MIN, Math.min(FEE_UW_OVERRIDE_MAX, uwFeePercent))
        feePercent = clamped
        breakdown = `Underwriter-set rate: ${(clamped * 100).toFixed(0)}% of annual rent`
        feeLabel = 'Custom Rate'
    } else {
        switch (tier) {
            case 'GREEN': {
                const incomeRatio = monthlyGrossIncome / monthlyRent
                if (incomeRatio >= FEE_GREEN_HIGH_INCOME_THRESHOLD) {
                    feePercent = FEE_GREEN_HIGH_INCOME
                    breakdown = `Strong income profile (${incomeRatio.toFixed(1)}× rent): 4% annual rate`
                    feeLabel = 'Strong Profile Rate'
                } else {
                    feePercent = FEE_GREEN_BASE
                    breakdown = `Standard approved rate: 5% annual rent`
                    feeLabel = 'Standard Rate'
                }
                break
            }
            case 'YELLOW': {
                feePercent = FEE_YELLOW_DEFAULT
                breakdown = `Elevated-risk profile: ${(FEE_YELLOW_DEFAULT * 100).toFixed(0)}% annual rate (underwriter may adjust 6–10%)`
                feeLabel = 'Review Rate'
                break
            }
            case 'RED':
            default: {
                feePercent = 0
                breakdown = 'Cosigner required before fee is calculated'
                feeLabel = 'Cosigner Required'
                break
            }
        }
    }

    const annualFee = monthlyRent * 12 * feePercent
    const monthlyFee = annualFee / 12
    const depositAmount = depositMonths > 0 ? monthlyFee * depositMonths : 0
    const totalDueAtSigning = monthlyFee + depositAmount

    return {
        feePercent,
        feePercentDisplay: `${(feePercent * 100).toFixed(0)}%`,
        monthlyFee: Math.round(monthlyFee * 100) / 100,
        annualFee: Math.round(annualFee * 100) / 100,
        depositAmount: Math.round(depositAmount * 100) / 100,
        totalDueAtSigning: Math.round(totalDueAtSigning * 100) / 100,
        feeLabel,
        breakdown,
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Returns valid YELLOW fee percentages (6–10% in 1% steps) */
export function getYellowFeeOptions(): { value: number; label: string }[] {
    const options = []
    for (let pct = FEE_YELLOW_MIN; pct <= FEE_YELLOW_MAX; pct += 0.01) {
        const rounded = Math.round(pct * 100) / 100
        options.push({
            value: rounded,
            label: `${(rounded * 100).toFixed(0)}% — $${Math.round((3000 * 12 * rounded) / 12)}/mo (on $3k rent example)`,
        })
    }
    return options
}

/** Returns valid underwriter override range (4–15% in 1% steps) */
export function getUwOverrideOptions(): { value: number; label: string }[] {
    const options = []
    for (let pct = FEE_UW_OVERRIDE_MIN; pct <= FEE_UW_OVERRIDE_MAX; pct += 0.01) {
        const rounded = Math.round(pct * 100) / 100
        options.push({ value: rounded, label: `${(rounded * 100).toFixed(0)}%` })
    }
    return options
}

/** Format a dollar amount as USD string */
export function formatUSD(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}
