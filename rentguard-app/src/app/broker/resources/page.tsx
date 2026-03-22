'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQ_ITEMS = [
    {
        q: 'How do I register as a Broker on RentGuard?',
        a: 'Visit the registration page and select "Broker" as your role. Fill in your name, email, phone, Florida license ID, brokerage name, and brokerage license number. Once registered, you\'ll have immediate access to the portal dashboard.',
    },
    {
        q: 'How do I enroll a property?',
        a: 'From your dashboard, click "Enroll Property" and follow the 5-step form: select property type, enter property details (address, rent, bedrooms), configure lease & payment preferences, add owner information, then review and submit.',
    },
    {
        q: 'What property types can I enroll?',
        a: 'RentGuard supports 6 property types: House, Townhome, Apartment/Condo, Commercial, Multi-Family, and Apartment Building. Each property type has its own icon and tracking throughout the portal.',
    },
    {
        q: 'How does tenant screening work?',
        a: 'When you invite a renter, they receive an email with a link to complete the RentGuard application. The application collects personal information, employment details, credit score, and supporting documents. Our AI underwriting engine then evaluates the application and assigns a risk tier (GREEN, YELLOW, or RED).',
    },
    {
        q: 'How long does approval take?',
        a: 'Most applications are processed within 24-48 hours. GREEN tier applications (low risk) may be auto-approved. YELLOW and RED tier applications undergo additional review by our underwriting team.',
    },
    {
        q: 'What happens if a tenant defaults?',
        a: 'RentGuard covers missed rent payments according to the protection plan terms. As a broker, you can track claims through the portal. The property owner files a claim, and RentGuard processes the payment based on the coverage agreement.',
    },
    {
        q: 'How does the referral commission work?',
        a: 'Brokers and realtors earn a commission for each property enrolled through their account that reaches ACTIVE status. Commission details and tracking will be available in your Deals page. (Commission rates are currently being finalized.)',
    },
    {
        q: 'Who pays the protection fee?',
        a: 'During property enrollment, you can select who pays the RentGuard fee: the Broker, the Property Owner, or the Renter. This is configured in Step 3 of the enrollment form and can be updated later.',
    },
    {
        q: 'Can I enroll properties owned by an LLC?',
        a: 'Yes! In Step 3 of the enrollment form, indicate that the property is owned by an LLC and provide the LLC name, address, and representative\'s name and email. The LLC representative will be included in the contract signing process.',
    },
    {
        q: 'How do I file a claim?',
        a: 'The claims filing feature is coming soon. When available, you\'ll be able to submit claims directly through the portal with supporting documentation. For now, please contact support for claim assistance.',
    },
]

export default function ResourcesPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    return (
        <div className="pt-4 max-w-3xl">
            <h1 className="text-2xl font-bold text-white mb-1">Resources & FAQ</h1>
            <p className="text-gray-500 text-sm mb-8">Common questions about using the RentGuard broker portal</p>

            <div className="space-y-2">
                {FAQ_ITEMS.map((item, i) => {
                    const isOpen = openIndex === i
                    return (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setOpenIndex(isOpen ? null : i)}
                                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/3 transition-colors"
                            >
                                <span className="text-sm font-medium text-white pr-4">{item.q}</span>
                                <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isOpen && (
                                <div className="px-5 pb-4">
                                    <p className="text-sm text-gray-400 leading-relaxed">{item.a}</p>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
