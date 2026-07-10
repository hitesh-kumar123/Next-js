import React from 'react'

export default function GymSuspendedNoticePage() {
  return (
    <main className="min-h-screen w-full bg-[#fbf7f0] flex flex-col justify-center items-center p-6 selection:bg-[#ff9c85]/20">
      {/* Glow Orbs */}
      <div className="orb-glow top-[-100px] right-[-100px] w-96 h-96 opacity-60" />
      <div className="orb-glow bottom-[-100px] left-[20%] w-96 h-96 opacity-60" />

      <div className="bg-white/70 backdrop-blur-md p-10 rounded-2xl max-w-md w-full border border-[#d7c3ae]/30 shadow-2xl text-center space-y-6 relative z-10">
        <span className="material-symbols-outlined text-[#ae3115] text-6xl select-none animate-pulse">
          lock_person
        </span>
        
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-black text-[#1b2432] uppercase tracking-tight">
            Account Suspended
          </h1>
          <p className="text-xs text-[#524534] leading-relaxed">
            This studio subdomain has been temporarily suspended by the platform administrator. Access to online registrations, schedules, and checkouts is disabled.
          </p>
        </div>

        <div className="pt-4 border-t border-[#d7c3ae]/25 text-[10px] text-[#857462]">
          If you are the owner, please contact platform support for verification.
        </div>
      </div>
    </main>
  )
}
