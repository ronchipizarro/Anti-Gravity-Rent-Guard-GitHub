import React from 'react'
import { BaseEmail } from './BaseEmail'

interface PaymentRequestEmailProps {
    recipientName: string
    feeAmount: number | string
    propertyAddress: string
    paymentLink: string
    dueDate?: string
    feePayer?: 'owner' | 'tenant'
}

export const PaymentRequestEmail = ({
    recipientName,
    feeAmount,
    propertyAddress,
    paymentLink,
    dueDate,
    feePayer,
}: PaymentRequestEmailProps) => {
    const feeFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
        typeof feeAmount === 'string' ? parseFloat(feeAmount) : feeAmount
    )

    const dueDateFormatted = dueDate ? new Date(dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Within 7 days'

    return (
        <BaseEmail>
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#1a1a1a' }}>
                    Complete Your RentGuard Payment – Protection Activation
                </h2>
                <p style={{ color: '#4b5563', marginBottom: 0 }}>
                    Hello {recipientName},
                </p>
            </div>

            <p style={{ color: '#4b5563', marginBottom: 16 }}>
                Your rental protection agreement has been signed and is now ready for payment processing.
                Your RentGuard protection coverage will activate immediately upon payment confirmation.
            </p>

            {/* Payment Details */}
            <div style={{
                backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: 16,
                marginBottom: 24,
            }}>
                <h3 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, color: '#1a1a1a' }}>
                    Payment Details
                </h3>
                <div style={{ marginBottom: 8 }}>
                    <span style={{ color: '#6b7280', fontSize: 12, display: 'block' }}>PROPERTY ADDRESS</span>
                    <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{propertyAddress}</span>
                </div>
                <div style={{ marginBottom: 8 }}>
                    <span style={{ color: '#6b7280', fontSize: 12, display: 'block' }}>PROTECTION FEE</span>
                    <span style={{ color: '#1a1a1a', fontWeight: 'bold', fontSize: 16 }}>{feeFormatted}</span>
                </div>
                <div style={{ marginBottom: 8 }}>
                    <span style={{ color: '#6b7280', fontSize: 12, display: 'block' }}>DUE DATE</span>
                    <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{dueDateFormatted}</span>
                </div>
                <div>
                    <span style={{ color: '#6b7280', fontSize: 12, display: 'block' }}>COVERAGE</span>
                    <span style={{ color: '#1a1a1a', fontWeight: 500 }}>Unlimited Protection</span>
                </div>
            </div>

            {/* Call to Action */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <a href={paymentLink} style={{
                    display: 'inline-block',
                    backgroundColor: '#16a34a',
                    color: 'white',
                    padding: '14px 36px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: 16,
                }}>
                    Complete Payment Now
                </a>
                <p style={{ color: '#6b7280', fontSize: 12, marginTop: 12, marginBottom: 0 }}>
                    Can't click the button? Copy and paste this link:
                    <br />
                    <code style={{ fontSize: 11, color: '#374151', wordBreak: 'break-all' }}>
                        {paymentLink}
                    </code>
                </p>
            </div>

            {/* What's Covered */}
            <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#1a1a1a' }}>
                    Your RentGuard Protection Covers:
                </h3>
                <ul style={{ color: '#4b5563', paddingLeft: 20, margin: '0 0 16px 0' }}>
                    <li style={{ marginBottom: 6 }}>Tenant defaults and non-payment of rent</li>
                    <li style={{ marginBottom: 6 }}>Property damage beyond normal wear</li>
                    <li style={{ marginBottom: 6 }}>Eviction-related losses and legal fees</li>
                    <li>Reimbursement processing within 5 business days</li>
                </ul>
            </div>

            {/* Security */}
            <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #fcd34d',
                borderRadius: 8,
                padding: 16,
                marginBottom: 24,
            }}>
                <p style={{ color: '#92400e', margin: 0, fontSize: 13 }}>
                    <strong>🔒 Secure Payment:</strong> Your payment information is processed securely through Stripe,
                    a trusted payment processor. Your data is never stored on our servers.
                </p>
            </div>

            {/* Support */}
            <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 8,
                padding: 16,
            }}>
                <p style={{ color: '#1e40af', margin: 0, fontSize: 13 }}>
                    <strong>Questions about payment?</strong> If you have any questions or need to update your payment
                    method, please reply to this email or contact our support team.
                </p>
            </div>
        </BaseEmail>
    )
}
