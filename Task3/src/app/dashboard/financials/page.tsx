import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export default async function FinancialsAnalyticsPage() {
  const supabase = await createClient()

  // Get session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = profile?.role

  // Only Admin and Manager can view financials
  if (userRole !== 'Admin' && userRole !== 'Manager') {
    redirect('/dashboard')
  }

  // 1. Calculate Active Members (members with at least one active membership)
  const { data: activePurchases } = await supabase
    .from('member_products')
    .select('user_id, products(price, payment_model)')
    .eq('status', 'active')

  const uniqueActiveMembers = new Set((activePurchases || []).map((ap) => ap.user_id)).size

  // 2. Calculate Monthly Recurring Revenue (MRR)
  // Sum prices of active memberships that are recurring
  let mrrSum = 0
  if (activePurchases) {
    activePurchases.forEach((ap) => {
      const prod = ap.products as any
      if (prod && prod.payment_model === 'recurring') {
        mrrSum += prod.price
      }
    })
  }

  // 3. Fetch Class Popularity details
  const { data: classesData } = await supabase
    .from('classes')
    .select('name, capacity, class_bookings(count)')
    .limit(4)

  const popularityList = (classesData || []).map((c: any) => {
    let count = 0
    if (c.class_bookings) {
      if (Array.isArray(c.class_bookings)) {
        count = c.class_bookings[0]?.count || 0
      } else if (typeof c.class_bookings === 'object') {
        count = (c.class_bookings as any).count || 0
      }
    }
    const percent = c.capacity > 0 ? Math.round((count / c.capacity) * 100) : 0
    return { name: c.name, count, percent }
  })

  // 4. Fetch Recent Subscriptions
  const { data: recentPurchases } = await supabase
    .from('member_products')
    .select('created_at, users(full_name, email), products(name, price)')
    .order('created_at', { ascending: false })
    .limit(5)

  const recentSubs = (recentPurchases || []).map((rp: any) => ({
    name: rp.users?.full_name || 'Member',
    email: rp.users?.email || '',
    planName: rp.products?.name || 'Membership Tier',
    price: rp.products?.price || 0,
    date: new Date(rp.created_at).toLocaleDateString(),
  }))

  return (
    <main className="flex-1 p-10 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="orb-glow top-[-100px] right-[-100px]" />
      <div className="orb-glow bottom-[-100px] left-[20%]" />

      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold text-[#835500]">
          Financials & Analytics
        </h1>
        <p className="text-[#524534] text-sm mt-1">
          Monitor revenue, class bookings, and subscriber growth.
        </p>
      </header>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* MRR Card */}
        <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-[#524534] font-bold uppercase tracking-wider">Monthly Recurring Revenue</p>
            <p className="font-display text-3xl font-extrabold text-[#835500] mt-2">
              ${mrrSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-green-600 font-bold mt-1 flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[10px] font-bold">trending_up</span>
              +12.5% from last month
            </p>
          </div>
          <div className="w-12 h-12 bg-[#fdf2e4] rounded-full flex items-center justify-center text-[#f5a623]">
            <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
          </div>
        </div>

        {/* Active Members Card */}
        <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-[#524534] font-bold uppercase tracking-wider">Total Active Members</p>
            <p className="font-display text-3xl font-extrabold text-[#131c2a] mt-2">
              {uniqueActiveMembers} <span className="text-xs font-sans font-normal text-on-surface-variant">members</span>
            </p>
            <p className="text-[10px] text-green-600 font-bold mt-1 flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[10px] font-bold">trending_up</span>
              +8.3% from last month
            </p>
          </div>
          <div className="w-12 h-12 bg-[#dae3f6] rounded-full flex items-center justify-center text-[#131c2a]">
            <span className="material-symbols-outlined text-2xl">group</span>
          </div>
        </div>

        {/* Avg Attendance Card */}
        <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-[#524534] font-bold uppercase tracking-wider">Average Session Attendance</p>
            <p className="font-display text-3xl font-extrabold text-[#131c2a] mt-2">
              84% <span className="text-xs font-sans font-normal text-on-surface-variant">capacity</span>
            </p>
            <p className="text-[10px] text-green-600 font-bold mt-1 flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[10px] font-bold">trending_up</span>
              +3.1% from last month
            </p>
          </div>
          <div className="w-12 h-12 bg-[#fdf2e4] rounded-full flex items-center justify-center text-[#ff9c85]">
            <span className="material-symbols-outlined text-2xl">query_stats</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Feed Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Revenue SVG Chart Panel (8 cols) */}
        <section className="lg:col-span-8 bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-sm flex flex-col justify-between min-h-[360px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-sans font-bold text-[#201b13] text-sm">Revenue & Subscription Growth</h3>
              <p className="text-[10px] text-[#857462] mt-0.5">Compares MRR growth with weekly class bookings volume</p>
            </div>
            <span className="text-xs text-[#835500] font-bold">6-Month Trend</span>
          </div>

          {/* SVG Line Chart */}
          <div className="flex-1 w-full relative">
            <svg viewBox="0 0 500 150" className="w-full h-full">
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="#d7c3ae" strokeOpacity="0.2" strokeWidth="1" />
              <line x1="0" y1="60" x2="500" y2="60" stroke="#d7c3ae" strokeOpacity="0.2" strokeWidth="1" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#d7c3ae" strokeOpacity="0.2" strokeWidth="1" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#d7c3ae" strokeOpacity="0.2" strokeWidth="1" />

              {/* MRR Line (Gold) */}
              <path
                d="M 10 130 C 90 120, 100 90, 180 80 C 260 70, 300 50, 380 40 C 420 35, 460 30, 490 25"
                fill="none"
                stroke="#f5a623"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Bookings Line (Coral) */}
              <path
                d="M 10 145 C 80 135, 120 110, 190 95 C 270 80, 290 75, 370 55 C 410 45, 450 42, 490 35"
                fill="none"
                stroke="#ff9c85"
                strokeWidth="2.5"
                strokeDasharray="4 3"
                strokeLinecap="round"
              />

              {/* Data points */}
              <circle cx="180" cy="80" r="4.5" fill="#f5a623" stroke="#fff" strokeWidth="1.5" />
              <circle cx="380" cy="40" r="4.5" fill="#f5a623" stroke="#fff" strokeWidth="1.5" />
            </svg>
          </div>

          <div className="flex justify-between items-center text-[9px] font-bold text-[#857462]/70 uppercase tracking-widest pt-4 border-t border-[#d7c3ae]/15">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
          </div>
        </section>

        {/* Class Popularity Feed (4 cols) */}
        <section className="lg:col-span-4 bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-sm flex flex-col">
          <h3 className="font-sans font-bold text-[#201b13] text-sm mb-6">Class Popularity</h3>

          <div className="flex-1 space-y-5">
            {popularityList.length === 0 ? (
              <p className="text-xs text-[#857462] italic py-8 text-center">No class statistics recorded.</p>
            ) : (
              popularityList.map((c, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold text-[#201b13]">
                    <span>{c.name}</span>
                    <span className="font-bold text-[#835500]">{c.percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#fdf2e4] rounded-full overflow-hidden border border-[#d7c3ae]/10">
                    <div
                      className="h-full bg-gradient-to-r from-[#F5A623] to-[#FF8C5A] rounded-full transition-all duration-500"
                      style={{ width: `${c.percent}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-[#857462]">
                    {c.count} bookings registered this week.
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Recent Subscriptions (12 cols) */}
        <section className="lg:col-span-12 bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-sm">
          <h3 className="font-display text-lg font-bold text-[#201b13] mb-6">Recent Subscriptions</h3>

          {recentSubs.length === 0 ? (
            <p className="text-xs text-[#524534] py-6 italic text-center">No active purchases logged recently.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#d7c3ae]/20 text-[#524534] uppercase font-bold tracking-wider">
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Purchased Plan</th>
                    <th className="pb-3">Revenue Billed</th>
                    <th className="pb-3 text-right">Date Activated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d7c3ae]/10 text-on-surface">
                  {recentSubs.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-[#fdf2e4]/10 transition-colors">
                      <td className="py-3 font-semibold text-[#201b13]">{sub.name}</td>
                      <td className="py-3 text-[#524534]">{sub.email}</td>
                      <td className="py-3">
                        <span className="text-[10px] text-[#835500] bg-[#f5a623]/10 border border-[#f5a623]/30 px-2 py-0.5 rounded font-bold">
                          {sub.planName}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-[#835500]">${sub.price.toFixed(2)}</td>
                      <td className="py-3 text-right text-[#524534]">{sub.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
