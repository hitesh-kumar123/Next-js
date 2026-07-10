import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import UsersClient from './UsersClient'

export const dynamic = 'force-dynamic'

export default async function SettingsUsersPage() {
  const supabase = await createClient()

  // Get active session
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

  // Fetch active users (Admin, Manager, Trainer, Member)
  const { data: usersData } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch pending invites
  const { data: invitesData } = await supabase
    .from('invites')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  const users = usersData || []
  const invites = invitesData || []

  return (
    <main className="flex-1 p-10 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="orb-glow top-[-100px] right-[-100px]" />
      <div className="orb-glow bottom-[-100px] left-[20%]" />

      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold text-[#835500]">
          Staff & User Management
        </h1>
        <p className="text-[#524534] text-sm mt-1">
          {userRole === 'Admin'
            ? 'Invite staff, manage roles, and review pending invites.'
            : 'View active staff, members, and pending invitations.'}
        </p>
      </header>

      <UsersClient
        currentUserId={user.id}
        currentUserRole={userRole}
        initialUsers={users}
        initialInvites={invites}
      />
    </main>
  )
}
