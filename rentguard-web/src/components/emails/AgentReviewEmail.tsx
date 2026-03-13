import * as React from 'react';
import { BaseEmail } from './BaseEmail';

interface AgentReviewEmailProps {
    applicationId: string;
    tenantName: string;
    monthlyRent: number;
    aiDecision: string;
    aiScore: number;
    recommendations: string[];
    baseUrl: string;
}

export const AgentReviewEmail: React.FC<AgentReviewEmailProps> = ({
    applicationId,
    tenantName,
    monthlyRent,
    aiDecision,
    aiScore,
    recommendations,
    baseUrl
}) => {
    const reviewUrl = `${baseUrl}/underwrite/${applicationId}`;

    return (
        <BaseEmail previewText={`Manual review required for ${tenantName}. AI Recommendation: ${aiDecision}`}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>New Application Review Required</h2>
            <div style={{
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
                marginBottom: '24px',
                border: '1px solid #e5e7eb'
            }}>
                <p style={{ margin: '0 0 8px 0' }}><strong>Tenant:</strong> {tenantName}</p>
                <p style={{ margin: '0 0 8px 0' }}><strong>Monthly Rent:</strong> ${monthlyRent}</p>
                <p style={{ margin: '0 0 8px 0' }}>
                    <strong>AI Recommendation:</strong>
                    <span style={{
                        color: aiDecision === 'GREEN' ? '#059669' : aiDecision === 'YELLOW' ? '#d97706' : '#dc2626',
                        fontWeight: 'bold',
                        marginLeft: '8px'
                    }}>
                        {aiDecision} ({aiScore}/100)
                    </span>
                </p>
            </div>

            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>AI Insights:</h3>
            <ul style={{ paddingLeft: '20px', margin: '0 0 24px 0', lineHeight: '1.5' }}>
                {recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                ))}
            </ul>

            <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Quick Actions:</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
                <a href={`${reviewUrl}?action=approve`} style={{
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 'bold'
                }}>Approve</a>

                <a href={`${reviewUrl}?action=reject`} style={{
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 'bold'
                }}>Reject</a>

                <a href={`${reviewUrl}?action=cosigner`} style={{
                    backgroundColor: '#d97706',
                    color: '#ffffff',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 'bold'
                }}>Request Cosigner</a>
            </div>

            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                For a full breakdown and document review, visit the application portal:
                <br />
                <a href={reviewUrl} style={{ color: '#3b82f6' }}>{reviewUrl}</a>
            </p>
        </BaseEmail>
    );
};
