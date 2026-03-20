import React from 'react'
import { BaseEmail } from './BaseEmail'

interface ContractSentEmailProps {
    tenantName: string
    ownerName?: string
    signingLink: string
    propertyAddress: string
    monthlyRent?: number | string
    feePayer?: string
}

export const ContractSentEmail = ({
    tenantName,
    ownerName,
    signingLink,
    propertyAddress,
    monthlyRent,
    feePayer,
}: ContractSentEmailProps) => {
    const monthlyRentFormatted = monthlyRent
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
            typeof monthlyRent === 'string' ? parseFloat(monthlyRent) : monthlyRent
        )
        : 'N/A'

    return (
        <BaseEmail>
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#1a1a1a' }}>
                    Your RentGuard Protection Contracts Are Ready to Sign
                </h2>
                <p style={{ color: '#4b5563', marginBottom: 0 }}>
                    Hello {tenantName},
                </p>
            </div>

            <p style={{ color: '#4b5563', marginBottom: 16 }}>
                Great news! Your rental protection agreement has been approved and is now ready for signature.
                Please review and sign the contract below to activate your RentGuard protection coverage.
            </p>

            {/* Contract Details */}
            <div style={{
                backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: 16,
                marginBottom: 24,
            }}>
                <h3 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, color: '#1a1a1a' }}>
                    Contract Details
                </h3>
                <div style={{ marginBottom: 8 }}>
                    <span style={{ color: '#6b7280', fontSize: 12, display: 'block' }}>PROPERTY ADDRESS</span>
                    <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{propertyAddress}</span>
                </div>
                <div style={{ marginBottom: 8 }}>
                    <span style={{ color: '#6b7280', fontSize: 12, display: 'block' }}>MONTHLY RENT</span>
                    <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{monthlyRentFormatted}</span>
                </div>
                {feePayer && (
                    <div>
                        <span style={{ color: '#6b7280', fontSize: 12, display: 'block' }}>FEE RESPONSIBILITY</span>
                        <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{feePayer} pays the protection fee</span>
                    </div>
                )}
            </div>

            {/* Call to Action */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <a href={signingLink} style={{
                    display: 'inline-block',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '12px 32px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: 14,
                }}>
                    Review & Sign Contract
                </a>
            </div>

            {/* Instructions */}
            <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#1a1a1a' }}>
                    What Happens Next
                </h3>
                <ol style={{ color: '#4b5563', paddingLeft: 20, marginBottom: 0 }}>
                    <li style={{ marginBottom: 8 }}>Click the button above to review your contract</li>
                    <li style={{ marginBottom: 8 }}>You'll be asked to sign electronically through our secure signing platform</li>
                    <li style={{ marginBottom: 8 }}>Once signed by all parties, we'll proceed with payment processing</li>
                    <li style={{ marginBottom: 0 }}>Your protection coverage will be active upon payment confirmation</li>
                </ol>
            </div>

            {/* Support */}
            <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 8,
                padding: 16,
            }}>
                <p style={{ color: '#1e40af', margin: 0, fontSize: 13 }}>
                    <strong>Questions about the contract?</strong> If you have any questions or concerns,
                    please reply to this email or contact our support team. We're here to help!
                </p>
            </div>
        </BaseEmail>
    )
}
