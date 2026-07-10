'use client'

import React from 'react'
import Link from 'next/link'

interface MemberDashboardProps {
  fullName: string
  email: string
  userId: string
  activeMembership: {
    id: string
    name: string
    price: number
    payment_model: string
    start_date: string
    status: string
  } | null
  signedWaiversCount: number
}

export default function MemberDashboard({
  fullName,
  email,
  userId,
  activeMembership,
  signedWaiversCount,
}: MemberDashboardProps) {
  // Generate QR Code URL using API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    userId
  )}`

  // Format member ID
  const memberId = `AUR-${userId.slice(0, 4).toUpperCase()}-${userId.slice(userId.length - 4).toUpperCase()}`

  return (
    <main className="flex-1 p-10 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="orb-glow top-[-100px] right-[-100px]" />
      <div className="orb-glow bottom-[-100px] left-[20%]" />

      {/* Top App Bar */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#835500]">
            Welcome back, {fullName}
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Your fitness journey is glowing today.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative p-2 text-on-surface-variant hover:text-primary cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-2xl">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-tertiary rounded-full border border-surface"></span>
          </div>

          <div className="flex items-center gap-3 bg-surface-container-low p-1.5 pr-4 rounded-full border border-outline-variant/30">
            <div className="w-10 h-10 rounded-full bg-[#f5a623] flex items-center justify-center text-white font-bold text-sm shadow-sm select-none">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="font-sans text-xs font-bold leading-none text-[#201b13]">
                {fullName}
              </span>
              <span className="text-[10px] text-on-surface-variant mt-0.5">
                Elite Member
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Membership QR Card (Featured) */}
        <section className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[#131c2a] text-[#fff8f2] p-8 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden aspect-[4/5]">
            {/* Membership Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-[#f5a623] font-sans text-[10px] font-bold uppercase tracking-widest mb-1">
                  Membership Card
                </p>
                <h2 className="font-display text-xl font-bold">
                  {activeMembership?.name || 'No Active Plan'}
                </h2>
              </div>
              <span className="material-symbols-outlined text-[#f5a623]">verified</span>
            </div>

            <div className="relative z-10 bg-white p-4 rounded-xl flex flex-col items-center gap-3 shadow-2xl scale-105 mx-auto">
              <div className="w-44 h-44 bg-[#fff8f2] flex items-center justify-center rounded-lg border border-[#d7c3ae]/30 overflow-hidden">
                <img src={qrCodeUrl} alt="Check-in QR Code" className="w-40 h-40" />
              </div>
              <p className="text-[#131c2a] font-mono text-[10px] font-bold tracking-tighter">
                MEMBER-ID: {memberId}
              </p>
            </div>

            <div className="relative z-10 pt-4 border-t border-white/10 flex justify-between items-end">
              <div className="text-[10px] text-[#bec7da]">
                <p>Status</p>
                <p className={`font-bold capitalize ${activeMembership?.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>
                  {activeMembership?.status || 'Inactive'}
                </p>
              </div>
              <Link
                href="/dashboard/billing"
                className="bg-[#f5a623] hover:opacity-95 text-[#644000] px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
              >
                <span>Manage Plan</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Main Stats & Classes Column */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          {/* Stats Chart Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Activity Stats */}
            <div className="bg-[#ffffff]/70 backdrop-blur-md p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-sans font-bold text-sm text-[#201b13]">Activity Stats</h3>
                <span className="text-[10px] font-bold text-[#857462]">Last 7 Days</span>
              </div>
              <div className="h-32 flex items-end gap-3 select-none">
                <div className="flex-1 bg-[#131c2a] rounded-t-sm" style={{ height: '40%' }}></div>
                <div className="flex-1 bg-[#f5a623] rounded-t-sm" style={{ height: '65%' }}></div>
                <div className="flex-1 bg-[#ff9c85] rounded-t-sm" style={{ height: '45%' }}></div>
                <div className="flex-1 bg-[#131c2a] rounded-t-sm" style={{ height: '85%' }}></div>
                <div className="flex-1 bg-[#f5a623] rounded-t-sm" style={{ height: '60%' }}></div>
                <div className="flex-1 bg-[#ff9c85] rounded-t-sm" style={{ height: '75%' }}></div>
                <div className="flex-1 bg-[#131c2a] rounded-t-sm" style={{ height: '95%' }}></div>
              </div>
              <div className="flex justify-between mt-3 text-[9px] font-bold text-[#857462]/70 uppercase">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>

            {/* Small Stat Cards Stack */}
            <div className="grid grid-rows-2 gap-6">
              <div className="bg-[#ffffff]/70 backdrop-blur-md p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-on-surface-variant text-xs font-semibold">Calories Burned</p>
                  <p className="font-display text-xl font-extrabold text-[#835500] mt-1">
                    1,250 <span className="text-xs font-sans font-normal text-on-surface-variant">kcal</span>
                  </p>
                </div>
                <div className="w-10 h-10 bg-[#fdf2e4] rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    local_fire_department
                  </span>
                </div>
              </div>

              <div className="bg-[#ffffff]/70 backdrop-blur-md p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-on-surface-variant text-xs font-semibold">Total Sessions</p>
                  <p className="font-display text-xl font-extrabold text-[#131c2a] mt-1">
                    4 <span className="text-xs font-sans font-normal text-on-surface-variant">this week</span>
                  </p>
                </div>
                <div className="w-10 h-10 bg-[#dae3f6] rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#131c2a]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    bolt
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Class Card */}
          <div className="bg-[#ffffff]/70 backdrop-blur-md rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden group">
            <div className="flex flex-col md:flex-row h-full">
              <div className="md:w-1/3 relative h-40 md:h-auto overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop')" }}>
                <div className="absolute inset-0 bg-[#131c2a]/20" />
                <div className="absolute top-3 left-3 bg-[#835500] text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                  Upcoming
                </div>
              </div>
              <div className="md:w-2/3 p-6 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-display text-base font-bold text-[#201b13]">Vinyasa Flow Elite</h3>
                    <span className="bg-[#fdf2e4] border border-[#d7c3ae]/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#835500]">
                      60 min
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Experience a dynamic transition between yoga postures, guided by intentional breath.
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-[#d7c3ae]/20 pt-4">
                  <div className="flex gap-4 text-xs text-[#524534]">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-primary">schedule</span>
                      18:30 Today
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-primary">location_on</span>
                      Studio A
                    </span>
                  </div>
                  <button
                    disabled
                    className="bg-[#131c2a]/10 text-gray-500 cursor-not-allowed px-4 py-2 rounded-full text-xs font-semibold"
                  >
                    Booked
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <section className="col-span-12 bg-[#ffffff]/70 backdrop-blur-md p-6 rounded-2xl border border-outline-variant/30 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-lg font-bold text-[#201b13]">Recent Activity</h3>
            <span className="text-xs text-[#835500] font-semibold flex items-center gap-1">
              Onboarding Completed
              <span className="material-symbols-outlined text-xs">verified_user</span>
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/50 border border-outline-variant/10">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 bg-[#ff9c85]/20 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#ae3115] text-lg">gavel</span>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#201b13]">Signed Legal Waiver Agreement</h4>
                  <p className="text-[10px] text-on-surface-variant">Digitally archived via public signup form.</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#524534] bg-[#fdf2e4] px-2 py-0.5 rounded border border-[#d7c3ae]/30">
                Completed
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/50 border border-outline-variant/10">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 bg-[#f5a623]/15 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#835500] text-lg">payments</span>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#201b13]">Initial Membership Invoice</h4>
                  <p className="text-[10px] text-on-surface-variant">Cleared transaction via Authorize.net.</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                Paid
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
