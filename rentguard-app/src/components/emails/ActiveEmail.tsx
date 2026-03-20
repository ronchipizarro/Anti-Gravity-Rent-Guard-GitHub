import React from 'react'
import { BaseEmail } from './BaseEmail'

interface ActiveEmailProps {
    recipientName: string
    propertyAddress: string
    activationDate?: string
}

export const ActiveEmail = ({
    recipientName,
    propertyAddress,
    activationDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
}: ActiveEmailProps) => {
    return (
        <BaseEmail>
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: '#16a34a' }}>
                    ✓ RentGuard Protection is Now Active
                </h2>
                <p style={{ color: '#4b5563', marginBottom: 0 }}>
                    Hello {recipientName},
                </p>
            </div>

            <p style={{ color: '#4b5563', marginBottom: 16 }}>
                Congratulations! Your RentGuard rental protection coverage is now fully active. Your property and
                investment are protected starting today.
            </p>

            {/* Status Card */}
            <div style={{
                backgroundColor: '#dcfce7',
                border: '2px solid #22c55e',
                borderRadius: 8,
                padding: 20,
                marginBottom: 24,
            }}>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 32 }}>✓</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#166534', textAlign: 'center' }}>
                    Coverage Active
                </h3>
                <div style={{ marginBottom: 10 }}>
                    <span style={{ color: '#166534', fontSize: 12, display: 'block' }}>PROPERTY</span>
                    <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{propertyAddress}</span>
                </div>
                <div>
                    <span style={{ color: '#166534', fontSize: 12, display: 'block' }}>ACTIVATION DATE</span>
                    <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{activationDate}</span>
                </div>
            </div>

            {/* Coverage Overview */}
            <h3 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, color: '#1a1a1a' }}>
                Your Protection Includes:
            </h3>
            <div style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: 16,
                marginBottom: 24,
            }}>
                <ul style={{ color: '#4b5563', paddingLeft: 20, margin: 0 }}>
                    <li style={{ marginBottom: 8 }}>
                        <strong>Rent Default Coverage:</strong> Protection against tenant non-payment of rent
                    </li>
                    <li style={{ marginBottom: 8 }}>
                        <strong>Property Damage:</strong> Coverage for damages beyond normal wear and tear
                    </li>
                    <li style={{ marginBottom: 8 }}>
                        <strong>Eviction Support:</strong> Reimbursement for eviction-related losses and legal fees
                    </li>
                    <li>
                        <strong>Fast Claims:</strong> Claims processed and paid within 5 business days
                    </li>
                </ul>
            </div>

            {/* How to File a Claim */}
            <h3 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, color: '#1a1a1a' }}>
                How to File a Claim
            </h3>
            <ol style={{ color: '#4b5563', paddingLeft: 20, marginBottom: 24 }}>
                <li style={{ marginBottom: 8 }}>
                    <strong>Document the Issue:</strong> Take photos, gather receipts, and document all damages
                </li>
                <li style={{ marginBottom: 8 }}>
                    <strong>Contact Us:</strong> Email claims@rentguard.us.com with your property address and claim details
                </li>
                <li style={{ marginBottom: 8 }}>
                    <strong>Submit Evidence:</strong> Provide documentation supporting your claim
                </li>
                <li>
                    <strong>Claim Processing:</strong> We'll review and respond within 5 business days
                </li>
            </ol>

            {/* Important Information */}
            <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 8,
                padding: 16,
                marginBottom: 24,
            }}>
                <h4 style={{ color: '#1e40af', marginTop: 0, marginBottom: 8 }}>
                    Important Information
                </h4>
                <ul style={{ color: '#1e40af', paddingLeft: 20, margin: 0, fontSize: 13 }}>
                    <li style={{ marginBottom: 4 }}>Keep your claim contact information updated</li>
                    <li style={{ marginBottom: 4 }}>Report incidents as soon as possible (within 30 days)</li>
                    <li>Review your coverage details in your account dashboard</li>
                </ul>
            </div>

            {/* Support */}
            <div style={{
                backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: 16,
            }}>
                <p style={{ color: '#4b5563', margin: 0, fontSize: 13 }}>
                    <strong>Questions?</strong> Our support team is here to help. Email us at
                    support@rentguard.us.com or reply to this email.
                </p>
            </div>
        </BaseEmail>
    )
}
