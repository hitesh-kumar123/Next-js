import React from 'react'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user?.id)
    .single()

  const fullName = profile?.full_name || 'Auric Member'

  return (
    <main className="flex-1 p-10 relative overflow-hidden flex flex-col justify-between">
      {/* Background Orbs */}
      <div className="orb-glow top-[-100px] right-[-100px]" />
      <div className="orb-glow bottom-[-100px] left-[20%]" />

      <div>
        {/* Top Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="font-display text-3xl font-bold text-[#835500]">
              Welcome back, {fullName}
            </h1>
            <p className="text-[#524534] text-sm mt-1">
              Your fitness journey is glowing today.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative p-2 text-[#524534] hover:text-[#835500] cursor-pointer transition-colors">
              <span className="material-symbols-outlined text-2xl">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ae3115] rounded-full border border-[#fff8f2]"></span>
            </div>
            
            <div className="flex items-center gap-3 bg-[#fdf2e4] p-1.5 pr-4 rounded-full border border-[#d7c3ae]/30">
              <div className="w-9 h-9 rounded-full bg-[#f5a623] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {fullName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-none text-[#201b13]">
                  {fullName}
                </span>
                <span className="text-[10px] text-[#524534] mt-0.5">
                  Member
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Welcome Dashboard Shell Message */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="col-span-2 bg-[#ffffff]/70 backdrop-blur-md p-8 rounded-2xl border border-[#d7c3ae]/30 shadow-sm">
            <h2 className="font-display text-xl font-bold text-[#201b13] mb-2">
              Milestone 1 Achieved: Foundation Ready
            </h2>
            <p className="text-sm text-[#524534] leading-relaxed mb-6">
              You are currently logged into the empty dashboard shell of Auric. The database connection is active, your public profile is synchronized, and authentication guards are securely enforced.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="bg-[#f5a623]/10 text-[#835500] border border-[#f5a623]/20 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">database</span>
                Supabase Connected
              </span>
              <span className="bg-[#ff9c85]/10 text-[#ae3115] border border-[#ff9c85]/20 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">lock</span>
                Next.js Auth Middleware
              </span>
              <span className="bg-[#dae3f6]/50 text-[#3d4757] border border-[#dae3f6] px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">palette</span>
                Auric Glow Styling
              </span>
            </div>
          </div>

          <div className="bg-[#131c2a] text-[#fff8f2] p-8 rounded-2xl shadow-lg flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
            <div>
              <span className="text-[#f5a623] text-xs font-bold uppercase tracking-wider block mb-1">
                Coming Up
              </span>
              <h3 className="font-display text-lg font-bold">
                Roles & Invites
              </h3>
              <p className="text-xs text-[#bec7da] mt-2 leading-relaxed">
                In Milestone 2, we will integrate Role-Based Access Control (RBAC) to support Admin, Manager, Trainer, and Member access privileges.
              </p>
            </div>
            <div className="pt-4 border-t border-[#fff8f2]/10 mt-6 flex justify-between items-center text-xs">
              <span className="text-[#bec7da]">Current Role</span>
              <span className="font-bold bg-[#f5a623] text-[#644000] px-2 py-0.5 rounded">
                Member
              </span>
            </div>
          </div>
        </div>

        {/* Placeholder Bento Grid components */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#ffffff]/50 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/20 shadow-xs flex flex-col justify-between h-48 opacity-75">
            <div>
              <div className="w-10 h-10 bg-[#fdf2e4] rounded-full flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[#f5a623]">calendar_today</span>
              </div>
              <h3 className="font-sans font-bold text-sm text-[#201b13]">Schedule & Classes</h3>
              <p className="text-xs text-[#524534] mt-1">Book and organize studio sessions.</p>
            </div>
            <span className="text-[10px] uppercase font-bold text-[#857462] tracking-wider">Locked (Milestone 8)</span>
          </div>

          <div className="bg-[#ffffff]/50 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/20 shadow-xs flex flex-col justify-between h-48 opacity-75">
            <div>
              <div className="w-10 h-10 bg-[#fdf2e4] rounded-full flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[#f5a623]">payments</span>
              </div>
              <h3 className="font-sans font-bold text-sm text-[#201b13]">Billing & Invoices</h3>
              <p className="text-xs text-[#524534] mt-1">Manage payments, plans, and receipts.</p>
            </div>
            <span className="text-[10px] uppercase font-bold text-[#857462] tracking-wider">Locked (Milestone 5)</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-[#d7c3ae]/30 py-6 flex flex-col sm:flex-row justify-between items-center text-xs text-[#524534] gap-4">
        <p>© 2026 Auric SaaS. All rights reserved.</p>
        <div className="flex gap-6">
          <span className="hover:text-[#835500] cursor-pointer">Privacy Policy</span>
          <span className="hover:text-[#835500] cursor-pointer">Terms of Service</span>
          <span className="hover:text-[#835500] cursor-pointer">Support</span>
        </div>
      </footer>
    </main>
  )
}
