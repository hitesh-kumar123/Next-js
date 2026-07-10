import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import SuperAdminClient from './SuperAdminClient'

export const dynamic = 'force-dynamic'

export default async function SuperAdminDashboardPage() {
  const supabase = await createClient()

  // Get session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch current profile to verify Super-Admin status
  const { data: profile } = await supabase
    .from('users')
    .select('is_superadmin')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.is_superadmin) {
    redirect('/dashboard')
  }

  // 1. Fetch Platform-wide Gym Owner Accounts (Admins with subdomains)
  const { data: gymsData } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'Admin')
    .not('subdomain', 'is', null)
    .order('created_at', { ascending: false })

  const gyms = gymsData || []

  // 2. Fetch Total Member Count
  const { count: totalMembers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'Member')

  // 3. Fetch Active Subscriptions & Global MRR
  const { data: activeSubsData } = await supabase
    .from('member_products')
    .select('id, products(price, payment_model)')
    .eq('status', 'active')

  const activeSubscriptions = activeSubsData?.length || 0

  let globalRevenueSum = 0
  if (activeSubsData) {
    activeSubsData.forEach((sub) => {
      const prod = sub.products as any
      if (prod) {
        globalRevenueSum += prod.price
      }
    })
  }

  // Calculations
  const totalGyms = gyms.length
  const avgMembersPerGym = totalGyms > 0 ? Math.round((totalMembers || 0) / totalGyms) : 0

  return (
    <main className="flex-1 p-10 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="orb-glow top-[-100px] right-[-100px]" />
      <div className="orb-glow bottom-[-100px] left-[20%]" />

      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold text-[#835500]">
          Super-Admin SaaS Portal
        </h1>
        <p className="text-[#524534] text-sm mt-1">
          Monitor global SaaS platform health, audit subdomains, and suspend/activate studio owner accounts.
        </p>
      </header>

      {/* Platform Bento Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-[#524534] font-bold uppercase tracking-wider">Total Studios</p>
            <p className="font-display text-2xl font-extrabold text-[#201b13] mt-1">{totalGyms}</p>
          </div>
          <div className="w-10 h-10 bg-[#fdf2e4] rounded-full flex items-center justify-center text-[#f5a623]">
            <span className="material-symbols-outlined">domain</span>
          </div>
        </div>

        <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-[#524534] font-bold uppercase tracking-wider">Total Members</p>
            <p className="font-display text-2xl font-extrabold text-[#201b13] mt-1">{totalMembers || 0}</p>
          </div>
          <div className="w-10 h-10 bg-[#dae3f6] rounded-full flex items-center justify-center text-[#131c2a]">
            <span className="material-symbols-outlined">groups</span>
          </div>
        </div>

        <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-[#524534] font-bold uppercase tracking-wider">Platform MRR</p>
            <p className="font-display text-2xl font-extrabold text-[#835500] mt-1">
              ${globalRevenueSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-10 h-10 bg-[#fdf2e4] rounded-full flex items-center justify-center text-[#f5a623]">
            <span className="material-symbols-outlined">account_balance_wallet</span>
          </div>
        </div>

        <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-[#524534] font-bold uppercase tracking-wider">Avg Members/Gym</p>
            <p className="font-display text-2xl font-extrabold text-[#201b13] mt-1">{avgMembersPerGym}</p>
          </div>
          <div className="w-10 h-10 bg-[#fdf2e4] rounded-full flex items-center justify-center text-[#ff9c85]">
            <span className="material-symbols-outlined">query_stats</span>
          </div>
        </div>
      </div>

      <SuperAdminClient initialGyms={gyms as any[]} />
    </main>
  )
}
