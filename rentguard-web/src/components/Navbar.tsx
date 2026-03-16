'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

import { Menu, X } from 'lucide-react'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'

const navLinks = [
    { label: 'For Landlords', href: '/landlords' },
    { label: 'For Tenants', href: '/tenants' },
    { label: 'For Brokers', href: '/brokers' },
    { label: 'FAQ', href: '/#faq' },
]

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
                    ? 'bg-black/80 backdrop-blur-xl border-b border-white/8'
                    : 'bg-transparent'
                }`}
        >
            <nav className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                        <span className="text-black font-black text-sm select-none">R</span>
                    </div>
                    <span className="font-semibold text-white tracking-tight text-[15px]">RentGuard</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/8 transition-all duration-200"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* CTA Buttons */}
                <div className="hidden md:flex items-center gap-3">
                    <a href={`${APP_URL}/apply/tenant`} className="text-sm text-gray-300 hover:text-white transition-colors duration-200 font-medium">
                        Tenant Apply
                    </a>
                    <a
                        href={`${APP_URL}/apply/owner`}
                        className="btn-primary text-xs px-5 py-2"
                    >
                        Owner Apply
                    </a>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="md:hidden p-2 rounded-lg hover:bg-white/8 transition-colors text-gray-300"
                    aria-label="Toggle menu"
                >
                    {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </nav>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/8 px-6 py-4 flex flex-col gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className="text-sm text-gray-300 hover:text-white py-2.5 px-3 rounded-lg hover:bg-white/8 transition-all"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-white/8">
                        <a href={`${APP_URL}/apply/tenant`} onClick={() => setMenuOpen(false)} className="btn-secondary text-center">
                            Tenant Apply
                        </a>
                        <a href={`${APP_URL}/apply/owner`} onClick={() => setMenuOpen(false)} className="btn-primary text-center">
                            Owner Apply
                        </a>
                    </div>
                </div>
            )}
        </header>
    )
}
