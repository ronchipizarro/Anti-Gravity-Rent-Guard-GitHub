import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Building2, BarChart3, Zap, Users } from 'lucide-react'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.rentguard.us.com'


export default function LandlordsPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen pt-24 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Hero Section */}
                    <div className="relative rounded-[2rem] border border-white/8 bg-gradient-to-b from-blue-900/10 to-transparent p-10 md:p-16 mb-12 overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-blue-500">
                            <Building2 size={240} />
                        </div>
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px] font-bold tracking-widest uppercase mb-6">
                                Institutional Portfolio Protection
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
                                Guarantee Every Dollar<br />
                                <span className="bg-gradient-to-r from-blue-400 to-white bg-clip-text text-transparent italic">
                                    Across Your Portfolio.
                                </span>
                            </h1>
                            <p className="text-gray-400 text-lg max-w-xl leading-relaxed mb-8">
                                RentGuard gives multi-family operators and portfolio owners institutional-grade protection. Turnover never disrupts your cash flow again.
                            </p>
                            <Link href={`${APP_URL}/apply/owner`} className="btn-primary gap-2 text-sm">
                                Start Portfolio Onboarding <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                        {[
                            { val: '3.4%', label: 'Avg. US tenant default rate' },
                            { val: '$9K+', label: 'Avg. eviction cost per unit' },
                            { val: '4-6mo', label: 'Avg. eviction timeline in FL' },
                            { val: '$0', label: 'Your out-of-pocket with us' },
                        ].map((s) => (
                            <div key={s.label} className="glass-card text-center p-6">
                                <div className="text-2xl font-black text-white mb-1">{s.val}</div>
                                <div className="text-[10px] text-gray-500 leading-tight uppercase tracking-wider">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Value Props */}
                    <div className="grid md:grid-cols-2 gap-6 mb-16">
                        {[
                            { icon: Building2, title: 'Volume Pricing', desc: 'Custom pricing tiers for portfolios. The more you protect, the better the rate.' },
                            { icon: Zap, title: 'Bulk Screening', desc: 'Submit multiple tenants at once. Our AI processes them with a 48-hour SLA.' },
                            { icon: BarChart3, title: 'Portfolio Dashboard', desc: 'Real-time visibility into coverage status and active claims across all units.' },
                            { icon: Users, title: 'Dedicated AE', desc: 'Direct access to your RentGuard rep — we know your portfolio by name.' },
                        ].map((v) => (
                            <div key={v.title} className="glass-card flex gap-5 items-start">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                    <v.icon className="text-blue-400" size={18} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold mb-1 text-sm">{v.title}</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed">{v.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ROI Highlight */}
                    <div className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-600/10 to-transparent p-10 mb-16">
                        <h2 className="text-2xl font-bold text-white mb-4">The RentGuard ROI</h2>
                        <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-2xl">
                            One single default costs more than an entire year of RentGuard coverage for a 50-unit portfolio.
                            We absorb the risk so you can focus on scale.
                        </p>
                        <div className="grid grid-cols-3 gap-6">
                            {[
                                { val: '100%', label: 'Rent Collected' },
                                { val: '$0', label: 'Legal Liability' },
                                { val: '48h', label: 'Underwriting SLA' },
                            ].map((i) => (
                                <div key={i.label} className="text-center">
                                    <div className="text-2xl font-black text-blue-400">{i.val}</div>
                                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">{i.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Feature List */}
                    <div className="grid sm:grid-cols-2 gap-4 mb-16">
                        {[
                            '100% unpaid rent covered',
                            'Attorney fees covered',
                            'AI-powered screening',
                            '48-hour turnaround',
                            'Full eviction management',
                            'No deductibles or caps',
                            'Soft credit inquiries only',
                            'Investor-ready reporting',
                        ].map((f) => (
                            <div key={f} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-300">
                                <CheckCircle size={14} className="text-green-500" />
                                {f}
                            </div>
                        ))}
                    </div>

                    {/* Final CTA */}
                    <div className="text-center pt-12 border-t border-white/8">
                        <h2 className="text-2xl font-bold text-white mb-4">Ready to stabilize your cash flow?</h2>
                        <div className="flex justify-center gap-4">
                            <Link href={`${APP_URL}/apply/owner`} className="btn-primary">Request Portfolio Review</Link>
                            <Link href="/#faq" className="btn-secondary">View FAQ</Link>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}
