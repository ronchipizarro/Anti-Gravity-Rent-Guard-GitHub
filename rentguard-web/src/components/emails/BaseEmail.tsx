import * as React from 'react';

interface BaseEmailProps {
    children: React.ReactNode;
    previewText: string;
}

export const BaseEmail: React.FC<BaseEmailProps> = ({ children, previewText }) => (
    <div style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#f9fafb',
        padding: '24px',
        color: '#111827'
    }}>
        <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid #e5e7eb'
        }}>
            <div style={{
                backgroundColor: '#000000',
                padding: '24px',
                textAlign: 'center'
            }}>
                <h1 style={{ color: '#ffffff', margin: 0, fontSize: '24px' }}>RentGuard</h1>
            </div>
            <div style={{ padding: '32px' }}>
                {children}
            </div>
            <div style={{
                padding: '24px',
                backgroundColor: '#f3f4f6',
                textAlign: 'center',
                fontSize: '12px',
                color: '#6b7280'
            }}>
                © {new Date().getFullYear()} RentGuard. All rights reserved.
            </div>
        </div>
        <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden' }}>{previewText}</div>
    </div>
);
