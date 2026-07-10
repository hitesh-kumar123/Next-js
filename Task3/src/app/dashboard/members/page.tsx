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

  const userRole = profile?.role

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
