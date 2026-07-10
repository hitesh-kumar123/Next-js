import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import WaiversClient from './WaiversClient'

export const dynamic = 'force-dynamic'

export default async function MemberWaiversPage() {
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

  // Only Members can access this signed waivers portal
  if (profile?.role !== 'Member') {
    redirect('/dashboard')
  }

  // Fetch signed waivers
  const { data: agreementsData } = await supabase
    .from('waiver_agreements')
    .select('*, waivers(title)')
    .eq('user_id', user.id)
    .order('signed_at', { ascending: false })

  const agreements = (agreementsData || []) as any[]

  return (
    <main className="flex-1 p-10 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="orb-glow top-[-100px] right-[-100px]" />
      <div className="orb-glow bottom-[-100px] left-[20%]" />

      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold text-[#835500]">
          Signed Legal Waivers
        </h1>
        <p className="text-[#524534] text-sm mt-1">
          Review legal release documents, liability releases, and digital signatures archived on your account.
        </p>
      </header>

      <WaiversClient agreements={agreements} />
    </main>
  )
}
