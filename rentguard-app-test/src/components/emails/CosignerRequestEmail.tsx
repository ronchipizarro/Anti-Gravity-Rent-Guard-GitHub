import * as React from 'react';
import { BaseEmail } from './BaseEmail';

interface CosignerRequestEmailProps {
    tenantName: string;
    applicationId: string;
    baseUrl: string;
}

export const CosignerRequestEmail: React.FC<CosignerRequestEmailProps> = ({
    tenantName,
    applicationId,
    baseUrl
}) => {
    const cosignerUrl = `${baseUrl}/cosigner/${applicationId}`;

    return (
        <BaseEmail previewText="A cosigner is required to complete your RentGuard application.">
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#fef3c7',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    marginBottom: '16px'
                }}>
                    ⚠
                </div>
            </div>
            <h2 style={{ fontSize: '20px', marginBottom: '16px', textAlign: 'center' }}>
                Cosigner Required
            </h2>
            <p style={{ lineHeight: '1.6', marginBottom: '24px' }}>
                Hello {tenantName},
                <br /><br />
                Your RentGuard application requires a <strong>cosigner</strong> to proceed. The cosigner must meet the following criteria:
            </p>
            <div style={{
                padding: '16px',
                backgroundColor: '#fffbeb',
                borderRadius: '6px',
                marginBottom: '24px',
                border: '1px solid #fde68a'
            }}>
                <ul style={{ paddingLeft: '20px', margin: 0, lineHeight: '1.8', color: '#92400e' }}>
                    <li><strong>W-2 employment</strong></li>
                    <li>More than <strong>6 months</strong> at the current job</li>
                    <li>At least <strong>3× income-to-rent ratio</strong></li>
                </ul>
            </div>
            <p style={{ lineHeight: '1.5', marginBottom: '24px' }}>
                Please click the button below to provide cosigner details. Your cosigner will then receive their own link to submit documents.
            </p>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <a href={cosignerUrl} style={{
                    backgroundColor: '#d97706',
                    color: '#ffffff',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    display: 'inline-block'
                }}>
                    Add Cosigner Details
                </a>
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                If the button doesn&apos;t work, copy and paste this link into your browser:
                <br />
                <a href={cosignerUrl} style={{ color: '#3b82f6' }}>{cosignerUrl}</a>
            </p>
        </BaseEmail>
    );
};
