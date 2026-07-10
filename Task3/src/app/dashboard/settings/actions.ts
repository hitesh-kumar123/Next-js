'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

// Helper to verify if current user is Admin
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
    throw new Error('Unauthorized. Only Admins can modify settings.')
  }

  return user.id
}

export async function createProduct(formData: {
  name: string
  price: number
  type: 'full_access' | 'visit_count' | 'time_based' | 'class_count_periodic'
  visitsLimit?: number
  durationType: 'ongoing' | 'limited_time' | 'periodic'
  durationMonths?: number
  startDate?: string
  endDate?: string
  paymentModel: 'one_time' | 'recurring'
}) {
  try {
    await verifyAdmin()
    const supabase = await createClient()

    const { error } = await supabase.from('products').insert({
      name: formData.name,
      price: formData.price,
      type: formData.type,
      visits_limit: formData.visitsLimit || null,
      duration_type: formData.durationType,
      duration_months: formData.durationMonths || null,
      start_date: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      end_date: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      payment_model: formData.paymentModel,
    })

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard/settings/products')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' }
  }
}

export async function createWaiver(title: string, content: string) {
  try {
    await verifyAdmin()
    const supabase = await createClient()

    const { error } = await supabase.from('waivers').insert({
      title,
      content,
    })

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard/settings/waivers')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' }
  }
}

export async function createSignupForm(
  title: string,
  slug: string,
  waiverId: string | null,
  productIds: string[]
) {
  try {
    await verifyAdmin()
    const supabase = await createClient()

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '')

    // 1. Create the signup form
    const { data: newForm, error: formError } = await supabase
      .from('signup_forms')
      .insert({
        title,
        slug: cleanSlug,
        waiver_id: waiverId || null,
        is_active: true,
      })
      .select('id')
      .single()

    if (formError) {
      return { error: formError.message }
    }

    // 2. Link products to the signup form
    if (productIds.length > 0) {
      const junctionRows = productIds.map((pid) => ({
        signup_form_id: newForm.id,
        product_id: pid,
      }))

      const { error: junctionError } = await supabase
        .from('signup_form_products')
        .insert(junctionRows)

      if (junctionError) {
        return { error: junctionError.message }
      }
    }

    revalidatePath('/dashboard/settings/forms')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' }
  }
}

export async function toggleSignupFormActive(formId: string, isActive: boolean) {
  try {
    await verifyAdmin()
    const supabase = await createClient()

    const { error } = await supabase
      .from('signup_forms')
      .update({ is_active: isActive })
      .eq('id', formId)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard/settings/forms')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' }
  }
}

export async function updateGymSettings(data: {
  subdomain: string
  gymName: string
  phone: string
  address: string
}) {
  try {
    const userId = await verifyAdmin()
    const supabase = await createClient()

    const cleanSubdomain = data.subdomain.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')

    const { error } = await supabase
      .from('users')
      .update({
        subdomain: cleanSubdomain || null,
        gym_name: data.gymName,
        phone: data.phone,
        address: data.address,
      })
      .eq('id', userId)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/settings/forms')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' }
  }
}
