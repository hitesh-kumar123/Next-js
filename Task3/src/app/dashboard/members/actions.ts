'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

// Helper to verify if user is Admin or Manager
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

  return { userId: user.id, role: profile.role }
}

export async function bulkDeleteMembers(userIds: string[]) {
  try {
    const staff = await verifyStaff()
    if (staff.role !== 'Admin') {
      return { error: 'Only Admins are allowed to delete users.' }
    }

    const adminSupabase = createAdminClient()

    // Delete users in batch
    for (const uid of userIds) {
      const { error } = await adminSupabase.auth.admin.deleteUser(uid)
      if (error) {
        console.error(`Failed to delete user ${uid}:`, error)
      }
    }

    revalidatePath('/dashboard/members')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' }
  }
}

export async function importMembersCSV(csvData: string) {
  try {
    await verifyStaff()
    const adminSupabase = createAdminClient()
    const supabase = await createClient()

    const lines = csvData.split('\n')
    let importCount = 0
    let skipCount = 0
    const errors: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Skip header row if it contains keywords
      if (i === 0 && (line.toLowerCase().includes('email') || line.toLowerCase().includes('name'))) {
        continue
      }

      // Simple CSV parse (split by comma, ignoring nested commas inside quotes simply)
      // Columns: full_name, email, phone, address, authorize_net_customer_id
      const cols = line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''))

      if (cols.length < 2) {
        errors.push(`Row ${i + 1}: Insufficient columns. Needs at least Name and Email.`)
        continue
      }

      const fullName = cols[0]
      const email = cols[1]
      const phone = cols[2] || ''
      const address = cols[3] || ''
      const authNetCustomerId = cols[4] || ''

      if (!email.includes('@')) {
        errors.push(`Row ${i + 1}: Invalid email address: "${email}"`)
        continue
      }

      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single()

      if (existingUser) {
        skipCount++
        continue
      }

      // Create user in Auth
      const tempPassword = 'TempPassword' + Math.floor(1000 + Math.random() * 9000) + '!'
      const { data: newUser, error: createErr } = await adminSupabase.auth.admin.createUser({
        email: email.toLowerCase(),
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
        },
      })

      if (createErr || !newUser?.user) {
        errors.push(`Row ${i + 1}: Failed to create auth profile: ${createErr?.message}`)
        continue
      }

      const newUserId = newUser.user.id

      // Update user details (trigger created the profile, we append role, phone, address, customer ID)
      const { error: updateErr } = await adminSupabase
        .from('users')
        .update({
          role: 'Member',
          phone,
          address,
          authorize_net_customer_id: authNetCustomerId || null,
        })
        .eq('id', newUserId)

      if (updateErr) {
        errors.push(`Row ${i + 1}: Failed to save profile details: ${updateErr.message}`)
      } else {
        importCount++
      }
    }

    revalidatePath('/dashboard/members')
    return { success: true, importCount, skipCount, errors }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' }
  }
}

export async function updateMemberProfile(
  userId: string,
  data: {
    fullName: string
    phone: string
    address: string
    authorizeNetCustomerId: string
  }
) {
  try {
    await verifyStaff()
    const supabase = await createClient()

    const { error } = await supabase
      .from('users')
      .update({
        full_name: data.fullName,
        phone: data.phone,
        address: data.address,
        authorize_net_customer_id: data.authorizeNetCustomerId || null,
      })
      .eq('id', userId)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard/members')
    revalidatePath(`/dashboard/members/${userId}`)
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' }
  }
}

export async function assignProductToMember(userId: string, productId: string) {
  try {
    await verifyStaff()
    const supabase = await createClient()

    // Query product to verify
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (!product) {
      return { error: 'Product not found.' }
    }

    // Insert purchase
    const { error } = await supabase.from('member_products').insert({
      user_id: userId,
      product_id: productId,
      status: 'active',
      start_date: new Date().toISOString(),
    })

    if (error) {
      return { error: error.message }
    }

    revalidatePath(`/dashboard/members/${userId}`)
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' }
  }
}

export async function refundMemberProduct(memberProductId: string, userId: string) {
  try {
    const staff = await verifyStaff()
    if (staff.role !== 'Admin') {
      return { error: 'Only Admins can perform product refunds.' }
    }

    const supabase = await createClient()

    // Update status to 'refunded'
    const { error } = await supabase
      .from('member_products')
      .update({ status: 'refunded' })
      .eq('id', memberProductId)

    if (error) {
      return { error: error.message }
    }

    revalidatePath(`/dashboard/members/${userId}`)
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' }
  }
}

export async function cancelMemberProduct(memberProductId: string, userId: string) {
  try {
    await verifyStaff()
    const supabase = await createClient()

    // Update status to 'cancelled'
    const { error } = await supabase
      .from('member_products')
      .update({ status: 'cancelled' })
      .eq('id', memberProductId)

    if (error) {
      return { error: error.message }
    }

    revalidatePath(`/dashboard/members/${userId}`)
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' }
  }
}
