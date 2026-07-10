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

  // Only Members can access this billing portal (admins have administrative financials)
  if (profile?.role !== 'Member') {
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
    <main className="flex-1 p-10 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="orb-glow top-[-100px] right-[-100px]" />
      <div className="orb-glow bottom-[-100px] left-[20%]" />

      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold text-[#835500]">
          Billing & Membership Portal
        </h1>
        <p className="text-[#524534] text-sm mt-1">
          Review your subscriptions, cancel memberships, and update your default credit card details.
        </p>
      </header>

      <BillingClient membership={membership as any} />
    </main>
  )
}
