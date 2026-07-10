'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  updateMemberProfile,
  assignProductToMember,
  refundMemberProduct,
  cancelMemberProduct,
} from '../actions'

interface ProductRecord {
  id: string
  name: string
  price: number
}

interface MemberProductRecord {
  id: string
  status: string
  start_date: string
  auth_net_subscription_id: string | null
  auth_net_profile_id: string | null
  products: {
    id: string
    name: string
    price: number
  }
}

interface WaiverAgreementRecord {
  id: string
  signed_content: string
  signed_at: string
  waivers: {
    title: string
  }
}

interface MemberDetailClientProps {
  member: {
    id: string
    email: string
    full_name: string | null
    phone: string | null
    address: string | null
    role: string
    authorize_net_customer_id: string | null
  }
  memberProducts: MemberProductRecord[]
  waivers: WaiverAgreementRecord[]
  catalogProducts: ProductRecord[]
  currentUserRole: string
}

export default function MemberDetailClient({
  member,
  memberProducts,
  waivers,
  catalogProducts,
  currentUserRole,
}: MemberDetailClientProps) {
  // Profile Form State
  const [fullName, setFullName] = useState(member.full_name || '')
  const [phone, setPhone] = useState(member.phone || '')
  const [address, setAddress] = useState(member.address || '')
  const [authNetCustId, setAuthNetCustId] = useState(member.authorize_net_customer_id || '')
  
  // Assign Product State
  const [selectedProductId, setSelectedProductId] = useState('')
  
  // Modal Preview Waiver State
  const [selectedWaiverText, setSelectedWaiverText] = useState<string | null>(null)
  
  // Feedback states
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [loadingAssign, setLoadingAssign] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const isAdmin = currentUserRole === 'Admin'

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingProfile(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    const result = await updateMemberProfile(member.id, {
      fullName,
      phone,
      address,
      authorizeNetCustomerId: authNetCustId,
    })

    if (result?.error) {
      setErrorMsg(result.error)
    } else {
      setSuccessMsg('Member profile details updated successfully!')
    }
    setLoadingProfile(false)
  }

  const handleAssignProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProductId) return
    setLoadingAssign(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    const result = await assignProductToMember(member.id, selectedProductId)
    if (result?.error) {
      setErrorMsg(result.error)
    } else {
      setSuccessMsg('Successfully assigned product to member.')
      setSelectedProductId('')
    }
    setLoadingAssign(false)
  }

  const handleCancelProduct = async (memberProductId: string) => {
    if (!confirm('Are you sure you want to cancel this membership?')) return
    setActionLoading(`cancel-${memberProductId}`)
    setErrorMsg(null)
    setSuccessMsg(null)

    const result = await cancelMemberProduct(memberProductId, member.id)
    if (result?.error) {
      setErrorMsg(result.error)
    } else {
      setSuccessMsg('Membership product cancelled.')
    }
    setActionLoading(null)
  }

  const handleRefundProduct = async (memberProductId: string) => {
    if (!isAdmin) return
    if (!confirm('Are you sure you want to refund this membership purchase?')) return
    setActionLoading(`refund-${memberProductId}`)
    setErrorMsg(null)
    setSuccessMsg(null)

    const result = await refundMemberProduct(memberProductId, member.id)
    if (result?.error) {
      setErrorMsg(result.error)
    } else {
      setSuccessMsg('Membership purchase refunded.')
    }
    setActionLoading(null)
  }

  return (
    <div className="space-y-8">
      {/* Back Link */}
      <div>
        <Link
          href="/dashboard/members"
          className="text-[#835500] hover:text-primary font-bold flex items-center gap-1.5 text-xs transition-colors"
        >
          <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
          Back to Members Directory
        </Link>
      </div>

      {/* Alert panels */}
      {errorMsg && (
        <div className="p-4 bg-error-container text-on-error-container border border-error/20 rounded-2xl text-sm flex items-center gap-3">
          <span className="material-symbols-outlined text-error">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-green-50 text-green-800 border border-green-200 rounded-2xl text-sm flex items-center gap-3">
          <span className="material-symbols-outlined text-green-600">check_circle</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Signed Waiver Content Modal */}
      {selectedWaiverText && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-[#fff8f2] p-8 rounded-2xl max-w-2xl w-full border border-[#d7c3ae]/30 shadow-2xl relative flex flex-col max-h-[80vh]">
            <button
              onClick={() => setSelectedWaiverText(null)}
              className="absolute right-4 top-4 text-on-surface-variant hover:text-[#ba1a1a] cursor-pointer focus:outline-none"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
            <h3 className="font-display text-lg font-bold text-[#201b13] mb-4">Signed Legal Waiver</h3>
            <div className="bg-white p-4 rounded-xl border border-[#d7c3ae]/20 overflow-y-auto text-xs text-[#524534] whitespace-pre-wrap leading-relaxed flex-1">
              {selectedWaiverText}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Member details & profile form */}
        <section className="space-y-6">
          <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-sm">
            <h2 className="font-display text-lg font-bold text-[#201b13] mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">person</span>
              Member Profile
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#201b13] mb-1.5">
                  Email (Auth Profile)
                </label>
                <input
                  type="email"
                  disabled
                  value={member.email}
                  className="w-full bg-[#fdf2e4]/10 border border-[#d7c3ae]/30 rounded-xl px-4 py-2.5 text-xs text-[#857462] cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#201b13] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-[#201b13]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#201b13] mb-1.5">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-[#201b13]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#201b13] mb-1.5">
                  Residential Address
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-[#201b13]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#201b13] mb-1.5">
                  Authorize.net Customer Profile ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. IND-102928"
                  value={authNetCustId}
                  onChange={(e) => setAuthNetCustId(e.target.value)}
                  className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-[#201b13] font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loadingProfile}
                  className="bg-[#131c2a] hover:bg-primary text-[#fff8f2] font-semibold px-5 py-2.5 rounded-full text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loadingProfile ? 'Saving...' : 'Save Profile'}
                  <span className="material-symbols-outlined text-sm">save</span>
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Right Columns: Active memberships and Assign products */}
        <section className="lg:col-span-2 space-y-6">
          {/* Active memberships table */}
          <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-sm">
            <h2 className="font-display text-lg font-bold text-[#201b13] mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">card_membership</span>
              Assigned Memberships & Products
            </h2>

            {memberProducts.length === 0 ? (
              <p className="text-xs text-[#524534] py-6 italic">No products currently assigned to this member.</p>
            ) : (
              <div className="space-y-4">
                {memberProducts.map((mp) => (
                  <div
                    key={mp.id}
                    className="p-4 rounded-xl border border-[#d7c3ae]/20 bg-white flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-bold text-sm text-[#201b13]">
                        {mp.products?.name}
                      </h3>
                      <p className="text-[10px] text-[#524534] mt-0.5">
                        Assigned: {new Date(mp.start_date).toLocaleDateString()}
                      </p>
                      {mp.auth_net_subscription_id && (
                        <p className="text-[9px] text-[#857462] font-mono mt-1">
                          Sub ID: {mp.auth_net_subscription_id}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                          mp.status === 'active'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : mp.status === 'refunded'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {mp.status}
                      </span>

                      {mp.status === 'active' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCancelProduct(mp.id)}
                            disabled={actionLoading === `cancel-${mp.id}`}
                            className="text-gray-500 hover:bg-gray-100 px-3 py-1 rounded-full text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                          >
                            Cancel
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleRefundProduct(mp.id)}
                              disabled={actionLoading === `refund-${mp.id}`}
                              className="text-[#ba1a1a] hover:bg-[#ba1a1a]/10 px-3 py-1 rounded-full text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assign product builder */}
          <div className="bg-[#131c2a] text-[#fff8f2] p-6 rounded-2xl shadow-lg border border-[#d7c3ae]/10 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
            
            <h3 className="font-display text-base font-bold text-[#fff8f2] mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#F5A623]">add_card</span>
              Assign Catalog Product Directly
            </h3>
            <p className="text-xs text-[#bec7da] mb-6">
              Manually add a membership or class pack product to this member account directly.
            </p>

            <form onSubmit={handleAssignProduct} className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#bec7da] mb-1.5">
                  Select Catalog Product
                </label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-[#3e4757]/40 border border-[#bec7da]/20 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-[#fff8f2]"
                >
                  <option value="">Choose a product...</option>
                  {catalogProducts.map((p) => (
                    <option className="bg-[#131c2a]" key={p.id} value={p.id}>
                      {p.name} (${p.price.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loadingAssign || !selectedProductId}
                className="bg-gradient-to-r from-[#F5A623] to-[#FF8C5A] hover:opacity-95 text-[#644000] font-bold px-6 py-2.5 rounded-full text-xs transition-all flex items-center gap-1.5 disabled:opacity-50 shrink-0 cursor-pointer"
              >
                {loadingAssign ? 'Assigning...' : 'Assign Product'}
                <span className="material-symbols-outlined text-sm font-bold">add</span>
              </button>
            </form>
          </div>

          {/* Signed Waiver Agreements log */}
          <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-sm">
            <h2 className="font-display text-lg font-bold text-[#201b13] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">gavel</span>
              Completed Legal Waivers
            </h2>

            {waivers.length === 0 ? (
              <p className="text-xs text-[#524534] py-4 italic">No waivers signed yet.</p>
            ) : (
              <div className="space-y-3">
                {waivers.map((waiver) => (
                  <div
                    key={waiver.id}
                    className="p-3.5 bg-gray-50 border border-outline-variant/10 rounded-xl flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-[#201b13]">{waiver.waivers?.title}</h4>
                      <p className="text-[9px] text-[#857462] mt-0.5">
                        Signed: {new Date(waiver.signed_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedWaiverText(waiver.signed_content)}
                      className="text-[#835500] hover:bg-[#fdf2e4] px-3 py-1.5 rounded-full text-[10px] font-bold transition-all cursor-pointer flex items-center gap-0.5"
                    >
                      <span className="material-symbols-outlined text-xs">visibility</span>
                      View Document
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
