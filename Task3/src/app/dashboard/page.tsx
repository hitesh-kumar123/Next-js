import React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import MemberDashboard from './MemberDashboard'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get current session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile info
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const fullName = profile?.full_name || 'Auric User'
  const userRole = profile?.role || 'Member'

  // Conditional Rendering: MEMBER Role
  if (userRole === 'Member') {
    // 1. Fetch active membership details
    const { data: memberProduct } = await supabase
      .from('member_products')
      .select('id, status, start_date, products(name, price, payment_model)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // 2. Fetch signed waivers count
    const { count: signedWaiversCount } = await supabase
      .from('waiver_agreements')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const activeMembership = memberProduct
      ? {
          id: memberProduct.id,
          name: (memberProduct.products as any)?.name || 'Membership Plan',
          price: (memberProduct.products as any)?.price || 0,
          payment_model: (memberProduct.products as any)?.payment_model || 'one_time',
          start_date: memberProduct.start_date,
          status: memberProduct.status,
        }
      : null

    return (
      <MemberDashboard
        fullName={fullName}
        email={user.email || ''}
        userId={user.id}
        activeMembership={activeMembership}
        signedWaiversCount={signedWaiversCount || 0}
      />
    )
  }

  // Conditional Rendering: ADMIN / MANAGER Role
  // Let's load platform metrics to show in the Admin welcome shell
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  const { count: totalForms } = await supabase
    .from('signup_forms')
    .select('*', { count: 'exact', head: true })

  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  return (
    <main className="flex-1 p-10 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="orb-glow top-[-100px] right-[-100px]" />
      <div className="orb-glow bottom-[-100px] left-[20%]" />

      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#835500]">
            Welcome back, {fullName}
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Studio administrative console is live.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-[#fdf2e4] p-1.5 pr-4 rounded-full border border-[#d7c3ae]/30">
            <div className="w-9 h-9 rounded-full bg-[#f5a623] flex items-center justify-center text-white font-bold text-sm shadow-sm select-none">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold leading-none text-[#201b13]">
                {fullName}
              </span>
              <span className="text-[10px] text-[#857462] mt-0.5 uppercase tracking-wider font-semibold">
                {userRole}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Banner */}
      <div className="bg-[#ffffff]/70 backdrop-blur-md p-8 rounded-2xl border border-[#d7c3ae]/30 shadow-sm mb-10">
        <h2 className="font-display text-xl font-bold text-[#201b13] mb-2">
          Auric SaaS Management Console
        </h2>
        <p className="text-sm text-[#524534] leading-relaxed mb-6">
          Use the dashboard menu to manage products, liability waivers, signup flows, and user roles. Your subdomains are configured to serve direct-checkout pages automatically.
        </p>

        <div className="flex flex-wrap gap-3">
          <span className="bg-[#f5a623]/10 text-[#835500] border border-[#f5a623]/20 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">shield_person</span>
            Role: {userRole} Authorized
          </span>
          <span className="bg-[#ff9c85]/10 text-[#ae3115] border border-[#ff9c85]/20 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">settings_input_component</span>
            Subdomain Routing Active
          </span>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-[#d7c3ae]/20 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-[#524534] font-bold uppercase tracking-wider">Total Users</p>
            <p className="font-display text-2xl font-extrabold text-[#201b13] mt-1">{totalUsers || 0}</p>
          </div>
          <div className="w-10 h-10 bg-[#fdf2e4] rounded-full flex items-center justify-center text-[#f5a623]">
            <span className="material-symbols-outlined">groups</span>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-[#d7c3ae]/20 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-[#524534] font-bold uppercase tracking-wider">Active Products</p>
            <p className="font-display text-2xl font-extrabold text-[#201b13] mt-1">{totalProducts || 0}</p>
          </div>
          <div className="w-10 h-10 bg-[#fdf2e4] rounded-full flex items-center justify-center text-[#f5a623]">
            <span className="material-symbols-outlined">shopping_bag</span>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-[#d7c3ae]/20 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-[#524534] font-bold uppercase tracking-wider">Onboarding Flows</p>
            <p className="font-display text-2xl font-extrabold text-[#201b13] mt-1">{totalForms || 0}</p>
          </div>
          <div className="w-10 h-10 bg-[#fdf2e4] rounded-full flex items-center justify-center text-[#f5a623]">
            <span className="material-symbols-outlined">feed</span>
          </div>
        </div>
      </div>

      {/* Settings Navigation Links */}
      <h3 className="font-display text-base font-bold text-[#201b13] mb-4">Quick Shortcuts</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/settings/users"
          className="bg-white hover:bg-[#fdf2e4]/30 p-5 rounded-2xl border border-[#d7c3ae]/20 shadow-xs flex items-center gap-4 transition-all"
        >
          <span className="material-symbols-outlined text-[#f5a623] text-2xl">manage_accounts</span>
          <div>
            <h4 className="font-bold text-sm text-[#201b13]">Staff & RBAC Settings</h4>
            <p className="text-[10px] text-[#524534] mt-0.5">Invite coaches, assign roles.</p>
          </div>
        </Link>

        <Link
          href="/dashboard/settings/products"
          className="bg-white hover:bg-[#fdf2e4]/30 p-5 rounded-2xl border border-[#d7c3ae]/20 shadow-xs flex items-center gap-4 transition-all"
        >
          <span className="material-symbols-outlined text-[#f5a623] text-2xl">add_card</span>
          <div>
            <h4 className="font-bold text-sm text-[#201b13]">Membership Catalog</h4>
            <p className="text-[10px] text-[#524534] mt-0.5">Create and price membership tiers.</p>
          </div>
        </Link>

        <Link
          href="/dashboard/settings/forms"
          className="bg-white hover:bg-[#fdf2e4]/30 p-5 rounded-2xl border border-[#d7c3ae]/20 shadow-xs flex items-center gap-4 transition-all"
        >
          <span className="material-symbols-outlined text-[#f5a623] text-2xl">qr_code</span>
          <div>
            <h4 className="font-bold text-sm text-[#201b13]">Signup Form Builder</h4>
            <p className="text-[10px] text-[#524534] mt-0.5">Setup onboarding pages and QR codes.</p>
          </div>
        </Link>
      </div>
    </main>
  )
}
