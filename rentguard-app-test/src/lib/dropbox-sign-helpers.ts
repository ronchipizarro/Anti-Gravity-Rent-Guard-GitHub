// ─────────────────────────────────────────────────────────────────────────────
// Dropbox Sign (formerly HelloSign) Integration
// ─────────────────────────────────────────────────────────────────────────────

const API_KEY = process.env.DROPBOX_SIGN_API_KEY || '';
const API_BASE = 'https://api.hellosign.com/v3';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SignerConfig {
    email: string;
    name: string;
    role?: 'tenant' | 'owner' | 'cosigner';
    order?: number;
}

export interface CreateEnvelopeInput {
    applicationId: string;
    tenantName: string;
    tenantEmail: string;
    ownerName: string;
    ownerEmail: string;
    cosignerEmail?: string;
    cosignerName?: string;
    propertyAddress: string;
    monthlyRent: number;
    feeMonthly: number;
}

export interface EnvelopeResponse {
    signature_request_id: string;
    signers: Array<{
        name: string;
        email: string;
        order: number;
    }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Contract HTML Generation
// ─────────────────────────────────────────────────────────────────────────────

export function generateContractHTML(input: CreateEnvelopeInput): string {
    const { tenantName, ownerName, propertyAddress, monthlyRent, feeMonthly } = input;
    const annualFee = feeMonthly * 12;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>RentGuard Protection Agreement</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        h1 { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .section { margin: 20px 0; }
        .terms { background: #f5f5f5; padding: 15px; border-left: 4px solid #0066cc; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        td { padding: 8px; border: 1px solid #ddd; }
        .signature-line { margin-top: 40px; border-top: 1px solid #333; width: 300px; padding-top: 5px; }
        .footer { margin-top: 60px; font-size: 0.9em; color: #666; }
    </style>
</head>
<body>
    <h1>RentGuard Tenant Protection Agreement</h1>

    <div class="section">
        <h2>Agreement Details</h2>
        <table>
            <tr>
                <td><strong>Tenant Name</strong></td>
                <td>${tenantName}</td>
            </tr>
            <tr>
                <td><strong>Owner/Landlord</strong></td>
                <td>${ownerName}</td>
            </tr>
            <tr>
                <td><strong>Property Address</strong></td>
                <td>${propertyAddress}</td>
            </tr>
            <tr>
                <td><strong>Monthly Rent</strong></td>
                <td>$${monthlyRent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr>
                <td><strong>Monthly Protection Fee</strong></td>
                <td>$${feeMonthly.toLocaleString('en-US', { minimumFractionDigits: 2 })} (${((feeMonthly / monthlyRent) * 100).toFixed(1)}% annual)</td>
            </tr>
            <tr>
                <td><strong>Annual Protection Cost</strong></td>
                <td>$${annualFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <h2>Terms & Conditions</h2>
        <div class="terms">
            <p><strong>1. Coverage Period</strong><br>
            This protection agreement is effective upon final approval by RentGuard's underwriting team and remains active for the duration of the rental agreement between Tenant and Owner.</p>

            <p><strong>2. Protection Scope</strong><br>
            RentGuard provides financial protection against non-payment of rent (up to the monthly rent amount) and property damage beyond normal wear and tear (up to agreed limits). This is not insurance and is subject to terms and conditions.</p>

            <p><strong>3. Payment Terms</strong><br>
            The Tenant agrees to pay the monthly protection fee of $${feeMonthly.toLocaleString('en-US', { minimumFractionDigits: 2 })} via automatic deduction or invoice. Payment is due within 7 days of invoice date.</p>

            <p><strong>4. Claim Process</strong><br>
            In the event of a qualifying claim, Owner will submit documentation to RentGuard within 30 days of the incident. RentGuard will evaluate and process claims within 15 business days.</p>

            <p><strong>5. Acknowledgments</strong><br>
            Both parties acknowledge that they have read, understood, and agree to be bound by the terms of this agreement. This agreement is binding and may not be modified without written consent from RentGuard.</p>
        </div>
    </div>

    <div class="section">
        <h2>Authorized Signatures</h2>
        <p>By signing below, both parties agree to the terms outlined in this RentGuard Protection Agreement.</p>

        <table>
            <tr>
                <td style="width: 50%;">
                    <strong>Tenant Signature</strong><br><br>
                    <div class="signature-line"></div>
                    ${tenantName}<br>
                    Date: __________
                </td>
                <td style="width: 50%;">
                    <strong>Owner/Landlord Signature</strong><br><br>
                    <div class="signature-line"></div>
                    ${ownerName}<br>
                    Date: __________
                </td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <p><strong>RentGuard Inc.</strong> | Anti-Gravity Holdings | noreply@rentguard.us</p>
        <p>Document ID: ${Date.now()} | Agreement Date: ${new Date().toLocaleDateString()}</p>
    </div>
</body>
</html>
    `.trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Create Signature Request via Dropbox Sign API
// ─────────────────────────────────────────────────────────────────────────────

export async function createSignatureRequest(
    input: CreateEnvelopeInput,
): Promise<EnvelopeResponse> {
    try {
        const signers: SignerConfig[] = [
            { email: input.tenantEmail, name: input.tenantName, role: 'tenant', order: 1 },
            { email: input.ownerEmail, name: input.ownerName, role: 'owner', order: 2 },
        ];

        if (input.cosignerEmail && input.cosignerName) {
            signers.push({
                email: input.cosignerEmail,
                name: input.cosignerName,
                role: 'cosigner',
                order: 3,
            });
        }

        // Generate contract HTML
        const contractHTML = generateContractHTML(input);

        // Build multipart form data manually for Node.js compatibility
        const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
        const parts: string[] = [];

        // Add signers
        signers.forEach((signer, idx) => {
            parts.push(`${boundary}\r\nContent-Disposition: form-data; name="signers[${idx}][email_address]"\r\n\r\n${signer.email}`);
            parts.push(`${boundary}\r\nContent-Disposition: form-data; name="signers[${idx}][name]"\r\n\r\n${signer.name}`);
            parts.push(`${boundary}\r\nContent-Disposition: form-data; name="signers[${idx}][order]"\r\n\r\n${signer.order || idx}`);
        });

        // Add file
        parts.push(
            `${boundary}\r\nContent-Disposition: form-data; name="file"; filename="contract.html"\r\nContent-Type: text/html\r\n\r\n${contractHTML}`,
        );

        // Add request details
        parts.push(`${boundary}\r\nContent-Disposition: form-data; name="subject"\r\n\r\nRentGuard Protection Agreement - Signature Required`);
        parts.push(
            `${boundary}\r\nContent-Disposition: form-data; name="message"\r\n\r\nPlease review and sign the RentGuard Protection Agreement for the property at ${input.propertyAddress}.`,
        );

        // Custom fields
        parts.push(
            `${boundary}\r\nContent-Disposition: form-data; name="custom_fields"\r\n\r\n${JSON.stringify({
                application_id: input.applicationId,
                tenant_email: input.tenantEmail,
                owner_email: input.ownerEmail,
            })}`,
        );

        const body = parts.join('\r\n') + `\r\n${boundary}--\r\n`;

        // Make API request
        const response = await fetch(`${API_BASE}/signature_request/send`, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${Buffer.from(`${API_KEY}:`).toString('base64')}`,
                'User-Agent': 'RentGuard/1.0',
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
            },
            body,
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Dropbox Sign API Error: ${response.status} - ${error}`);
        }

        const result = await response.json() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        const data = result.signature_request;

        return {
            signature_request_id: data.signature_request_id,
            signers: signers.map((s, idx) => ({
                name: s.name,
                email: s.email,
                order: s.order || idx,
            })),
        };
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error('Dropbox Sign Error:', error.message);
        throw error;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Get Request Status
// ─────────────────────────────────────────────────────────────────────────────

export async function getSignatureRequestStatus(
    signatureRequestId: string,
): Promise<{
    status: 'sent' | 'signed' | 'declined' | 'expired';
    signers: Array<{
        email: string;
        name: string;
        signed_at: string | null;
    }>;
}> {
    try {
        const response = await fetch(`${API_BASE}/signature_request/${signatureRequestId}`, {
            method: 'GET',
            headers: {
                Authorization: `Basic ${Buffer.from(`${API_KEY}:`).toString('base64')}`,
                'User-Agent': 'RentGuard/1.0',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch status: ${response.status}`);
        }

        const result = await response.json() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        const data = result.signature_request;

        return {
            status: data.is_complete ? 'signed' : data.has_error ? 'declined' : 'sent',
            signers: data.signatures.map((sig: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
                email: sig.signer_email_address,
                name: sig.signer_name,
                signed_at: sig.signed_at || null,
            })),
        };
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error('Dropbox Sign Status Error:', error.message);
        throw error;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Cancel Request
// ─────────────────────────────────────────────────────────────────────────────

export async function cancelSignatureRequest(signatureRequestId: string): Promise<void> {
    try {
        const response = await fetch(`${API_BASE}/signature_request/cancel/${signatureRequestId}`, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${Buffer.from(`${API_KEY}:`).toString('base64')}`,
                'User-Agent': 'RentGuard/1.0',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to cancel: ${response.status}`);
        }
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error('Dropbox Sign Cancel Error:', error.message);
        throw error;
    }
}
