'use client'

import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

interface SidebarProps {
  userEmail: string
  fullName: string
  userRole: 'Admin' | 'Manager' | 'Trainer' | 'Member'
  isSuperAdmin?: boolean
}

type NavItem = {
  name: string
  icon: string
  href: string
  disabled?: boolean
  roles?: string[]
}

const MAIN_ITEMS: NavItem[] = [
  { name: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
  { name: 'Class Schedule', icon: 'calendar_today', href: '/dashboard/schedule' },
  {
    name: 'Financials',
    icon: 'payments',
    href: '/dashboard/financials',
    roles: ['Admin', 'Manager'],
  },
  {
    name: 'Members',
    icon: 'groups',
    href: '/dashboard/members',
    roles: ['Admin', 'Manager'],
  },
  {
    name: 'Check-In Terminal',
    icon: 'barcode_reader',
    href: '/dashboard/checkin',
    roles: ['Admin', 'Manager'],
  },
  { name: 'Billing', icon: 'credit_card', href: '/dashboard/billing', roles: ['Member'] },
  { name: 'Signed Waivers', icon: 'gavel', href: '/dashboard/waivers', roles: ['Member'] },
]

const ACCOUNT_ITEMS: NavItem[] = [
  {
    name: 'Staff Management',
    icon: 'badge',
    href: '/dashboard/settings/users',
    roles: ['Admin', 'Manager'],
  },
  { name: 'Settings', icon: 'settings', href: '/dashboard/settings' },
]

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U'
}

function NavLink({ item, isActive, onNavigate }: { item: NavItem; isActive: boolean; onNavigate?: () => void }) {
  if (item.disabled) {
    return (
      <div
        className="text-slate-600 flex items-center gap-3 px-4 py-2.5 cursor-not-allowed rounded-full"
        title="Coming in a later milestone"
      >
        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
        <span className="text-sm font-semibold">{item.name}</span>
        <span className="text-[9px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full ml-auto uppercase tracking-wide">
          Locked
        </span>
      </div>
    )
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? 'page' : undefined}
      className={`relative flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
        isActive
          ? 'bg-[#f5a623] text-[#644000] shadow-[0_0_15px_rgba(245,166,35,0.25)]'
          : 'text-[#bec7da] hover:bg-[#3e4757] hover:text-[#fff8f2]'
      }`}
    >
      <span
        className="material-symbols-outlined text-[20px]"
        style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
      >
        {item.icon}
      </span>
      <span>{item.name}</span>
    </Link>
  )
}

export default function Sidebar({
  userEmail,
  fullName,
  userRole,
  isSuperAdmin = false,
}: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const accountItems = [...ACCOUNT_ITEMS]
  if (isSuperAdmin) {
    accountItems.push({
      name: 'Platform Console',
      icon: 'admin_panel_settings',
      href: '/dashboard/superadmin',
    })
  }

  const visible = (items: NavItem[]) =>
    items.filter((item) => !item.roles || item.roles.includes(userRole))

  const isItemActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  const sidebarContent = (
    <>
      {/* Logo */}
      <Link href="/dashboard" className="mb-10 px-2 flex items-center gap-2 shrink-0">
        <span className="material-symbols-outlined text-[#F5A623] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          fitness_center
        </span>
        <span className="font-display text-2xl font-extrabold tracking-tight text-[#f5a623] uppercase">
          AURIC
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto space-y-6 pr-1 -mr-1">
        <div className="space-y-1">
          <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2">
            Main
          </p>
          {visible(MAIN_ITEMS).map((item) => (
            <NavLink
              key={item.name}
              item={item}
              isActive={isItemActive(item.href)}
              onNavigate={() => setMobileOpen(false)}
            />
          ))}
        </div>

        <div className="space-y-1">
          <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2">
            Account
          </p>
          {visible(accountItems).map((item) => (
            <NavLink
              key={item.name}
              item={item}
              isActive={isItemActive(item.href)}
              onNavigate={() => setMobileOpen(false)}
            />
          ))}
        </div>
      </nav>

      {/* User Info & Logout */}
      <div className="mt-4 pt-5 border-t border-[#f5a623]/10 space-y-3 shrink-0">
        <div className="px-2 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full bg-gradient-to-br from-[#f5a623] to-[#ff8c5a] text-[#090d16] flex items-center justify-center text-xs font-black shrink-0"
            aria-hidden="true"
          >
            {initials(fullName || userEmail)}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-sm font-semibold text-white truncate block">
              {fullName || 'User'}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-slate-500 truncate">{userEmail}</span>
            </div>
          </div>
          <span className="text-[9px] font-bold bg-[#f5a623]/15 text-[#f5a623] border border-[#f5a623]/30 px-1.5 py-0.5 rounded uppercase leading-none shrink-0">
            {userRole}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-[#bec7da] hover:text-red-400 flex items-center gap-3 px-4 py-2.5 rounded-full transition-all hover:bg-red-500/10 group"
        >
          <span className="material-symbols-outlined text-[20px] group-hover:text-red-400">
            logout
          </span>
          <span className="text-sm font-semibold">Logout</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-[#131c2a] border-b border-white/10 flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#F5A623] text-2xl">fitness_center</span>
          <span className="font-display text-lg font-extrabold text-[#fff8f2] uppercase">AURIC</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="text-white p-2 rounded-full hover:bg-[#1a2536]"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Desktop sidebar (always visible) */}
      <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 bg-[#131c2a] text-[#fff8f2] p-6 flex-col z-30">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar (slide-in drawer) */}
      <aside
        className={`md:hidden h-screen w-72 fixed left-0 top-0 bg-[#131c2a] text-[#fff8f2] p-6 flex flex-col z-50 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        {sidebarContent}
      </aside>

      {/* Spacer so page content isn't hidden behind the fixed sidebar/topbar */}
      <div className="hidden md:block w-64 shrink-0" aria-hidden="true" />
      <div className="md:hidden h-16" aria-hidden="true" />
    </>
  )
}