'use client'

import React, { useState } from 'react'
import { importMembersCSV } from './actions'

interface CSVImportModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function CSVImportModal({ onClose, onSuccess }: CSVImportModalProps) {
  const [csvText, setCsvText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    importCount: number
    skipCount: number
    errors: string[]
  } | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!csvText.trim()) {
      setErrorMsg('Please paste some CSV data first.')
      return
    }

    setLoading(true)
    setErrorMsg(null)
    setResult(null)

    const res = await importMembersCSV(csvText)
    if (res?.error) {
      setErrorMsg(res.error)
    } else if (res) {
      setResult({
        importCount: res.importCount || 0,
        skipCount: res.skipCount || 0,
        errors: res.errors || [],
      })
      onSuccess()
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center z-50 p-4">
      <div className="bg-[#fff8f2] p-8 rounded-2xl max-w-xl w-full border border-[#d7c3ae]/30 shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-on-surface-variant hover:text-[#ba1a1a] cursor-pointer focus:outline-none"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        <h3 className="font-display text-xl font-bold text-[#201b13] mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">upload_file</span>
          CSV Members Import
        </h3>
        <p className="text-xs text-[#524534] mb-6">
          Paste comma-separated rows. Columns must follow this order:
          <code className="block bg-[#fdf2e4] p-2 rounded mt-2 border border-[#d7c3ae]/30 font-mono text-[10px] text-[#835500]">
            full_name, email, phone, address, authorize_net_customer_id
          </code>
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container border border-error/20 rounded-xl text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-error">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {result && (
          <div className="mb-4 p-4 bg-green-50 text-green-800 border border-green-200 rounded-xl text-xs space-y-2">
            <p className="font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-green-600">check_circle</span>
              Batch Processing Completed
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Successfully imported: <strong>{result.importCount} members</strong></li>
              <li>Skipped (emails already exist): <strong>{result.skipCount} members</strong></li>
            </ul>
            {result.errors.length > 0 && (
              <div className="mt-2 pt-2 border-t border-green-200">
                <p className="font-bold text-red-700">Errors encountered:</p>
                <div className="max-h-24 overflow-y-auto text-[10px] text-red-600 font-mono mt-1 space-y-1">
                  {result.errors.map((err, idx) => (
                    <div key={idx}>{err}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleImport} className="flex-1 flex flex-col min-h-[200px] gap-4">
          <textarea
            required
            rows={8}
            placeholder={`Jane Doe, jane@gmail.com, 555-0199, 123 Pine St, IND-9021\nJohn Smith, john@smith.com, 555-0211, 404 Elm St, IND-9022`}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            disabled={loading}
            className="w-full flex-1 bg-white border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl p-4 text-xs outline-none font-mono resize-none"
          />

          <div className="flex gap-3 justify-end pt-2 border-t border-[#d7c3ae]/15">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#131c2a] text-[#fff8f2] hover:bg-primary px-6 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-3.5 h-3.5" />
                  Importing...
                </>
              ) : (
                <>
                  <span>Import Members</span>
                  <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
