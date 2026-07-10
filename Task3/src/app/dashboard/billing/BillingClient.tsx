'use client'

import React, { useState } from 'react'
import { cancelMembership, updatePaymentMethod } from '../actions'

interface BillingClientProps {
  membership: {
    id: string
    status: string
    start_date: string
    auth_net_subscription_id: string | null
    auth_net_profile_id: string | null
    product: {
      name: string
      price: number
      payment_model: string
    }
  } | null
}

export default function BillingClient({ membership }: BillingClientProps) {
  // Card states
  const [cardNumber, setCardNumber] = useState('')
  const [expirationDate, setExpirationDate] = useState('')
  const [cardCode, setCardCode] = useState('')

  const [loading, setLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ')
    setCardNumber(formatted.slice(0, 19))
  }

  const handleExpirationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 2) {
      setExpirationDate(value)
    } else {
      setExpirationDate(`${value.slice(0, 2)}/${value.slice(2, 4)}`)
    }
  }

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    const result = await updatePaymentMethod({ cardNumber, expirationDate, cardCode })
    if (result?.error) {
      setErrorMsg(result.error)
    } else {
      setSuccessMsg('Payment method updated successfully in gateway.')
      setCardNumber('')
      setExpirationDate('')
      setCardCode('')
    }
    setLoading(false)
  }

  const handleCancel = async () => {
    if (!membership) return
    if (!confirm('Are you sure you want to cancel your membership? You will lose access immediately.')) {
      return
    }

    setCancelLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    const result = await cancelMembership(membership.id)
    if (result?.error) {
      setErrorMsg(result.error)
    } else {
      setSuccessMsg('Membership cancelled successfully.')
    }
    setCancelLoading(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Current plan & billing history (2 cols) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Plan card */}
        <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-sm">
          <h2 className="font-display text-xl font-bold text-[#201b13] mb-4">Current Plan</h2>

          {membership ? (
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 bg-[#fdf2e4]/30 p-5 rounded-xl border border-[#d7c3ae]/15">
              <div>
                <h3 className="font-bold text-base text-[#201b13]">{membership.product.name}</h3>
                <p className="text-xs text-[#524534] mt-1">
                  Started on {new Date(membership.start_date).toLocaleDateString()}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-lg font-extrabold text-[#835500]">
                    ${membership.product.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-[#857462]">
                    / {membership.product.payment_model === 'recurring' ? 'month' : 'one-time'}
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
                <span className="bg-green-50 text-green-800 border border-green-200 px-3 py-1 rounded-full text-xs font-bold capitalize">
                  {membership.status}
                </span>
                {membership.status === 'active' && (
                  <button
                    onClick={handleCancel}
                    disabled={cancelLoading}
                    className="text-[#ba1a1a] hover:bg-[#ba1a1a]/10 px-3 py-1.5 rounded-full text-xs font-bold transition-all disabled:opacity-50 mt-2 cursor-pointer"
                  >
                    {cancelLoading ? 'Cancelling...' : 'Cancel Membership'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 bg-[#fdf2e4]/20 border border-[#d7c3ae]/20 rounded-xl text-center">
              <span className="material-symbols-outlined text-[#857462] text-4xl mb-2">payments</span>
              <p className="text-sm text-[#524534] italic">No active membership plan found.</p>
            </div>
          )}
        </div>

        {/* Invoice/Payment history */}
        <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-sm">
          <h2 className="font-display text-xl font-bold text-[#201b13] mb-4">Payment History</h2>
          
          {!membership ? (
            <p className="text-xs text-[#857462] italic py-4">No billing records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#d7c3ae]/20 text-xs font-bold text-[#524534] uppercase tracking-wider">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Description</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Method</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d7c3ae]/10">
                  <tr className="hover:bg-[#fdf2e4]/10 transition-colors">
                    <td className="py-4 text-xs">
                      {new Date(membership.start_date).toLocaleDateString()}
                    </td>
                    <td className="py-4 font-semibold text-[#201b13]">
                      Initial Checkout — {membership.product.name}
                    </td>
                    <td className="py-4 text-[#835500] font-bold">
                      ${membership.product.price.toFixed(2)}
                    </td>
                    <td className="py-4 text-xs font-mono text-on-surface-variant">
                      {membership.auth_net_subscription_id ? 'ARB Subscription' : 'Credit Card'}
                    </td>
                    <td className="py-4 text-right">
                      <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                        Cleared
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Update payment method (1 col) */}
      <div className="space-y-6">
        <div className="bg-[#131c2a] text-[#fff8f2] p-6 rounded-2xl shadow-lg border border-[#d7c3ae]/10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />

          <h2 className="font-display text-lg font-bold text-[#fff8f2] mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#F5A623]">credit_card</span>
            Update Card
          </h2>
          <p className="text-xs text-[#bec7da] mb-6 leading-relaxed">
            Update your default credit card credentials on file.
          </p>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950 text-red-200 border border-red-800 rounded-xl text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-red-400">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-green-950 text-green-200 border border-green-800 rounded-xl text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-green-400">check_circle</span>
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePayment} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#bec7da] mb-1.5">
                Card Number
              </label>
              <input
                type="text"
                required
                placeholder="4007 0000 0002 7"
                value={cardNumber}
                onChange={handleCardNumberChange}
                className="w-full bg-[#3e4757]/40 border border-[#bec7da]/20 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-[#fff8f2] placeholder:text-[#bec7da]/40 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#bec7da] mb-1.5">
                  Expiration (MM/YY)
                </label>
                <input
                  type="text"
                  required
                  placeholder="12/28"
                  value={expirationDate}
                  onChange={handleExpirationChange}
                  className="w-full bg-[#3e4757]/40 border border-[#bec7da]/20 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-[#fff8f2] placeholder:text-[#bec7da]/40 text-center font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#bec7da] mb-1.5">
                  Security Code (CVV)
                </label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  placeholder="123"
                  value={cardCode}
                  onChange={(e) => setCardCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[#3e4757]/40 border border-[#bec7da]/20 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-[#fff8f2] placeholder:text-[#bec7da]/40 text-center font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#F5A623] to-[#FF8C5A] hover:opacity-95 active:scale-[0.98] text-[#644000] font-bold py-3.5 rounded-full transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Card'}
                <span className="material-symbols-outlined text-lg">save</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
