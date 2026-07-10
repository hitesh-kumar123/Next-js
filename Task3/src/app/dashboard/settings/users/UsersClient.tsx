'use client'

import React, { useState } from 'react'
import { inviteUser, revokeInvite, removeUser } from './actions'

interface UserRecord {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'Admin' | 'Manager' | 'Trainer' | 'Member'
  created_at: string
}

interface InviteRecord {
  id: string
  email: string
  role: 'Admin' | 'Manager' | 'Trainer' | 'Member'
  token: string
  status: string
  expires_at: string
  created_at: string
}

interface UsersClientProps {
  currentUserId: string
  currentUserRole: 'Admin' | 'Manager' | 'Trainer' | 'Member'
  initialUsers: UserRecord[]
  initialInvites: InviteRecord[]
}

export default function UsersClient({
  currentUserId,
  currentUserRole,
  initialUsers,
  initialInvites,
}: UsersClientProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'Admin' | 'Manager' | 'Trainer'>('Trainer')
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)

  const isAdmin = currentUserRole === 'Admin'

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdmin) return
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)
    setGeneratedLink(null)

    const result = await inviteUser(email, role)
    if (result?.error) {
      setErrorMsg(result.error)
    } else if (result?.token) {
      const origin = window.location.origin
      const inviteUrl = `${origin}/invite/accept?token=${result.token}`
      setGeneratedLink(inviteUrl)
      setSuccessMsg(`Successfully created invitation for ${email}!`)
      setEmail('')
    }
    setLoading(false)
  }

  const handleRevoke = async (inviteId: string) => {
    if (!isAdmin) return
    setActionLoading(`revoke-${inviteId}`)
    setErrorMsg(null)
    setSuccessMsg(null)

    const result = await revokeInvite(inviteId)
    if (result?.error) {
      setErrorMsg(result.error)
    } else {
      setSuccessMsg('Invitation revoked successfully.')
    }
    setActionLoading(null)
  }

  const handleRemoveUser = async (userId: string) => {
    if (!isAdmin) return
    if (userId === currentUserId) {
      setErrorMsg("You cannot remove your own admin account.")
      return
    }

    if (!confirm('Are you sure you want to remove this user? This action cannot be undone.')) {
      return
    }

    setActionLoading(`remove-${userId}`)
    setErrorMsg(null)
    setSuccessMsg(null)

    const result = await removeUser(userId)
    if (result?.error) {
      setErrorMsg(result.error)
    } else {
      setSuccessMsg('User removed successfully.')
    }
    setActionLoading(null)
  }

  const getRoleBadgeClass = (roleName: string) => {
    switch (roleName) {
      case 'Admin':
        return 'bg-[#f5a623]/10 text-[#835500] border-[#f5a623]/30'
      case 'Manager':
        return 'bg-[#d7e0f3] text-[#565f6f] border-[#565f6f]/20'
      case 'Trainer':
        return 'bg-[#ff9c85]/10 text-[#ae3115] border-[#ff9c85]/20'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link)
    alert('Invite link copied to clipboard!')
  }

  return (
    <div className="space-y-10">
      {/* Alert Banners */}
      {errorMsg && (
        <div className="p-4 bg-error-container text-on-error-container border border-error/20 rounded-2xl text-sm flex items-center gap-3">
          <span className="material-symbols-outlined text-error">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-green-50 text-green-800 border border-green-200 rounded-2xl text-sm flex items-center gap-3">
          <span className="material-symbols-outlined text-green-600">check_circle</span>
          <div>
            <p className="font-bold">{successMsg}</p>
            {generatedLink && (
              <div className="mt-2 flex items-center gap-2 bg-white/70 p-2 rounded-lg border border-green-200">
                <span className="font-mono text-xs text-green-900 break-all select-all flex-1">
                  {generatedLink}
                </span>
                <button
                  onClick={() => handleCopyLink(generatedLink)}
                  className="bg-[#131c2a] text-[#fff8f2] hover:bg-[#835500] text-xs px-3 py-1.5 rounded-md font-semibold transition-all shrink-0 cursor-pointer"
                >
                  Copy Link
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: List of Staff / Users */}
        <section className={`${isAdmin ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
          <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-sm">
            <h2 className="font-display text-xl font-bold text-[#201b13] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">groups</span>
              Active Staff & Users
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#d7c3ae]/20 text-xs font-bold text-[#524534] uppercase tracking-wider">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Role</th>
                    {isAdmin && <th className="pb-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d7c3ae]/10 text-sm">
                  {initialUsers.map((user) => (
                    <tr key={user.id} className="group hover:bg-[#fdf2e4]/20 transition-colors">
                      <td className="py-4 font-semibold text-[#201b13]">
                        {user.full_name || 'No name'}
                        {user.id === currentUserId && (
                          <span className="ml-2 text-[10px] bg-[#131c2a] text-white px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-[#524534]">{user.email}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRoleBadgeClass(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="py-4 text-right">
                          {user.id !== currentUserId && (
                            <button
                              onClick={() => handleRemoveUser(user.id)}
                              disabled={actionLoading === `remove-${user.id}`}
                              className="text-[#ba1a1a] hover:bg-[#ba1a1a]/10 px-3 py-1.5 rounded-full text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                            >
                              {actionLoading === `remove-${user.id}` ? 'Removing...' : 'Remove'}
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Invites List */}
          <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-sm">
            <h2 className="font-display text-xl font-bold text-[#201b13] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">mail</span>
              Pending Invitations
            </h2>

            {initialInvites.length === 0 ? (
              <p className="text-sm text-[#524534] py-4 italic">No pending invites.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#d7c3ae]/20 text-xs font-bold text-[#524534] uppercase tracking-wider">
                      <th className="pb-3">Email</th>
                      <th className="pb-3">Role</th>
                      <th className="pb-3">Expires At</th>
                      {isAdmin && <th className="pb-3 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d7c3ae]/10 text-sm">
                    {initialInvites.map((invite) => {
                      const isExpired = new Date(invite.expires_at) < new Date()
                      const inviteUrl = typeof window !== 'undefined' ? `${window.location.origin}/invite/accept?token=${invite.token}` : ''
                      return (
                        <tr key={invite.id} className="hover:bg-[#fdf2e4]/20 transition-colors">
                          <td className="py-4 text-[#201b13]">
                            {invite.email}
                            {isExpired && (
                              <span className="ml-2 text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                Expired
                              </span>
                            )}
                          </td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRoleBadgeClass(invite.role)}`}>
                              {invite.role}
                            </span>
                          </td>
                          <td className="py-4 text-xs text-[#524534]">
                            {new Date(invite.expires_at).toLocaleDateString()}
                          </td>
                          {isAdmin && (
                            <td className="py-4 text-right space-x-2">
                              {!isExpired && (
                                <button
                                  onClick={() => handleCopyLink(inviteUrl)}
                                  className="text-[#835500] hover:bg-[#fdf2e4] px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer"
                                >
                                  Copy Link
                                </button>
                              )}
                              <button
                                onClick={() => handleRevoke(invite.id)}
                                disabled={actionLoading === `revoke-${invite.id}`}
                                className="text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-full text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                              >
                                {actionLoading === `revoke-${invite.id}` ? 'Revoking...' : 'Revoke'}
                              </button>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Invite Form - Only visible to Admin */}
        {isAdmin && (
          <section className="space-y-6">
            <div className="bg-[#131c2a] text-[#fff8f2] p-6 rounded-2xl shadow-lg border border-[#d7c3ae]/10 relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
              
              <h2 className="font-display text-lg font-bold text-[#fff8f2] mb-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#F5A623]">person_add</span>
                Invite Staff
              </h2>
              <p className="text-xs text-[#bec7da] mb-6 leading-relaxed">
                Send an invitation to a new staff member. They will receive a link to register and activate their account with their assigned role.
              </p>

              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#bec7da] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="staff@gym.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#3e4757]/40 border border-[#bec7da]/20 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:text-[#bec7da]/40 text-[#fff8f2]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#bec7da] mb-1.5">
                    Assigned Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-[#3e4757]/40 border border-[#bec7da]/20 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-3 text-sm outline-none transition-all text-[#fff8f2]"
                  >
                    <option className="bg-[#131c2a]" value="Trainer">Trainer (Calendar & Settings)</option>
                    <option className="bg-[#131c2a]" value="Manager">Manager (Full View, No Invites)</option>
                    <option className="bg-[#131c2a]" value="Admin">Admin (Full Access & Invites)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#F5A623] to-[#FF8C5A] hover:opacity-95 active:scale-[0.98] text-[#644000] font-bold py-3.5 rounded-full transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Generating Link...' : 'Create Invite Link'}
                    <span className="material-symbols-outlined text-lg">link</span>
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
