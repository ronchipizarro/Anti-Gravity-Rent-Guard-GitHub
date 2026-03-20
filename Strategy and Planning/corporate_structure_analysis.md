# Corporate Structure Analysis: RentGuard Miami Launch

## Objective

Determine the optimal corporate legal structure for launching RentGuard in Miami-Dade County, FL. The structure must:

1. **Enable operations** — hold a FL business license, open US bank accounts, accept Stripe payments, sign the Protection Agreement as "Service Provider"
2. **Isolate liability** — protect personal assets and future expansion states from FL operational risk (tenant lawsuits, landlord disputes, regulatory action)
3. **Build landlord trust** — demonstrate financial backing ("Proof of Funds") to convince landlords that RentGuard can pay claims
4. **Optimize taxes** — avoid unnecessary double taxation or unfavorable withholding
5. **Scale across states** — structure should accommodate expansion to TX, GA, etc. without major reorganization
6. **Protect IP** — isolate the brand, platform (app.rentguard.com), and underwriting engine from operational creditors

---

## The Core Decision

The fundamental question is: **How many entities, in which states, and with what ownership structure?**

This decision is driven by three tensions:

| Tension | Simple (1 entity) | Complex (2-3 entities) |
|---------|-------------------|----------------------|
| **Speed to launch** | Fast (days) | Slower (1-3 weeks) |
| **Setup cost** | ~$300 | ~$800-1,500 |
| **Ongoing cost** | ~$300/year | ~$800-1,500/year |
| **Liability protection** | Weak | Strong |
| **Landlord credibility** | Decent | Can be stronger (Keep Well) |
| **Tax complexity** | Simple | Moderate |

---

## Option 1: Single Florida LLC

**Structure:**
```
Francisco (Member)
    └── Rent Guard LLC (FL domestic LLC)
            - Operations, IP, capital, everything
```

**Setup:** File Articles of Organization with FL Division of Corporations (sunbiz.org). $125 filing + $138.75 annual report.

### Pros
- **Fastest to launch** — can be operational in 2-3 business days
- **Cheapest** — ~$264/year total
- **Simplest banking** — one bank account, one EIN, one tax return
- **Contract-ready** — the Protection Agreement already names "RENT GUARD LLC, a Florida limited liability company"
- **No piercing risk from complexity** — courts can't pierce what doesn't exist between entities
- **FL has no state income tax** — LLC income passes through to member without FL state tax

### Cons
- **No liability isolation** — if a tenant sues and wins a judgment beyond insurance coverage, all company assets (including capital reserves and IP) are exposed
- **No state-by-state compartmentalization** — if you expand to TX/GA, those states' risks also sit in this entity
- **No Wyoming privacy** — FL LLC requires disclosure of member/manager names in annual report (public record)
- **Proof of funds = actual balance sheet** — no mechanism to show "backstop" capital separately
- **If FOIR classifies this as insurance** — the single entity is the one that gets shut down; no fallback

### Best for: Solo founder who wants to get to market ASAP and add structure later. Acceptable risk if you have E&O insurance and keep personal assets protected through standard LLC protections.

---

## Option 2: Wyoming Holding + Florida Operating LLC ("Hub & Spoke")

**Structure:**
```
Francisco (Member)
    └── Rent Guard Holdings LLC (WY) — owns IP, brand, tech platform
            └── Rent Guard Florida LLC (FL domestic) — 100% owned by WY Holding
                    - FL operations, customer-facing, signs Protection Agreements
```

**Setup:** Form WY LLC ($100 + $60/year). Form FL LLC ($125 + $138.75/year). WY LLC is sole member of FL LLC. Register WY LLC's ownership in FL LLC operating agreement.

### Pros
- **Liability isolation** — FL operational liabilities (tenant lawsuits, landlord disputes, regulatory fines) are contained in the FL LLC. The WY Holding's assets (IP, platform, brand) are protected by the corporate veil.
- **IP protection** — if the FL entity faces judgment, the IP/brand sits in WY and is shielded (assuming proper formalities)
- **Wyoming privacy** — WY does not require public disclosure of LLC members. The FL LLC's annual report lists "Rent Guard Holdings LLC (WY)" as manager/member, not Francisco personally
- **Multi-state ready** — to expand, create "Rent Guard Texas LLC" as another subsidiary of the WY Holding. Each state's risk is isolated.
- **Clean ownership change** — if you take on investors or partners later, they invest in the WY Holding and gain proportional ownership of all state operations
- **No FL income tax** on either entity (FL has no individual or LLC income tax; WY has no state income tax)

