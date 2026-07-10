'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

interface SidebarProps {
  userEmail: string
  fullName: string
}

export default function Sidebar({ userEmail, fullName }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  const navItems = [
    {
      name: 'Dashboard',
      icon: 'dashboard',
      href: '/dashboard',
    },
    {
      name: 'Class Schedule',
      icon: 'calendar_today',
      href: '/dashboard/schedule',
      disabled: true,
    },
    {
      name: 'Financials',
      icon: 'payments',
      href: '/dashboard/financials',
      disabled: true,
    },
    {
      name: 'Settings',
      icon: 'settings',
      href: '/dashboard/settings',
      disabled: true,
    },
  ]

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-[#131c2a] text-[#fff8f2] p-6 flex flex-col z-50">
      {/* Logo */}
      <div className="mb-12 px-2 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#F5A623] text-3xl">
          fitness_center
        </span>
        <span className="font-display text-2xl font-extrabold tracking-tight text-[#fff8f2]">
          AURIC
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          if (item.disabled) {
            return (
              <div
                key={item.name}
                className="text-[#dae3f6]/40 flex items-center gap-3 px-4 py-3 cursor-not-allowed rounded-full transition-all"
                title="Coming in later milestone"
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-sans text-sm font-semibold">{item.name}</span>
                <span className="text-[10px] bg-[#3e4757]/60 text-[#dae3f6]/80 px-2 py-0.5 rounded-full ml-auto">
                  Lock
                </span>
              </div>
            )
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all group ${
                isActive
                  ? 'bg-[#f5a623] text-[#644000] shadow-[0_0_20px_rgba(245,166,35,0.4)]'
                  : 'text-[#bec7da] hover:bg-[#3e4757] hover:text-[#fff8f2]'
              }`}
            >
              <span className={`material-symbols-outlined`}>{item.icon}</span>
              <span className="font-sans text-sm font-semibold">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="mt-auto pt-6 border-t border-[#dae3f6]/10 space-y-4">
        <div className="px-2 flex flex-col">
          <span className="text-sm font-semibold text-[#fff8f2] truncate">
            {fullName || 'User'}
          </span>
          <span className="text-xs text-[#bec7da] truncate">{userEmail}</span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-[#bec7da] hover:text-[#ba1a1a] flex items-center gap-3 px-4 py-3 rounded-full transition-all hover:bg-[#ba1a1a]/10 group"
        >
          <span className="material-symbols-outlined group-hover:text-[#ba1a1a]">
            logout
          </span>
          <span className="font-sans text-sm font-semibold">Logout</span>
        </button>
      </div>
    </aside>
  )
}
