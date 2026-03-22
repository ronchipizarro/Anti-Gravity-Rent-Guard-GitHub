'use client'

import Link from 'next/link'

const MARKETING_URL = process.env.NEXT_PUBLIC_MARKETING_URL || 'https://rentguard.us.com'

export default function AppNavbar() {
    return (
        <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/8">
            <nav className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link href={MARKETING_URL} className="flex items-center gap-2 group">
                    <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                        <span className="text-black font-black text-sm select-none">R</span>
                    </div>
                    <span className="font-semibold text-white tracking-tight text-[15px]">RentGuard</span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link
                        href="/broker/login"
                        className="text-xs text-gray-400 hover:text-white transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-white/8"
                    >
                        Broker Portal
                    </Link>
                    <a
                        href={MARKETING_URL}
                        className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1"
                    >
                        &larr; Back to RentGuard
                    </a>
                </div>
            </nav>
        </header>
    )
}
