import * as React from 'react';
import { BaseEmail } from './BaseEmail';

interface OwnerNotificationEmailProps {
    tenantName: string;
    propertyAddress?: string;
}

export const OwnerNotificationEmail: React.FC<OwnerNotificationEmailProps> = ({
    tenantName,
    propertyAddress
}) => {
    return (
        <BaseEmail previewText={`RentGuard application submitted for ${tenantName}.`}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Application Submitted</h2>
            <p style={{ lineHeight: '1.5', marginBottom: '24px' }}>
                Hello,
                <br /><br />
                A rent coverage application has been successfully submitted by <strong>{tenantName}</strong>{propertyAddress ? ` for property ${propertyAddress}` : ''}.
            </p>
            <div style={{
                padding: '16px',
                backgroundColor: '#f3f4f6',
                borderRadius: '6px',
                marginBottom: '24px',
                border: '1px solid #e5e7eb'
            }}>
                <h3 style={{ fontSize: '16px', margin: '0 0 12px 0' }}>Next Steps:</h3>
                <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.5' }}>
                    <li>Our underwriting team is reviewing the application.</li>
                    <li>We verify credit, income, and employment history.</li>
                    <li>You should expect to hear back with a final decision within 24–48 hours.</li>
                </ul>
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                Thank you for using RentGuard to protect your rental income.
            </p>
        </BaseEmail>
    );
};