### Cons
- **Two entities = double the compliance** — two annual reports, potentially two tax returns (though single-member LLCs are disregarded for federal tax), two registered agents
- **Slower setup** — 1-2 weeks to form both entities and get banking sorted
- **Veil-piercing risk** — if you don't maintain proper separation (separate bank accounts, signed operating agreements, no commingling of funds), a FL court can pierce the veil and reach the WY Holding
- **Banking complexity** — need a bank account for each entity. Some banks make it harder for WY LLCs owned by non-US-resident individuals (if applicable)
- **Does NOT solve "Proof of Funds"** — the FL LLC's balance sheet is still just the FL LLC. Landlords don't see the WY Holding's assets unless you create a separate mechanism (Keep Well Agreement)

### Best for: Founder who plans to scale beyond FL and wants professional-grade asset protection from Day 1.

---

## Option 3: Hub & Spoke + Dedicated Capital Entity ("The Treasury Model")

**Structure:**
```
Francisco (Member)
    └── Rent Guard Holdings LLC (WY) — owns IP, brand, tech, all subsidiaries
            ├── Rent Guard Capital LLC (WY) — holds Service Fund reserves only, no operations
            └── Rent Guard Florida LLC (FL domestic) — operations
                    - Signs Protection Agreements
                    - Capital Co issues "Keep Well Agreement" to FL LLC
```

**Setup:** Three entities. WY Holding ($100), WY Capital ($100), FL LLC ($125). WY annual: $60 x2. FL annual: $138.75.

### Pros
- **Strongest liability isolation** — three-tier protection: personal → WY Holding → WY Capital (money) / FL LLC (operations). A FL judgment reaches only FL LLC assets, not the capital reserves.
- **"Keep Well Agreement" for landlord trust** — Capital Co commits to backstop FL LLC. Landlords receive a certificate: *"Rent Guard Florida is backstopped by the $X treasury of Rent Guard Capital LLC."* This is a marketing asset — makes a startup look institutional.
- **Capital reserves protected from operational creditors** — if a tenant wins a large judgment against FL LLC, the Service Fund capital in WY Capital is not directly reachable
- **Investor-ready** — clean structure for fundraising. Investors buy into Holdings; Capital is a dedicated pool; Operations are state-specific.
- **Maximum state expansion flexibility** — each new state is a new subsidiary; capital pool serves them all

### Cons
- **Most expensive** — ~$584/year in filing fees alone, plus 3 registered agents (~$150-300/year total), plus potential CPA costs for multi-entity tax returns
- **Highest maintenance** — three operating agreements, three bank accounts, meticulous record-keeping to avoid veil piercing
- **Overkill for MVP** — you're launching with <10 policies and $50-150K in capital. Three entities for a pre-revenue startup may be premature optimization.
- **Keep Well Agreement is not a guarantee** — it's a contractual commitment from Capital Co to FL LLC. If Capital Co runs out of money, the agreement is worthless. It's a credibility tool, not a legal shield.
- **Banking friction** — opening 3 US bank accounts (especially for WY entities) requires time and potentially in-person visits. Some banks won't open accounts for WY LLCs without a WY physical presence.

### Best for: Founder with $200K+ in capital who wants institutional-grade structure from Day 1, or who is actively fundraising.

---

## Option 4: Single Florida LLC Now, Restructure at Scale ("Crawl-Walk-Run")

**Structure — Phase 1 (MVP):**
```
Francisco (Member)
    └── Rent Guard LLC (FL domestic) — everything
```

**Structure — Phase 2 (at ~$500K revenue or second state):**
```
Francisco (Member)
    └── Rent Guard Holdings LLC (WY)
            ├── Rent Guard LLC (FL) — converted to subsidiary
            └── Rent Guard [Next State] LLC
```

