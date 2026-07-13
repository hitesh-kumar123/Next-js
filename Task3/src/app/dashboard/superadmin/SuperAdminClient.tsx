'use client'

import React, { useState } from 'react'
import { toggleGymSuspended, impersonateUser } from './actions'

interface GymRecord {
  id: string
  full_name: string | null
  email: string
  subdomain: string | null
  gym_name: string | null
  is_suspended: boolean
  created_at: string
}

interface PlatformUserRecord {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
  gym_name?: string | null
  subdomain?: string | null
}

interface AnalyticsData {
  membership: {
    totalActiveMembers: number
    avgDurationMonths: number
    planBreakdown: { [key: string]: number }
    mostActiveTier: string
    newMemberships: number
    churnRate: number
    renewalRate: number
    inactiveMembers: number
  }
  financial: {
    lifetimeRevenue: number
    memberLtv: number
    revenueByPlan: { [key: string]: number }
    mrr: number
    arr: number
    arpu: number
    failedPayments: number
    refunds: number
    outstandingPayments: number
  }
}

interface SuperAdminClientProps {
  initialGyms: GymRecord[]
  initialUsers: PlatformUserRecord[]
  analytics: AnalyticsData
}

export default function SuperAdminClient({
  initialGyms,
  initialUsers,
  analytics,
}: SuperAdminClientProps) {
  const [activeTab, setActiveTab] = useState<'studios' | 'users' | 'analytics'>('studios')
  const [search, setSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [impersonatingEmail, setImpersonatingEmail] = useState<string | null>(null)
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

  const handleImpersonate = async (email: string) => {
    setImpersonatingEmail(email)
    setErrorMsg(null)
    setSuccessMsg(null)

    const res = await impersonateUser(email)
    if (res.error) {
      setErrorMsg(res.error)
    } else if (res.link) {
      setSuccessMsg(`Access link generated successfully. Opening new session...`)
      // Open magic link in a new window to login as user
      window.open(res.link, '_blank')
    }
    setImpersonatingEmail(null)
  }

  // Filter gym owners
  const filteredGyms = initialGyms.filter((gym) => {
    const query = search.toLowerCase()
    const nameMatch = (gym.gym_name || '').toLowerCase().includes(query)
    const subMatch = (gym.subdomain || '').toLowerCase().includes(query)
    const emailMatch = gym.email.toLowerCase().includes(query)
    return nameMatch || subMatch || emailMatch
  })

  // Filter platform users
  const filteredUsers = initialUsers.filter((u) => {
    const query = userSearch.toLowerCase()
    const nameMatch = (u.full_name || '').toLowerCase().includes(query)
    const emailMatch = u.email.toLowerCase().includes(query)
    const roleMatch = u.role.toLowerCase().includes(query)
    return nameMatch || emailMatch || roleMatch
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

      {/* Tabs Selector */}
      <div className="flex border-b border-[#d7c3ae]/30 gap-6 select-none">
        <button
          onClick={() => setActiveTab('studios')}
          className={`pb-3 text-sm font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'studios'
              ? 'border-[#835500] text-[#835500]'
              : 'border-transparent text-[#524534]/60 hover:text-[#524534]'
          }`}
        >
          Studios & Tenants
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'users'
              ? 'border-[#835500] text-[#835500]'
              : 'border-transparent text-[#524534]/60 hover:text-[#524534]'
          }`}
        >
          All Platform Users
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 text-sm font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'analytics'
              ? 'border-[#835500] text-[#835500]'
              : 'border-transparent text-[#524534]/60 hover:text-[#524534]'
          }`}
        >
          Platform Analytics
        </button>
      </div>

      {/* TAB 1: Studios & Tenants */}
      {activeTab === 'studios' && (
        <div className="space-y-6 animate-fade-in">
          {/* Control bar */}
          <div className="bg-white/75 backdrop-blur-md p-5 rounded-2xl border border-[#d7c3ae]/30 shadow-sm">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search studios by name, subdomain, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 pl-10 text-sm outline-none transition-all placeholder:text-[#857462]/60 text-[#201b13]"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#857462]/60 text-lg">
                search
              </span>
            </div>
          </div>

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
      )}

      {/* TAB 2: All Users Directory */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-fade-in">
          {/* Control bar */}
          <div className="bg-white/75 backdrop-blur-md p-5 rounded-2xl border border-[#d7c3ae]/30 shadow-sm">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search users by name, email, or role..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 pl-10 text-sm outline-none transition-all placeholder:text-[#857462]/60 text-[#201b13]"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#857462]/60 text-lg">
                search
              </span>
            </div>
          </div>

          <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-sm">
            <div className="overflow-x-auto">
              {filteredUsers.length === 0 ? (
                <p className="text-sm text-[#524534] py-8 italic text-center">
                  No users found matching filters.
                </p>
              ) : (
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[#d7c3ae]/20 text-xs font-bold text-[#524534] uppercase tracking-wider">
                      <th className="pb-3">User Details</th>
                      <th className="pb-3">Email Address</th>
                      <th className="pb-3">System Role</th>
                      <th className="pb-3">Associated Gym</th>
                      <th className="pb-3">Created At</th>
                      <th className="pb-3 text-right">Impersonation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d7c3ae]/10">
                    {filteredUsers.map((user) => {
                      return (
                        <tr key={user.id} className="hover:bg-[#fdf2e4]/20 transition-colors">
                          <td className="py-4 font-semibold text-[#201b13]">
                            {user.full_name || 'No Profile Name'}
                          </td>
                          <td className="py-4 text-[#524534]">{user.email}</td>
                          <td className="py-4">
                            <span
                              className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase ${
                                user.role === 'Admin'
                                  ? 'bg-[#fdf2e4] text-[#835500] border-[#d7c3ae]/40'
                                  : user.role === 'Manager'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : user.role === 'Trainer'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : 'bg-gray-100 text-gray-700 border-gray-200'
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="py-4 text-[#835500] font-medium text-xs">
                            {user.gym_name ? (
                              <div className="flex flex-col">
                                <span>{user.gym_name}</span>
                                <span className="text-[10px] text-[#857462] font-mono">{user.subdomain}.thinkauric.com</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">None (Platform Admin)</span>
                            )}
                          </td>
                          <td className="py-4 text-xs text-[#857462]">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-4 text-right">
                            <button
                              onClick={() => handleImpersonate(user.email)}
                              disabled={impersonatingEmail === user.email}
                              className="px-3 py-1.5 rounded-full text-[10px] font-bold bg-[#131c2a] text-[#fff8f2] hover:bg-primary transition-all cursor-pointer flex items-center gap-1 ml-auto"
                            >
                              <span className="material-symbols-outlined text-xs">login</span>
                              {impersonatingEmail === user.email ? 'Logging in...' : 'Log in as User'}
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
      )}

      {/* TAB 3: Platform Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-10 animate-fade-in">
          {/* Membership Analytics */}
          <section className="space-y-6">
            <h2 className="font-display text-xl font-bold text-[#835500] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-2xl">insights</span>
              Membership & Subscriber Analytics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-xs">
                <p className="text-[10px] text-[#524534] font-bold uppercase tracking-wider">Active Paid Subs</p>
                <p className="font-display text-2xl font-extrabold text-[#201b13] mt-1">
                  {analytics.membership.totalActiveMembers}
                </p>
                <p className="text-[10px] text-green-600 mt-2 flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px]">trending_up</span>
                  Active membership status
                </p>
              </div>

              <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-xs">
                <p className="text-[10px] text-[#524534] font-bold uppercase tracking-wider">Avg Contract Length</p>
                <p className="font-display text-2xl font-extrabold text-[#201b13] mt-1">
                  {analytics.membership.avgDurationMonths} months
                </p>
                <p className="text-[10px] text-[#857462] mt-2">Average duration on platform</p>
              </div>

              <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-xs">
                <p className="text-[10px] text-[#524534] font-bold uppercase tracking-wider">Plan Churn Rate</p>
                <p className="font-display text-2xl font-extrabold text-red-600 mt-1">
                  {analytics.membership.churnRate}%
                </p>
                <p className="text-[10px] text-red-500 mt-2 flex items-center gap-0.5">
                  Cancelled / total packages ratio
                </p>
              </div>

              <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-xs">
                <p className="text-[10px] text-[#524534] font-bold uppercase tracking-wider">Member Renewal Rate</p>
                <p className="font-display text-2xl font-extrabold text-[#835500] mt-1">
                  {analytics.membership.renewalRate}%
                </p>
                <p className="text-[10px] text-[#857462] mt-2">Recurring renewals ratio</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-xs">
                <p className="text-[10px] text-[#524534] font-bold uppercase tracking-wider mb-4">Membership Plan Breakdown</p>
                <div className="space-y-3">
                  {Object.keys(analytics.membership.planBreakdown).length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No plans subscribed yet.</p>
                  ) : (
                    Object.entries(analytics.membership.planBreakdown).map(([name, count]) => (
                      <div key={name} className="flex justify-between items-center text-xs">
                        <span className="font-medium text-[#201b13]">{name}</span>
                        <span className="font-bold bg-[#fdf2e4] text-[#835500] px-2 py-0.5 rounded border border-[#d7c3ae]/20">
                          {count} users
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-xs flex flex-col justify-between">
                <div>
                  <p className="text-[10px] text-[#524534] font-bold uppercase tracking-wider">Most Popular Tier</p>
                  <p className="font-display text-xl font-black text-[#201b13] mt-2">{analytics.membership.mostActiveTier}</p>
                </div>
                <div className="pt-4 border-t border-[#d7c3ae]/15 mt-4">
                  <p className="text-[10px] text-[#524534] font-bold uppercase tracking-wider">New Sign-Ups (30 days)</p>
                  <p className="text-xl font-bold text-[#835500] mt-1">+{analytics.membership.newMemberships} members</p>
                </div>
              </div>

              <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-xs flex flex-col justify-between">
                <div>
                  <p className="text-[10px] text-[#524534] font-bold uppercase tracking-wider">Inactive Members (15+ Days)</p>
                  <p className="font-display text-3xl font-extrabold text-red-700 mt-2">
                    {analytics.membership.inactiveMembers}
                  </p>
                  <p className="text-[10px] text-[#857462] mt-2">Users without recent check-in scan</p>
                </div>
              </div>
            </div>
          </section>

          {/* Financial Analytics */}
          <section className="space-y-6">
            <h2 className="font-display text-xl font-bold text-[#835500] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-2xl">account_balance</span>
              Financial & Revenue Analytics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-xs">
                <p className="text-[10px] text-[#524534] font-bold uppercase tracking-wider">Lifetime Platform Volume</p>
                <p className="font-display text-2xl font-extrabold text-[#835500] mt-1">
                  ${analytics.financial.lifetimeRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-[#857462] mt-2">Total gross revenue processing</p>
              </div>

              <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-xs">
                <p className="text-[10px] text-[#524534] font-bold uppercase tracking-wider">Customer LTV</p>
                <p className="font-display text-2xl font-extrabold text-[#201b13] mt-1">
                  ${analytics.financial.memberLtv.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-[#857462] mt-2">Average value generated per user</p>
              </div>

              <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-xs">
                <p className="text-[10px] text-[#524534] font-bold uppercase tracking-wider">Annual Run Rate (ARR)</p>
                <p className="font-display text-2xl font-extrabold text-[#201b13] mt-1">
                  ${analytics.financial.arr.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-[#857462] mt-2">Projected ARR from active ARBs</p>
              </div>

              <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-xs">
                <p className="text-[10px] text-[#524534] font-bold uppercase tracking-wider">ARPU</p>
                <p className="font-display text-2xl font-extrabold text-[#201b13] mt-1">
                  ${analytics.financial.arpu.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-[#857462] mt-2">Average revenue per active user</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-xs">
                <p className="text-[10px] text-[#524534] font-bold uppercase tracking-wider mb-4">Revenue by Package Plan</p>
                <div className="space-y-3">
                  {Object.keys(analytics.financial.revenueByPlan).length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No revenue processed yet.</p>
                  ) : (
                    Object.entries(analytics.financial.revenueByPlan).map(([name, sum]) => (
                      <div key={name} className="flex justify-between items-center text-xs">
                        <span className="font-medium text-[#201b13]">{name}</span>
                        <span className="font-bold text-[#835500]">
                          ${sum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-xs flex flex-col justify-between">
                <div>
                  <p className="text-[10px] text-[#524534] font-bold uppercase tracking-wider">Refunds & Chargebacks</p>
                  <p className="font-display text-2xl font-bold text-red-600 mt-2">{analytics.financial.refunds} events</p>
                </div>
                <div className="pt-4 border-t border-[#d7c3ae]/15 mt-4">
                  <p className="text-[10px] text-[#524534] font-bold uppercase tracking-wider">Failed / Declined Payments</p>
                  <p className="text-lg font-bold text-red-600 mt-1">{analytics.financial.failedPayments} declines</p>
                </div>
              </div>

              <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-xs flex flex-col justify-between">
                <div>
                  <p className="text-[10px] text-[#524534] font-bold uppercase tracking-wider">Outstanding Accounts Balance</p>
                  <p className="font-display text-3xl font-extrabold text-[#835500] mt-2">
                    ${analytics.financial.outstandingPayments.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-[#857462] mt-2">Outstanding customer subscription invoices</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
