import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import MemberDetailClient from './MemberDetailClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function MemberDetailPage({ params }: PageProps) {
  const resolvedParams = await params
  const { id } = resolvedParams

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

  const userRole = profile?.role

  // Only Admin and Manager are allowed to view member details
  if (userRole !== 'Admin' && userRole !== 'Manager') {
    redirect('/dashboard')
  }

  // Fetch the member details
  const { data: memberProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .eq('role', 'Member')
    .single()

  if (!memberProfile) {
    return notFound()
  }

  // Fetch member's assigned products
  const { data: memberProductsData } = await supabase
    .from('member_products')
    .select('id, status, start_date, auth_net_subscription_id, auth_net_profile_id, products(id, name, price)')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  const memberProducts = (memberProductsData || []).map((mp) => ({
    id: mp.id,
    status: mp.status,
    start_date: mp.start_date,
    auth_net_subscription_id: mp.auth_net_subscription_id,
    auth_net_profile_id: mp.auth_net_profile_id,
    products: {
      id: (mp.products as any)?.id || '',
      name: (mp.products as any)?.name || 'Membership Plan',
      price: (mp.products as any)?.price || 0,
    },
  }))

  // Fetch signed waivers
  const { data: waiversData } = await supabase
    .from('waiver_agreements')
    .select('id, signed_content, signed_at, waivers(title)')
    .eq('user_id', id)
    .order('signed_at', { ascending: false })

  const waivers = (waiversData || []) as any[]

  // Fetch catalog products
  const { data: catalogProducts } = await supabase
    .from('products')
    .select('id, name, price')
    .order('name', { ascending: true })

  return (
    <main className="flex-1 p-10 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="orb-glow top-[-100px] right-[-100px]" />
      <div className="orb-glow bottom-[-100px] left-[20%]" />

      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold text-[#835500]">
          Member Details: {memberProfile.full_name || 'No Name'}
        </h1>
        <p className="text-[#524534] text-sm mt-1">
          Configure profile details, manage purchased memberships, issue cancellations/refunds, and audit legal agreement signatures.
        </p>
      </header>

      <MemberDetailClient
        member={{
          id: memberProfile.id,
          email: memberProfile.email,
          full_name: memberProfile.full_name,
          phone: memberProfile.phone,
          address: memberProfile.address,
          role: memberProfile.role,
          authorize_net_customer_id: memberProfile.authorize_net_customer_id || null,
        }}
        memberProducts={memberProducts}
        waivers={waivers}
        catalogProducts={catalogProducts || []}
        currentUserRole={userRole}
      />
    </main>
  )
}