**Setup:** FL LLC only ($125). Restructure later when revenue justifies it.

### Pros
- **Fastest to revenue** — entity formed in days, banking in 1-2 weeks, selling within the month
- **Cheapest upfront** — $264/year until you restructure
- **No wasted complexity** — if the business doesn't work, you dissolve one entity, not three
- **Restructuring is straightforward** — form WY Holding, have it acquire 100% membership interest in FL LLC via assignment. The FL LLC continues operating under the same EIN, same bank account, same contracts. No disruption to landlords or tenants.
- **The Protection Agreement doesn't care** — it names "RENT GUARD LLC, a Florida limited liability company" as Service Provider. That entity persists through restructuring. Landlords never know the ownership changed.
- **Real-world pattern** — this is how most successful startups operate. Start simple, add structure when there's something to protect.

### Cons
- **No liability isolation until restructure** — same as Option 1 for Phase 1
- **Restructuring has a cost** — when you do it, expect $2,000-4,000 in attorney + CPA fees to set up the WY holding and do the membership interest assignment properly
- **Discipline required** — you must actually restructure when the trigger point is reached, not keep saying "later"
- **No Wyoming privacy during Phase 1** — your name is on the FL annual report

### Best for: Pragmatic founder who prioritizes speed-to-market and will invest in structure once the business proves viable.

---

## Option 5: Series LLC (Wyoming)

**Structure:**
```
Francisco (Member)
    └── Rent Guard Series LLC (WY)
            ├── Series A — Florida operations
            ├── Series B — Capital/Treasury
            └── Series C — IP/Brand
```

**Setup:** One WY Series LLC ($100 + $60/year). Each series registers as foreign LLC in its operating state.

### Pros
- **One entity, multiple liability-isolated compartments** — theoretically combines the simplicity of one entity with the isolation of multiple entities
- **Cheapest multi-compartment option** — one WY filing, one annual report
- **Florida recognition** — FL SB 316 (effective July 2026) will formally recognize series LLC liability shields

### Cons
- **FL courts are historically hostile to series LLCs** — pre-SB 316, FL had no series LLC statute. Even after July 2026, the case law is untested. No FL court has ruled on whether a series LLC's internal liability shields hold up in litigation.
- **Piercing risk is HIGH** — each series must maintain completely separate books, bank accounts, and records. Any commingling = all series treated as one entity. This is harder than it sounds for a startup.
- **Banking nightmare** — many US banks don't understand series LLCs and won't open accounts for individual series. You may end up opening accounts for the parent LLC and manually segregating funds — which defeats the purpose.
- **Landlord confusion** — the Protection Agreement would be signed by "Rent Guard Series LLC, Series A (Florida)" — this looks unusual and may reduce trust
- **CPA complexity** — series LLC tax treatment varies by state and is unsettled in many jurisdictions
- **If the series shield fails, you have WORSE protection than a single LLC** — because you have one entity with all assets, not separate entities with natural separation

### Best for: Experienced business owners with CPA/attorney support who understand the maintenance requirements. Not recommended for MVP.

---

## Comparison Matrix

| Feature | Opt 1: Single FL | Opt 2: Hub & Spoke | Opt 3: Treasury Model | Opt 4: Crawl-Walk-Run | Opt 5: Series LLC |
|---------|:---:|:---:|:---:|:---:|:---:|
| **Setup speed** | 2-3 days | 1-2 weeks | 2-3 weeks | 2-3 days | 1-2 weeks |
| **Year 1 cost** | ~$300 | ~$700 | ~$1,100 | ~$300 (→$700 later) | ~$500 |
| **Liability isolation** | None | Strong | Strongest | None → Strong | Theoretical |
| **IP protection** | None | Strong | Strong | None → Strong | Untested in FL |
| **Proof of Funds tool** | Balance sheet only | Needs Keep Well add-on | Keep Well built-in | Balance sheet → Keep Well | Series-specific |
| **Wyoming privacy** | No | Yes | Yes | No → Yes | Yes |
| **Multi-state ready** | No | Yes | Yes | No → Yes | Yes (on paper) |
| **Banking ease** | Easy | Moderate | Hard | Easy → Moderate | Hard |
| **Ongoing compliance** | Low | Medium | High | Low → Medium | Medium-High |
| **Investor-readiness** | Low | High | Highest | Low → High | Low |
| **FL court tested** | Yes | Yes | Yes | Yes | No (SB 316 new) |

