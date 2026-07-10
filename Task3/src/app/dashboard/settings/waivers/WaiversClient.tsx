'use client'

import React, { useState } from 'react'
import { createWaiver } from '../actions'

interface WaiverRecord {
  id: string
  title: string
  content: string
  created_at: string
}

interface WaiversClientProps {
  initialWaivers: WaiverRecord[]
  isAdmin: boolean
}

export default function WaiversClient({
  initialWaivers,
  isAdmin,
}: WaiversClientProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdmin) return
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    const result = await createWaiver(title, content)
    if (result?.error) {
      setErrorMsg(result.error)
    } else {
      setSuccessMsg(`Successfully created waiver: ${title}!`)
      setTitle('')
      setContent('')
    }
    setLoading(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* List of Waivers (2 columns) */}
      <section className={`${isAdmin ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
        <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-sm">
          <h2 className="font-display text-xl font-bold text-[#201b13] mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">description</span>
            Configured Waivers
          </h2>

          {initialWaivers.length === 0 ? (
            <p className="text-sm text-[#524534] py-8 italic text-center">
              No waivers created yet. Create a waiver on the right to start protecting your business.
            </p>
          ) : (
            <div className="space-y-4">
              {initialWaivers.map((waiver) => (
                <details
                  key={waiver.id}
                  className="bg-[#ffffff] p-4 rounded-xl border border-[#d7c3ae]/20 shadow-xs group"
                >
                  <summary className="font-bold text-[#201b13] cursor-pointer flex justify-between items-center outline-none list-none">
                    <span className="flex items-center gap-2 select-none">
                      <span className="material-symbols-outlined text-primary text-xl">gavel</span>
                      {waiver.title}
                    </span>
                    <span className="material-symbols-outlined text-on-surface-variant/50 group-open:rotate-180 transition-transform">
                      expand_more
                    </span>
                  </summary>
                  <div className="mt-4 pt-4 border-t border-[#d7c3ae]/15 text-xs text-[#524534] whitespace-pre-wrap leading-relaxed">
                    {waiver.content}
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Waiver Creator (1 column) - Admin Only */}
      {isAdmin && (
        <section className="space-y-6">
          <div className="bg-[#131c2a] text-[#fff8f2] p-6 rounded-2xl shadow-lg border border-[#d7c3ae]/10 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />

            <h2 className="font-display text-lg font-bold text-[#fff8f2] mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#F5A623]">gavel</span>
              Create Waiver
            </h2>
            <p className="text-xs text-[#bec7da] mb-4 leading-relaxed">
              Write a legal waiver agreements. Support substitution tokens.
            </p>

            {/* Token Cheat Sheet */}
            <div className="bg-[#3e4757]/30 border border-[#bec7da]/10 p-3 rounded-xl mb-6 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#F5A623]">
                Substitution Tokens:
              </p>
              <div className="grid grid-cols-3 text-[10px] font-mono text-[#bec7da]">
                <div><span className="text-[#ff9c85] font-bold">{"{first_name}"}</span></div>
                <div><span className="text-[#ff9c85] font-bold">{"{last_name}"}</span></div>
                <div><span className="text-[#ff9c85] font-bold">{"{date}"}</span></div>
              </div>
              <p className="text-[9px] text-[#bec7da]/70 mt-1 leading-none">
                These will be replaced with real user inputs during sign up.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-950 text-red-200 border border-red-800 rounded-xl text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-red-400">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-green-950 text-green-200 border border-green-800 rounded-xl text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-green-400">check_circle</span>
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#bec7da] mb-1.5">
                  Waiver Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Liability Waiver & Release"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#3e4757]/40 border border-[#bec7da]/20 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-[#fff8f2] placeholder:text-[#bec7da]/40"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#bec7da] mb-1.5">
                  Waiver Content
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder={`I, {first_name} {last_name}, release Auric Gym from all liability on this day of {date}...`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-[#3e4757]/40 border border-[#bec7da]/20 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-[#fff8f2] placeholder:text-[#bec7da]/40 font-sans resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#F5A623] to-[#FF8C5A] hover:opacity-95 active:scale-[0.98] text-[#644000] font-bold py-3.5 rounded-full transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Waiver'}
                  <span className="material-symbols-outlined text-lg font-bold">add</span>
                </button>
              </div>
            </form>
          </div>
        </section>
      )}
    </div>
  )
}
