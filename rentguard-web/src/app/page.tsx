import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import {
  Shield,
  Zap,
  FileCheck,
  Scale,
  BadgeDollarSign,
  BellRing,
  ChevronDown,
  Star,
  ArrowRight,
  CheckCircle,
} from 'lucide-react'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.rentguard.us.com'


// ─── Hero ──────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16 overflow-hidden">
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-800/8 rounded-full blur-[100px]" />
      </div>

      {/* Grid lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center gap-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold tracking-wider uppercase">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          Statewide Coverage · Instant Approvals
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[1.05]">
          Collect Rent.
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-white bg-clip-text text-transparent">
            No Matter What.
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed">
          Institutional rental protection for landlords and property managers. If your tenant stops paying,{' '}
          <span className="text-white font-medium">RentGuard covers every dollar</span> through the full eviction process.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
          <Link href={`${APP_URL}/apply/owner`} className="btn-primary gap-2">
            Get Protected as an Owner <ArrowRight size={14} />
          </Link>
          <Link href={`${APP_URL}/apply/tenant`} className="btn-secondary">
            Apply as Tenant
          </Link>
        </div>

        {/* Trust row */}
        <div className="flex flex-wrap justify-center items-center gap-6 mt-6">
          {[
            '✓  Unlimited rent coverage',
            '✓  48-hour approvals',
            '✓  Legal costs included',
          ].map((item) => (
            <span key={item} className="text-sm text-gray-500 font-medium">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-600 animate-bounce">
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <ChevronDown size={14} />
      </div>
    </section>
  )
}

// ─── Stats Bar ─────────────────────────────────────────────────────────────
function StatsBar() {
  const stats = [
    { value: '100%', label: 'Rent Covered' },
    { value: 'Up to 48h', label: 'Max Approval Time' },
    { value: 'From 4%', label: 'Annual Premium' },
    { value: '$0', label: 'Out-of-Pocket Legal Costs' },
  ]

  return (
    <section className="border-y border-white/8 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-1">
            <span className="text-3xl md:text-4xl font-black text-white">{s.value}</span>
            <span className="text-sm text-gray-500">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── How It Works ──────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Submit Details',
      desc: 'Property owner or tenant submits details through our secure portal. Takes less than 10 minutes.',
    },
    {
      step: '02',
      title: 'Underwriting',
      desc: 'We underwrite the tenant with institutional-grade AI analysis and credit verification.',
    },
    {
      step: '03',
      title: 'Instant Approval',
      desc: 'Tenant is approved instantly or within 48 hours. Lease signing can proceed with confidence.',
    },
    {
      step: '04',
      title: 'Full Protection',
      desc: 'If the tenant defaults, RentGuard pays rent during the entire eviction process. No gaps.',
    },
  ]

  return (
    <section id="how-it-works" className="py-28 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <span className="section-label">Process</span>
          <h2 className="section-title">How RentGuard Works</h2>
          <p className="section-subtitle">
            Simple, transparent, and built for every stakeholder — owners, tenants, and brokers.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={s.step} className="glass-card flex flex-col gap-4 relative group">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute right-0 top-10 translate-x-full w-6 h-px bg-white/10 z-10" />
              )}
              <span className="text-4xl font-black text-white/10 group-hover:text-blue-500/30 transition-colors duration-300">
                {s.step}
              </span>
              <h3 className="text-lg font-semibold text-white">{s.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Link href={`${APP_URL}/apply/owner`} className="btn-blue">
            Start Your Application <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── What's Covered ────────────────────────────────────────────────────────
function WhatsCovered() {
  const items = [
    {
      icon: BadgeDollarSign,
      title: 'Unpaid Rent During Eviction',
      desc: 'Every dollar of rent owed while the eviction process is underway — covered in full.',
    },
    {
      icon: Shield,
      title: 'Tenant Vetting & Underwriting',
      desc: 'AI-powered screening combined with institutional-grade review before you sign.',
    },
    {
      icon: Zap,
      title: 'Rent Collection Escalation',
      desc: 'Delinquency management and collection escalation handled on your behalf.',
    },
    {
      icon: Scale,
      title: 'Legal & Eviction Management',
      desc: 'Full eviction process management from notice to resolution — we handle it all.',
    },
    {
      icon: FileCheck,
      title: 'Attorney Fees & Court Costs',
      desc: 'When RentGuard pursues eviction, all legal costs are covered, period.',
    },
    {
      icon: BellRing,
      title: 'Ongoing Landlord Updates',
      desc: 'Stay informed at every step with transparent real-time status updates.',
    },
  ]

  return (
    <section className="py-28 px-6 bg-white/[0.015]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <span className="section-label">Coverage</span>
          <h2 className="section-title">What RentGuard Handles</h2>
          <p className="section-subtitle">
            Unlimited rent coverage, clear terms, no surprises. Protection from day one of default.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <div key={item.title} className="glass-card group cursor-default">
              <div className="mb-4 w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors duration-300">
                <item.icon size={18} className="text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-2 text-[15px]">{item.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Estimate Banner ───────────────────────────────────────────────────────
function EstimateBanner() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto text-center rounded-3xl border border-white/8 bg-gradient-to-b from-white/5 to-transparent p-12 md:p-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-blue-500/10 blur-3xl" />
        </div>
        <span className="section-label mb-4 block">Pricing</span>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Get Your Estimate
        </h2>
        <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
          See how affordable institutional-grade rental protection can be. Premiums start at just 4% of annual rent.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href={`${APP_URL}/apply/tenant`} className="btn-secondary">
            Apply as Tenant
          </Link>
          <Link href={`${APP_URL}/apply/owner`} className="btn-primary gap-2">
            Apply as Owner <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ──────────────────────────────────────────────────────────
function Testimonials() {
  const testimonials = [
    {
      name: 'Michael R.',
      role: 'Property Manager, Los Angeles',
      text: 'RentGuard has been a game-changer for our portfolio. We no longer worry about tenant defaults disrupting our cash flow. The underwriting is fast and thorough.',
    },
    {
      name: 'Sarah K.',
      role: 'Landlord, San Francisco',
      text: 'The peace of mind is priceless. When one of my tenants stopped paying, RentGuard covered the rent throughout the entire eviction process. Seamless experience.',
    },
    {
      name: 'David L.',
      role: 'Real Estate Broker, San Diego',
      text: 'I refer all my landlord clients to RentGuard. It speeds up lease signings and gives everyone confidence. The tiered commission structure—with payouts in 48 hours—is the best in the industry.',
    },
  ]

  return (
    <section className="py-28 px-6 bg-white/[0.015]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <span className="section-label">Testimonials</span>
          <h2 className="section-title">Trusted by Landlords<br className="hidden md:block" /> Across the Country</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="glass-card flex flex-col gap-4">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-gray-300 leading-relaxed italic">&quot;{t.text}&quot;</p>
              <div className="mt-auto pt-4 border-t border-white/5">
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="text-xs text-gray-500">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FAQ ───────────────────────────────────────────────────────────────────
const faqItems = [
  {
    q: 'Is RentGuard insurance?',
    a: 'No. RentGuard provides rental protection agreements, not insurance products. Coverage is subject to agreement terms and exclusions. Soft credit inquiry only.',
  },
  {
    q: 'Who pays the protection fee?',
    a: 'Either the landlord or the tenant can pay the annual premium, depending on the agreement negotiated at lease signing. Brokers can also bundle it into their service.',
  },
  {
    q: 'Does this replace the security deposit?',
    a: 'RentGuard is designed to complement or replace traditional security deposits, offering broader protection including coverage during eviction proceedings.',
  },
  {
    q: 'When does coverage start?',
    a: 'Coverage begins the day the lease is signed and the first premium payment is confirmed. Protection is active from day one of the tenancy.',
  },
  {
    q: 'Is there a coverage limit?',
    a: 'RentGuard offers unlimited rent coverage throughout the full eviction process, with no monthly cap. Attorney fees and court costs are also included.',
  },
  {
    q: 'How quickly are claims paid?',
    a: 'Once a default is confirmed and eviction proceedings have started, RentGuard begins paying the landlord within 5 business days on a monthly basis until the property is recovered.',
  },
]

function FAQ() {
  return (
    <section id="faq" className="py-28 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <span className="section-label">FAQ</span>
          <h2 className="section-title">Frequently Asked<br />Questions</h2>
        </div>

        <div className="flex flex-col divide-y divide-white/8">
          {faqItems.map((item) => (
            <details key={item.q} className="group py-6 cursor-pointer list-none">
              <summary className="flex justify-between items-center gap-4 text-white font-medium text-[15px] cursor-pointer select-none list-none marker:hidden">
                {item.q}
                <ChevronDown
                  size={16}
                  className="text-gray-500 flex-shrink-0 transition-transform duration-300 group-open:rotate-180"
                />
              </summary>
              <p className="mt-4 text-sm text-gray-400 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Final CTA ─────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="py-20 px-6 border-t border-white/8">
      <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-2">
          <span className="text-black font-black text-xl">R</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          Ready to protect<br />your rental income?
        </h2>
        <p className="text-gray-400 text-lg max-w-xl">
          Join hundreds of landlords and property managers who collect rent no matter what.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link href={`${APP_URL}/apply/owner`} className="btn-primary gap-2">
            Owner Apply <ArrowRight size={14} />
          </Link>
          <Link href={`${APP_URL}/apply/tenant`} className="btn-secondary">
            Tenant Apply
          </Link>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <CheckCircle size={12} className="text-green-500" />
          Soft credit inquiry only · No obligations · Cancel anytime
        </div>
      </div>
    </section>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <HowItWorks />
        <WhatsCovered />
        <EstimateBanner />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
