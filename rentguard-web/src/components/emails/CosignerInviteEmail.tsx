import * as React from 'react';
import { BaseEmail } from './BaseEmail';

interface CosignerInviteEmailProps {
    cosignerName: string;
    tenantName: string;
    applicationId: string;
    baseUrl: string;
}

export const CosignerInviteEmail: React.FC<CosignerInviteEmailProps> = ({
    cosignerName,
    tenantName,
    applicationId,
    baseUrl
}) => {
    const submitUrl = `${baseUrl}/cosigner/submit/${applicationId}`;

    return (
        <BaseEmail previewText={`${tenantName} has listed you as a cosigner for their RentGuard application.`}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Cosigner Document Submission</h2>
            <p style={{ lineHeight: '1.6', marginBottom: '24px' }}>
                Hello {cosignerName},
                <br /><br />
                <strong>{tenantName}</strong> has listed you as a cosigner for their RentGuard rent coverage application. To proceed, we need you to submit the following documentation:
            </p>
            <div style={{
                padding: '16px',
                backgroundColor: '#f0f9ff',
                borderRadius: '6px',
                marginBottom: '24px',
                border: '1px solid #bae6fd'
            }}>
                <ul style={{ paddingLeft: '20px', margin: 0, lineHeight: '1.8', color: '#0c4a6e' }}>
                    <li>Government-issued photo ID</li>
                    <li>Last 2 pay stubs (W-2 employment)</li>
                    <li>3 months of bank statements</li>
                    <li>Proof of employment (employment letter or W-2)</li>
                </ul>
            </div>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <a href={submitUrl} style={{
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    display: 'inline-block'
                }}>
                    Submit Documentation
                </a>
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                If the button doesn&apos;t work, copy and paste this link into your browser:
                <br />
                <a href={submitUrl} style={{ color: '#3b82f6' }}>{submitUrl}</a>
            </p>
        </BaseEmail>
    );
};
