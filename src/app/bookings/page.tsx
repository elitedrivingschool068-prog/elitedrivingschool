import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import styles from './bookings.module.css'
import CancelBookingButton from '@/components/CancelBookingButton'

export default async function MyBookingsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/auth/sign-in')
  }

  // Fetch user's bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id,
      created_at,
      start_time,
      instructors:instructor_id (
        lesson_price,
        profiles!instructors_id_fkey (
          first_name,
          last_name
        )
      )
    `)
    .eq('user_id', user.id)
    .order('start_time', { ascending: true })

  // Separate upcoming and past bookings
  const now = new Date()
  const upcomingBookings = bookings?.filter(booking => 
    booking.start_time && new Date(booking.start_time) > now
  ) || []
  const pastBookings = bookings?.filter(booking => 
    booking.start_time && new Date(booking.start_time) <= now
  ) || []

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Bookings</h1>
        <p className={styles.subtitle}>Manage your driving lesson bookings</p>
      </div>

      {/* Upcoming Bookings */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Upcoming Lessons</h2>
        {upcomingBookings.length > 0 ? (
          <div className={styles.bookingsGrid}>
            {upcomingBookings.map((booking) => (
              <div key={booking.id} className={`${styles.bookingCard} ${styles.upcoming}`}>
                <div className={styles.bookingHeader}>
                  <h3 className={styles.instructorName}>
                    {booking.instructors?.profiles?.first_name} {booking.instructors?.profiles?.last_name}
                  </h3>
                  <span className={styles.price}>R{booking.instructors?.lesson_price || 50}</span>
                </div>
                <div className={styles.bookingDetails}>
                  <div className={styles.dateTime}>
                    <div className={styles.date}>
                      📅 {new Date(booking.start_time!).toLocaleDateString('en-ZA', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className={styles.time}>
                      🕐 {new Date(booking.start_time!).toLocaleTimeString('en-ZA', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <CancelBookingButton 
                      bookingId={booking.id} 
                      className={`${styles.actionButton} ${styles.cancel}`}
                    />
                  </div>
                </div>
                <div className={styles.booked}>
                  Booked on {new Date(booking.created_at).toLocaleDateString('en-ZA')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>You have no upcoming lessons.</p>
            <a href="/instructors" className={styles.bookButton}>Book Your First Lesson</a>
          </div>
        )}
      </section>

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Past Lessons</h2>
          <div className={styles.bookingsGrid}>
            {pastBookings.map((booking) => (
              <div key={booking.id} className={`${styles.bookingCard} ${styles.past}`}>
                <div className={styles.bookingHeader}>
                  <h3 className={styles.instructorName}>
                    {booking.instructors?.profiles?.first_name} {booking.instructors?.profiles?.last_name}
                  </h3>
                  <span className={styles.price}>R{booking.instructors?.lesson_price || 50}</span>
                </div>
                <div className={styles.bookingDetails}>
                  <div className={styles.dateTime}>
                    <div className={styles.date}>
                      📅 {new Date(booking.start_time!).toLocaleDateString('en-ZA', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className={styles.time}>
                      🕐 {new Date(booking.start_time!).toLocaleTimeString('en-ZA', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
                <div className={styles.completed}>✅ Completed</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}