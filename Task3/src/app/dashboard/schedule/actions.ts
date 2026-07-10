'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

// Verify staff access
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

export async function createClass(data: {
  name: string
  description: string
  instructor: string
  location: string
  category: string
  startTime: string
  durationMinutes: number
  capacity: number
}) {
  try {
    await verifyStaff()
    const supabase = await createClient()

    const { error } = await supabase.from('classes').insert({
      name: data.name,
      description: data.description,
      instructor: data.instructor,
      location: data.location,
      category: data.category,
      start_time: data.startTime,
      duration_minutes: data.durationMinutes,
      capacity: data.capacity,
    })

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard/schedule')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' }
  }
}

export async function deleteClass(classId: string) {
  try {
    await verifyStaff()
    const supabase = await createClient()

    const { error } = await supabase.from('classes').delete().eq('id', classId)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard/schedule')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' }
  }
}

export async function bookClass(classId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthenticated.' }
    }

    // 1. Verify waiver signature
    const { data: waiverSign } = await supabase
      .from('waiver_agreements')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()

    if (!waiverSign) {
      return { error: 'You must review and sign the legal waiver before booking classes.' }
    }

    // 2. Verify active membership eligibility
    const { data: activeMembership } = await supabase
      .from('member_products')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()

    if (!activeMembership) {
      return { error: 'Requires an active membership plan to book class spots.' }
    }

    // 3. Verify class capacity
    const { data: classObj, error: classErr } = await supabase
      .from('classes')
      .select('capacity')
      .eq('id', classId)
      .single()

    if (classErr || !classObj) {
      return { error: 'Class not found.' }
    }

    const { count, error: countErr } = await supabase
      .from('class_bookings')
      .select('*', { count: 'exact', head: true })
      .eq('class_id', classId)

    if (countErr) {
      return { error: 'Failed to check class occupancy.' }
    }

    if (count !== null && count >= classObj.capacity) {
      return { error: 'This class has reached its maximum participant capacity.' }
    }

    // 4. Insert booking
    const { error: insertErr } = await supabase.from('class_bookings').insert({
      class_id: classId,
      user_id: user.id,
    })

    if (insertErr) {
      return { error: insertErr.message || 'Failed to book class spot.' }
    }

    revalidatePath('/dashboard/schedule')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' }
  }
}

export async function cancelBooking(classId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthenticated.' }
    }

    const { error } = await supabase
      .from('class_bookings')
      .delete()
      .eq('class_id', classId)
      .eq('user_id', user.id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard/schedule')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' }
  }
}
