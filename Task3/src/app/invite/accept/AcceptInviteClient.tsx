'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface AcceptInviteClientProps {
  email: string
  role: 'Admin' | 'Manager' | 'Trainer' | 'Member'
  token: string
}

export default function AcceptInviteClient({
  email,
  role,
  token,
}: AcceptInviteClientProps) {
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        setErrorMsg(error.message)
      } else {
        if (data.session) {
          router.refresh()
          router.push('/dashboard')
        } else {
          setSuccessMsg(
            'Activation successful! Please check your email inbox to verify your account.'
          )
        }
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err)
      if (errMsg.toLowerCase().includes('fetch') || errMsg.toLowerCase().includes('failed to fetch')) {
        setErrorMsg('Failed to connect to Supabase. Please check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correctly set in the .env file.')
      } else {
        setErrorMsg(errMsg || 'An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen w-full bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="orb-glow top-[-100px] right-[-100px] md:w-[600px] md:h-[600px]" />
      <div className="orb-glow bottom-[-150px] left-[-150px] md:w-[600px] md:h-[600px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-4xl leading-none">
              fitness_center
            </span>
            <span className="font-display text-3xl font-extrabold text-[#1B2432] tracking-tight">
              AURIC
            </span>
          </div>
          <p className="text-on-surface-variant text-sm font-sans">
            Staff & Staff Invite Activation Portal
          </p>
        </div>

        <div className="glass-card p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          <h2 className="font-display text-2xl font-bold text-[#1B2432] mb-1">
            Accept Invitation
          </h2>
          <p className="text-on-surface-variant text-sm mb-6">
            Complete your profile details to join as an <span className="text-[#835500] font-bold">{role}</span>.
          </p>

          {errorMsg && (
            <div className="mb-4 p-3 bg-error-container text-on-error-container border border-error/20 rounded-xl text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-error">
                error
              </span>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 text-green-800 border border-green-200 rounded-xl text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-green-600">
                check_circle
              </span>
              <span>{successMsg}</span>
            </div>
          )}

          {!successMsg && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1B2432] mb-1.5">
                  Email Address (Invited)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full bg-[#fdf2e4]/10 border border-[#d7c3ae]/30 rounded-xl px-4 py-3 text-sm text-on-surface-variant/80 outline-none cursor-not-allowed"
                  />
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/30 text-xl">
                    lock
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1B2432] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:text-[#857462]/60 text-[#201b13]"
                  />
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-xl">
                    person
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1B2432] mb-1.5">
                  Choose Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:text-[#857462]/60 pr-12 text-[#201b13]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-primary transition-colors focus:outline-none"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1B2432] mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:text-[#857462]/60 pr-12 text-[#201b13]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-primary transition-colors focus:outline-none"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#F5A623] to-[#FF8C5A] hover:opacity-95 active:scale-[0.98] text-white py-3.5 rounded-full font-semibold transition-all shadow-md glow-shadow-gold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Activating Account...' : 'Activate Account'}
                  <span className="material-symbols-outlined text-lg">
                    verified_user
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
