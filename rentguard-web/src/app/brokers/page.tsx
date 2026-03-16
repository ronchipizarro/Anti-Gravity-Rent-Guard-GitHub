import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, Handshake, Rocket, BadgeDollarSign } from 'lucide-react'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'


export default function BrokersPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen pt-24 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Hero Section */}
                    <div className="relative rounded-[2rem] border border-white/8 bg-gradient-to-b from-blue-600/10 to-transparent p-10 md:p-16 mb-12 overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                            <Handshake size={200} />
                        </div>
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px] font-bold tracking-widest uppercase mb-6">
                                Referral Program
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
                                Give Landlords<br />
                                <span className="bg-gradient-to-r from-blue-400 to-white bg-clip-text text-transparent italic">
                                    Guaranteed Rent.
                                </span>
                            </h1>
                            <p className="text-gray-400 text-lg max-w-xl leading-relaxed mb-8">
                                Introduce your landlord clients to RentGuard. They get 12 months of coverage, and you earn a referral fee per deal.
                            </p>
                            <Link href={`${APP_URL}/apply/owner`} className="btn-primary gap-2">
                                Start Onboarding a Client <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>

                    {/* How It Works */}
                    <div className="grid md:grid-cols-2 gap-6 mb-16">
                        {[
                            { step: '01', title: 'You Introduce Us', desc: 'Share RentGuard with a landlord client. Takes less than 60 seconds.' },
                            { step: '02', title: 'We Underwrite', desc: 'The entire application is online. We vet the tenant and approve within 48h.' },
                            { step: '03', title: 'Lease Gets Signed', desc: 'Your client signs with confidence. Coverage starts on day one.' },
                            { step: '04', title: 'You Get Paid', desc: 'Your referral fee arrives automatically. No invoicing, no chasing.' },
                        ].map((s) => (
                            <div key={s.step} className="glass-card flex gap-4">
                                <span className="text-2xl font-black text-blue-500/20">{s.step}</span>
                                <div>
                                    <h3 className="text-white font-bold mb-1">{s.title}</h3>
                                    <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Commission Highlight */}
                    <div className="glass-card border-blue-500/30 bg-blue-500/5 p-8 flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
                        <div className="max-w-md">
                            <h2 className="text-2xl font-bold text-white mb-2">The Referral Advantage</h2>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Earn commission on the annual premium for every activated policy. Zero friction, no paperwork, and your client relationships stay yours.
                            </p>
                        </div>
                        <div className="bg-blue-600 rounded-2xl p-6 text-center min-w-[160px]">
                            <span className="text-4xl block mb-1">💰</span>
                            <span className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Commission<br />Paid per deal</span>
                        </div>
                    </div>

                    {/* Why Choose Us */}
                    <div className="grid md:grid-cols-3 gap-6 mb-16">
                        {[
                            { icon: Rocket, title: 'Close Faster', desc: "Protection removes landlord hesitation, speeding up the lease signing process." },
                            { icon: BadgeDollarSign, title: 'Frictionless', desc: "Your client applies online in minutes. You stay out of the tedious paperwork." },
                            { icon: ShieldCheck, title: 'Ownership', desc: "We never compete with you. RentGuard is a tool to strengthen your client trust." },
                        ].map((b) => (
                            <div key={b.title} className="glass-card text-center flex flex-col items-center">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                                    <b.icon className="text-blue-400" size={20} />
                                </div>
                                <h3 className="text-white font-bold mb-2">{b.title}</h3>
                                <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Summary Footer */}
                    <div className="text-center pt-12 border-t border-white/8">
                        <h2 className="text-2xl font-bold text-white mb-4">Ready to offer RentGuard?</h2>
                        <div className="flex justify-center gap-4">
                            <Link href={`${APP_URL}/apply/owner`} className="btn-primary">Get Started</Link>
                            <Link href="/#faq" className="btn-secondary">View FAQ</Link>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}
