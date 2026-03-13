import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RentGuard | Collect Rent No Matter What',
  description: 'Institutional rental protection for landlords, property managers, and real estate brokers. RentGuard covers unpaid rent and legal costs throughout eviction.',
  keywords: ['rent guarantee', 'rental protection', 'landlord insurance', 'eviction protection', 'garantía de alquiler'],
  openGraph: {
    title: 'RentGuard | Collect Rent No Matter What',
    description: 'Institutional rental protection for landlords and property managers.',
    type: 'website',
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
