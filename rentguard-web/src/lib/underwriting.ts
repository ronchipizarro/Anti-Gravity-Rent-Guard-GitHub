// ─────────────────────────────────────────────────────────────────────────────
// RentGuard Credit Underwriting Engine — Florida, USA (MVP)
// Decision Tiers: GREEN (Approved) | YELLOW (Manual Review) | RED (Rejected)
// ─────────────────────────────────────────────────────────────────────────────

export type EmploymentStatus =
    | 'w2'
    | 'self_employed'
    | '1099'
    | 'retired'
    | 'student'
    | 'other'

export type DecisionTier = 'GREEN' | 'YELLOW' | 'RED'

export interface UnderwritingInput {
    // Financial
    monthlyRent: number           // USD
    monthlyGrossIncome: number    // USD
    otherMonthlyIncome?: number   // USD (optional)
    creditScore: number           // 300–850

    // Employment
    employmentStatus: EmploymentStatus
    employmentTenureMonths: number   // months at current job/business
    year1TaxableIncome?: number      // for self-employed/1099 — year 1
    year2TaxableIncome?: number      // for self-employed/1099 — year 2

    // History
    priorEviction: boolean

    // Optional modifiers
    hasCoApplicant?: boolean
    coApplicantMonthlyIncome?: number
    coApplicantCreditScore?: number
}

export interface RuleResult {
    rule: string
    passed: boolean
    tier: DecisionTier
    detail: string
}

export interface UnderwritingResult {
    tier: DecisionTier
    label: string
    score: number               // 0–100 internal score
    rules: RuleResult[]
    summary: string
    recommendations: string[]
    timestamp: string
}

// ─── Rule Engine ─────────────────────────────────────────────────────────────

const INCOME_MULTIPLE = 3
const MIN_CREDIT_SCORE = 600
const YELLOW_CREDIT_SCORE = 650
const MIN_EMPLOYMENT_MONTHS = 6

function calculateEffectiveIncome(input: UnderwritingInput): number {
    let base = input.monthlyGrossIncome + (input.otherMonthlyIncome ?? 0)

    // For self-employed / 1099: use average of two tax years if available
    if (
        (input.employmentStatus === 'self_employed' || input.employmentStatus === '1099') &&
        input.year1TaxableIncome !== undefined &&
        input.year2TaxableIncome !== undefined
    ) {
        const avgAnnual = (input.year1TaxableIncome + input.year2TaxableIncome) / 2
        base = avgAnnual / 12 + (input.otherMonthlyIncome ?? 0)
    }

    // Add co-applicant income if provided
    if (input.hasCoApplicant && input.coApplicantMonthlyIncome) {
        base += input.coApplicantMonthlyIncome
    }

    return base
}

