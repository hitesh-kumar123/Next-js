'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

// Helper to verify caller is a platform Super-Admin
async function verifySuperAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthenticated')

  const { data: profile } = await supabase
    .from('users')
    .select('is_superadmin')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.is_superadmin) {
    throw new Error('Unauthorized. Super-Admin privileges required.')
  }

  return user.id
}

// Toggle gym suspension status
export async function toggleGymSuspended(gymOwnerId: string, currentVal: boolean) {
  try {
    await verifySuperAdmin()
    const supabase = await createClient()

    const { error } = await supabase
      .from('users')
      .update({ is_suspended: !currentVal })
      .eq('id', gymOwnerId)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard/superadmin')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' }
  }
}

// Fetch all platform users
export async function getAllUsers() {
  try {
    await verifySuperAdmin()
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      
    if (error) throw error
    return { users: data || [] }
  } catch (err: any) {
    return { error: err.message || 'Failed to fetch platform users.' }
  }
}

import { createAdminClient } from '@/utils/supabase/admin'

// Impersonate / Log-in as user using magic link generation
export async function impersonateUser(userEmail: string) {
  try {
    await verifySuperAdmin()
    const adminSupabase = createAdminClient()
    
    const { data, error } = await adminSupabase.auth.admin.generateLink({
      type: 'magiclink',
      email: userEmail.trim().toLowerCase(),
    })

    if (error) throw error
    
    return { success: true, link: data.properties?.action_link || '' }
  } catch (err: any) {
    return { error: err.message || 'Failed to generate impersonation link.' }
  }
}
