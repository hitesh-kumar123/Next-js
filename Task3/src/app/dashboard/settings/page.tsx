import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import SettingsClient from './SettingsClient'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()

  // Get session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch current user's profile info
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  return (
    <main className="flex-1 p-10 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="orb-glow top-[-100px] right-[-100px]" />
      <div className="orb-glow bottom-[-100px] left-[20%]" />

      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold text-[#835500]">
          Account Settings
        </h1>
        <p className="text-[#524534] text-sm mt-1">
          View and update your personal contact details, residential address, and profile credentials.
        </p>
      </header>

      <SettingsClient
        fullName={profile.full_name || ''}
        phone={profile.phone || ''}
        address={profile.address || ''}
        userEmail={user.email || ''}
        userRole={profile.role}
      />
    </main>
  )
}
