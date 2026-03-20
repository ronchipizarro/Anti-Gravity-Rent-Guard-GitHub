import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { ShieldCheck, UserCheck, Zap, CreditCard, Sparkles, ArrowRight, CheckCircle } from 'lucide-react'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.rentguard.us.com'


export default function TenantsInfoPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen pt-24 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Hero Section */}
                    <div className="relative rounded-[2rem] border border-white/8 bg-gradient-to-b from-green-900/10 to-transparent p-10 md:p-16 mb-12 overflow-hidden text-center">
                        <div className="absolute top-0 left-0 p-8 opacity-10 pointer-events-none text-green-500">
                            <UserCheck size={200} />
                        </div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-[10px] font-bold tracking-widest uppercase mb-6">
                                For Renters
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
                                Move In Faster with<br />
                                <span className="bg-gradient-to-r from-green-400 to-white bg-clip-text text-transparent italic">
                                    RentGuard Approval.
                                </span>
                            </h1>
                            <p className="text-gray-400 text-lg max-w-xl leading-relaxed mb-8">
                                Get pre-qualified in minutes. We provide the institutional guarantee landlords trust,
                                so you can stand out and secure your dream home.
                            </p>
                            <Link href={`${APP_URL}/apply/tenant`} className="btn-primary bg-green-600 hover:bg-green-500 border-green-500/50 gap-2 text-sm">
                                Get Your Decision Now <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>

                    {/* Features Row */}
                    <div className="grid md:grid-cols-3 gap-6 mb-16">
                        {[
                            { icon: Sparkles, title: 'Stand Out', desc: 'An approved RentGuard profile makes you the safest choice for any landlord.' },
                            { icon: CreditCard, title: 'No Score Impact', desc: 'We only perform a soft credit inquiry. It never affects your credit score.' },
                            { icon: Zap, title: 'Instant Peace', desc: 'Know where you stand immediately. No waiting for days for a background check.' },
                        ].map((s) => (
                            <div key={s.title} className="glass-card text-center flex flex-col items-center">
                                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                                    <s.icon className="text-green-400" size={20} />
                                </div>
                                <h3 className="text-white font-bold mb-2 text-sm">{s.title}</h3>
                                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Security Highlight */}
                    <div className="glass-card border-white/5 bg-white/5 p-8 flex flex-col md:flex-row items-center gap-8 mb-16">
                        <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                            <ShieldCheck size={32} className="text-green-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-2">Institutional-Grade Security</h2>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Your data is encrypted and used exclusively for underwriting. We use the same security standards
                                as major financial institutions to protect your personal information.
                            </p>
                        </div>
                    </div>

                    {/* The Process */}
                    <div className="mb-16">
                        <h2 className="text-2xl font-bold text-white mb-8 text-center">The Application Process</h2>
                        <div className="space-y-4">
                            {[
                                { t: 'Enter Basics', d: 'Provide your basic personal and employment info.' },
                                { t: 'Upload Docs', d: 'Securely upload your ID and proof of income.' },
                                { t: 'Get Decision', d: 'Receive an instant GREEN, YELLOW, or RED result.' },
                                { t: 'Sign Lease', d: 'Share your approval with the landlord and sign.' },
                            ].map((step, i) => (
                                <div key={step.t} className="flex items-center gap-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 font-black text-sm">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-sm">{step.t}</h3>
                                        <p className="text-xs text-gray-500">{step.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary Footer */}
                    <div className="text-center pt-8">
                        <div className="inline-flex items-center gap-2 text-xs text-gray-600 mb-6 py-2 px-4 rounded-full bg-white/5 border border-white/5">
                            <CheckCircle size={12} className="text-green-500" />
                            Soft inquiry only — no credit score impact
                        </div>
                        <div className="flex justify-center gap-4">
                            <Link href={`${APP_URL}/apply/tenant`} className="btn-primary bg-green-600 hover:bg-green-500 border-green-500/50">Apply Now</Link>
                            <Link href="/#faq" className="btn-secondary">Learn More</Link>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}
