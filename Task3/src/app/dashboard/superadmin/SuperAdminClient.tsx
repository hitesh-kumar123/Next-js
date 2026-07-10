'use client'

import React, { useState } from 'react'
import { toggleGymSuspended } from './actions'

interface GymRecord {
  id: string
  full_name: string | null
  email: string
  subdomain: string | null
  gym_name: string | null
  is_suspended: boolean
  created_at: string
}

interface SuperAdminClientProps {
  initialGyms: GymRecord[]
}

export default function SuperAdminClient({ initialGyms }: SuperAdminClientProps) {
  const [search, setSearch] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleToggleSuspended = async (ownerId: string, currentVal: boolean) => {
    const actionText = currentVal ? 'reactivate' : 'suspend'
    if (!confirm(`Are you sure you want to ${actionText} this studio account?`)) {
      return
    }

    setLoadingId(ownerId)
    setErrorMsg(null)
    setSuccessMsg(null)

    const res = await toggleGymSuspended(ownerId, currentVal)
    if (res?.error) {
      setErrorMsg(res.error)
    } else {
      setSuccessMsg(`Studio account ${actionText}d successfully.`)
    }
    setLoadingId(null)
  }

  // Filter gym owners (role = Admin and has subdomain)
  const filteredGyms = initialGyms.filter((gym) => {
    const query = search.toLowerCase()
    const nameMatch = (gym.gym_name || '').toLowerCase().includes(query)
    const subMatch = (gym.subdomain || '').toLowerCase().includes(query)
    const emailMatch = gym.email.toLowerCase().includes(query)

    return nameMatch || subMatch || emailMatch
  })

  return (
    <div className="space-y-6">
      {/* Feedback Alerts */}
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

      {/* Control bar */}
      <div className="bg-white/75 backdrop-blur-md p-5 rounded-2xl border border-[#d7c3ae]/30 shadow-sm">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search studios by name, subdomain, or owner email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 pl-10 text-sm outline-none transition-all placeholder:text-[#857462]/60 text-[#201b13]"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#857462]/60 text-lg">
            search
          </span>
        </div>
      </div>

      {/* Gym Directory Table */}
      <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-sm">
        <div className="overflow-x-auto">
          {filteredGyms.length === 0 ? (
            <p className="text-sm text-[#524534] py-8 italic text-center">
              No registered gyms/studios found.
            </p>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#d7c3ae]/20 text-xs font-bold text-[#524534] uppercase tracking-wider">
                  <th className="pb-3">Gym / Studio</th>
                  <th className="pb-3">Subdomain Address</th>
                  <th className="pb-3">Owner Contact</th>
                  <th className="pb-3">Registration Date</th>
                  <th className="pb-3">Platform Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d7c3ae]/10">
                {filteredGyms.map((gym) => {
                  const isSuspended = gym.is_suspended
                  return (
                    <tr key={gym.id} className="hover:bg-[#fdf2e4]/20 transition-colors">
                      <td className="py-4 font-semibold text-[#201b13]">
                        {gym.gym_name || 'Unnamed Gym'}
                      </td>
                      <td className="py-4 text-[#835500] font-mono text-xs">
                        {gym.subdomain ? `${gym.subdomain}.thinkauric.com` : 'Not Set'}
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="text-[#201b13] font-medium">{gym.full_name || 'Owner'}</span>
                          <span className="text-[10px] text-[#857462]">{gym.email}</span>
                        </div>
                      </td>
                      <td className="py-4 text-xs">
                        {new Date(gym.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                            isSuspended
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-green-50 text-green-700 border-green-200'
                          }`}
                        >
                          {isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleToggleSuspended(gym.id, isSuspended)}
                          disabled={loadingId === gym.id}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            isSuspended
                              ? 'bg-green-600 hover:bg-green-700 text-white shadow-xs'
                              : 'bg-[#ba1a1a]/15 text-[#ba1a1a] hover:bg-[#ba1a1a]/25'
                          }`}
                        >
                          {loadingId === gym.id
                            ? 'Updating...'
                            : isSuspended
                            ? 'Activate Gym'
                            : 'Suspend Gym'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
