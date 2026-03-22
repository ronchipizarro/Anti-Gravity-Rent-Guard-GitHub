import * as React from 'react';
import { BaseEmail } from './BaseEmail';

interface TenantInviteEmailProps {
    applicationId: string;
    baseUrl: string;
}

export const TenantInviteEmail: React.FC<TenantInviteEmailProps> = ({
    applicationId,
    baseUrl
}) => {
    const applyUrl = `${baseUrl}/apply/tenant?appId=${applicationId}`;

    return (
        <BaseEmail previewText="You have been invited to apply for rent coverage with RentGuard.">
            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Rent Coverage Invitation</h2>
            <p style={{ lineHeight: '1.5', marginBottom: '24px' }}>
                Hello,
                <br /><br />
                You have been invited to apply for rent coverage through RentGuard. RentGuard helps tenants secure their dream homes by providing rent guarantees to landlords.
            </p>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <a href={applyUrl} style={{
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    display: 'inline-block'
                }}>
                    Start Application
                </a>
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                If the button above doesn&apos;t work, copy and paste this link into your browser:
                <br />
                <a href={applyUrl} style={{ color: '#3b82f6' }}>{applyUrl}</a>
            </p>
        </BaseEmail>
    );
};
