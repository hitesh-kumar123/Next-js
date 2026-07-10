import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()

  // Verify auth session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to dashboard if logged in
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen w-full bg-background relative overflow-hidden flex flex-col justify-between selection:bg-[#f5a623]/30 selection:text-[#835500]">
      {/* Glow Orbs */}
      <div className="orb-glow top-[-150px] right-[-150px] md:w-[600px] md:h-[600px]" />
      <div className="orb-glow bottom-[-200px] left-[-200px] md:w-[650px] md:h-[650px]" />

      {/* Navigation Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 select-none">
          <span className="material-symbols-outlined text-primary text-3xl font-extrabold" style={{ fontVariationSettings: "'FILL' 1" }}>
            workspace_premium
          </span>
          <span className="font-display text-2xl font-black text-[#1B2432] tracking-tighter">
            AURIC<span className="text-[#f5a623] font-sans font-light">GLOW</span>
          </span>
        </div>

        <nav className="hidden md:flex gap-8 text-xs font-bold text-[#524534] uppercase tracking-wider">
          <a href="#features" className="hover:text-[#f5a623] transition-colors">Features</a>
          <a href="#pricing" className="hover:text-[#f5a623] transition-colors">Pricing</a>
          <a href="#about" className="hover:text-[#f5a623] transition-colors">About Us</a>
        </nav>

        <div className="flex items-center gap-4 relative z-10">
          <Link
            href="/login"
            className="text-xs font-bold text-[#1B2432] hover:text-[#f5a623] uppercase tracking-wider px-4 py-2 transition-colors cursor-pointer"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="bg-[#131c2a] hover:bg-primary text-[#fff8f2] font-bold px-6 py-2.5 rounded-full text-xs transition-all cursor-pointer shadow-md"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-16 md:py-24 text-center space-y-8 flex-1 flex flex-col justify-center">
        <div className="space-y-4 max-w-4xl mx-auto">
          <span className="bg-[#f5a623]/10 text-[#835500] border border-[#f5a623]/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider select-none inline-block">
            Modern Gym & Fitness Studio SaaS
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-black text-[#1B2432] leading-none tracking-tight">
            Empower Your Studio.<br />
            <span className="bg-gradient-to-r from-[#F5A623] to-[#FF8C5A] bg-clip-text text-transparent">
              Elevate Your Fitness SaaS.
            </span>
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant max-w-2xl mx-auto font-sans leading-relaxed">
            Manage memberships, execute sandbox transactions, host legal waivers with replacement tokens, and check-in users via front-facing camera scanners.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link
            href="/signup"
            className="bg-gradient-to-r from-[#F5A623] to-[#FF8C5A] hover:opacity-95 text-[#644000] font-bold px-8 py-4 rounded-full text-sm transition-all shadow-lg glow-shadow-gold cursor-pointer"
          >
            Start Free Trial
          </Link>
          <a
            href="#features"
            className="border border-[#d7c3ae]/80 hover:border-primary text-[#524534] font-bold px-8 py-4 rounded-full text-sm transition-all bg-white/40 cursor-pointer"
          >
            Learn More
          </a>
        </div>

        {/* Features Bento Section */}
        <section id="features" className="pt-24 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#1B2432]">
              All-In-One Studio Suite
            </h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Built with security-first database integrations and modern web technologies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
            <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-xs flex flex-col justify-between h-48 hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-[#f5a623] text-3xl">add_card</span>
              <div>
                <h3 className="font-sans font-bold text-sm text-[#201b13]">Automated Payments</h3>
                <p className="text-xs text-[#524534] mt-1">Authorize.net Sandbox integration for recurring subscriptions.</p>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-xs flex flex-col justify-between h-48 hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-[#f5a623] text-3xl">calendar_today</span>
              <div>
                <h3 className="font-sans font-bold text-sm text-[#201b13]">Interactive Calendar</h3>
                <p className="text-xs text-[#524534] mt-1">Class bookings for members, schedule management for admins.</p>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-xs flex flex-col justify-between h-48 hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-[#f5a623] text-3xl">gavel</span>
              <div>
                <h3 className="font-sans font-bold text-sm text-[#201b13]">Tokenized Waivers</h3>
                <p className="text-xs text-[#524534] mt-1">Rich-text waiver templates replacing client names in real-time.</p>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-xs flex flex-col justify-between h-48 hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-[#f5a623] text-3xl">lock</span>
              <div>
                <h3 className="font-sans font-bold text-sm text-[#201b13]">Role-Based Access</h3>
                <p className="text-xs text-[#524534] mt-1">Strict RLS database policies for Admin, Manager, Trainer, and Members.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Plan cards */}
        <section id="pricing" className="pt-24 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#1B2432]">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              No hidden fees. Cancel or upgrade your plan at any time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white/60 backdrop-blur-md p-8 rounded-2xl border border-[#d7c3ae]/30 shadow-xs flex flex-col justify-between h-[400px]">
              <div>
                <p className="text-xs font-bold text-[#524534] uppercase tracking-wider">Starter</p>
                <p className="font-display text-3xl font-extrabold text-[#1B2432] mt-3">
                  $49<span className="text-xs font-sans font-normal text-on-surface-variant">/mo</span>
                </p>
                <ul className="text-xs text-[#524534] space-y-2.5 mt-8 list-none">
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-600 text-base">check</span>Up to 100 Members</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-600 text-base">check</span>Basic Billing Settings</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-600 text-base">check</span>Email Support</li>
                </ul>
              </div>
              <Link href="/signup" className="w-full bg-[#131c2a] text-[#fff8f2] hover:bg-primary py-3 rounded-full text-xs font-bold transition-all text-center block cursor-pointer">
                Choose Starter
              </Link>
            </div>

            {/* Growth Plan (Featured) */}
            <div className="bg-[#131c2a] text-[#fff8f2] p-8 rounded-2xl border border-[#d7c3ae]/15 shadow-xl flex flex-col justify-between h-[420px] relative -translate-y-2 scale-105">
              <div className="absolute top-4 right-4 bg-[#f5a623] text-[#644000] text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                Popular
              </div>
              <div>
                <p className="text-xs font-bold text-[#bec7da] uppercase tracking-wider">Growth</p>
                <p className="font-display text-4xl font-extrabold text-white mt-3">
                  $99<span className="text-xs font-sans font-normal text-[#bec7da]">/mo</span>
                </p>
                <ul className="text-xs text-[#bec7da] space-y-2.5 mt-8 list-none">
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#f5a623] text-base">check</span>Unlimited Members</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#f5a623] text-base">check</span>Camera QR check-ins</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#f5a623] text-base">check</span>Full Catalog & Waivers</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#f5a623] text-base">check</span>Priority Support</li>
                </ul>
              </div>
              <Link href="/signup" className="w-full bg-gradient-to-r from-[#F5A623] to-[#FF8C5A] hover:opacity-95 text-[#644000] py-3.5 rounded-full text-xs font-bold transition-all text-center block cursor-pointer">
                Choose Growth
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white/60 backdrop-blur-md p-8 rounded-2xl border border-[#d7c3ae]/30 shadow-xs flex flex-col justify-between h-[400px]">
              <div>
                <p className="text-xs font-bold text-[#524534] uppercase tracking-wider">Enterprise</p>
                <p className="font-display text-3xl font-extrabold text-[#1B2432] mt-3">
                  Custom
                </p>
                <ul className="text-xs text-[#524534] space-y-2.5 mt-8 list-none">
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-600 text-base">check</span>Custom subdomains</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-600 text-base">check</span>Dedicated database schema</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-600 text-base">check</span>24/7 Phone Support</li>
                </ul>
              </div>
              <Link href="/signup" className="w-full bg-[#131c2a] text-[#fff8f2] hover:bg-primary py-3 rounded-full text-xs font-bold transition-all text-center block cursor-pointer">
                Contact Sales
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#d7c3ae]/30 py-8 text-center text-xs text-[#524534] max-w-7xl mx-auto w-full px-6 flex flex-col sm:flex-row justify-between items-center gap-4 mt-20">
        <p>© 2026 Auric SaaS platform. Built for elite studios.</p>
        <div className="flex gap-6">
          <span className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-primary cursor-pointer transition-colors">Terms of Service</span>
          <span className="hover:text-primary cursor-pointer transition-colors">Documentation</span>
        </div>
      </footer>
    </div>
  )
}
