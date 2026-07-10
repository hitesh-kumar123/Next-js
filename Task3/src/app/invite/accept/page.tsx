import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AcceptInviteClient from './AcceptInviteClient'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

interface InviteRPCResult {
  id: string
  email: string
  role: 'Admin' | 'Manager' | 'Trainer' | 'Member'
  status: string
  expires_at: string
}

export const dynamic = 'force-dynamic'

export default async function AcceptInvitePage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  const token = typeof resolvedSearchParams.token === 'string' ? resolvedSearchParams.token : ''

  if (!token) {
    return (
      <main className="min-h-screen w-full bg-background flex flex-col justify-center items-center p-4">
        <div className="glass-card p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <span className="material-symbols-outlined text-error text-5xl mb-4">error</span>
          <h2 className="font-display text-xl font-bold text-[#201b13] mb-2">
            Missing Invitation Token
          </h2>
          <p className="text-sm text-[#524534]">
            This link appears to be invalid or incomplete. Please check your invitation URL.
          </p>
        </div>
      </main>
    )
  }

  const supabase = await createClient()

  // Query database for the invite using token lookup
  // We call our public RPC function since the table invites itself is restricted to Admins/Managers
  const { data, error } = await supabase
    .rpc('get_invite_by_token', { token_text: token })
    .maybeSingle()

  const invite = data as InviteRPCResult | null

  if (error || !invite) {

    return (
      <main className="min-h-screen w-full bg-background flex flex-col justify-center items-center p-4">
        <div className="glass-card p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <span className="material-symbols-outlined text-error text-5xl mb-4">error</span>
          <h2 className="font-display text-xl font-bold text-[#201b13] mb-2">
            Invitation Not Found
          </h2>
          <p className="text-sm text-[#524534]">
            This invitation could not be found or has been removed by the administrator.
          </p>
        </div>
      </main>
    )
  }

  // Check status and expiration
  const isExpired = new Date(invite.expires_at) < new Date()
  if (invite.status !== 'pending' || isExpired) {
    return (
      <main className="min-h-screen w-full bg-background flex flex-col justify-center items-center p-4">
        <div className="glass-card p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <span className="material-symbols-outlined text-error text-5xl mb-4">
            hourglass_disabled
          </span>
          <h2 className="font-display text-xl font-bold text-[#201b13] mb-2">
            Invitation Expired or Used
          </h2>
          <p className="text-sm text-[#524534]">
            {invite.status === 'accepted'
              ? 'This invitation has already been accepted. Please log in with your email.'
              : 'This invitation has expired or been revoked. Please request a new invite.'}
          </p>
        </div>
      </main>
    )
  }

  return (
    <AcceptInviteClient
      email={invite.email}
      role={invite.role}
      token={token}
    />
  )
}
