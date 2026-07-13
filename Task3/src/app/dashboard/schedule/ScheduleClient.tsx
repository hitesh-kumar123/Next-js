'use client'

import React, { useState } from 'react'
import { createClass, deleteClass, bookClass, cancelBooking } from './actions'

interface ClassRecord {
  id: string
  name: string
  description: string | null
  instructor: string
  location: string
  category: string
  start_time: string
  duration_minutes: number
  capacity: number
  bookings_count: number
}
interface TrainerRecord {
  id: string
  full_name: string | null
  email: string
}

interface ScheduleClientProps {
  initialClasses: ClassRecord[]
  initialBookedIds: string[]
  userRole: 'Admin' | 'Manager' | 'Trainer' | 'Member'
  currentUserFullName: string
  trainers: TrainerRecord[]
}

export default function ScheduleClient({
  initialClasses,
  initialBookedIds,
  userRole,
  currentUserFullName,
  trainers,
}: ScheduleClientProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null) // Format: YYYY-MM-DD
  const [bookedIds, setBookedIds] = useState<string[]>(initialBookedIds)
  const [filterMyClasses, setFilterMyClasses] = useState(false) // Trainer filter

  // Add Class Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [newClassDesc, setNewClassDesc] = useState('')
  const [newClassInstructor, setNewClassInstructor] = useState('')
  const [newClassLocation, setNewClassLocation] = useState('')
  const [newClassCategory, setNewClassCategory] = useState('Yoga')
  const [newClassStartTime, setNewClassStartTime] = useState('')
  const [newClassDuration, setNewClassDuration] = useState('60')
  const [newClassCapacity, setNewClassCapacity] = useState('20')

  // Feedback states
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const isStaff = userRole === 'Admin' || userRole === 'Manager' || userRole === 'Trainer'

  // Generate date list (Today and next 6 days)
  const getDates = () => {
    const list = []
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() + i)
      const dayName = days[d.getDay()]
      const dayNum = d.getDate()
      const dateString = d.toISOString().split('T')[0] // YYYY-MM-DD
      list.push({ dayName, dayNum, dateString })
    }
    return list
  }
  const dateSliderList = getDates()

  // Actions
  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isStaff) return
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    const res = await createClass({
      name: newClassName,
      description: newClassDesc,
      instructor: newClassInstructor,
      location: newClassLocation,
      category: newClassCategory,
      startTime: new Date(newClassStartTime).toISOString(),
      durationMinutes: parseInt(newClassDuration),
      capacity: parseInt(newClassCapacity),
    })

    if (res?.error) {
      setErrorMsg(res.error)
    } else {
      setSuccessMsg('Successfully created class!')
      setShowAddModal(false)
      // Clear inputs
      setNewClassName('')
      setNewClassDesc('')
      setNewClassInstructor('')
      setNewClassLocation('')
      setNewClassCategory('Yoga')
      setNewClassStartTime('')
      setNewClassDuration('60')
      setNewClassCapacity('20')
    }
    setLoading(false)
  }

  const handleDeleteClass = async (classId: string) => {
    if (!isStaff) return
    if (!confirm('Are you sure you want to permanently delete this class?')) return
    setErrorMsg(null)
    setSuccessMsg(null)

    const res = await deleteClass(classId)
    if (res?.error) {
      setErrorMsg(res.error)
    } else {
      setSuccessMsg('Successfully deleted class.')
    }
  }

  const handleBookSpot = async (classId: string) => {
    if (userRole !== 'Member') return
    setErrorMsg(null)
    setSuccessMsg(null)

    const res = await bookClass(classId)
    if (res?.error) {
      setErrorMsg(res.error)
    } else {
      setBookedIds((prev) => [...prev, classId])
      setSuccessMsg('Spot booked successfully! Enjoy your workout.')
    }
  }

  const handleCancelBooking = async (classId: string) => {
    if (userRole !== 'Member') return
    if (!confirm('Cancel your booking for this class?')) return
    setErrorMsg(null)
    setSuccessMsg(null)

    const res = await cancelBooking(classId)
    if (res?.error) {
      setErrorMsg(res.error)
    } else {
      setBookedIds((prev) => prev.filter((id) => id !== classId))
      setSuccessMsg('Booking cancelled successfully.')
    }
  }

  // Filter logic
  const filteredClasses = initialClasses.filter((c) => {
    // Trainer: My classes filter
    if (userRole === 'Trainer' && filterMyClasses && c.instructor !== currentUserFullName) return false

    // Category pill filter
    if (selectedCategory !== 'All' && c.category !== selectedCategory) return false

    // Search query filter
    const query = search.toLowerCase()
    const nameMatch = c.name.toLowerCase().includes(query)
    const instMatch = c.instructor.toLowerCase().includes(query)
    if (!nameMatch && !instMatch) return false

    // Date Slider filter
    if (selectedDateStr) {
      const classDateStr = c.start_time.split('T')[0]
      if (classDateStr !== selectedDateStr) return false
    }

    return true
  })

  return (
    <div className="space-y-8">
      {/* Feedback Messages */}
      {errorMsg && (
        <div className="p-4 bg-error-container text-on-error-container border border-error/20 rounded-2xl text-sm flex items-center gap-3">
          <span className="material-symbols-outlined text-error">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-green-50 text-green-800 border border-green-200 rounded-2xl text-sm flex items-center gap-3">
          <span className="material-symbols-outlined text-green-600">check_circle</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Add Class Modal (Staff only) */}
      {showAddModal && isStaff && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-[#fff8f2] p-8 rounded-2xl max-w-md w-full border border-[#d7c3ae]/30 shadow-2xl relative flex flex-col">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 text-on-surface-variant hover:text-[#ba1a1a] cursor-pointer"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
            <h3 className="font-display text-xl font-bold text-[#201b13] mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">add_circle</span>
              Schedule New Class
            </h3>

            <form onSubmit={handleAddClass} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#201b13] mb-1">
                  Class Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HIIT Power Burn"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2 text-xs outline-none text-[#201b13]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#201b13] mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Class description..."
                  value={newClassDesc}
                  onChange={(e) => setNewClassDesc(e.target.value)}
                  className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2 text-xs outline-none text-[#201b13] resize-none"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#201b13] mb-1">
                    Instructor (Staff)
                  </label>
                  <select
                    required
                    value={newClassInstructor}
                    onChange={(e) => setNewClassInstructor(e.target.value)}
                    className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] rounded-xl px-4 py-2 text-xs outline-none text-[#201b13] bg-white"
                  >
                    <option value="">Select Trainer...</option>
                    {trainers.map((t) => (
                      <option className="bg-[#fff8f2] text-[#201b13]" key={t.id} value={t.full_name || ''}>
                        {t.full_name || t.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#201b13] mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Studio Room A"
                    value={newClassLocation}
                    onChange={(e) => setNewClassLocation(e.target.value)}
                    className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] rounded-xl px-4 py-2 text-xs outline-none text-[#201b13]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#201b13] mb-1">
                    Category
                  </label>
                  <select
                    value={newClassCategory}
                    onChange={(e) => setNewClassCategory(e.target.value)}
                    className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] rounded-xl px-4 py-2 text-xs outline-none text-[#201b13]"
                  >
                    <option value="Yoga">Yoga</option>
                    <option value="HIIT">HIIT</option>
                    <option value="Pilates">Pilates</option>
                    <option value="Strength">Strength</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#201b13] mb-1">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newClassStartTime}
                    onChange={(e) => setNewClassStartTime(e.target.value)}
                    className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] rounded-xl px-4 py-2 text-xs outline-none text-[#201b13]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#201b13] mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    required
                    value={newClassDuration}
                    onChange={(e) => setNewClassDuration(e.target.value)}
                    className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] rounded-xl px-4 py-2 text-xs outline-none text-[#201b13]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#201b13] mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    required
                    value={newClassCapacity}
                    onChange={(e) => setNewClassCapacity(e.target.value)}
                    className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] rounded-xl px-4 py-2 text-xs outline-none text-[#201b13]"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-[#d7c3ae]/20">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-gray-500 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#131c2a] text-[#fff8f2] hover:bg-primary px-6 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search and Category filters */}
      <div className="flex flex-col gap-6 bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-[#d7c3ae]/30 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search classes by name or instructor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#fdf2e4]/40 border border-[#d7c3ae]/50 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl px-4 py-2.5 pl-10 text-sm outline-none transition-all placeholder:text-[#857462]/60 text-[#201b13]"
            />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#857462]/60 text-lg">
              search
            </span>
          </div>

          {isStaff && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#131c2a] hover:bg-primary text-[#fff8f2] font-semibold px-5 py-2.5 rounded-full text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 self-end md:self-auto"
            >
              <span className="material-symbols-outlined text-sm font-bold">add</span>
              Add New Class
            </button>
          )}
        </div>

        {/* Category Pills (Yoga, HIIT, Pilates, Strength) */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#d7c3ae]/15 justify-between items-center w-full">
          <div className="flex flex-wrap gap-2">
            {['All', 'Yoga', 'HIIT', 'Pilates', 'Strength'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#131c2a] text-[#fff8f2]'
                    : 'bg-[#fdf2e4]/40 text-[#524534] border border-[#d7c3ae]/30 hover:bg-[#fdf2e4]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {userRole === 'Trainer' && (
            <button
              onClick={() => setFilterMyClasses(!filterMyClasses)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                filterMyClasses
                  ? 'bg-[#f5a623] text-[#644000] border-[#f5a623] shadow-xs'
                  : 'bg-white/50 text-[#524534] border-[#d7c3ae]/30 hover:bg-[#fdf2e4]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">filter_list</span>
              Show My Classes Only
            </button>
          )}
        </div>
      </div>

      {/* Date Slider Selector */}
      <section className="bg-white/75 backdrop-blur-md p-5 rounded-2xl border border-[#d7c3ae]/30 shadow-sm flex items-center justify-between gap-4 overflow-x-auto select-none">
        <button
          onClick={() => setSelectedDateStr(null)}
          className={`shrink-0 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center border ${
            selectedDateStr === null
              ? 'bg-[#f5a623]/20 border-[#f5a623] text-[#835500]'
              : 'border-[#d7c3ae]/30 hover:bg-[#fdf2e4]/30'
          }`}
        >
          <span>All</span>
          <span>Days</span>
        </button>

        <div className="flex-1 flex justify-between gap-3 min-w-[400px]">
          {dateSliderList.map((item) => {
            const isSelected = selectedDateStr === item.dateString
            return (
              <button
                key={item.dateString}
                onClick={() => setSelectedDateStr(item.dateString)}
                className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center border ${
                  isSelected
                    ? 'bg-[#f5a623]/25 border-[#f5a623] text-[#835500] font-extrabold shadow-xs scale-102'
                    : 'border-[#d7c3ae]/20 bg-white/50 hover:bg-[#fdf2e4]/30'
                }`}
              >
                <span className="text-[10px] uppercase font-semibold text-on-surface-variant/80">{item.dayName}</span>
                <span className="text-sm font-bold mt-0.5">{item.dayNum}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Class Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.length === 0 ? (
          <div className="col-span-full bg-white/70 backdrop-blur-md p-12 text-center rounded-2xl border border-[#d7c3ae]/30">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3">event_busy</span>
            <p className="text-sm text-[#524534] italic">No classes scheduled matching your search filters.</p>
          </div>
        ) : (
          filteredClasses.map((cls) => {
            const isBooked = bookedIds.includes(cls.id)
            const remainingSlots = cls.capacity - cls.bookings_count
            const isFull = remainingSlots <= 0
            const classTime = new Date(cls.start_time)

            return (
              <div
                key={cls.id}
                className="bg-white/75 backdrop-blur-md rounded-2xl border border-[#d7c3ae]/30 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
              >
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold uppercase tracking-widest bg-[#fdf2e4] text-[#835500] px-2.5 py-0.5 rounded-full border border-[#d7c3ae]/30">
                      {cls.category}
                    </span>
                    <span className="text-[10px] text-[#857462] flex items-center gap-1 font-semibold">
                      <span className="material-symbols-outlined text-xs">schedule</span>
                      {cls.duration_minutes} min
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-base text-[#201b13]">{cls.name}</h3>
                    {cls.description && (
                      <p className="text-xs text-[#524534] mt-1.5 leading-relaxed line-clamp-2">
                        {cls.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#d7c3ae]/15 grid grid-cols-2 gap-2 text-xs text-[#524534]">
                    <div>
                      <p className="text-[10px] text-[#857462] font-semibold">Instructor</p>
                      <p className="font-bold text-[#201b13] mt-0.5">{cls.instructor}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#857462] font-semibold">Location</p>
                      <p className="font-bold text-[#201b13] mt-0.5">{cls.location}</p>
                    </div>
                    <div className="col-span-2 pt-2">
                      <p className="text-[10px] text-[#857462] font-semibold">Start Time</p>
                      <p className="font-bold text-[#835500] mt-0.5">
                        {classTime.toLocaleDateString()} at {classTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#fdf2e4]/30 px-6 py-4 border-t border-[#d7c3ae]/25 flex justify-between items-center">
                  <div className="text-[10px] text-[#524534]">
                    <span className="font-extrabold text-[#835500]">{Math.max(0, remainingSlots)}</span> / {cls.capacity} spots left
                  </div>

                  {isStaff ? (
                    <button
                      onClick={() => handleDeleteClass(cls.id)}
                      className="text-[#ba1a1a] hover:bg-[#ba1a1a]/10 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-0.5"
                    >
                      <span className="material-symbols-outlined text-xs">delete</span>
                      Remove
                    </button>
                  ) : userRole === 'Member' ? (
                    isBooked ? (
                      <button
                        onClick={() => handleCancelBooking(cls.id)}
                        className="bg-[#131c2a] text-[#fff8f2] hover:bg-red-700 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        Booked
                      </button>
                    ) : isFull ? (
                      <button
                        disabled
                        className="bg-gray-200 text-gray-400 px-4 py-2 rounded-full text-xs font-bold cursor-not-allowed"
                      >
                        Class Full
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBookSpot(cls.id)}
                        className="bg-gradient-to-r from-[#F5A623] to-[#FF8C5A] hover:opacity-95 text-[#644000] font-bold px-4 py-2 rounded-full text-xs transition-all cursor-pointer shadow-xs"
                      >
                        Book Spot
                      </button>
                    )
                  ) : (
                    <span className="text-[10px] text-[#857462] italic">Staff view</span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </section>
    </div>
  )
}