---

## Key Considerations for Your Specific Situation

### 1. International Ownership (if applicable)
If you are not a US citizen/resident, additional considerations apply:
- **ITIN required** — Individual Taxpayer Identification Number (if no SSN) for LLC tax returns
- **FIRPTA** — Foreign Investment in Real Property Tax Act may apply to real property-related income
- **Treaty benefits** — US-Spain tax treaty may reduce withholding on certain income
- **US bank accounts** — some banks require in-person visits for non-US owners. Mercury, Relay, and Brex have more flexible policies for foreign-owned LLCs
- **ECI (Effectively Connected Income)** — LLC income from US operations is generally ECI, taxed at regular US rates regardless of where you live
- **State nexus** — operating in FL creates FL nexus. FL has no income tax, but you still file a federal return.

### 2. Contract Alignment
The Protection Agreement names **"RENT GUARD LLC, a Florida limited liability company"** as Service Provider. Whatever structure you choose, this FL domestic LLC must exist and be the entity that:
- Signs the Protection Agreement with landlords and tenants
- Holds the Power of Attorney
- Receives Subrogation rights
- Receives Service Fee payments
- Has a FL bank account for claim payouts

The parent/holding entity (if any) stays behind the scenes.

### 3. The "Proof of Funds" Problem
Landlords will ask: "How do I know you can actually pay if my tenant defaults?" Your answer depends on structure:

| Structure | Proof of Funds Approach |
|-----------|------------------------|
| Single FL LLC | Show the FL LLC bank balance. Simple but exposes your full treasury. |
| Hub & Spoke | Show FL LLC balance + reference the WY Holding's backing. Less transparent. |
| Treasury Model | Issue a **Keep Well Letter** from Capital Co: "We commit to maintaining $X available to FL LLC." Most professional. |
| Any structure | **Letter from CPA/accountant** confirming available capital. Works regardless of structure. |

For MVP with <10 landlords, a **CPA letter + professional presentation** is likely sufficient. You don't need a three-entity structure to look credible — you need a professional pitch deck (which you have) and a real bank balance.

### 4. FOIR Regulatory Risk Interaction
If the FL Office of Insurance Regulation investigates, the corporate structure matters:
- **Single FL LLC** — FOIR deals with one entity. If they issue a cease-and-desist, the entire business stops.
- **Hub & Spoke** — FOIR targets the FL LLC. The WY Holding (which owns the IP and platform) survives. You could theoretically restructure the FL operations or pivot the business model while preserving the tech assets.
- **This is a real consideration** — the Legal Risk Analysis rates OIR investigation as "Low probability, Critical impact." Having the IP in a separate entity is insurance against the worst case.

### 5. Cost of Inaction
Every week without a legal entity = a week you can't:
- Open a business bank account
- Get a Stripe account
- Sign contracts with landlords
- Collect Service Fees
- Start generating revenue

The cost difference between Option 1 ($300) and Option 2 ($700) is trivial compared to the cost of delaying launch by weeks to set up a perfect structure.

---

## FOUNDER DECISION (2026-03-19)

**Chosen structure: Option 2 (Hub & Spoke) → Option 3 (Treasury Model) at $500K revenue.**

- **Now:** Use an **existing Wyoming LLC** as the Holding Co. Form a new **Rent Guard Florida LLC** as a domestic FL LLC, 100% owned by the WY Holding.
- **At $500K revenue:** Add a dedicated **Rent Guard Capital LLC (WY)** to hold Service Fund reserves, issue Keep Well Agreement to FL LLC.

```
CURRENT (MVP):                          AT $500K REVENUE:

[Existing WY LLC] (Holding)             [Existing WY LLC] (Holding)
    └── Rent Guard Florida LLC (FL)         ├── Rent Guard Capital LLC (WY) ← NEW
            - Operations                    └── Rent Guard Florida LLC (FL)
            - Signs contracts                       - Operations
            - Holds Service Funds                   - Signs contracts
                                                    - Capital Co backstops via Keep Well
```

