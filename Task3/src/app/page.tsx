import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Header from '@/components/Header'

export const dynamic = 'force-dynamic'

const PLANS = [
  {
    name: 'Starter',
    price: '$49',
    featured: false,
    perks: ['Up to 100 members', 'Basic billing settings', 'Email support'],
    cta: 'Choose Starter',
  },
  {
    name: 'Growth',
    price: '$99',
    featured: true,
    perks: [
      'Unlimited members',
      'Camera QR check-ins',
      'Full catalog & waivers',
      'Priority support',
    ],
    cta: 'Choose Growth',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    featured: false,
    perks: ['Custom subdomains', 'Dedicated database schema', '24/7 phone support'],
    cta: 'Contact Sales',
  },
] as const

const TESTIMONIALS = [
  {
    quote:
      'We moved 400 members over in a weekend. Check-ins used to be a clipboard; now it\u2019s a five-second QR scan.',
    name: 'Priya Nair',
    gym: 'Ironwell Fitness',
  },
  {
    quote:
      'The waiver builder alone saved us from three different liability headaches this year.',
    name: 'Marcus Webb',
    gym: 'Foundry Strength Co.',
  },
  {
    quote:
      'Recurring billing just works. Failed payments used to eat a whole afternoon a week \u2014 now it\u2019s automatic.',
    name: 'Dana Ruiz',
    gym: 'Bloom Studio',
  },
  {
    quote:
      'Our front desk staff onboard a new hire on this in ten minutes. No manual required.',
    name: 'Tomás Ferreira',
    gym: 'Powerhouse Athletics',
  },
  {
    quote:
      'Custom subdomains made it feel like our own product, not a rented tool.',
    name: 'Leah Osei',
    gym: 'Vantage Strength Club',
  },
] as const

const FAQS = [
  {
    q: 'Do I need my own Authorize.net account?',
    a: 'Yes. Auric connects to your existing Authorize.net account so funds settle directly to you \u2014 we never hold your money.',
  },
  {
    q: 'Can members book classes from their phone?',
    a: 'Yes. Every member gets a self-serve dashboard for booking classes, viewing billing, and pulling up their check-in QR code.',
  },
  {
    q: 'What happens to members if I cancel?',
    a: 'You can export your full member list and payment history as CSV at any time, no lock-in.',
  },
  {
    q: 'Is there a setup fee?',
    a: 'No. Every plan includes a free sandbox environment so you can test signup forms and payments before going live.',
  },
] as const

const TICKER = [
  'Jake M. checked in \u2014 Ironwell Fitness',
  'New Growth plan signup \u2014 Foundry Strength Co.',
  'Waiver signed \u2014 Powerhouse Athletics',
  'Priya N. booked HIIT Circuit \u2014 Bloom Studio',
  'Recurring payment processed \u2014 Vantage Strength Club',
  'QR check-in scanned \u2014 Ironwell Fitness',
  'New member joined via signup form \u2014 Bloom Studio',
] as const

const STEPS = [
  {
    n: '01',
    title: 'Build your signup page',
    desc: 'Pick your products, paste your waiver, and get a QR code ready to print in minutes.',
  },
  {
    n: '02',
    title: 'Members join & pay',
    desc: 'Authorize.net handles checkout and recurring billing the moment someone signs up.',
  },
  {
    n: '03',
    title: 'Scan to check in',
    desc: 'Camera QR or a name search at the front desk \u2014 no separate hardware needed.',
  },
  {
    n: '04',
    title: 'Watch it grow',
    desc: 'Revenue, churn, and attendance update on your dashboard in real time.',
  },
] as const

