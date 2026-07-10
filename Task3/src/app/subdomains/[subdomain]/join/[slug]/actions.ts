'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { chargeCard, createARBSubscription } from '@/utils/payments/authorizeNet'

interface CheckoutPayload {
  email: string
  fullName: string
  passwordStr: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  productId: string
  waiverId: string | null
  signedWaiverContent: string | null
  card: {
    cardNumber: string
    expirationDate: string
    cardCode: string
  }
}

export async function processPublicCheckout(payload: CheckoutPayload) {
  try {
    const supabase = await createClient()

    // 1. Fetch product details
    const { data: product, error: productErr } = await supabase
      .from('products')
      .select('*')
      .eq('id', payload.productId)
      .single()

    if (productErr || !product) {
      return { error: 'Selected product could not be found.' }
    }

    // 2. Split first and last name
    const nameParts = payload.fullName.trim().split(/\s+/)
    const firstName = nameParts[0] || 'Member'
    const lastName = nameParts.slice(1).join(' ') || 'User'

    // 3. Execute payment via Authorize.net
    let paymentResult
    if (product.payment_model === 'recurring') {
      paymentResult = await createARBSubscription(
        payload.card,
        product.price,
        product.name,
        {
          email: payload.email,
          firstName,
          lastName,
          address: payload.address,
          city: payload.city,
          state: payload.state,
          zip: payload.zip,
          phone: payload.phone,
        },
        product.duration_months || undefined
      )
    } else {
      paymentResult = await chargeCard(
        payload.card,
        product.price,
        product.name,
        {
          email: payload.email,
          firstName,
          lastName,
          address: payload.address,
          city: payload.city,
          state: payload.state,
          zip: payload.zip,
          phone: payload.phone,
        }
      )
    }

    if (!paymentResult.success) {
      return { error: paymentResult.error || 'Payment transaction failed.' }
    }

    // 4. Create user in Supabase Auth via Admin Client to bypass email confirmations and confirm immediately
    const adminSupabase = createAdminClient()
    const { data: newUser, error: signUpErr } = await adminSupabase.auth.admin.createUser({
      email: payload.email.trim().toLowerCase(),
      password: payload.passwordStr,
      email_confirm: true,
      user_metadata: {
        full_name: payload.fullName,
      },
    })

    if (signUpErr || !newUser?.user) {
      return { error: signUpErr?.message || 'Failed to create user account.' }
    }

    const userId = newUser.user.id

    // 5. Update user profile details (triggers already created user profile, we update address/phone)
    const { error: profileUpdateErr } = await adminSupabase
      .from('users')
      .update({
        phone: payload.phone,
        address: `${payload.address}, ${payload.city}, ${payload.state} ${payload.zip}`,
        role: 'Member', // Always defaults to Member
      })
      .eq('id', userId)

    if (profileUpdateErr) {
      // Log error but don't fail checkout since auth and payment succeeded
      console.error('Failed to update profile info:', profileUpdateErr)
    }

    // 6. Record purchase in public.member_products
    const { error: purchaseErr } = await adminSupabase.from('member_products').insert({
      user_id: userId,
      product_id: product.id,
      status: 'active',
      start_date: new Date().toISOString(),
      auth_net_subscription_id: 'subscriptionId' in paymentResult ? paymentResult.subscriptionId : null,
      auth_net_profile_id: 'transactionId' in paymentResult ? paymentResult.transactionId : null,
    })

    if (purchaseErr) {
      console.error('Failed to record purchase:', purchaseErr)
    }

    // 7. Record waiver signature if waiver was linked and signed
    if (payload.waiverId && payload.signedWaiverContent) {
      const { error: waiverErr } = await adminSupabase.from('waiver_agreements').insert({
        user_id: userId,
        waiver_id: payload.waiverId,
        signed_content: payload.signedWaiverContent,
        signed_at: new Date().toISOString(),
      })

      if (waiverErr) {
        console.error('Failed to record waiver signature:', waiverErr)
      }
    }

    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected checkout error occurred.' }
  }
}
