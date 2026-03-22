import React from 'react'
import { BaseEmail } from './BaseEmail'

interface PaymentNoticeEmailProps {
    recipientName: string
    feePayer: 'owner' | 'tenant'
    propertyAddress: string
    monthlyFee?: string | number
}

export const PaymentNoticeEmail = ({
    recipientName,
    feePayer,
    propertyAddress,
    monthlyFee,
}: PaymentNoticeEmailProps) => {
    const feePayerName = feePayer === 'owner' ? 'Property Owner' : 'Tenant'
    const monthlyFeeFormatted = monthlyFee
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
            typeof monthlyFee === 'string' ? parseFloat(monthlyFee) : monthlyFee
        )
        : 'calculated amount'

    return (
        <BaseEmail>
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#1a1a1a' }}>
                    RentGuard Protection – Payment in Progress
                </h2>
                <p style={{ color: '#4b5563', marginBottom: 0 }}>
                    Hello {recipientName},
                </p>
            </div>

            <p style={{ color: '#4b5563', marginBottom: 16 }}>
                This is an informational notice that your RentGuard protection agreement has been signed
                and payment is being collected. Your rental protection coverage will activate once payment is confirmed.
            </p>

            {/* Status Info */}
            <div style={{
                backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: 16,
                marginBottom: 24,
            }}>
                <h3 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, color: '#1a1a1a' }}>
                    Coverage Status
                </h3>
                <div style={{ marginBottom: 8 }}>
                    <span style={{ color: '#6b7280', fontSize: 12, display: 'block' }}>PROPERTY ADDRESS</span>
                    <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{propertyAddress}</span>
                </div>
                <div style={{ marginBottom: 8 }}>
                    <span style={{ color: '#6b7280', fontSize: 12, display: 'block' }}>PROTECTION STATUS</span>
                    <span style={{ color: '#1a1a1a', fontWeight: 500 }}>
                        <span style={{ color: '#f97316' }}>●</span> Awaiting Payment
                    </span>
                </div>
                <div>
                    <span style={{ color: '#6b7280', fontSize: 12, display: 'block' }}>RESPONSIBLE PARTY</span>
                    <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{feePayerName}</span>
                </div>
            </div>

            {/* What Happens Next */}
            <h3 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, color: '#1a1a1a' }}>
                What to Expect
            </h3>
            <ol style={{ color: '#4b5563', paddingLeft: 20, marginBottom: 24 }}>
                <li style={{ marginBottom: 8 }}>
                    <strong>Payment Request:</strong> The {feePayerName.toLowerCase()} will receive a payment link
                    (monthly fee: {monthlyFeeFormatted})
                </li>
                <li style={{ marginBottom: 8 }}>
                    <strong>Payment Processing:</strong> Once the fee is paid, we'll confirm receipt and activate coverage
                </li>
                <li>
                    <strong>Coverage Activation:</strong> You'll receive a confirmation email once protection is active
                </li>
            </ol>

            {/* Timeline */}
            <div style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: 16,
                marginBottom: 24,
            }}>
                <h4 style={{ color: '#1a1a1a', marginTop: 0, marginBottom: 12 }}>
                    Expected Timeline
                </h4>
                <div style={{ display: 'flex', gap: 12, color: '#4b5563', fontSize: 13 }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', color: '#1a1a1a' }}>Now</div>
                        <div>Contract Signed</div>
                    </div>
                    <div style={{ color: '#ccc' }}>→</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', color: '#1a1a1a' }}>Today</div>
                        <div>Payment Link Sent</div>
                    </div>
                    <div style={{ color: '#ccc' }}>→</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', color: '#1a1a1a' }}>1-2 Days</div>
                        <div>Coverage Active</div>
                    </div>
                </div>
            </div>

            {/* Questions */}
            <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 8,
                padding: 16,
            }}>
                <p style={{ color: '#1e40af', margin: 0, fontSize: 13 }}>
                    <strong>Questions?</strong> If you have questions about your rental protection or the payment process,
                    please contact our support team at support@rentguard.us.com.
                </p>
            </div>
        </BaseEmail>
    )
}
