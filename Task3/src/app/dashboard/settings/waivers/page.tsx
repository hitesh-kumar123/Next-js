import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import WaiversClient from './WaiversClient'

export const dynamic = 'force-dynamic'

export default async function SettingsWaiversPage() {
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

  // Only Admin and Manager are allowed to view this page
  if (userRole !== 'Admin' && userRole !== 'Manager') {
    redirect('/dashboard')
  }

  // Fetch active waivers
  const { data: waiversData } = await supabase
    .from('waivers')
    .select('*')
    .order('created_at', { ascending: false })

  const waivers = waiversData || []

  return (
    <main className="flex-1 p-10 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="orb-glow top-[-100px] right-[-100px]" />
      <div className="orb-glow bottom-[-100px] left-[20%]" />

      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold text-[#835500]">
          Waiver Management
        </h1>
        <p className="text-[#524534] text-sm mt-1">
          {userRole === 'Admin'
            ? 'Write and compile legal waivers that members must sign during checkout.'
            : 'Review currently configured legal waivers.'}
        </p>
      </header>

      <WaiversClient initialWaivers={waivers} isAdmin={userRole === 'Admin'} />
    </main>
  )
}
