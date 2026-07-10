'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import CSVImportModal from './CSVImportModal'
import { bulkDeleteMembers } from './actions'

interface UserRecord {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  address: string | null
  role: string
  created_at: string
  member_products?: {
    id: string
    status: string
    products: {
      name: string
    }
  }[]
}

interface MembersClientProps {
  initialUsers: UserRecord[]
  currentUserRole: string
}

export default function MembersClient({ initialUsers, currentUserRole }: MembersClientProps) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'date_desc'>('date_desc')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [showImportModal, setShowImportModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isAdmin = currentUserRole === 'Admin'

  const handleSelectRow = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const handleSelectAll = (filteredUsers: UserRecord[]) => {
    const allFilteredIds = filteredUsers.map((u) => u.id)
    const isAllSelected = allFilteredIds.every((id) => selectedUserIds.includes(id))

    if (isAllSelected) {
      setSelectedUserIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)))
    } else {
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...allFilteredIds])))
    }
  }

  const handleBulkDelete = async () => {
    if (!isAdmin) return
    if (selectedUserIds.length === 0) return

    if (
      !confirm(
        `Are you sure you want to permanently delete these ${selectedUserIds.length} users? This cannot be undone.`
      )
    ) {
      return
    }

    setDeleting(true)
    const res = await bulkDeleteMembers(selectedUserIds)
    if (res?.error) {
      alert('Bulk delete failed: ' + res.error)
    } else {
      setSelectedUserIds([])
      alert('Selected members deleted successfully.')
    }
    setDeleting(false)
  }

  // Filter and Sort logic
  const filteredUsers = initialUsers.filter((user) => {
    // Only search Member roles
    if (user.role !== 'Member') return false

    // Search query
    const query = search.toLowerCase()
    const nameMatch = (user.full_name || '').toLowerCase().includes(query)
    const emailMatch = user.email.toLowerCase().includes(query)
    if (!nameMatch && !emailMatch) return false

    // Status filter
    const activeProducts = user.member_products || []
    const hasActive = activeProducts.some((p) => p.status === 'active')

    if (filterStatus === 'active' && !hasActive) return false
    if (filterStatus === 'inactive' && hasActive) return false

    return true
  })

  // Sort logic
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === 'name_asc') {
      return (a.full_name || '').localeCompare(b.full_name || '')
    }
    if (sortBy === 'name_desc') {
      return (b.full_name || '').localeCompare(a.full_name || '')
    }
    // Default: date joined descending
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const isAllSelected =
    sortedUsers.length > 0 && sortedUsers.every((u) => selectedUserIds.includes(u.id))

  return (
    <div className="space-y-6">
      {/* CSV Modal */}
      {showImportModal && (
        <CSVImportModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            // refresh data handled automatically via Server Actions revalidatePath
          }}
        />
      )}

      {/* Control bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/75 backdrop-blur-md p-5 rounded-2xl border border-[#d7c3ae]/30 shadow-sm">
        <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search members by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 pl-10 text-sm outline-none transition-all placeholder:text-[#857462]/60 text-[#201b13]"
            />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#857462]/60 text-lg">
              search
            </span>
          </div>

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e: any) => setFilterStatus(e.target.value)}
            className="bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 rounded-xl px-4 py-2.5 text-sm outline-none text-[#524534]"
          >
            <option value="all">All Memberships</option>
            <option value="active">Active Members</option>
            <option value="inactive">Inactive Members</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 rounded-xl px-4 py-2.5 text-sm outline-none text-[#524534]"
          >
            <option value="date_desc">Joined (Newest First)</option>
            <option value="name_asc">Name A-Z</option>
            <option value="name_desc">Name Z-A</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 w-full md:w-auto shrink-0 justify-end">
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-[#131c2a] hover:bg-primary text-[#fff8f2] font-semibold px-5 py-2.5 rounded-full text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-sm font-bold">upload_file</span>
            Import CSV
          </button>
        </div>
      </div>

      {/* Bulk action floating bar */}
      {selectedUserIds.length > 0 && isAdmin && (
        <div className="p-4 bg-[#131c2a] text-[#fff8f2] rounded-2xl flex justify-between items-center gap-4 shadow-lg border border-white/10 animate-fade-in">
          <span className="text-xs font-semibold">
            {selectedUserIds.length} members selected
          </span>
          <button
            onClick={handleBulkDelete}
            disabled={deleting}
            className="bg-[#ba1a1a] hover:bg-red-700 text-white font-bold px-4 py-2 rounded-full text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xs">delete</span>
            {deleting ? 'Deleting...' : 'Delete Selected'}
          </button>
        </div>
      )}

      {/* Table grid */}
      <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-sm">
        <div className="overflow-x-auto">
          {sortedUsers.length === 0 ? (
            <p className="text-sm text-[#524534] py-8 italic text-center">
              No members match the query filters.
            </p>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#d7c3ae]/20 text-xs font-bold text-[#524534] uppercase tracking-wider select-none">
                  {isAdmin && (
                    <th className="pb-3 w-10">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={() => handleSelectAll(sortedUsers)}
                        className="rounded text-primary focus:ring-primary border-[#d7c3ae]/50 bg-transparent w-4 h-4 cursor-pointer"
                      />
                    </th>
                  )}
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">Joined</th>
                  <th className="pb-3">Memberships</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d7c3ae]/10">
                {sortedUsers.map((user) => {
                  const isChecked = selectedUserIds.includes(user.id)
                  const activeProducts = (user.member_products || []).filter(
                    (p) => p.status === 'active'
                  )
                  return (
                    <tr
                      key={user.id}
                      className={`group hover:bg-[#fdf2e4]/20 transition-colors ${
                        isChecked ? 'bg-[#fdf2e4]/30' : ''
                      }`}
                    >
                      {isAdmin && (
                        <td className="py-4">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleSelectRow(user.id)}
                            className="rounded text-primary focus:ring-primary border-[#d7c3ae]/50 bg-transparent w-4 h-4 cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="py-4 font-semibold text-[#201b13]">
                        {user.full_name || 'No Name'}
                      </td>
                      <td className="py-4 text-[#524534]">{user.email}</td>
                      <td className="py-4 text-[#524534]">{user.phone || '—'}</td>
                      <td className="py-4 text-xs">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        {activeProducts.length === 0 ? (
                          <span className="text-[10px] text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">
                            No Active Plan
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {activeProducts.map((ap) => (
                              <span
                                key={ap.id}
                                className="text-[10px] text-[#835500] bg-[#f5a623]/10 border border-[#f5a623]/30 px-2 py-0.5 rounded font-bold"
                              >
                                {ap.products?.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        <Link
                          href={`/dashboard/members/${user.id}`}
                          className="text-[#835500] hover:text-primary font-bold transition-all text-xs flex items-center justify-end gap-0.5 hover:gap-1.5"
                        >
                          Details
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
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
