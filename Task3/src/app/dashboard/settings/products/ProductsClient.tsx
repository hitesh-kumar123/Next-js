'use client'

import React, { useState } from 'react'
import { createProduct } from '../actions'

interface ProductRecord {
  id: string
  name: string
  price: number
  type: string
  visits_limit: number | null
  duration_type: string
  duration_months: number | null
  start_date: string | null
  end_date: string | null
  payment_model: string
  created_at: string
}

interface ProductsClientProps {
  initialProducts: ProductRecord[]
  isAdmin: boolean
}

export default function ProductsClient({
  initialProducts,
  isAdmin,
}: ProductsClientProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [type, setType] = useState<'full_access' | 'visit_count' | 'time_based' | 'class_count_periodic'>('full_access')
  const [visitsLimit, setVisitsLimit] = useState('')
  const [durationType, setDurationType] = useState<'ongoing' | 'limited_time' | 'periodic'>('ongoing')
  const [durationMonths, setDurationMonths] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [paymentModel, setPaymentModel] = useState<'one_time' | 'recurring'>('one_time')

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdmin) return
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    const parsedPrice = parseFloat(price)
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setErrorMsg('Price must be a valid positive number.')
      setLoading(false)
      return
    }

    const payload = {
      name,
      price: parsedPrice,
      type,
      visitsLimit: type === 'visit_count' || type === 'class_count_periodic' ? parseInt(visitsLimit) || undefined : undefined,
      durationType,
      durationMonths: durationType === 'limited_time' ? parseInt(durationMonths) || undefined : undefined,
      startDate: durationType === 'periodic' ? startDate : undefined,
      endDate: durationType === 'periodic' ? endDate : undefined,
      paymentModel,
    }

    const result = await createProduct(payload)
    if (result?.error) {
      setErrorMsg(result.error)
    } else {
      setSuccessMsg(`Successfully created product: ${name}!`)
      // Reset form
      setName('')
      setPrice('')
      setType('full_access')
      setVisitsLimit('')
      setDurationType('ongoing')
      setDurationMonths('')
      setStartDate('')
      setEndDate('')
      setPaymentModel('one_time')
    }
    setLoading(false)
  }

  const getProductTypeLabel = (pType: string) => {
    switch (pType) {
      case 'full_access':
        return 'Full Access (Unlimited)'
      case 'visit_count':
        return 'Visit-Count Based'
      case 'time_based':
        return 'Time-Based Pass'
      case 'class_count_periodic':
        return 'Periodic Class-Count'
      default:
        return pType
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* List of Products (2 columns) */}
      <section className={`${isAdmin ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
        <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-sm">
          <h2 className="font-display text-xl font-bold text-[#201b13] mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">fitness_center</span>
            Current Products & Memberships
          </h2>

          {initialProducts.length === 0 ? (
            <p className="text-sm text-[#524534] py-8 italic text-center">
              No products created yet. Use the panel to add your first product.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {initialProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-[#ffffff] p-5 rounded-xl border border-[#d7c3ae]/20 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="font-bold text-[#201b13] text-base leading-tight">
                        {product.name}
                      </h3>
                      <span className="bg-[#f5a623]/10 text-[#835500] border border-[#f5a623]/30 px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>

                    <p className="text-xs text-[#524534] mb-3">
                      Type: <strong className="text-[#201b13]">{getProductTypeLabel(product.type)}</strong>
                      {product.visits_limit && ` (${product.visits_limit} visits)`}
                    </p>

                    <div className="text-xs text-[#857462] space-y-1 bg-[#fdf2e4]/30 p-2 rounded-lg">
                      <p>
                        Duration: <strong>{product.duration_type}</strong>
                        {product.duration_months && ` (${product.duration_months} months)`}
                      </p>
                      {product.start_date && (
                        <p>
                          Starts: {new Date(product.start_date).toLocaleDateString()}
                          {product.end_date && ` - Ends: ${new Date(product.end_date).toLocaleDateString()}`}
                        </p>
                      )}
                      <p>
                        Billing: <span className="font-bold text-[#835500] uppercase">{product.payment_model}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Product Creator Form (1 column) - Admin Only */}
      {isAdmin && (
        <section className="space-y-6">
          <div className="bg-[#131c2a] text-[#fff8f2] p-6 rounded-2xl shadow-lg border border-[#d7c3ae]/10 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />

            <h2 className="font-display text-lg font-bold text-[#fff8f2] mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#F5A623]">add_card</span>
              Create Product
            </h2>
            <p className="text-xs text-[#bec7da] mb-6 leading-relaxed">
              Define a new product, membership, or class package.
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#bec7da] mb-1.5">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Gold Monthly Membership"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#3e4757]/40 border border-[#bec7da]/20 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-[#fff8f2] placeholder:text-[#bec7da]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#bec7da] mb-1.5">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="99.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-[#3e4757]/40 border border-[#bec7da]/20 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-[#fff8f2] placeholder:text-[#bec7da]/40"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#bec7da] mb-1.5">
                    Payment Model
                  </label>
                  <select
                    value={paymentModel}
                    onChange={(e) => setPaymentModel(e.target.value as any)}
                    className="w-full bg-[#3e4757]/40 border border-[#bec7da]/20 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-[#fff8f2]"
                  >
                    <option className="bg-[#131c2a]" value="one_time">One-Time</option>
                    <option className="bg-[#131c2a]" value="recurring">Recurring (Monthly)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#bec7da] mb-1.5">
                  Membership Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-[#3e4757]/40 border border-[#bec7da]/20 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-[#fff8f2]"
                >
                  <option className="bg-[#131c2a]" value="full_access">Full Access (Unlimited visits)</option>
                  <option className="bg-[#131c2a]" value="visit_count">Visit-Count Based</option>
                  <option className="bg-[#131c2a]" value="time_based">Time-Based Pass</option>
                  <option className="bg-[#131c2a]" value="class_count_periodic">Class-Count Per Period</option>
                </select>
              </div>

              {(type === 'visit_count' || type === 'class_count_periodic') && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#bec7da] mb-1.5">
                    Visits/Class Limit
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g., 10"
                    value={visitsLimit}
                    onChange={(e) => setVisitsLimit(e.target.value)}
                    className="w-full bg-[#3e4757]/40 border border-[#bec7da]/20 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-[#fff8f2]"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#bec7da] mb-1.5">
                  Duration Type
                </label>
                <select
                  value={durationType}
                  onChange={(e) => setDurationType(e.target.value as any)}
                  className="w-full bg-[#3e4757]/40 border border-[#bec7da]/20 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-[#fff8f2]"
                >
                  <option className="bg-[#131c2a]" value="ongoing">Ongoing (Auto-renews)</option>
                  <option className="bg-[#131c2a]" value="limited_time">Limited Time (e.g., 6 months)</option>
                  <option className="bg-[#131c2a]" value="periodic">Periodic (Fixed start/end date)</option>
                </select>
              </div>

              {durationType === 'limited_time' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#bec7da] mb-1.5">
                    Duration (Months)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g., 6"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(e.target.value)}
                    className="w-full bg-[#3e4757]/40 border border-[#bec7da]/20 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-[#fff8f2]"
                  />
                </div>
              )}

              {durationType === 'periodic' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#bec7da] mb-1.5">
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-[#3e4757]/40 border border-[#bec7da]/20 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-[#fff8f2]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#bec7da] mb-1.5">
                      End Date
                    </label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-[#3e4757]/40 border border-[#bec7da]/20 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-[#fff8f2]"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#F5A623] to-[#FF8C5A] hover:opacity-95 active:scale-[0.98] text-[#644000] font-bold py-3.5 rounded-full transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Product'}
                  <span className="material-symbols-outlined text-lg font-bold">add</span>
                </button>
              </div>
            </form>
          </div>
        </section>
      )}
    </div>
  )
}
