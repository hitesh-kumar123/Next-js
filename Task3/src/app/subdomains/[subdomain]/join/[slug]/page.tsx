import React from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AcceptCheckoutClient from './AcceptCheckoutClient'

interface PageProps {
  params: Promise<{ subdomain: string; slug: string }>
}

interface ProductRecord {
  id: string
  name: string
  price: number
  payment_model: string
}

export const dynamic = 'force-dynamic'

export default async function PublicJoinPage({ params }: PageProps) {
  const resolvedParams = await params
  const { subdomain, slug } = resolvedParams

  const supabase = await createClient()

  // 1. Fetch the gym details by subdomain (from public.users table)
  const { data: gymProfile, error: gymErr } = await supabase
    .from('users')
    .select('gym_name')
    .eq('subdomain', subdomain.toLowerCase())
    .single()

  if (gymErr || !gymProfile) {
    return (
      <main className="min-h-screen w-full bg-background flex flex-col justify-center items-center p-4">
        <div className="glass-card p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <span className="material-symbols-outlined text-error text-5xl mb-4">error</span>
          <h2 className="font-display text-xl font-bold text-on-surface mb-2">
            Gym Not Found
          </h2>
          <p className="text-sm text-on-surface-variant">
            The subdomain <code>{subdomain}</code> does not correspond to an active gym on Auric.
          </p>
        </div>
      </main>
    )
  }

  // 2. Fetch the signup form by slug
  const { data: form, error: formErr } = await supabase
    .from('signup_forms')
    .select('*')
    .eq('slug', slug.toLowerCase())
    .single()

  if (formErr || !form) {
    return notFound()
  }

  // If the form is paused, block checkout
  if (!form.is_active) {
    return (
      <main className="min-h-screen w-full bg-background flex flex-col justify-center items-center p-4">
        <div className="glass-card p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <span className="material-symbols-outlined text-[#F5A623] text-5xl mb-4">pause_circle</span>
          <h2 className="font-display text-xl font-bold text-on-surface mb-2">
            Form Registration Paused
          </h2>
          <p className="text-sm text-on-surface-variant">
            This signup page has been temporarily deactivated by the gym administrator.
          </p>
        </div>
      </main>
    )
  }

  // 3. Fetch linked products
  const { data: formProducts } = await supabase
    .from('signup_form_products')
    .select('product_id')
    .eq('signup_form_id', form.id)

  const productIds = (formProducts || []).map((fp) => fp.product_id)

  let products: ProductRecord[] = []
  if (productIds.length > 0) {
    const { data: productsData } = await supabase
      .from('products')
      .select('id, name, price, payment_model')
      .in('id', productIds)

    products = (productsData || []) as ProductRecord[]
  }

  if (products.length === 0) {
    return (
      <main className="min-h-screen w-full bg-background flex flex-col justify-center items-center p-4">
        <div className="glass-card p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <span className="material-symbols-outlined text-[#F5A623] text-5xl mb-4">production_quantity_limits</span>
          <h2 className="font-display text-xl font-bold text-on-surface mb-2">
            No Products Configured
          </h2>
          <p className="text-sm text-on-surface-variant">
            This form does not have any active products available for purchase.
          </p>
        </div>
      </main>
    )
  }

  // 4. Fetch linked waiver if it exists
  let waiver = null
  if (form.waiver_id) {
    const { data: waiverData } = await supabase
      .from('waivers')
      .select('id, title, content')
      .eq('id', form.waiver_id)
      .single()

    waiver = waiverData
  }

  return (
    <AcceptCheckoutClient
      gymName={gymProfile.gym_name || 'Auric Gym'}
      formTitle={form.title}
      products={products}
      waiver={waiver}
      subdomain={subdomain}
      slug={slug}
    />
  )
}
