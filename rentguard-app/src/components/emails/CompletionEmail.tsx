import React from 'react'
import { BaseEmail } from './BaseEmail'

interface CompletionEmailProps {
    tenantName: string
    ownerName?: string
    propertyAddress: string
    feeAmount?: number | string
    activationDate?: string
    applicationId?: string
}

export const CompletionEmail = ({
    tenantName,
    ownerName,
    propertyAddress,
    feeAmount,
    activationDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    applicationId,
}: CompletionEmailProps) => {
    const feeFormatted = feeAmount
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
            typeof feeAmount === 'string' ? parseFloat(feeAmount) : feeAmount
        )
        : 'N/A'

    return (
        <BaseEmail previewText="Application complete - RentGuard protection activated">
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#16a34a' }}>
                    Application Complete – Protection Activated
                </h2>
                <p style={{ color: '#4b5563', marginBottom: 0 }}>
                    Hello Underwriter,
                </p>
            </div>

            <p style={{ color: '#4b5563', marginBottom: 16 }}>
                An application has completed the full approval workflow. The contract has been signed,
                payment has been confirmed, and rental protection coverage is now active.
            </p>

            {/* Application Summary */}
            <div style={{
                backgroundColor: '#dcfce7',
                border: '2px solid #22c55e',
                borderRadius: 8,
                padding: 20,
                marginBottom: 24,
            }}>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 28 }}>✓</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#166534', textAlign: 'center' }}>
                    Status: ACTIVE
                </h3>
                {applicationId && (
                    <div style={{ marginBottom: 10 }}>
                        <span style={{ color: '#166534', fontSize: 12, display: 'block' }}>APPLICATION ID</span>
                        <span style={{ color: '#1a1a1a', fontWeight: 500, fontFamily: 'monospace', fontSize: 13 }}>
                            {applicationId}
                        </span>
                    </div>
                )}
                <div style={{ marginBottom: 10 }}>
                    <span style={{ color: '#166534', fontSize: 12, display: 'block' }}>TENANT</span>
                    <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{tenantName}</span>
                </div>
                {ownerName && (
                    <div style={{ marginBottom: 10 }}>
                        <span style={{ color: '#166534', fontSize: 12, display: 'block' }}>OWNER</span>
                        <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{ownerName}</span>
                    </div>
                )}
                <div style={{ marginBottom: 10 }}>
                    <span style={{ color: '#166534', fontSize: 12, display: 'block' }}>PROPERTY</span>
                    <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{propertyAddress}</span>
                </div>
                <div style={{ marginBottom: 10 }}>
                    <span style={{ color: '#166534', fontSize: 12, display: 'block' }}>FEE COLLECTED</span>
                    <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{feeFormatted}</span>
                </div>
                <div>
                    <span style={{ color: '#166534', fontSize: 12, display: 'block' }}>ACTIVATION DATE</span>
                    <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{activationDate}</span>
                </div>
            </div>

            {/* Workflow Summary */}
            <h3 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, color: '#1a1a1a' }}>
                Workflow Completed
            </h3>
            <div style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: 16,
                marginBottom: 24,
            }}>
                <div style={{ display: 'flex', gap: 8, color: '#4b5563', fontSize: 12 }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontWeight: 'bold', color: '#16a34a' }}>✓</div>
                        <div>Approved</div>
                    </div>
                    <div style={{ color: '#ccc', alignSelf: 'center' }}>→</div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontWeight: 'bold', color: '#16a34a' }}>✓</div>
                        <div>Signed</div>
                    </div>
                    <div style={{ color: '#ccc', alignSelf: 'center' }}>→</div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontWeight: 'bold', color: '#16a34a' }}>✓</div>
                        <div>Paid</div>
                    </div>
                    <div style={{ color: '#ccc', alignSelf: 'center' }}>→</div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontWeight: 'bold', color: '#16a34a' }}>✓</div>
                        <div>Active</div>
                    </div>
                </div>
            </div>

            {/* Info */}
            <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 8,
                padding: 16,
            }}>
                <p style={{ color: '#1e40af', margin: 0, fontSize: 13 }}>
                    <strong>No further action needed.</strong> Both tenant and owner have received confirmation
                    emails with coverage details and claim instructions.
                </p>
            </div>
        </BaseEmail>
    )
}