### Immediate Action Items:
1. **Form Rent Guard Florida LLC** — sunbiz.org ($125), with WY Holding as sole member
2. **Get EIN for FL LLC** — IRS online, same day
3. **Draft FL LLC Operating Agreement** — WY Holding as sole member, manager-managed
4. **Open FL LLC bank account** — deposit Service Fund capital
5. **File FL business tax receipt** — Miami-Dade County
6. **Designate FL registered agent** — service ($50-100/yr) or business address
7. **Update WY Holding Operating Agreement** — reflect FL LLC as subsidiary asset

---

## Original Analysis & Recommendation

### Original Recommendation: Option 4 (Crawl-Walk-Run)

**Why:**
1. **Speed is the priority.** You have a working product, marketing materials, and a bulletproof contract. The bottleneck is the legal entity, bank account, and Stripe. A single FL LLC unblocks all three in days, not weeks.

2. **The risk is manageable.** With <10 policies and $50-150K exposure, the liability profile doesn't justify three entities. E&O insurance + general liability insurance (Section 1E of the checklist) provides adequate protection at this scale.

3. **Restructuring is cheap and non-disruptive.** When you hit the trigger point (suggested: $500K annual revenue OR expansion to a second state OR first lawsuit), form the WY Holding and do a membership interest assignment. The FL LLC continues operating under the same name, same EIN, same contracts. Landlords and tenants never know.

4. **The contract is already written for this.** The Protection Agreement names "RENT GUARD LLC, a Florida limited liability company." This works for both a standalone FL LLC and a FL LLC that later becomes a subsidiary.

### Restructure Triggers (move to Option 2 when ANY of these hit):
- [ ] Annual revenue exceeds $500K
- [ ] Expanding to a second state
- [ ] First lawsuit or regulatory inquiry
- [ ] Taking on outside investment
- [ ] Service Fund capital exceeds $500K

### Immediate Action Items:
1. **File FL LLC** — Articles of Organization on sunbiz.org ($125)
2. **Get EIN** — IRS online, same day
3. **Open business bank account** — Mercury or Chase Business (deposit Service Fund capital)
4. **File FL business tax receipt** — Miami-Dade County
5. **Designate registered agent** — use a service ($50-100/year) or use your FL business address
6. **Draft Operating Agreement** — single-member LLC operating agreement (protects LLC status)
7. **Get Stripe account** — requires EIN + bank account

### If You Prefer Option 2 (Hub & Spoke) From Day 1:
That's also a reasonable choice if you're willing to spend 1-2 extra weeks on setup. The additional steps would be:
1. Form WY LLC first (online, $100)
2. Get EIN for WY LLC
3. Form FL LLC with WY LLC as sole member
4. Get EIN for FL LLC
5. Open bank account for FL LLC (the operating entity)
6. Optional: open bank account for WY LLC (for receiving dividends/distributions)
7. Draft operating agreements for both entities
8. File FL foreign qualification for WY LLC (if WY LLC will do anything in FL directly — but if it only holds ownership, this may not be required)

The extra cost is ~$400/year and 1-2 weeks of setup time. If that's worth the peace of mind, do it.

---

## What NOT to Do

1. **Don't form only a WY LLC and foreign-qualify it in FL (Option 2 "Foreign Qualification").** This gives you Wyoming privacy but zero liability protection. A FL judgment creditor can reach all WY LLC assets. Worst of both worlds.

2. **Don't use a Series LLC for MVP.** Untested in FL courts, banking headaches, and high maintenance for no practical benefit at your scale.

3. **Don't delay launch to build the "perfect" structure.** A single FL LLC with proper insurance is 90% as good as a three-entity structure at 10% of the complexity. Launch now, restructure later.

4. **Don't commingle personal and business funds.** Regardless of structure, keep a clear separation between personal accounts and the LLC bank account. This is the #1 way LLC protections get pierced.

5. **Don't skip the Operating Agreement.** FL doesn't require one, but without it, you're governed by the FL LLC Act default rules — which may not match your intentions. A basic single-member operating agreement costs $0 (templates online) and protects your LLC status.