const GALLERY = [
  {
    src: 'https://images.unsplash.com/photo-1689877020200-403d8542d95d?auto=format&fit=crop&w=1200&q=80',
    alt: 'Gym floor lined with strength training machines and free weights',
  },
  {
    src: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1200&q=80',
    alt: 'Member lifting a barbell during a strength session',
  },
  {
    src: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1200&q=80',
    alt: 'Trainer coaching a member through a weightlifting set',
  },
] as const

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  const tickerLoop = [...TICKER, ...TICKER]
  const testimonialLoop = [...TESTIMONIALS, ...TESTIMONIALS]

  return (
    <div className="min-h-screen w-full bg-[#FBF7F0] text-[#1B2432] relative overflow-x-clip flex flex-col selection:bg-[#F5A623]/25">
      <style>{`
        @keyframes auric-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .auric-ticker { animation: auric-marquee 26s linear infinite; }
        .auric-testimonials { animation: auric-marquee 45s linear infinite; }
        .auric-pause:hover .auric-ticker,
        .auric-pause:hover .auric-testimonials { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .auric-ticker, .auric-testimonials { animation: none; }
        }
      `}</style>

      {/* Ambient orbs */}
      <div className="orb-glow top-[-150px] right-[-150px] md:w-[600px] md:h-[600px]" aria-hidden="true" />
      <div className="orb-glow bottom-[-200px] left-[-200px] md:w-[650px] md:h-[650px]" aria-hidden="true" />

      {/* Navbar — sticky, reserves its own height in flow, so nothing below
          it ever needs a guessed padding-top to avoid being hidden. */}
      <Header />

      {/* Hero — pt-24 is a fixed value matching Header's constant h-20 height
          plus breathing room. This never changes with scroll state or
          breakpoint, so the gap here is always identical. */}
      <section className="w-full max-w-7xl mx-auto px-6 pt-24 pb-8 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
        <div className="space-y-7 text-center lg:text-left">
          <span className="bg-[#F5A623]/12 text-[#B5791A] border border-[#F5A623]/30 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block">
            Premium Gym & Health Club SaaS Platform
          </span>
          <h1 className="text-4xl md:text-6xl font-black leading-[1.02] tracking-tight">
            Run your gym studio.
            <br />
            <span className="bg-gradient-to-r from-[#F5A623] to-[#FF8C5A] bg-clip-text text-transparent">
              Without the spreadsheets.
            </span>
          </h1>
          <p className="text-sm md:text-base text-[#6B6459] max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Automate Authorize.net billing, build waivers that fill themselves in, and check
            members in with a camera scan \u2014 all from one dashboard built for gym owners.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link
              href="/signup"
              className="bg-gradient-to-r from-[#F5A623] to-[#FF8C5A] hover:opacity-90 text-[#1B2432] font-black px-8 py-4 rounded-full text-sm transition-all shadow-lg glow-shadow-gold"
            >
              Get Started Free
            </Link>
            <a
              href="#capabilities"
              className="border border-[#1B2432]/15 hover:border-[#F5A623]/60 text-[#1B2432] font-bold px-8 py-4 rounded-full text-sm transition-all bg-white/60"
            >
              Explore Capabilities
            </a>
          </div>
        </div>

        {/* Signature: floating stat card over the hero photo, offset like a real snapshot */}
        <div className="relative h-[340px] md:h-[420px]">
          <div className="absolute inset-0 rounded-[2rem] overflow-hidden rotate-2 shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80"
              alt="Gym member preparing to lift a barbell on the training floor"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1B2432]/50 via-transparent to-transparent" />
          </div>
          <div className="absolute -bottom-6 -left-4 md:left-4 bg-white rounded-2xl shadow-xl p-4 -rotate-3 border border-[#1B2432]/5 w-52">
            <p className="text-[10px] font-bold text-[#6B6459] uppercase tracking-widest">This week</p>
            <p className="text-2xl font-black text-[#1B2432]">312 check-ins</p>
            <p className="text-[11px] text-[#8FA24D] font-bold">▲ 18% vs last week</p>
          </div>
        </div>
      </section>

      {/* Live activity ticker — signature element */}
      <div className="w-full border-y border-[#1B2432]/8 bg-white/60 py-3 overflow-hidden auric-pause">
        <div className="flex w-max gap-10 auric-ticker">
          {tickerLoop.map((item, i) => (
            <span key={i} className="flex items-center gap-2 text-xs font-semibold text-[#6B6459] whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8FA24D]" aria-hidden="true" />
              {item}
            </span>
          ))}
        </div>
      </div>

      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 flex-1">
        {/* Gallery — mosaic, not a repeated card row */}
        <section className="py-16 grid grid-cols-1 md:grid-cols-3 md:grid-rows-[repeat(2,190px)] gap-4">
          <div className="relative md:col-span-2 md:row-span-2 rounded-2xl overflow-hidden border border-[#1B2432]/8 group min-h-[250px] md:min-h-auto">
            <img src={GALLERY[0].src} alt={GALLERY[0].alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-[#1B2432]/8 group min-h-[190px]">
            <img src={GALLERY[1].src} alt={GALLERY[1].alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-[#1B2432]/8 group min-h-[190px]">
            <img src={GALLERY[2].src} alt={GALLERY[2].alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </div>
        </section>

        {/* Capabilities — asymmetric bento, QR check-in as the signature dark card */}
        <section id="capabilities" className="py-16 space-y-12 scroll-mt-28">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl md:text-4xl font-extrabold">Designed for gym management</h2>
            <p className="text-xs text-[#6B6459] leading-relaxed max-w-lg mx-auto">
              Everything to configure products, billing, invites, and front-desk check-ins in one dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-[repeat(2,minmax(180px,auto))] gap-6">
            <div className="md:col-span-2 relative overflow-hidden bg-gradient-to-br from-[#FDECC8] to-white rounded-2xl border border-[#1B2432]/8 p-7 flex flex-col justify-between hover:border-[#F5A623]/40 hover:-translate-y-1 transition-all">
              <span
                className="material-symbols-outlined absolute -right-4 -bottom-6 text-[#F5A623]/15 pointer-events-none select-none"
                style={{ fontSize: '9rem' }}
                aria-hidden="true"
              >
                add_card
              </span>
              <span className="material-symbols-outlined text-[#F5A623] text-3xl relative" aria-hidden="true">add_card</span>
              <div className="relative">
                <h3 className="font-bold text-base mt-3">Authorize.net Payments</h3>
                <p className="text-xs text-[#6B6459] mt-1.5 leading-relaxed max-w-sm">
                  Automate credit card checkouts and recurring ARB monthly billing, seamlessly.
                </p>
              </div>
            </div>

            <div className="md:row-span-2 bg-[#1B2432] text-white rounded-2xl p-7 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-[#F5A623]/15 blur-2xl" aria-hidden="true" />
              <span className="material-symbols-outlined text-[#F5A623] text-3xl" aria-hidden="true">barcode_reader</span>
              <div className="relative">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#F5A623]">Signature feature</span>
                <h3 className="font-bold text-lg mt-1">Camera QR Check-In</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Verify active memberships and signed waivers at the door using nothing but a
                  phone or tablet camera — no scanner hardware to buy.
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-[#FFE3D6] to-white rounded-2xl border border-[#1B2432]/8 p-7 flex flex-col justify-between hover:border-[#F5A623]/40 hover:-translate-y-1 transition-all">
              <span
                className="material-symbols-outlined absolute -right-3 -bottom-6 text-[#FF6B4A]/15 pointer-events-none select-none"
                style={{ fontSize: '7rem' }}
                aria-hidden="true"
              >
                gavel
              </span>
              <span className="material-symbols-outlined text-[#F5A623] text-3xl relative" aria-hidden="true">gavel</span>
              <div className="relative">
                <h3 className="font-bold text-base mt-3">Tokenized Waivers</h3>
                <p className="text-xs text-[#6B6459] mt-1.5 leading-relaxed">
                  Liability waivers that auto-fill client names and dates when shown to a customer.
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-[#E4EAF3] to-white rounded-2xl border border-[#1B2432]/8 p-7 flex flex-col justify-between hover:border-[#F5A623]/40 hover:-translate-y-1 transition-all">
              <span
                className="material-symbols-outlined absolute -right-3 -bottom-6 text-[#1B2432]/10 pointer-events-none select-none"
                style={{ fontSize: '7rem' }}
                aria-hidden="true"
              >
                domain
              </span>
              <span className="material-symbols-outlined text-[#F5A623] text-3xl relative" aria-hidden="true">domain</span>
              <div className="relative">
                <h3 className="font-bold text-base mt-3">Custom Subdomains</h3>
                <p className="text-xs text-[#6B6459] mt-1.5 leading-relaxed">
                  Serve your checkout page under your own name: yourgym.thinkauric.com.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works — real sequence, timeline */}
        <section className="py-16">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
            <h2 className="text-2xl md:text-4xl font-extrabold">From signup to check-in</h2>
            <p className="text-xs text-[#6B6459]">The path every one of your members actually takes.</p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="hidden md:block absolute top-6 left-[12.5%] right-[12.5%] h-px bg-[#F5A623]/25" aria-hidden="true" />
            {STEPS.map((s) => (
              <div key={s.n} className="relative text-center md:text-left">
                <div className="w-12 h-12 rounded-full bg-white border-2 border-[#F5A623] text-[#F5A623] font-black text-sm flex items-center justify-center mx-auto md:mx-0 relative z-10">
                  {s.n}
                </div>
                <h3 className="font-bold text-sm mt-4">{s.title}</h3>
                <p className="text-xs text-[#6B6459] mt-1.5 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-16 space-y-12 scroll-mt-28">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl md:text-4xl font-extrabold">Select your subscription plan</h2>
            <p className="text-xs text-[#6B6459]">Every plan starts with a sandbox for testing before you go live.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={
                  plan.featured
                    ? 'bg-[#1B2432] text-white p-8 rounded-2xl shadow-xl flex flex-col justify-between min-h-[420px] relative md:-translate-y-3'
                    : 'bg-white p-8 rounded-2xl border border-[#1B2432]/8 flex flex-col justify-between min-h-[400px] hover:border-[#F5A623]/40 transition-all'
                }
              >
                {plan.featured && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-[#F5A623] to-[#FF8C5A] text-[#1B2432] text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                    Popular
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-[#F5A623] uppercase tracking-wider">{plan.name}</p>
                  <p className={`font-extrabold mt-3 ${plan.featured ? 'text-4xl' : 'text-3xl'}`}>
                    {plan.price}
                    {plan.price !== 'Custom' && (
                      <span className={`text-xs font-normal ${plan.featured ? 'text-slate-400' : 'text-[#6B6459]'}`}>/mo</span>
                    )}
                  </p>
                  <ul className={`text-xs space-y-3 mt-8 text-left ${plan.featured ? 'text-slate-300' : 'text-[#1B2432]'}`}>
                    {plan.perks.map((perk) => (
                      <li key={perk} className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#F5A623] text-sm" aria-hidden="true">check</span>
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href="/signup"
                  className={
                    plan.featured
                      ? 'w-full bg-gradient-to-r from-[#F5A623] to-[#FF8C5A] hover:opacity-90 text-[#1B2432] py-3.5 rounded-full text-xs font-black transition-all text-center block mt-8'
                      : 'w-full bg-[#FBF7F0] text-[#1B2432] border border-[#1B2432]/15 hover:border-[#F5A623]/50 py-3 rounded-full text-xs font-bold transition-all text-center block mt-8'
                  }
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials — auto-scrolling marquee, pauses on hover */}
        <section id="testimonials" className="py-16 space-y-10 scroll-mt-28">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl md:text-4xl font-extrabold">Trusted by health clubs</h2>
          </div>

          <div className="overflow-hidden auric-pause -mx-6 px-6">
            <div className="flex w-max gap-6 auric-testimonials">
              {testimonialLoop.map((t, i) => (
                <figure key={i} className="bg-white rounded-2xl border border-[#1B2432]/8 p-6 w-80 shrink-0 flex flex-col justify-between">
                  <div className="flex gap-1 mb-4" aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <span key={j} className="material-symbols-outlined text-[#F5A623] text-sm">star</span>
                    ))}
                  </div>
                  <blockquote className="text-sm text-[#1B2432] leading-relaxed flex-1">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6 pt-4 border-t border-[#1B2432]/8">
                    <p className="text-sm font-bold">{t.name}</p>
                    <p className="text-xs text-[#6B6459]">{t.gym}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-16 pb-28 space-y-10 scroll-mt-28 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-4xl font-extrabold">Frequently asked questions</h2>
          </div>
          <div className="divide-y divide-[#1B2432]/8 border-y border-[#1B2432]/8">
            {FAQS.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex justify-between items-center cursor-pointer list-none text-sm font-bold">
                  {item.q}
                  <span className="material-symbols-outlined text-[#F5A623] transition-transform group-open:rotate-45" aria-hidden="true">add</span>
                </summary>
                <p className="text-xs text-[#6B6459] leading-relaxed mt-3">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#1B2432]/8 py-8 text-center text-xs text-[#6B6459] max-w-7xl mx-auto w-full px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p>&copy; {new Date().getFullYear()} AuricFit. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-[#F5A623] transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-[#F5A623] transition-colors">Terms of Service</Link>
          <Link href="/docs" className="hover:text-[#F5A623] transition-colors">Documentation</Link>
        </div>
      </footer>
    </div>
  )
}