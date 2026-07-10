import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Sidebar from './Sidebar'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Get active session user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the public.users record
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const fullName = profile?.full_name || 'Auric Member'
  const userEmail = user.email || ''
  const userRole = profile?.role || 'Member'
  const isSuperAdmin = profile?.is_superadmin || false

  return (
    <div className="min-h-screen bg-[#fff8f2] text-[#201b13] flex">
      {/* Sidebar Navigation */}
      <Sidebar
        userEmail={userEmail}
        fullName={fullName}
        userRole={userRole}
        isSuperAdmin={isSuperAdmin}
      />

      {/* Main Content Area */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}

