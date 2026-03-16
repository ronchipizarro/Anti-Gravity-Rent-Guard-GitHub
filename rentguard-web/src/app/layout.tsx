import type { Metadata } from 'next'
import './globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rentguard.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'RentGuard | Collect Rent No Matter What',
    template: '%s | RentGuard',
  },
  description: 'Institutional rental protection for landlords, property managers, and real estate brokers. RentGuard covers unpaid rent and legal costs throughout eviction.',
  keywords: ['rent guarantee', 'rental protection', 'landlord insurance', 'eviction protection', 'rent default insurance', 'garantía de alquiler'],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'RentGuard | Collect Rent No Matter What',
    description: 'Institutional rental protection for landlords and property managers.',
    type: 'website',
    url: SITE_URL,
    siteName: 'RentGuard',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RentGuard | Collect Rent No Matter What',
    description: 'Institutional rental protection for landlords and property managers.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  )
}
