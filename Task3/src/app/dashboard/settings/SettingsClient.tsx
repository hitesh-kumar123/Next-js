'use client'

import React, { useState } from 'react'
import { updateProfile } from '../actions'

interface SettingsClientProps {
  fullName: string
  phone: string
  address: string
  userEmail: string
  userRole: string
}

export default function SettingsClient({
  fullName: initialFullName,
  phone: initialPhone,
  address: initialAddress,
  userEmail,
  userRole,
}: SettingsClientProps) {
  const [fullName, setFullName] = useState(initialFullName)
  const [phone, setPhone] = useState(initialPhone)
  const [address, setAddress] = useState(initialAddress)

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    const result = await updateProfile({ fullName, phone, address })
    if (result?.error) {
      setErrorMsg(result.error)
    } else {
      setSuccessMsg('Account profile details updated successfully!')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl bg-white/75 backdrop-blur-md p-8 rounded-2xl border border-[#d7c3ae]/30 shadow-sm">
      <h2 className="font-display text-xl font-bold text-[#201b13] mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">person</span>
        Profile Details
      </h2>

      {errorMsg && (
        <div className="mb-6 p-4 bg-error-container text-on-error-container border border-error/20 rounded-xl text-sm flex items-center gap-3">
          <span className="material-symbols-outlined text-error">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 text-green-800 border border-green-200 rounded-xl text-sm flex items-center gap-3">
          <span className="material-symbols-outlined text-green-600">check_circle</span>
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#201b13] mb-1.5">
              Account Email
            </label>
            <input
              type="email"
              disabled
              value={userEmail}
              className="w-full bg-[#fdf2e4]/10 border border-[#d7c3ae]/30 rounded-xl px-4 py-2.5 text-sm text-[#857462] cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#201b13] mb-1.5">
              Current Role
            </label>
            <div className="w-full bg-[#fdf2e4]/10 border border-[#d7c3ae]/30 rounded-xl px-4 py-2.5 text-sm text-[#857462] flex items-center gap-2 select-none">
              <span className="text-[10px] font-bold bg-[#f5a623]/25 text-[#f5a623] border border-[#f5a623]/40 px-2 py-0.5 rounded uppercase leading-none">
                {userRole}
              </span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#201b13] mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-[#201b13]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#201b13] mb-1.5">
            Contact Phone
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-[#201b13]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#201b13] mb-1.5">
            Residential Address
          </label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-[#201b13]"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#131c2a] hover:bg-[#835500] text-white font-semibold px-6 py-3 rounded-full text-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Profile Settings'}
            <span className="material-symbols-outlined text-base">save</span>
          </button>
        </div>
      </form>
    </div>
  )
}
