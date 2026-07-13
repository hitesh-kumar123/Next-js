'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { verifyAndCheckIn } from './actions'

interface CheckinLog {
  id: string
  fullName: string
  email: string
  checkedInAt: string
}

interface CheckInClientProps {
  initialCheckins: CheckinLog[]
}

export default function CheckInClient({ initialCheckins }: CheckInClientProps) {
  const [memberInput, setMemberInput] = useState('')
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Last check-in result state
  const [result, setResult] = useState<{
    success: boolean
    memberName?: string
    activePlan?: string
    reason?: string
  } | null>(null)

  // Today's check-ins log state
  const [logs, setLogs] = useState<CheckinLog[]>(initialCheckins)

  const qrScannerRef = useRef<Html5Qrcode | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus input on mount and after checks
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Manage html5-qrcode video scanning
  useEffect(() => {
    if (cameraActive) {
      const scanner = new Html5Qrcode('qr-reader-viewport')
      qrScannerRef.current = scanner

      scanner
        .start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: (width, height) => {
              const min = Math.min(width, height)
              return { width: Math.round(min * 0.7), height: Math.round(min * 0.7) }
            },
          },
          (decodedText) => {
            // Stop scanner on decode, execute check-in, then reset
            setCameraActive(false)
            handleCheckInSubmit(decodedText)
          },
          () => {
            // ignore scan frame errors (verbose logs)
          }
        )
        .catch((err) => {
          console.warn('Webcam QR scanner failed to start:', err)
          if (typeof window !== 'undefined' && !window.isSecureContext) {
            setCameraError('Webcam requires HTTPS or localhost. For mobile testing, use localhost:3000 on the host PC or expose your local server using an HTTPS tunnel (e.g. ngrok).')
          } else {
            setCameraError('Failed to access webcam. Please verify camera permissions in browser settings.')
          }
          setCameraActive(false)
        })

      return () => {
        if (scanner.isScanning) {
          scanner
            .stop()
            .then(() => {
              qrScannerRef.current = null
            })
            .catch((err) => console.error('Failed to stop QR scanner:', err))
        }
      }
    }
  }, [cameraActive])

  const handleCheckInSubmit = async (val: string) => {
    const query = val.trim()
    if (!query) return

    setLoading(true)
    setResult(null)

    try {
      const res = await verifyAndCheckIn(query)
      setResult(res)

      // If eligible, append to local logs list in real-time
      if (res.success) {
        setLogs((prev) => [
          {
            id: Math.random().toString(),
            fullName: res.memberName || 'Member',
            email: query.includes('@') ? query : 'checked-in via ID/QR',
            checkedInAt: new Date().toISOString(),
          },
          ...prev,
        ])
      }
    } catch (err) {
      console.error(err)
      setResult({ success: false, reason: 'Check-in transaction error.' })
    }

    setLoading(false)
    setMemberInput('')
    // Refocus manual input
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleCheckInSubmit(memberInput)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Check-In Controls (7 columns) */}
      <section className="lg:col-span-7 space-y-6">
        {/* Manual barcode input card */}
        <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-sm">
          <h2 className="font-display text-xl font-bold text-[#201b13] mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">barcode_reader</span>
            Check-In Controller
          </h2>
          
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                required
                disabled={loading}
                placeholder="Enter member email, ID (AUR-XXXX-XXXX), or full name..."
                value={memberInput}
                onChange={(e) => setMemberInput(e.target.value)}
                className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-3 pl-12 text-sm outline-none transition-all placeholder:text-[#857462]/60 text-[#201b13] font-sans"
              />
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#857462]/60">
                search
              </span>
            </div>

            <div className="flex gap-3 justify-between items-center">
              <p className="text-[10px] text-[#857462] italic">
                Press <strong>Enter</strong> to check-in (supports barcode gun inputs).
              </p>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#131c2a] text-[#fff8f2] hover:bg-primary px-6 py-2.5 rounded-full text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                {loading ? 'Verifying...' : 'Check In'}
                <span className="material-symbols-outlined text-xs">login</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live checkin result alert (if any) */}
        {result && (
          <div
            className={`p-8 rounded-2xl border text-center shadow-md animate-fade-in ${
              result.success
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <span
                className={`material-symbols-outlined text-5xl ${
                  result.success ? 'text-green-600 animate-bounce' : 'text-red-500'
                }`}
              >
                {result.success ? 'check_circle' : 'cancel'}
              </span>

              <div>
                <h3 className="font-display text-xl font-extrabold tracking-tight">
                  {result.success ? 'ACCESS ELIGIBLE' : 'ACCESS BLOCKED'}
                </h3>
                <p className="text-sm font-semibold mt-1">
                  {result.memberName || 'Unknown Member'}
                </p>
                {result.success ? (
                  <p className="text-xs text-green-700 mt-2 font-mono bg-green-100/50 px-4 py-1.5 rounded-full inline-block">
                    Plan: {result.activePlan}
                  </p>
                ) : (
                  <p className="text-xs text-red-700 mt-2 font-bold bg-red-100/50 px-4 py-1.5 rounded-full inline-block">
                    Reason: {result.reason}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Camera Scanning Port (5 columns) */}
      <section className="lg:col-span-5 space-y-6">
        <div className="bg-[#131c2a] text-[#fff8f2] p-6 rounded-2xl shadow-lg border border-[#d7c3ae]/10 relative overflow-hidden flex flex-col items-center">
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
          
          <h2 className="font-display text-lg font-bold text-[#fff8f2] mb-1 self-start flex items-center gap-2">
            <span className="material-symbols-outlined text-[#F5A623]">qr_code_scanner</span>
            Webcam Scanner
          </h2>
          <p className="text-xs text-[#bec7da] mb-6 self-start">
            Use the front-facing webcam to scan a member's check-in QR code.
          </p>

          <div className="w-full max-w-[280px] aspect-square bg-[#3e4757]/30 border border-[#bec7da]/20 rounded-xl overflow-hidden relative flex items-center justify-center mb-6">
            {cameraActive ? (
              <div id="qr-reader-viewport" className="w-full h-full object-cover" />
            ) : cameraError ? (
              <div className="text-center p-4 space-y-2">
                <span className="material-symbols-outlined text-3xl text-red-400">gpp_maybe</span>
                <p className="text-[10px] text-red-300 font-bold leading-normal px-2">{cameraError}</p>
              </div>
            ) : (
              <div className="text-center p-6 space-y-3">
                <span className="material-symbols-outlined text-4xl text-[#bec7da]/30">videocam_off</span>
                <p className="text-[10px] text-[#bec7da]/50">Camera feed deactivated.</p>
              </div>
            )}
            
            {cameraActive && (
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-red-500 animate-scanner-pulse shadow-[0_0_10px_red]" />
            )}
          </div>

          <button
            onClick={() => {
              setCameraError(null)
              setCameraActive(!cameraActive)
            }}
            className={`w-full py-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              cameraActive
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-md'
                : 'bg-gradient-to-r from-[#F5A623] to-[#FF8C5A] hover:opacity-95 text-[#644000] shadow-md'
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {cameraActive ? 'videocam_off' : 'videocam'}
            </span>
            {cameraActive ? 'Deactivate Scanner' : 'Activate Camera Scanner'}
          </button>
        </div>
      </section>

      {/* History Log (12 columns) */}
      <section className="lg:col-span-12 bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-sm">
        <h2 className="font-display text-lg font-bold text-[#201b13] mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">history</span>
          Today's Check-In Logs
        </h2>

        {logs.length === 0 ? (
          <p className="text-xs text-[#524534] py-6 italic text-center">
            No check-in transactions recorded today yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#d7c3ae]/20 text-[#524534] uppercase font-bold tracking-wider">
                  <th className="pb-3">Time Checked In</th>
                  <th className="pb-3">Member Name</th>
                  <th className="pb-3">Contact Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d7c3ae]/10 text-on-surface">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#fdf2e4]/10 transition-colors">
                    <td className="py-3 font-semibold text-[#201b13]">
                      {new Date(log.checkedInAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3 font-bold text-[#835500]">{log.fullName}</td>
                    <td className="py-3 text-[#524534]">{log.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
