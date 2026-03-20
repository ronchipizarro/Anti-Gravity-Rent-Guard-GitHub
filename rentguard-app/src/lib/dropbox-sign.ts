/**
 * Dropbox Sign (formerly DocuSign) integration for RentGuard
 * Handles e-signature envelopes and webhook signature validation
 */

import crypto from 'crypto'

const apiKey = process.env.DROPBOX_SIGN_API_KEY
const baseUrl = 'https://api.hellosign.com/v3'

/**
 * Create a signature request envelope with Dropbox Sign
 * @param contractPdf - Buffer containing the PDF to be signed
 * @param tenantEmail - Email of the primary signer (tenant)
 * @param tenantName - Full name of the tenant
 * @param ownerEmail - Email of the secondary signer (owner)
 * @param applicationId - ID of the application for tracking
 * @returns Object with envelope_id and signing_link
 */
export async function createSignatureEnvelope(
    contractPdf: Buffer,
    tenantEmail: string,
    tenantName: string,
    ownerEmail: string,
    applicationId: string
): Promise<{ envelope_id: string; signing_link: string }> {
    if (!apiKey) {
        throw new Error('DROPBOX_SIGN_API_KEY is not configured')
    }

    // Create form data for multipart file upload
    const form = new FormData()
    form.append('file', new Blob([new Uint8Array(contractPdf)], { type: 'application/pdf' }), 'contract.pdf')
    form.append('title', `RentGuard Protection Agreement - ${applicationId}`)
    form.append('subject', 'Please sign your RentGuard rental protection agreement')
    form.append('message', 'Your RentGuard protection agreement is ready for signature. Please review and sign both the rental agreement and protection clause.')

    // Add signers
    form.append('signers[0][email_address]', tenantEmail)
    form.append('signers[0][name]', tenantName)
    form.append('signers[0][order]', '0')

    form.append('signers[1][email_address]', ownerEmail)
    form.append('signers[1][name]', 'Property Owner')
    form.append('signers[1][order]', '1')

    // Add CC recipient (underwriter)
    const underwriterEmail = process.env.UNDERWRITER_EMAIL || 'francisco@usadamant.com'
    form.append('cc_email_addresses[]', underwriterEmail)

    // Set callback for completion
    const callbackUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.rentguard.us.com'
    form.append('signing_redirect_url', `${callbackUrl}/underwrite`)

    try {
        const response = await fetch(`${baseUrl}/signature_request/send_with_files`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
            },
            body: form,
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(`Dropbox Sign API Error: ${error.error?.error_msg || response.statusText}`)
        }

        const data = await response.json()
        const envelopeId = data.signature_request?.signature_request_id
        const signingLink = data.signature_request?.signing_url || `${baseUrl}/signature_request/${envelopeId}`

        return { envelope_id: envelopeId, signing_link: signingLink }
    } catch (error) {
        console.error('Failed to create signature envelope:', error)
        throw error
    }
}

/**
 * Validate webhook signature from Dropbox Sign
 * Ensures the webhook came from Dropbox Sign and wasn't tampered with
 * @param requestBody - Raw request body (string)
 * @param xDropboxSignature - Signature header from Dropbox Sign
 * @returns Boolean indicating if signature is valid
 */
export function validateWebhookSignature(requestBody: string, xDropboxSignature: string): boolean {
    if (!apiKey) {
        console.error('DROPBOX_SIGN_API_KEY is not configured')
        return false
    }

    try {
        // Dropbox Sign uses HMAC-SHA256 for webhook signatures
        const computedSignature = crypto
            .createHmac('sha256', apiKey)
            .update(requestBody)
            .digest('hex')

        return xDropboxSignature === computedSignature
    } catch (error) {
        console.error('Webhook signature validation failed:', error)
        return false
    }
}

/**
 * Get signature request details from Dropbox Sign
 * @param signatureRequestId - The ID of the signature request
 * @returns Signature request details
 */
export async function getSignatureRequest(signatureRequestId: string) {
    if (!apiKey) {
        throw new Error('DROPBOX_SIGN_API_KEY is not configured')
    }

    try {
        const response = await fetch(`${baseUrl}/signature_request/${signatureRequestId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
            },
        })

        if (!response.ok) {
            throw new Error(`Failed to get signature request: ${response.statusText}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Failed to get signature request:', error)
        throw error
    }
}