export function underwrite(input: UnderwritingInput): UnderwritingResult {
    const rules: RuleResult[] = []
    const recommendations: string[] = []
    let internalScore = 100

    // ── Rule 1: Prior Eviction (Auto-Reject) ────────────────────────────────
    const evictionPassed = !input.priorEviction
    rules.push({
        rule: 'No Prior Eviction History',
        passed: evictionPassed,
        tier: evictionPassed ? 'GREEN' : 'RED',
        detail: evictionPassed
            ? 'No prior eviction history on record.'
            : 'Applicant has a prior eviction. Auto-rejected per underwriting policy.',
    })

    if (!evictionPassed) {
        return {
            tier: 'RED',
            label: 'Rejected — Auto',
            score: 0,
            rules,
            summary: 'Application automatically rejected due to prior eviction history.',
            recommendations: ['Prior eviction history results in automatic rejection per current underwriting guidelines.'],
            timestamp: new Date().toISOString(),
        }
    }

    // ── Rule 2: Income Ratio ─────────────────────────────────────────────────
    const effectiveIncome = calculateEffectiveIncome(input)
    const requiredIncome = input.monthlyRent * INCOME_MULTIPLE
    const incomeRatio = effectiveIncome / input.monthlyRent
    const incomePassed = effectiveIncome >= requiredIncome

    let incomeTier: DecisionTier = 'GREEN'
    if (!incomePassed) {
        if (incomeRatio >= 2.5) {
            incomeTier = 'YELLOW'
            internalScore -= 20
            recommendations.push('Income is below the 3× threshold but within manual review range. Request additional documentation.')
        } else {
            incomeTier = 'RED'
            internalScore -= 40
        }
    }

    rules.push({
        rule: 'Income ≥ 3× Monthly Rent',
        passed: incomePassed,
        tier: incomeTier,
        detail: `Effective monthly income: $${effectiveIncome.toFixed(0)} | Required: $${requiredIncome.toFixed(0)} | Ratio: ${incomeRatio.toFixed(2)}×`,
    })

    // ── Rule 3: Credit Score ─────────────────────────────────────────────────
    const { creditScore } = input
    const creditPassed = creditScore >= MIN_CREDIT_SCORE
    let creditTier: DecisionTier = 'GREEN'

    if (!creditPassed) {
        creditTier = 'RED'
        internalScore -= 35
    } else if (creditScore < YELLOW_CREDIT_SCORE) {
        creditTier = 'YELLOW'
        internalScore -= 15
        recommendations.push('Credit score is within the caution zone (600–649). Consider requesting additional income documentation.')
    }

    rules.push({
        rule: `Credit Score ≥ ${MIN_CREDIT_SCORE}`,
        passed: creditPassed,
        tier: creditTier,
        detail: `Credit score: ${creditScore} | Minimum required: ${MIN_CREDIT_SCORE} | Zone: ${creditScore >= 700 ? 'Good' : creditScore >= 650 ? 'Fair' : creditScore >= 600 ? 'Caution' : 'Below Threshold'
            }`,
    })

    // ── Rule 4: Employment Tenure ────────────────────────────────────────────
    const tenurePassed = input.employmentTenureMonths >= MIN_EMPLOYMENT_MONTHS
    let tenureTier: DecisionTier = 'GREEN'

    if (!tenurePassed) {
        if (input.employmentTenureMonths >= 3) {
            tenureTier = 'YELLOW'
            internalScore -= 15
            recommendations.push('Employment tenure is below 6 months. Manual review of employment letter and income verification recommended.')
        } else {
            tenureTier = 'RED'
            internalScore -= 25
        }
    }

    rules.push({
        rule: 'Employment ≥ 6 Months',
        passed: tenurePassed,
        tier: tenureTier,
        detail: `Employment tenure: ${input.employmentTenureMonths} months${input.employmentStatus === 'self_employed' || input.employmentStatus === '1099'
                ? ' (Self-employed — income averaged from 2-year tax returns)'
                : ''
            }`,
    })

    // ── Rule 5: Co-Applicant (Positive Modifier) ────────────────────────────
    if (input.hasCoApplicant && input.coApplicantCreditScore) {
        const coScore = input.coApplicantCreditScore
        const coBonus = coScore >= 700 ? 5 : coScore >= 650 ? 3 : 0
        internalScore = Math.min(100, internalScore + coBonus)
        rules.push({
            rule: 'Co-Applicant',
            passed: true,
            tier: 'GREEN',
            detail: `Co-applicant with credit score ${coScore} adds support to the application.`,
        })
    }

    // ── Final Decision ───────────────────────────────────────────────────────
    const finalScore = Math.max(0, internalScore)
    const hasRed = rules.some((r) => r.tier === 'RED')
    const hasYellow = rules.some((r) => r.tier === 'YELLOW')

    let tier: DecisionTier
    let label: string
    let summary: string

    if (hasRed) {
        tier = 'RED'
        label = 'Rejected'
        summary = 'Application does not meet minimum underwriting requirements. One or more hard criteria were not satisfied.'
    } else if (hasYellow) {
        tier = 'YELLOW'
        label = 'Manual Review Required'
        summary = 'Application is within acceptable range but requires a manual review by an underwriter before a final decision can be issued.'
    } else {
        tier = 'GREEN'
        label = 'Approved'
        summary = 'Applicant meets all RentGuard underwriting criteria for Florida residential rental coverage.'
        recommendations.push('Coverage can proceed. Issue protection agreement.')
    }

    return {
        tier,
        label,
        score: finalScore,
        rules,
        summary,
        recommendations,
        timestamp: new Date().toISOString(),
    }
}
