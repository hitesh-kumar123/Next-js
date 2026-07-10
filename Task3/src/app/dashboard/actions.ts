'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

// Update member profile settings
export async function updateProfile(data: {
  fullName: string
  phone: string
  address: string
}) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthenticated.' }
    }

    const { error } = await supabase
      .from('users')
      .update({
        full_name: data.fullName,
        phone: data.phone,
        address: data.address,
      })
      .eq('id', user.id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/settings')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' }
  }
}

// Cancel user's membership product
export async function cancelMembership(memberProductId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthenticated.' }
    }

    // Verify membership belongs to this user
    const { data: membership, error: fetchErr } = await supabase
      .from('member_products')
      .select('id, auth_net_subscription_id')
      .eq('id', memberProductId)
      .eq('user_id', user.id)
      .single()

    if (fetchErr || !membership) {
      return { error: 'Membership subscription not found.' }
    }

    // Update status in public.member_products to 'cancelled'
    const { error: updateErr } = await supabase
      .from('member_products')
      .update({ status: 'cancelled' })
      .eq('id', memberProductId)

    if (updateErr) {
      return { error: updateErr.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/billing')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' }
  }
}

// Update payment method (mocks Authorize.net card profile updates)
export async function updatePaymentMethod(cardDetails: {
  cardNumber: string
  expirationDate: string
  cardCode: string
}) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthenticated.' }
    }

    // Validation
    const cardNo = cardDetails.cardNumber.replace(/\s/g, '')
    if (cardNo.length < 13) {
      return { error: 'Invalid credit card number.' }
    }

    // Mock update success (in production, we'd update Authorize.net customer payment profile)
    revalidatePath('/dashboard/billing')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' }
  }
}
