import { NextRequest, NextResponse } from 'next/server'
import { underwrite, UnderwritingInput } from '@/lib/underwriting'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json() as UnderwritingInput

        // Basic input validation
        const required: (keyof UnderwritingInput)[] = [
            'monthlyRent',
            'monthlyGrossIncome',
            'creditScore',
            'employmentStatus',
            'employmentTenureMonths',
            'priorEviction',
        ]

        for (const field of required) {
            if (body[field] === undefined || body[field] === null) {
                return NextResponse.json(
                    { error: `Missing required field: ${field}` },
                    { status: 400 }
                )
            }
        }

        const result = underwrite(body)

        return NextResponse.json(result, { status: 200 })
    } catch (err) {
        console.error('[/api/underwrite] Error:', err)
        return NextResponse.json(
            { error: 'Invalid request body.' },
            { status: 400 }
        )
    }
}
