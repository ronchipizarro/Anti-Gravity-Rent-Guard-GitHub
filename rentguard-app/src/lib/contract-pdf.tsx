/**
 * Contract PDF Generator for RentGuard
 * Creates professional rental protection contract PDFs
 */

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

/**
 * Application data structure for contract generation
 */
export interface ContractData {
    applicationId: string
    property: {
        address: string
        city: string
        state: string
        zip?: string
        monthly_rent: number | string
    }
    tenant: {
        first_name: string
        last_name: string
        email: string
    }
    owner: {
        first_name?: string
        last_name?: string
        email: string
    }
    fee_payer: 'owner' | 'tenant'
}

// PDF Styles
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 11,
        lineHeight: 1.6,
        color: '#1a1a1a',
    },
    header: {
        marginBottom: 30,
        borderBottom: 2,
        paddingBottom: 20,
        borderBottomColor: '#2563eb',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#1a1a1a',
    },
    subtitle: {
        fontSize: 12,
        color: '#4b5563',
        marginBottom: 3,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 12,
        color: '#1a1a1a',
        borderBottom: 1,
        borderBottomColor: '#e5e7eb',
        paddingBottom: 4,
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        marginBottom: 6,
    },
    label: {
        fontWeight: 'bold',
        width: '35%',
        color: '#4b5563',
    },
    value: {
        width: '65%',
        color: '#1a1a1a',
    },
    twoColumn: {
        display: 'flex',
        flexDirection: 'row',
        gap: 20,
        marginBottom: 10,
    },
    column: {
        flex: 1,
    },
    signatureBlock: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: 4,
        marginBottom: 20,
    },
    signatureLine: {
        borderBottom: 1,
        borderBottomColor: '#000000',
        width: 200,
        marginBottom: 4,
    },
    text: {
        marginBottom: 8,
        lineHeight: 1.8,
        textAlign: 'justify',
    },
})

/**
 * Format currency for display
 */
const formatCurrency = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num)
}

/**
 * Generate a contract PDF as a Buffer
 * @param data - Application data for contract generation
 * @returns Buffer containing the PDF
 */
export async function generateContractPdf(data: ContractData): Promise<Buffer> {
    const monthlyRent = typeof data.property.monthly_rent === 'string'
        ? parseFloat(data.property.monthly_rent)
        : data.property.monthly_rent

    const annualRent = monthlyRent * 12
    const protectionFee = monthlyRent * 0.04 // 4% of monthly rent

    const propertyAddress = `${data.property.address}, ${data.property.city}, ${data.property.state}${data.property.zip ? ` ${data.property.zip}` : ''}`

    // Create the PDF document
    const doc = (
        <Document>
            <Page size="LETTER" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>RENTAL PROTECTION AGREEMENT</Text>
                    <Text style={styles.subtitle}>RentGuard Protection Services</Text>
                    <Text style={styles.subtitle}>Agreement ID: {data.applicationId}</Text>
                    <Text style={styles.subtitle}>Effective Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
                </View>

                {/* Property Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PROPERTY INFORMATION</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Property Address:</Text>
                        <Text style={styles.value}>{propertyAddress}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Monthly Rent:</Text>
                        <Text style={styles.value}>{formatCurrency(monthlyRent)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Annual Rent:</Text>
                        <Text style={styles.value}>{formatCurrency(annualRent)}</Text>
                    </View>
                </View>

                {/* Tenant Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>TENANT INFORMATION</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Full Name:</Text>
                        <Text style={styles.value}>{data.tenant.first_name} {data.tenant.last_name}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Email:</Text>
                        <Text style={styles.value}>{data.tenant.email}</Text>
                    </View>
                </View>

                {/* Protection Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PROTECTION DETAILS</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Coverage Type:</Text>
                        <Text style={styles.value}>Comprehensive Rental Protection</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Monthly Protection Fee:</Text>
                        <Text style={styles.value}>{formatCurrency(protectionFee)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Fee Payer:</Text>
                        <Text style={styles.value}>{data.fee_payer === 'owner' ? 'Property Owner' : 'Tenant'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Coverage Amount:</Text>
                        <Text style={styles.value}>Unlimited</Text>
                    </View>
                </View>

                {/* Terms and Conditions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>TERMS AND CONDITIONS</Text>
                    <Text style={styles.text}>
                        1. COVERAGE: RentGuard provides comprehensive rental protection coverage against tenant defaults, property damage, and eviction-related losses.
                    </Text>
                    <Text style={styles.text}>
                        2. ACTIVATION: This agreement becomes effective upon execution by both parties and payment of the initial protection fee. Coverage begins immediately upon payment confirmation.
                    </Text>
                    <Text style={styles.text}>
                        3. FEE RESPONSIBILITY: The {data.fee_payer === 'owner' ? 'property owner' : 'tenant'} is responsible for payment of the monthly protection fee of {formatCurrency(protectionFee)}.
                    </Text>
                    <Text style={styles.text}>
                        4. CLAIMS: All claims must be filed within thirty (30) days of the claim event. RentGuard will review and respond to claims within 5 business days.
                    </Text>
                    <Text style={styles.text}>
                        5. TERMINATION: This agreement may be terminated by either party with thirty (30) days written notice. Refunds are available on a prorated basis.
                    </Text>
                </View>

                {/* Signature Blocks */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>SIGNATURES</Text>
                    <View style={styles.twoColumn}>
                        <View style={styles.column}>
                            <Text style={{ marginBottom: 8 }}>TENANT</Text>
                            <View style={styles.signatureBlock}>
                                <View style={styles.signatureLine} />
                                <Text style={{ fontSize: 10 }}>{data.tenant.first_name} {data.tenant.last_name}</Text>
                                <Text style={{ fontSize: 10, marginTop: 4 }}>Date: ____________</Text>
                            </View>
                        </View>
                        <View style={styles.column}>
                            <Text style={{ marginBottom: 8 }}>PROPERTY OWNER</Text>
                            <View style={styles.signatureBlock}>
                                <View style={styles.signatureLine} />
                                <Text style={{ fontSize: 10 }}>{data.owner.first_name || 'Owner'} {data.owner.last_name || ''}</Text>
                                <Text style={{ fontSize: 10, marginTop: 4 }}>Date: ____________</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={{ marginTop: 30, paddingTop: 10, borderTop: 1, borderTopColor: '#e5e7eb' }}>
                    <Text style={{ fontSize: 9, color: '#6b7280', textAlign: 'center' }}>
                        RentGuard - Comprehensive Rental Protection Services
                    </Text>
                    <Text style={{ fontSize: 9, color: '#6b7280', textAlign: 'center' }}>
                        This document is binding upon execution by all parties.
                    </Text>
                </View>
            </Page>
        </Document>
    )

    // Convert to PDF Buffer
    try {
        // Note: This requires pdf-rendering on Node.js side
        // We'll use a server-side rendering approach
        const { renderToStream } = await import('@react-pdf/renderer')
        const stream = await renderToStream(doc)

        return new Promise((resolve, reject) => {
            const chunks: Buffer[] = []
            stream.on('data', (chunk) => chunks.push(chunk))
            stream.on('end', () => resolve(Buffer.concat(chunks)))
            stream.on('error', reject)
        })
    } catch (error) {
        console.error('Failed to generate contract PDF:', error)
        throw error
    }
}
