import React from 'react'
import { BaseEmail } from './BaseEmail'

interface SigningReminderEmailProps {
    recipientName: string
    propertyAddress: string
    signingLink: string
    daysSinceSent: number
}

export const SigningReminderEmail = ({
    recipientName,
    propertyAddress,
    signingLink,
    daysSinceSent,
}: SigningReminderEmailProps) => {
    return (
        <BaseEmail previewText="Reminder: Your RentGuard contract needs signature">
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#f59e0b' }}>
                    Reminder: Your Contract Needs Signature
                </h2>
                <p style={{ color: '#4b5563', marginBottom: 0 }}>
                    Hello {recipientName},
                </p>
            </div>

            <p style={{ color: '#4b5563', marginBottom: 16 }}>
                We noticed your RentGuard protection contract was sent {daysSinceSent} day{daysSinceSent !== 1 ? 's' : ''} ago
                and is still awaiting your signature. Please sign at your earliest convenience to activate your
                rental protection coverage.
            </p>

            {/* Status Card */}
            <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #fcd34d',
                borderRadius: 8,
                padding: 16,
                marginBottom: 24,
            }}>
                <h3 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#92400e' }}>
                    Contract Status: Awaiting Signature
                </h3>
                <div style={{ marginBottom: 8 }}>
                    <span style={{ color: '#92400e', fontSize: 12, display: 'block' }}>PROPERTY</span>
                    <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{propertyAddress}</span>
                </div>
                <div>
                    <span style={{ color: '#92400e', fontSize: 12, display: 'block' }}>SENT</span>
                    <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{daysSinceSent} day{daysSinceSent !== 1 ? 's' : ''} ago</span>
                </div>
            </div>

            {/* Call to Action */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <a href={signingLink} style={{
                    display: 'inline-block',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '14px 36px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: 16,
                }}>
                    Sign Contract Now
                </a>
                <p style={{ color: '#6b7280', fontSize: 12, marginTop: 12, marginBottom: 0 }}>
                    Can't click the button? Copy and paste this link:
                    <br />
                    <code style={{ fontSize: 11, color: '#374151', wordBreak: 'break-all' }}>
                        {signingLink}
                    </code>
                </p>
            </div>

            {/* Why Sign */}
            <h3 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, color: '#1a1a1a' }}>
                Why Sign Now?
            </h3>
            <ul style={{ color: '#4b5563', paddingLeft: 20, marginBottom: 24 }}>
                <li style={{ marginBottom: 8 }}>
                    <strong>Activate protection faster</strong> – Coverage begins once payment is complete after signing
                </li>
                <li style={{ marginBottom: 8 }}>
                    <strong>Secure your rental</strong> – Don't leave your property unprotected
                </li>
                <li>
                    <strong>Quick process</strong> – Electronic signing takes just a few minutes
                </li>
            </ul>

            {/* Support */}
            <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 8,
                padding: 16,
            }}>
                <p style={{ color: '#1e40af', margin: 0, fontSize: 13 }}>
                    <strong>Having trouble signing?</strong> If you're experiencing any issues with the signing
                    platform or have questions about the contract, please reply to this email or contact
                    support@rentguard.us.com.
                </p>
            </div>
        </BaseEmail>
    )
}
