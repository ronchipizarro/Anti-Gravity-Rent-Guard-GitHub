import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="border-t border-white/8 bg-black">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
                                <span className="text-black font-black text-sm">R</span>
                            </div>
                            <span className="font-semibold text-white">RentGuard</span>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                            Institutional rental protection for landlords and property managers.
                        </p>
                    </div>

                    {/* Solutions */}
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Solutions</p>
                        <ul className="space-y-3">
                            {[
                                { label: 'For Landlords', href: '/landlords' },
                                { label: 'For Tenants', href: '/tenants' },
                                { label: 'For Brokers', href: '/brokers' },
                            ].map((item) => (
                                <li key={item.label}>
                                    <Link href={item.href} className="text-sm text-gray-500 hover:text-white transition-colors">
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Apply */}
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Apply</p>
                        <ul className="space-y-3">
                            {[
                                { label: 'Owner Application', href: '/apply/owner' },
                                { label: 'Tenant Application', href: '/apply/tenant' },
                            ].map((item) => (
                                <li key={item.href}>
                                    <Link href={item.href} className="text-sm text-gray-500 hover:text-white transition-colors">
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Company</p>
                        <ul className="space-y-3">
                            {[
                                { label: 'FAQ', href: '/#faq' },
                                { label: 'How It Works', href: '/#how-it-works' },
                            ].map((item) => (
                                <li key={item.href}>
                                    <Link href={item.href} className="text-sm text-gray-500 hover:text-white transition-colors">
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between gap-4">
                    <p className="text-xs text-gray-600">
                        © {new Date().getFullYear()} RentGuard. All rights reserved.
                    </p>
                    <p className="text-xs text-gray-600 max-w-md text-right">
                        RentGuard provides rental protection agreements. RentGuard is not an insurance company. Coverage subject to agreement terms and exclusions. Not insurance.
                    </p>
                </div>
            </div>
        </footer>
    )
}
