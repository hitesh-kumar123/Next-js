'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

// Helper to verify if the current user is an Admin
async function verifyAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthenticated')
  }

  const { data: profile, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !profile || profile.role !== 'Admin') {
    throw new Error('Unauthorized. Only Admins can perform this action.')
  }

  return user.id
}

export async function inviteUser(email: string, role: 'Admin' | 'Manager' | 'Trainer') {
  try {
    const adminUserId = await verifyAdmin()
    const supabase = await createClient()

    // 1. Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .single()

    if (existingUser) {
      return { error: 'A user with this email already exists in the system.' }
    }

    // 2. Generate a secure random token
    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // expires in 7 days

    // 3. Insert or update the invite row
    // If there is an existing pending invite, we overwrite it.
    const { error: inviteError } = await supabase.from('invites').upsert(
      {
        email: email.trim().toLowerCase(),
        role,
        invited_by: adminUserId,
        token,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
      },
      { onConflict: 'email' }
    )

    if (inviteError) {
      return { error: inviteError.message }
    }

    revalidatePath('/dashboard/settings/users')
    return { success: true, token }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' }
  }
}

export async function revokeInvite(inviteId: string) {
  try {
    await verifyAdmin()
    const supabase = await createClient()

    const { error } = await supabase
      .from('invites')
      .update({ status: 'revoked' })
      .eq('id', inviteId)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard/settings/users')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' }
  }
}

export async function removeUser(userId: string) {
  try {
    await verifyAdmin()
    
    // We must delete the user from auth.users (which cascades to public.users via our foreign key on delete cascade)
    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase.auth.admin.deleteUser(userId)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard/settings/users')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' }
  }
}
