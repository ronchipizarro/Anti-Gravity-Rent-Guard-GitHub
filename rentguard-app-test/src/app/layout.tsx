import type { Metadata } from 'next'
import './globals.css'
import AppNavbar from '@/components/AppNavbar'

export const metadata: Metadata = {
  title: 'RentGuard | Application Portal',
  description: 'Apply for RentGuard rental protection coverage.',
  robots: { index: false, follow: false },
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
        <AppNavbar />
        {children}
      </body>
    </html>
  )
}
