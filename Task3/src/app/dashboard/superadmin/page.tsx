import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getAllUsers } from './actions'
import SuperAdminClient from './SuperAdminClient'

export const dynamic = 'force-dynamic'

interface ProductDetails {
  name: string
  price: number
  payment_model: string
}

interface MemberProductItem {
  id: string
  created_at: string
  status: string
  products: ProductDetails | null
}

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

  // 2. Fetch all platform users
  const { users = [] } = await getAllUsers()
  const totalMembers = users.filter((u) => u.role === 'Member').length

  // 3. Fetch check-ins for active/inactive calculations
  const { data: checkinsData } = await supabase
     .from('checkins')
     .select('user_id, checked_in_at')
  const checkins = checkinsData || []

  // 4. Fetch all memberships purchase history
  const { data: rawMemberProducts } = await supabase
    .from('member_products')
    .select('id, created_at, status, products(name, price, payment_model)')

  const memberProducts = (rawMemberProducts || []) as any[] as MemberProductItem[]

  // --- ANALYTICS CALCULATIONS ---

  // Membership Analytics
  const activeSubs = memberProducts.filter((mp) => mp.status === 'active')
  const totalActiveMembers = activeSubs.length

  // Average Membership Duration (days active)
  let totalDays = 0
  let durationCount = 0
  memberProducts.forEach((mp) => {
    const start = new Date(mp.created_at)
    const end = mp.status === 'active' ? new Date() : new Date(mp.created_at) // simplified check
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    totalDays += diffDays
    durationCount++
  })
  const avgDurationDays = durationCount > 0 ? Math.round(totalDays / durationCount) : 30
  const avgDurationMonths = Math.max(1, Math.round(avgDurationDays / 30))

  // Plan Breakdown
  const planBreakdown: { [key: string]: number } = {}
  activeSubs.forEach((sub) => {
    const name = sub.products?.name || 'Standard Membership'
    planBreakdown[name] = (planBreakdown[name] || 0) + 1
  })

  // Most Active Membership Tier
  let mostActiveTier = 'N/A'
  let maxActiveCount = 0
  Object.entries(planBreakdown).forEach(([name, count]) => {
    if (count > maxActiveCount) {
      maxActiveCount = count
      mostActiveTier = name
    }
  })

  // New Memberships (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const newMemberships = memberProducts.filter(
    (mp) => new Date(mp.created_at) >= thirtyDaysAgo
  ).length

  // Churn Rate (cancelled vs total)
  const totalPlansCount = memberProducts.length
  const cancelledPlansCount = memberProducts.filter((mp) => mp.status === 'cancelled').length
  const churnRate = totalPlansCount > 0 ? Math.round((cancelledPlansCount / totalPlansCount) * 100) : 0

  // Renewal Rate (active vs total)
  const renewalRate = totalPlansCount > 0 ? Math.round((totalActiveMembers / totalPlansCount) * 100) : 100

  // Inactive Members (no checkin in 15 days)
  const fifteenDaysAgo = new Date()
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)
  const checkedInUserIds = new Set(
    checkins
      .filter((ci) => new Date(ci.checked_in_at) >= fifteenDaysAgo)
      .map((ci) => ci.user_id)
  )
  const inactiveMembers = users.filter(
    (u) => u.role === 'Member' && !checkedInUserIds.has(u.id)
  ).length

  // Financial Analytics
  let lifetimeRevenue = 0
  memberProducts.forEach((mp) => {
    const price = mp.products?.price || 0
    // simplified sum
    lifetimeRevenue += price
  })

  const memberLtv = totalMembers > 0 ? Math.round(lifetimeRevenue / totalMembers) : 0

  // Revenue by membership type
  const revenueByPlan: { [key: string]: number } = {}
  memberProducts.forEach((mp) => {
    const name = mp.products?.name || 'Standard Plan'
    const price = mp.products?.price || 0
    revenueByPlan[name] = (revenueByPlan[name] || 0) + price
  })

  // MRR
  let mrr = 0
  activeSubs.forEach((sub) => {
    if (sub.products?.payment_model === 'recurring') {
      mrr += sub.products?.price || 0
    }
  })

  const arr = mrr * 12
  const arpu = totalActiveMembers > 0 ? Math.round(mrr / totalActiveMembers) : 0

  // Mocked/Calculated checkout failures & outstanding billing
  const failedPayments = Math.round(activeSubs.length * 0.03) // ~3% mock failure rate
  const refunds = memberProducts.filter((mp) => mp.status === 'refunded').length
  const outstandingPayments = Math.round(activeSubs.length * 0.05) * 50 // Mocked sum of unpaid periods

  const analytics = {
    membership: {
      totalActiveMembers,
      avgDurationMonths,
      planBreakdown,
      mostActiveTier,
      newMemberships,
      churnRate,
      renewalRate,
      inactiveMembers,
    },
    financial: {
      lifetimeRevenue,
      memberLtv,
      revenueByPlan,
      mrr,
      arr,
      arpu,
      failedPayments,
      refunds,
      outstandingPayments,
    },
  }

  // General metrics
  const totalGyms = gyms.length
  const avgMembersPerGym = totalGyms > 0 ? Math.round((totalMembers || 0) / totalGyms) : 0

  return (
    <main className="flex-1 p-10 relative overflow-hidden bg-[#FBF7F0]">
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
              ${mrr.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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

      <SuperAdminClient
        initialGyms={gyms as any[]}
        initialUsers={users as any[]}
        analytics={analytics}
      />
    </main>
  )
}
