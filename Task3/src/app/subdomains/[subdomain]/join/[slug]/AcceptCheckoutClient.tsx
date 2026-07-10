'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { processPublicCheckout } from './actions'

interface ProductRecord {
  id: string
  name: string
  price: number
  payment_model: string
}

interface WaiverRecord {
  id: string
  title: string
  content: string
}

interface AcceptCheckoutClientProps {
  gymName: string
  formTitle: string
  products: ProductRecord[]
  waiver: WaiverRecord | null
  subdomain: string
  slug: string
}

export default function AcceptCheckoutClient({
  gymName,
  formTitle,
  products,
  waiver,
}: AcceptCheckoutClientProps) {
  // Input fields
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [passwordStr, setPasswordStr] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')

  // Selected product
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '')

  // Card details
  const [cardNumber, setCardNumber] = useState('')
  const [expirationDate, setExpirationDate] = useState('')
  const [cardCode, setCardCode] = useState('')

  // Waiver checkbox
  const [waiverAgreed, setWaiverAgreed] = useState(false)

  // Feedback states
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  // Format Card Number (adds spaces every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ')
    setCardNumber(formatted.slice(0, 19))
  }

  // Format Expiration Date (MM/YY)
  const handleExpirationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 2) {
      setExpirationDate(value)
    } else {
      setExpirationDate(`${value.slice(0, 2)}/${value.slice(2, 4)}`)
    }
  }

  // Token replacement helper for Waiver Content
  const getRenderedWaiver = () => {
    if (!waiver) return ''
    const today = new Date().toLocaleDateString()
    const nameParts = fullName.trim().split(/\s+/)
    const firstName = nameParts[0] || '________'
    const lastName = nameParts.slice(1).join(' ') || '________'

    return waiver.content
      .replace(/{first_name}/g, firstName)
      .replace(/{last_name}/g, lastName)
      .replace(/{date}/g, today)
  }

  const selectedProduct = products.find((p) => p.id === selectedProductId)

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    if (waiver && !waiverAgreed) {
      setErrorMsg('You must review and agree to the waiver agreement terms.')
      setLoading(false)
      return
    }

    try {
      const result = await processPublicCheckout({
        email,
        fullName,
        passwordStr,
        phone,
        address,
        city,
        state,
        zip,
        productId: selectedProductId,
        waiverId: waiver?.id || null,
        signedWaiverContent: waiver ? getRenderedWaiver() : null,
        card: {
          cardNumber,
          expirationDate,
          cardCode,
        },
      })

      if (result?.error) {
        setErrorMsg(result.error)
        setLoading(false)
      } else {
        setSuccess(true)
        // Sign in user client-side and redirect
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password: passwordStr,
        })

        if (signInErr) {
          setErrorMsg('Checkout was successful, but auto-login failed: ' + signInErr.message + '. Please go to login.')
          setLoading(false)
        } else {
          router.refresh()
          router.push('/dashboard')
        }
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err)
      if (errMsg.toLowerCase().includes('fetch') || errMsg.toLowerCase().includes('failed to fetch')) {
        setErrorMsg('Failed to connect to Supabase. Please check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correctly set in the .env file.')
      } else {
        setErrorMsg(errMsg || 'An unexpected error occurred during checkout.')
      }
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen w-full bg-background flex flex-col justify-center items-center p-4">
        <div className="glass-card p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <span className="material-symbols-outlined text-green-600 text-6xl mb-4 animate-bounce">
            task_alt
          </span>
          <h2 className="font-display text-2xl font-bold text-[#201b13] mb-2">
            Payment Successful!
          </h2>
          <p className="text-sm text-[#524534] mb-4">
            Welcome to {gymName}! Your account is active and membership is set up. Redirecting to your dashboard...
          </p>
          <div className="animate-pulse h-2 bg-gradient-to-r from-[#F5A623] to-[#FF8C5A] rounded-full w-full max-w-[200px] mx-auto" />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen w-full bg-background py-12 px-4 relative overflow-hidden flex flex-col justify-center items-center">
      {/* Background Orbs */}
      <div className="orb-glow top-[-100px] right-[-100px] md:w-[600px] md:h-[600px]" />
      <div className="orb-glow bottom-[-150px] left-[-150px] md:w-[600px] md:h-[600px]" />

      <div className="w-full max-w-3xl relative z-10 space-y-6">
        {/* Gym Header */}
        <div className="text-center">
          <h1 className="font-display text-3xl font-extrabold text-[#1B2432] tracking-tight uppercase">
            {gymName}
          </h1>
          <p className="text-on-surface-variant text-sm font-sans mt-1">
            {formTitle}
          </p>
        </div>

        {/* Checkout Card Grid */}
        <div className="glass-card p-8 rounded-2xl shadow-2xl">
          {errorMsg && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container border border-error/20 rounded-xl text-sm flex items-center gap-3">
              <span className="material-symbols-outlined text-error">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleCheckout} className="space-y-8">
            {/* Step 1: Membership Selection */}
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-[#1B2432] border-b border-[#d7c3ae]/30 pb-2 flex items-center gap-2">
                <span className="text-[#f5a623] font-mono text-sm">01</span>
                Select Membership Tier
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((product) => {
                  const isSelected = selectedProductId === product.id
                  return (
                    <label
                      key={product.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all select-none ${
                        isSelected
                          ? 'border-[#F5A623] bg-[#fdf2e4]/30 shadow-xs'
                          : 'border-[#d7c3ae]/30 hover:border-[#F5A623]/50 bg-white/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="productSelect"
                        checked={isSelected}
                        onChange={() => setSelectedProductId(product.id)}
                        className="sr-only"
                      />
                      <div>
                        <span className="font-bold text-[#201b13] block text-sm">{product.name}</span>
                        <span className="text-xs text-[#524534] mt-0.5 block">
                          {product.payment_model === 'recurring' ? 'Monthly auto-renew' : 'One-time checkout'}
                        </span>
                      </div>
                      <span className="text-lg font-extrabold text-[#835500] mt-4 block">
                        ${product.price.toFixed(2)}
                        {product.payment_model === 'recurring' && <span className="text-xs font-normal text-[#524534]">/mo</span>}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Step 2: Customer Profile */}
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-[#1B2432] border-b border-[#d7c3ae]/30 pb-2 flex items-center gap-2">
                <span className="text-[#f5a623] font-mono text-sm">02</span>
                Create Account Profile
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#201b13] mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-[#201b13]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#201b13] mb-1.5">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-[#201b13]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#201b13] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-[#201b13]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#201b13] mb-1.5">
                    Account Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwordStr}
                    onChange={(e) => setPasswordStr(e.target.value)}
                    className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-[#201b13]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#201b13] mb-1.5">
                    Billing Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Street Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-[#201b13] mb-3"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-sm outline-none"
                    />
                    <input
                      type="text"
                      required
                      placeholder="State (e.g. CA)"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-sm outline-none"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Zip Code"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-sm outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Waiver Signatures */}
            {waiver && (
              <div className="space-y-4">
                <h2 className="font-display text-lg font-bold text-[#1B2432] border-b border-[#d7c3ae]/30 pb-2 flex items-center gap-2">
                  <span className="text-[#f5a623] font-mono text-sm">03</span>
                  Review & Sign Legal Waiver
                </h2>
                <div className="bg-[#fff8f2] border border-[#d7c3ae]/40 rounded-xl p-4 h-48 overflow-y-auto text-xs text-[#524534] whitespace-pre-wrap leading-relaxed">
                  {getRenderedWaiver()}
                </div>
                <label className="flex items-start gap-2.5 text-xs text-[#524534] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={waiverAgreed}
                    onChange={(e) => setWaiverAgreed(e.target.checked)}
                    className="rounded text-primary focus:ring-primary border-[#d7c3ae]/50 bg-transparent w-4.5 h-4.5 cursor-pointer mt-0.5"
                  />
                  <span>
                    I confirm that I, <strong className="text-[#201b13]">{fullName || '________'}</strong>, have read, understood, and agree to the waiver terms above on this day.
                  </span>
                </label>
              </div>
            )}

            {/* Step 4: Checkout details */}
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-[#1B2432] border-b border-[#d7c3ae]/30 pb-2 flex items-center gap-2">
                <span className="text-[#f5a623] font-mono text-sm">
                  {waiver ? '04' : '03'}
                </span>
                Payment Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#201b13] mb-1.5">
                    Credit Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="4007 0000 0002 7"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-[#201b13] font-mono"
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/30">
                      credit_card
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#201b13] mb-1.5">
                    Expiration Date
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    value={expirationDate}
                    onChange={handleExpirationChange}
                    className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-[#201b13] text-center font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#201b13] mb-1.5">
                    Security Code (CVV)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    placeholder="123"
                    value={cardCode}
                    onChange={(e) => setCardCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-[#201b13] text-center font-mono"
                  />
                </div>

                <div className="md:col-span-2 flex flex-col justify-center">
                  <p className="text-xs text-[#524534]">
                    Total Amount Due: <strong className="text-base text-[#835500]">${selectedProduct?.price.toFixed(2) || '0.00'}</strong>
                    {selectedProduct?.payment_model === 'recurring' && <span className="text-[10px] text-[#857462]"> (billed monthly)</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-[#d7c3ae]/30">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#F5A623] to-[#FF8C5A] hover:opacity-95 active:scale-[0.98] text-white py-4 rounded-full font-bold transition-all shadow-lg glow-shadow-gold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <span>Complete Signup & Pay</span>
                    <span className="material-symbols-outlined text-lg">shopping_cart_checkout</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
