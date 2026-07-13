'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

// Verify caller is Admin or Manager
async function verifyStaff() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthenticated')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'Admin' && profile.role !== 'Manager')) {
    throw new Error('Unauthorized. Staff privileges required.')
  }

  return user.id
}

// Find member by flexible identifier
async function findMember(supabase: any, identifier: string) {
  const cleanId = identifier.trim().toLowerCase()
  if (!cleanId) return null

  // 1. If UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (uuidRegex.test(cleanId)) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', cleanId)
      .eq('role', 'Member')
      .maybeSingle()
    if (data) return data
  }

  // 2. If Member ID AUR-XXXX-XXXX
  if (cleanId.startsWith('aur-')) {
    const parts = cleanId.replace('aur-', '').split('-')
    if (parts.length === 2) {
      const firstPart = parts[0]
      const lastPart = parts[1]
      
      // Query users checking if ID starts with firstPart and ends with lastPart
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'Member')
        .filter('id', 'like', `${firstPart}%`)
        .filter('id', 'like', `%${lastPart}`)
        .limit(1)
        .maybeSingle()

      if (data) return data
    }
  }

  // 3. Search by Email
  const { data: emailUser } = await supabase
    .from('users')
    .select('*')
    .eq('email', cleanId)
    .eq('role', 'Member')
    .maybeSingle()

  if (emailUser) return emailUser

  // 4. Search by Authorize.net Customer Profile ID
  const { data: authNetUser } = await supabase
    .from('users')
    .select('*')
    .eq('authorize_net_customer_id', identifier.trim())
    .eq('role', 'Member')
    .maybeSingle()

  if (authNetUser) return authNetUser

  // 5. Search by Full Name (case insensitive)
  const { data: nameUser } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'Member')
    .ilike('full_name', cleanId)
    .limit(1)
    .maybeSingle()

  if (nameUser) return nameUser

  return null
}

export async function verifyAndCheckIn(memberIdentifier: string) {
  try {
    const staffId = await verifyStaff()
    const supabase = await createClient()

    // 1. Locate Member
    const member = await findMember(supabase, memberIdentifier)
    if (!member) {
      return { success: false, reason: 'Member profile could not be found.' }
    }

    const memberName = member.full_name || 'Member'

    // 2. Waiver Verification
    const { data: waiverSign } = await supabase
      .from('waiver_agreements')
      .select('id')
      .eq('user_id', member.id)
      .limit(1)
      .maybeSingle()

    if (!waiverSign) {
      return {
        success: false,
        reason: 'Blocked: Waiver Not Signed.',
        memberName,
      }
    }

    // 3. Membership Status Verification
    const { data: membership } = await supabase
      .from('member_products')
      .select('id, products(name)')
      .eq('user_id', member.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!membership) {
      return {
        success: false,
        reason: 'Blocked: Membership Inactive.',
        memberName,
      }
    }

    const activePlan = (membership.products as any)?.name || 'Active Membership'

    // 4. Log the Check-in Event
    const { error: logErr } = await supabase.from('checkins').insert({
      user_id: member.id,
      checked_in_by: staffId,
    })

    if (logErr) {
      return { success: false, reason: 'Failed to record check-in log: ' + logErr.message, memberName }
    }

    revalidatePath('/dashboard/checkin')
    return {
      success: true,
      memberName,
      activePlan,
    }
  } catch (err: any) {
    return { success: false, reason: err.message || 'An unexpected check-in error occurred.' }
  }
}

export async function getTodayCheckins() {
  try {
    await verifyStaff()
    const supabase = await createClient()

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('checkins')
      .select('id, checked_in_at, users!user_id(full_name, email)')
      .gte('checked_in_at', todayStart.toISOString())
      .order('checked_in_at', { ascending: false })

    if (error) throw error

    return (data || []).map((ci) => ({
      id: ci.id,
      checkedInAt: ci.checked_in_at,
      fullName: (ci.users as any)?.full_name || 'Member',
      email: (ci.users as any)?.email || '',
    }))
  } catch (err: any) {
    console.error('Failed to pull checkins:', err?.message || err)
    return []
  }
}
