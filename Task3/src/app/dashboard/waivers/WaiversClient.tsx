'use client'

import React, { useState } from 'react'

interface AgreementRecord {
  id: string
  signed_content: string
  signed_at: string
  ip_address: string | null
  waivers: {
    title: string
  }
}

interface WaiversClientProps {
  agreements: AgreementRecord[]
}

export default function WaiversClient({ agreements }: WaiversClientProps) {
  const [selectedWaiverText, setSelectedWaiverText] = useState<string | null>(null)
  const [selectedWaiverTitle, setSelectedWaiverTitle] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {/* Signature Modal */}
      {selectedWaiverText && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-[#fff8f2] p-8 rounded-2xl max-w-2xl w-full border border-[#d7c3ae]/30 shadow-2xl relative flex flex-col max-h-[80vh]">
            <button
              onClick={() => {
                setSelectedWaiverText(null)
                setSelectedWaiverTitle(null)
              }}
              className="absolute right-4 top-4 text-on-surface-variant hover:text-primary cursor-pointer focus:outline-none"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
            <h3 className="font-display text-lg font-bold text-[#201b13] mb-4">
              {selectedWaiverTitle}
            </h3>
            <div className="bg-white p-4 rounded-xl border border-[#d7c3ae]/20 overflow-y-auto text-xs text-[#524534] whitespace-pre-wrap leading-relaxed flex-1">
              {selectedWaiverText}
            </div>
            <div className="pt-4 border-t border-[#d7c3ae]/15 mt-4 text-[10px] text-[#857462] flex justify-between">
              <span>IP Logged: {agreements[0]?.ip_address || 'N/A'}</span>
              <span>Signed At: {new Date(agreements[0]?.signed_at || '').toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-sm">
        <h2 className="font-display text-xl font-bold text-[#201b13] mb-4">Your Signed Waivers</h2>

        {agreements.length === 0 ? (
          <p className="text-sm text-[#524534] py-8 italic text-center">
            No signed waivers found.
          </p>
        ) : (
          <div className="space-y-4">
            {agreements.map((agreement) => (
              <div
                key={agreement.id}
                className="bg-[#ffffff] p-4 rounded-xl border border-[#d7c3ae]/20 shadow-xs flex justify-between items-center"
              >
                <div>
                  <h3 className="font-bold text-[#201b13] text-sm">
                    {agreement.waivers?.title || 'Waiver Agreement'}
                  </h3>
                  <p className="text-[10px] text-[#857462] mt-1">
                    Signed on {new Date(agreement.signed_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedWaiverText(agreement.signed_content)
                    setSelectedWaiverTitle(agreement.waivers?.title || 'Waiver Content')
                  }}
                  className="bg-[#131c2a] text-[#fff8f2] hover:bg-primary px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">visibility</span>
                  View Document
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
