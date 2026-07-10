import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import BillingClient from './BillingClient'

export const dynamic = 'force-dynamic'

export default async function MemberBillingPage() {
  const supabase = await createClient()

  // Get session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch current user's profile to check role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return (
      <main className="flex-1 p-6 md:p-10 flex justify-center items-center relative overflow-hidden bg-[#FBF7F0] min-h-screen">
        <div className="orb-glow top-[-100px] right-[-100px]" aria-hidden="true" />
        <div className="orb-glow bottom-[-100px] left-[20%]" aria-hidden="true" />

        <div className="bg-white border border-[#1B2432]/8 p-8 rounded-2xl shadow-xl max-w-md w-full text-center relative z-10">
          <span
            className="material-symbols-outlined text-[#E24B4A] text-5xl mb-4 inline-block"
            aria-hidden="true"
          >
            database_alert
          </span>
          <h2 className="text-xl font-black text-[#1B2432] mb-2">
            We couldn&apos;t load your profile
          </h2>
          <p className="text-sm text-[#6B6459] mb-6 leading-relaxed">
            Something went wrong fetching your account details. This is usually a temporary sync
            issue — try refreshing, and reach out to support if it keeps happening.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <div className="bg-[#FBF7F0] p-3.5 rounded-xl border border-[#1B2432]/8 text-[11px] text-[#6B6459] text-left font-mono">
              <span className="block font-bold text-[#E24B4A] mb-1">Dev diagnosis:</span>
              Supabase profile query returned null for this user.
              <br />
              User ID: {user.id.slice(0, 8)}&hellip;
              <br />
              Check that a matching row exists in the <code>users</code> table with this ID.
            </div>
          )}

          <a
            href="/billing"
            className="inline-flex items-center gap-2 mt-6 bg-gradient-to-r from-[#F5A623] to-[#FF8C5A] text-[#1B2432] font-bold text-xs px-5 py-2.5 rounded-full transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">refresh</span>
            Try again
          </a>
        </div>
      </main>
    )
  }

  // Only Members can access this billing portal (admins have administrative financials)
  if (profile.role !== 'Member') {
    redirect('/dashboard')
  }

  // Fetch active/cancelled memberships for this user
  const { data: membershipData } = await supabase
    .from('member_products')
    .select('id, status, start_date, auth_net_subscription_id, auth_net_profile_id, products(name, price, payment_model)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const membership = membershipData
    ? {
        id: membershipData.id,
        status: membershipData.status,
        start_date: membershipData.start_date,
        auth_net_subscription_id: membershipData.auth_net_subscription_id,
        auth_net_profile_id: membershipData.auth_net_profile_id,
        product: {
          name: (membershipData.products as any)?.name || 'Membership Plan',
          price: (membershipData.products as any)?.price || 0,
          payment_model: (membershipData.products as any)?.payment_model || 'one_time',
        },
      }
    : null

  return (
    <main className="flex-1 p-6 md:p-10 relative overflow-hidden bg-[#FBF7F0] min-h-screen">
      {/* Background Orbs */}
      <div className="orb-glow top-[-100px] right-[-100px]" aria-hidden="true" />
      <div className="orb-glow bottom-[-100px] left-[20%]" aria-hidden="true" />

      <header className="mb-10 relative z-10">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#B5791A]">
          Account
        </span>
        <h1 className="text-3xl font-black tracking-tight text-[#1B2432] mt-1">
          Billing & membership
        </h1>
        <p className="text-[#6B6459] text-sm mt-2 max-w-xl leading-relaxed">
          Review your subscription, cancel your membership, and update your default card on file.
        </p>
      </header>

      <div className="relative z-10">
        <BillingClient membership={membership as any} />
      </div>
    </main>
  )
}