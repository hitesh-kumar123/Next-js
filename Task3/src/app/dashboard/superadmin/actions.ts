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
