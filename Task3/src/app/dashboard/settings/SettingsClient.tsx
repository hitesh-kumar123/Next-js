'use client'

import React, { useState } from 'react'
import { updateProfile } from '../actions'

interface SettingsClientProps {
  fullName: string
  phone: string
  address: string
  userEmail: string
  userRole: string
  emailReminders: boolean
  smsReminders: boolean
}

export default function SettingsClient({
  fullName: initialFullName,
  phone: initialPhone,
  address: initialAddress,
  userEmail,
  userRole,
  emailReminders: initialEmailReminders,
  smsReminders: initialSmsReminders,
}: SettingsClientProps) {
  const [fullName, setFullName] = useState(initialFullName)
  const [phone, setPhone] = useState(initialPhone)
  const [address, setAddress] = useState(initialAddress)
  const [emailReminders, setEmailReminders] = useState(initialEmailReminders)
  const [smsReminders, setSmsReminders] = useState(initialSmsReminders)

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    const result = await updateProfile({ fullName, phone, address, emailReminders, smsReminders })
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

        <div className="border-t border-[#d7c3ae]/30 pt-6 space-y-4">
          <h3 className="font-display text-sm font-bold text-[#201b13] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">notifications</span>
            Calendar Notifications & Reminders
          </h3>
          <p className="text-xs text-[#524534]">
            Receive reminders and schedule alerts for classes you have booked or are assigned to instruct.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 bg-[#fdf2e4]/30 border border-[#d7c3ae]/30 rounded-xl p-3.5 cursor-pointer hover:bg-[#fdf2e4]/50 select-none">
              <input
                type="checkbox"
                checked={emailReminders}
                onChange={(e) => setEmailReminders(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-[#d7c3ae]"
              />
              <div>
                <p className="text-xs font-bold text-[#201b13]">Email Reminders</p>
                <p className="text-[10px] text-[#524534] mt-0.5">Receive class updates by email.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 bg-[#fdf2e4]/30 border border-[#d7c3ae]/30 rounded-xl p-3.5 cursor-pointer hover:bg-[#fdf2e4]/50 select-none">
              <input
                type="checkbox"
                checked={smsReminders}
                onChange={(e) => setSmsReminders(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-[#d7c3ae]"
              />
              <div>
                <p className="text-xs font-bold text-[#201b13]">SMS Reminders</p>
                <p className="text-[10px] text-[#524534] mt-0.5">Receive text message alerts on mobile.</p>
              </div>
            </label>
          </div>
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
