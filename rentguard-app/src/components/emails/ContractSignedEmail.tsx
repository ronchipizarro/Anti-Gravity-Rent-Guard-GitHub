import React from 'react'
import { BaseEmail } from './BaseEmail'

interface ContractSignedEmailProps {
    tenantName: string
    ownerName?: string
    propertyAddress: string
    signedDate: string
    recipientType?: 'tenant' | 'owner' | 'underwriter'
}

export const ContractSignedEmail = ({
    tenantName,
    ownerName,
    propertyAddress,
    signedDate,
    recipientType = 'tenant',
}: ContractSignedEmailProps) => {
    const isTenant = recipientType === 'tenant'
    const isUnderwriter = recipientType === 'underwriter'

    return (
        <BaseEmail>
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#16a34a' }}>
                    ✓ Contract Signed – Next Steps
                </h2>
                <p style={{ color: '#4b5563', marginBottom: 0 }}>
                    Hello {isTenant ? tenantName : isUnderwriter ? 'Underwriter' : ownerName},
                </p>
            </div>

            <p style={{ color: '#4b5563', marginBottom: 16 }}>
                {isTenant
                    ? 'Excellent! Your rental protection contract has been successfully signed by all parties. We\'re one step closer to activating your protection coverage.'
                    : isUnderwriter
                    ? `The contract for ${tenantName} at ${propertyAddress} has been signed by all parties and is ready for payment processing.`
                    : `Thank you for signing the contract. Your rental protection agreement is now in effect for the property at ${propertyAddress}.`}
            </p>

            {/* Status Card */}
            <div style={{
                backgroundColor: '#dcfce7',
                border: '1px solid #86efac',
                borderRadius: 8,
                padding: 16,
                marginBottom: 24,
            }}>
                <h3 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#166534' }}>
                    Contract Status: ✓ Signed
                </h3>
                <div style={{ marginBottom: 8 }}>
                    <span style={{ color: '#166534', fontSize: 12, display: 'block' }}>PROPERTY</span>
                    <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{propertyAddress}</span>
                </div>
                <div>
                    <span style={{ color: '#166534', fontSize: 12, display: 'block' }}>SIGNED DATE</span>
                    <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{signedDate}</span>
                </div>
            </div>

            {/* Next Steps */}
            {isTenant && (
                <>
                    <h3 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, color: '#1a1a1a' }}>
                        What Happens Next
                    </h3>
                    <ol style={{ color: '#4b5563', paddingLeft: 20, marginBottom: 24 }}>
                        <li style={{ marginBottom: 8 }}>
                            <strong>Payment Processing:</strong> You'll soon receive a payment link to complete the
                            RentGuard protection fee. The fee is a small percentage of your monthly rent.
                        </li>
                        <li style={{ marginBottom: 8 }}>
                            <strong>Coverage Activation:</strong> Once payment is confirmed, your rental protection
                            coverage becomes active immediately.
                        </li>
                        <li style={{ marginBottom: 0 }}>
                            <strong>Protection Active:</strong> You'll receive a confirmation email with your coverage
                            details and claim process instructions.
                        </li>
                    </ol>
                </>
            )}

            {isUnderwriter && (
                <>
                    <h3 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, color: '#1a1a1a' }}>
                        Action Items
                    </h3>
                    <div style={{
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        padding: 16,
                        marginBottom: 24,
                    }}>
                        <p style={{ color: '#4b5563', marginBottom: 8, fontSize: 13 }}>
                            This application is now ready for payment collection:
                        </p>
                        <ul style={{ color: '#4b5563', paddingLeft: 20, margin: 0 }}>
                            <li style={{ marginBottom: 6 }}>Review the fee payer selection in your dashboard</li>
                            <li style={{ marginBottom: 6 }}>Click "Request Payment" to generate the Stripe payment link</li>
                            <li>Payment link will be sent to the fee payer automatically</li>
                        </ul>
                    </div>
                </>
            )}

            {!isTenant && !isUnderwriter && (
                <>
                    <h3 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, color: '#1a1a1a' }}>
                        What's Next
                    </h3>
                    <p style={{ color: '#4b5563', marginBottom: 24 }}>
                        The protection fee payment is due within 7 days. You'll receive a payment link separately.
                        Once payment is complete, the tenant's rental protection coverage will be fully activated.
                    </p>
                </>
            )}

            {/* Support */}
            <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 8,
                padding: 16,
            }}>
                <p style={{ color: '#1e40af', margin: 0, fontSize: 13 }}>
                    <strong>Need help?</strong> If you have any questions about your signed contract or next steps,
                    please reach out to our support team.
                </p>
            </div>
        </BaseEmail>
    )
}
