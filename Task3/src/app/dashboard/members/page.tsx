import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import MembersClient from './MembersClient'

export const dynamic = 'force-dynamic'

export default async function MembersListPage() {
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
      <main className="flex-1 p-10 flex justify-center items-center relative overflow-hidden bg-background">
        <div className="orb-glow top-[-100px] right-[-100px]" />
        <div className="orb-glow bottom-[-100px] left-[20%]" />
        <div className="bg-[#121824] border border-[#f5a623]/25 p-8 rounded-2xl shadow-xl max-w-md w-full text-center relative z-10">
          <span className="material-symbols-outlined text-red-500 text-5xl mb-4">database_alert</span>
          <h2 className="font-display text-xl font-bold text-white mb-2">
            Profile Sync Issue
          </h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Could not fetch user profile. This is likely caused by incorrect or invalid Supabase API keys in your <code>.env</code> file.
          </p>
          <div className="bg-[#090d16] p-3.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 text-left font-mono">
            <span className="block font-bold text-red-400 mb-1">Diagnosis:</span>
            - Supabase query returned null/error<br/>
            - Token starts with: {process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 8) || 'None'}<br/>
            - User ID: {user.id.slice(0, 8)}...
          </div>
        </div>
      </main>
    )
  }

  const userRole = profile.role

  // Only Admin and Manager are allowed to view this page
  if (userRole !== 'Admin' && userRole !== 'Manager') {
    redirect('/dashboard')
  }

  // Fetch all users of type Member, along with their active memberships
  const { data: usersData } = await supabase
    .from('users')
    .select('*, member_products(*, products(name))')
    .eq('role', 'Member')
    .order('created_at', { ascending: false })

  const users = (usersData || []) as any[]

  return (
    <main className="flex-1 p-10 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="orb-glow top-[-100px] right-[-100px]" />
      <div className="orb-glow bottom-[-100px] left-[20%]" />

      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold text-[#835500]">
          Members Directory
        </h1>
        <p className="text-[#524534] text-sm mt-1">
          Review, manage, search, and import customer accounts. Click a row to configure custom memberships.
        </p>
      </header>

      <MembersClient initialUsers={users} currentUserRole={userRole} />
    </main>
  )
}
