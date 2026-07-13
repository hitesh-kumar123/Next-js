import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getTrainers } from './actions'
import ScheduleClient from './ScheduleClient'

export const dynamic = 'force-dynamic'

export default async function ClassSchedulePage() {
  const supabase = await createClient()

  // Get session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all data in parallel to avoid query waterfalls
  const [profileRes, classesRes, bookingsRes, trainersRes] = await Promise.all([
    supabase
      .from('users')
      .select('role, full_name')
      .eq('id', user.id)
      .single(),
    supabase
      .from('classes')
      .select('*, class_bookings(count)')
      .order('start_time', { ascending: true }),
    supabase
      .from('class_bookings')
      .select('class_id')
      .eq('user_id', user.id),
    getTrainers(),
  ])

  const profile = profileRes.data
  const classesData = classesRes.data
  const classesErr = classesRes.error
  const bookingsData = bookingsRes.data
  const trainers = trainersRes.trainers || []

  if (!profile) {
    return (
      <main className="flex-1 p-10 flex justify-center items-center relative overflow-hidden bg-background">
        <div className="orb-glow top-[-100px] right-[-100px]" />
        <div className="orb-glow bottom-[-100px] left-[20%]" />
        <div className="bg-[#121824] border border-[#f5a623]/25 p-8 rounded-2xl shadow-xl max-w-md w-full text-center relative z-10">
          <span className="material-symbols-outlined text-red-500 text-5xl mb-4">database_alert</span>
          <h2 className="font-display text-xl font-bold text-white mb-2">
            Profile Sync Issue
          </h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Could not fetch user profile. This is likely caused by incorrect or invalid Supabase API keys in your <code>.env</code> file.
          </p>
          <div className="bg-[#090d16] p-3.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 text-left font-mono">
            <span className="block font-bold text-red-400 mb-1">Diagnosis:</span>
            - Supabase query returned null/error<br/>
            - Token starts with: {process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 8) || 'None'}<br/>
            - User ID: {user.id.slice(0, 8)}...
          </div>
        </div>
      </main>
    )
  }

  if (classesErr) {
    console.error('Failed to pull classes:', classesErr)
  }

  // Format classes to extract bookings_count
  const classes = (classesData || []).map((c: any) => {
    // class_bookings count can be array of count or object depending on postgrest version
    let count = 0
    if (c.class_bookings) {
      if (Array.isArray(c.class_bookings)) {
        count = c.class_bookings[0]?.count || 0
      } else if (typeof c.class_bookings === 'object') {
        count = (c.class_bookings as any).count || 0
      }
    }
    return {
      id: c.id,
      name: c.name,
      description: c.description,
      instructor: c.instructor,
      location: c.location,
      category: c.category,
      start_time: c.start_time,
      duration_minutes: c.duration_minutes,
      capacity: c.capacity,
      bookings_count: count,
    }
  })

  const bookedIds = (bookingsData || []).map((b: any) => b.class_id)

  // Fetch trainers is already done in Promise.all above

  return (
    <main className="flex-1 p-10 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="orb-glow top-[-100px] right-[-100px]" />
      <div className="orb-glow bottom-[-100px] left-[20%]" />

      <header className="mb-10 flex justify-between items-start">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#835500]">
            Class Scheduling & Calendar
          </h1>
          <p className="text-[#524534] text-sm mt-1">
            Browse upcoming studio sessions, filter by Category, and book your spots.
          </p>
        </div>
      </header>

      <ScheduleClient
        initialClasses={classes}
        initialBookedIds={bookedIds}
        userRole={profile.role}
        currentUserFullName={profile.full_name || ''}
        trainers={trainers}
      />
    </main>
  )
}
