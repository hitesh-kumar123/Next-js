'use client'

import React, { useState } from 'react'
import { createSignupForm, toggleSignupFormActive, updateGymSettings } from '../actions'

interface ProductRecord {
  id: string
  name: string
  price: number
}

interface WaiverRecord {
  id: string
  title: string
}

interface SignupFormRecord {
  id: string
  title: string
  slug: string
  is_active: boolean
  waiver_id: string | null
  created_at: string
  products?: { id: string; name: string }[]
}

interface FormsClientProps {
  initialForms: SignupFormRecord[]
  products: ProductRecord[]
  waivers: WaiverRecord[]
  subdomain: string | null
  gymName: string | null
  phone: string | null
  address: string | null
  isAdmin: boolean
}

export default function FormsClient({
  initialForms,
  products,
  waivers,
  subdomain: initialSubdomain,
  gymName: initialGymName,
  phone: initialPhone,
  address: initialAddress,
  isAdmin,
}: FormsClientProps) {
  // Gym Settings State
  const [gymSubdomain, setGymSubdomain] = useState(initialSubdomain || '')
  const [gymName, setGymName] = useState(initialGymName || '')
  const [gymPhone, setGymPhone] = useState(initialPhone || '')
  const [gymAddress, setGymAddress] = useState(initialAddress || '')
  const [gymLoading, setGymLoading] = useState(false)
  const [gymSuccess, setGymSuccess] = useState<string | null>(null)
  const [gymError, setGymError] = useState<string | null>(null)

  // Form Creator State
  const [formTitle, setFormTitle] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [selectedWaiverId, setSelectedWaiverId] = useState('')
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [formLoading, setFormLoading] = useState(false)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  // QR Modal State
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [qrTitle, setQrTitle] = useState<string | null>(null)

  const handleUpdateGym = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdmin) return
    setGymLoading(true)
    setGymSuccess(null)
    setGymError(null)

    const result = await updateGymSettings({
      subdomain: gymSubdomain,
      gymName,
      phone: gymPhone,
      address: gymAddress,
    })

    if (result?.error) {
      setGymError(result.error)
    } else {
      setGymSuccess('Gym settings and subdomain updated successfully!')
    }
    setGymLoading(false)
  }

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdmin) return
    setFormLoading(true)
    setFormSuccess(null)
    setFormError(null)

    if (selectedProductIds.length === 0) {
      setFormError('Please select at least one product to display on checkout.')
      setFormLoading(false)
      return
    }

    const result = await createSignupForm(
      formTitle,
      formSlug,
      selectedWaiverId || null,
      selectedProductIds
    )

    if (result?.error) {
      setFormError(result.error)
    } else {
      setFormSuccess(`Successfully created signup form: ${formTitle}!`)
      setFormTitle('')
      setFormSlug('')
      setSelectedWaiverId('')
      setSelectedProductIds([])
    }
    setFormLoading(false)
  }

  const handleToggleActive = async (formId: string, currentVal: boolean) => {
    if (!isAdmin) return
    const result = await toggleSignupFormActive(formId, !currentVal)
    if (result?.error) {
      alert('Failed to update form status: ' + result.error)
    }
  }

  const handleCheckboxChange = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }

  const buildPublicUrl = (slug: string) => {
    if (typeof window === 'undefined') return ''
    const hostParts = window.location.host.split('.')
    let mainDomain = 'thinkauric.com'

    // If running in localhost
    if (hostParts[hostParts.length - 1].includes('localhost')) {
      mainDomain = 'localhost:3000'
    }

    const sub = gymSubdomain || 'yourname'
    return `${window.location.protocol}//${sub}.${mainDomain}/join/${slug}`
  }

  return (
    <div className="space-y-10">
      {/* QR Code Modal Overlay */}
      {qrUrl && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-[#fff8f2] p-8 rounded-2xl max-w-sm w-full text-center border border-[#d7c3ae]/30 shadow-2xl relative">
            <button
              onClick={() => setQrUrl(null)}
              className="absolute right-4 top-4 text-on-surface-variant hover:text-primary cursor-pointer focus:outline-none"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
            <h3 className="font-display text-lg font-bold text-[#201b13] mb-2">{qrTitle}</h3>
            <p className="text-xs text-[#524534] mb-6">Scan QR code to open the public signup page.</p>
            <div className="bg-white p-4 rounded-xl border border-[#d7c3ae]/20 inline-block mb-6 shadow-sm">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`}
                alt="Form QR Code"
                className="w-48 h-48"
              />
            </div>
            <button
              onClick={() => {
                const text = qrUrl
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  navigator.clipboard.writeText(text)
                    .then(() => alert('Signup URL copied!'))
                    .catch(() => {
                      const textArea = document.createElement('textarea')
                      textArea.value = text
                      textArea.style.position = 'fixed'
                      document.body.appendChild(textArea)
                      textArea.focus()
                      textArea.select()
                      document.execCommand('copy')
                      document.body.removeChild(textArea)
                      alert('Signup URL copied!')
                    })
                } else {
                  const textArea = document.createElement('textarea')
                  textArea.value = text
                  textArea.style.position = 'fixed'
                  document.body.appendChild(textArea)
                  textArea.focus()
                  textArea.select()
                  document.execCommand('copy')
                  document.body.removeChild(textArea)
                  alert('Signup URL copied!')
                }
              }}
              className="w-full bg-[#131c2a] text-[#fff8f2] hover:bg-primary py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer"
            >
              Copy Public URL
            </button>
          </div>
        </div>
      )}

      {/* Subdomain & Gym Settings Form */}
      <section className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-sm">
        <h2 className="font-display text-xl font-bold text-[#201b13] mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">domain</span>
          Gym Subdomain & Settings
        </h2>
        <p className="text-xs text-[#524534] mb-6 leading-relaxed">
          Configure the subdomain where your public-facing membership signup forms will be served (e.g. <code>yourname.thinkauric.com</code>).
        </p>

        {gymError && (
          <div className="mb-4 p-4 bg-error-container text-on-error-container border border-error/20 rounded-xl text-sm flex items-center gap-3">
            <span className="material-symbols-outlined text-error">error</span>
            <span>{gymError}</span>
          </div>
        )}

        {gymSuccess && (
          <div className="mb-4 p-4 bg-green-50 text-green-800 border border-green-200 rounded-xl text-sm flex items-center gap-3">
            <span className="material-symbols-outlined text-green-600">check_circle</span>
            <span>{gymSuccess}</span>
          </div>
        )}

        <form onSubmit={handleUpdateGym} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#201b13] mb-1.5">
                Subdomain Prefix
              </label>
              <div className="flex rounded-xl border border-[#d7c3ae]/50 overflow-hidden bg-[#fdf2e4]/20 focus-within:ring-1 focus-within:ring-[#F5A623] focus-within:border-[#F5A623]">
                <input
                  type="text"
                  required
                  disabled={!isAdmin}
                  placeholder="gymname"
                  value={gymSubdomain}
                  onChange={(e) => setGymSubdomain(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-sm bg-transparent outline-none border-none text-[#201b13]"
                />
                <span className="bg-[#fdf2e4]/70 px-4 py-2.5 text-sm text-[#857462] border-l border-[#d7c3ae]/30 select-none">
                  .thinkauric.com
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#201b13] mb-1.5">
                Gym / Studio Name
              </label>
              <input
                type="text"
                required
                disabled={!isAdmin}
                placeholder="Auric Glow Fitness Studio"
                value={gymName}
                onChange={(e) => setGymName(e.target.value)}
                className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-[#201b13]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#201b13] mb-1.5">
                Contact Phone
              </label>
              <input
                type="tel"
                required
                disabled={!isAdmin}
                placeholder="+1 (555) 019-2834"
                value={gymPhone}
                onChange={(e) => setGymPhone(e.target.value)}
                className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-[#201b13]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#201b13] mb-1.5">
                Studio Address
              </label>
              <input
                type="text"
                required
                disabled={!isAdmin}
                placeholder="402 Glowing Light Blvd, Suite B"
                value={gymAddress}
                onChange={(e) => setGymAddress(e.target.value)}
                className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-[#201b13]"
              />
            </div>
          </div>

          {isAdmin && (
            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                disabled={gymLoading}
                className="bg-[#131c2a] hover:bg-primary text-[#fff8f2] font-semibold px-6 py-3 rounded-full text-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {gymLoading ? 'Saving...' : 'Save Gym Settings'}
                <span className="material-symbols-outlined text-base">save</span>
              </button>
            </div>
          )}
        </form>
      </section>

      {/* Forms Listing & Form Creator Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left List of Forms (2 columns) */}
        <section className={`${isAdmin ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
          <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-sm">
            <h2 className="font-display text-xl font-bold text-[#201b13] mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">feed</span>
              Membership Signup Forms
            </h2>

            {initialForms.length === 0 ? (
              <p className="text-sm text-[#524534] py-8 italic text-center">
                No signup forms built yet. Setup one on the right to start onboarding members.
              </p>
            ) : (
              <div className="space-y-4">
                {initialForms.map((form) => {
                  const signupUrl = buildPublicUrl(form.slug)
                  return (
                    <div
                      key={form.id}
                      className="bg-[#ffffff] p-5 rounded-xl border border-[#d7c3ae]/20 shadow-xs flex flex-col md:flex-row justify-between md:items-center gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-[#201b13] text-base leading-tight">
                            {form.title}
                          </h3>
                          <span className="text-[10px] bg-[#fdf2e4] text-[#835500] px-2 py-0.5 rounded-full font-mono border border-[#d7c3ae]/30">
                            /{form.slug}
                          </span>
                        </div>
                        <p className="text-xs text-[#524534]">
                          Waiver: <strong className="text-[#201b13]">
                            {waivers.find((w) => w.id === form.waiver_id)?.title || 'None'}
                          </strong>
                        </p>
                        {signupUrl && (
                          <a
                            href={signupUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#835500] hover:text-primary transition-colors flex items-center gap-1 break-all"
                          >
                            <span className="material-symbols-outlined text-xs">open_in_new</span>
                            {signupUrl}
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-4 self-end md:self-auto shrink-0">
                        {/* QR Code Action */}
                        <button
                          onClick={() => {
                            setQrUrl(signupUrl)
                            setQrTitle(form.title)
                          }}
                          className="text-[#565f6f] hover:bg-[#d7e0f3] border border-[#565f6f]/20 bg-gray-50 p-2 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                          title="Generate QR Code"
                        >
                          <span className="material-symbols-outlined">qr_code</span>
                        </button>

                        {/* Active Toggle Switch */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#524534]">
                            {form.is_active ? 'Active' : 'Paused'}
                          </span>
                          <button
                            disabled={!isAdmin}
                            onClick={() => handleToggleActive(form.id, form.is_active)}
                            className={`w-11 h-6 rounded-full p-0.5 transition-colors relative cursor-pointer outline-none ${
                              form.is_active ? 'bg-[#f5a623]' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform block ${
                                form.is_active ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* Signup Form Creator Form (1 column) - Admin Only */}
        {isAdmin && (
          <section className="space-y-6">
            <div className="bg-[#131c2a] text-[#fff8f2] p-6 rounded-2xl shadow-lg border border-[#d7c3ae]/10 relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />

              <h2 className="font-display text-lg font-bold text-[#fff8f2] mb-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#F5A623]">pageview</span>
                Create Signup Form
              </h2>
              <p className="text-xs text-[#bec7da] mb-6 leading-relaxed">
                Build a new membership onboarding page by attaching products and legal waivers.
              </p>

              {formError && (
                <div className="mb-4 p-3 bg-red-950 text-red-200 border border-red-800 rounded-xl text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-red-400">error</span>
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="mb-4 p-3 bg-green-950 text-green-200 border border-green-800 rounded-xl text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-green-400">check_circle</span>
                  <span>{formSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreateForm} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#bec7da] mb-1.5">
                    Form Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., General Public Enrollment"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-[#3e4757]/40 border border-[#bec7da]/20 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-[#fff8f2] placeholder:text-[#bec7da]/40"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#bec7da] mb-1.5">
                    Form URL Slug
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., summer-enroll"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full bg-[#3e4757]/40 border border-[#bec7da]/20 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-[#fff8f2] placeholder:text-[#bec7da]/40 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#bec7da] mb-1.5">
                    Select Legal Waiver
                  </label>
                  <select
                    value={selectedWaiverId}
                    onChange={(e) => setSelectedWaiverId(e.target.value)}
                    className="w-full bg-[#3e4757]/40 border border-[#bec7da]/20 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-[#fff8f2]"
                  >
                    <option value="">No Waiver (Not Recommended)</option>
                    {waivers.map((w) => (
                      <option className="bg-[#131c2a]" key={w.id} value={w.id}>
                        {w.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#bec7da] mb-1.5">
                    Select Products Offered
                  </label>
                  <div className="bg-[#3e4757]/30 border border-[#bec7da]/10 p-3 rounded-xl max-h-40 overflow-y-auto space-y-2">
                    {products.length === 0 ? (
                      <p className="text-xs text-[#bec7da]/50 italic">No products available.</p>
                    ) : (
                      products.map((product) => (
                        <label key={product.id} className="flex items-center gap-2 text-xs cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={selectedProductIds.includes(product.id)}
                            onChange={() => handleCheckboxChange(product.id)}
                            className="rounded text-primary focus:ring-primary border-[#bec7da]/30 bg-transparent w-4 h-4 cursor-pointer"
                          />
                          <span>
                            {product.name} (${product.price.toFixed(2)})
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full bg-gradient-to-r from-[#F5A623] to-[#FF8C5A] hover:opacity-95 active:scale-[0.98] text-[#644000] font-bold py-3.5 rounded-full transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {formLoading ? 'Creating...' : 'Create Form'}
                    <span className="material-symbols-outlined text-lg font-bold">add</span>
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
