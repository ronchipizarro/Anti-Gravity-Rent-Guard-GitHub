import * as React from 'react';
import { BaseEmail } from './BaseEmail';

interface TenantDecisionEmailProps {
    tenantName: string;
    decision: 'approved' | 'rejected';
}

export const TenantDecisionEmail: React.FC<TenantDecisionEmailProps> = ({
    tenantName,
    decision
}) => {
    const isApproved = decision === 'approved';

    return (
        <BaseEmail previewText={`Your RentGuard application has been ${decision}.`}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: isApproved ? '#d1fae5' : '#fee2e2',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    marginBottom: '16px'
                }}>
                    {isApproved ? '✓' : '✗'}
                </div>
            </div>
            <h2 style={{ fontSize: '20px', marginBottom: '16px', textAlign: 'center' }}>
                Application {isApproved ? 'Approved' : 'Declined'}
            </h2>
            <p style={{ lineHeight: '1.6', marginBottom: '24px' }}>
                Hello {tenantName},
                <br /><br />
                {isApproved ? (
                    <>
                        Congratulations! Your RentGuard rent coverage application has been <strong style={{ color: '#059669' }}>approved</strong>.
                        <br /><br />
                        Our team will be in touch shortly to finalize the protection agreement and next steps. No further action is needed from you at this time.
                    </>
                ) : (
                    <>
                        We regret to inform you that your RentGuard application has been <strong style={{ color: '#dc2626' }}>declined</strong> at this time.
                        <br /><br />
                        This decision was made based on our current underwriting criteria. If you believe there has been an error or your circumstances have changed, please don&apos;t hesitate to reach out.
                    </>
                )}
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                Thank you for considering RentGuard.
            </p>
        </BaseEmail>
    );
};
