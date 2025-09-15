import { requireAdmin } from '@/lib/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import AdminNav from '@/components/AdminNav'
import BookingManagementClient from '@/components/admin/BookingManagementClient'
import styles from '../admin.module.css'

export default async function BookingsManagement() {
  await requireAdmin()
  
  const supabase = await createServerSupabaseClient()

  // Fetch all bookings with related data
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id,
      created_at,
      start_time,
      status,
      profiles:user_id (
        first_name,
        last_name,
        email
      ),
      instructors:instructor_id (
        lesson_price,
        profiles!instructors_id_fkey (
          first_name,
          last_name
        )
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className={styles.adminLayout}>
      <AdminNav />
      <main className={styles.adminMain}>
        <div className={styles.adminContent}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Booking Management</h1>
              <p className={styles.subtitle}>View and manage all lesson bookings</p>
            </div>
          </div>

          <div className={styles.card}>
            {bookings && bookings.length > 0 ? (
              <BookingManagementClient
                bookings={bookings.map((booking) => ({
                  ...booking,
                  profiles: {
                    ...booking.profiles,
                    first_name: booking.profiles?.first_name || '',
                    last_name: booking.profiles?.last_name || '',
                    email: booking.profiles?.email || ''
                  },
                  instructors: booking.instructors
                    ? {
                        ...booking.instructors,
                        lesson_price: booking.instructors.lesson_price || 0,
                        profiles: booking.instructors.profiles
                          ? {
                              ...booking.instructors.profiles,
                              first_name: booking.instructors.profiles.first_name || '',
                              last_name: booking.instructors.profiles.last_name || '',
                            }
                          : null,
                      }
                    : null,
                }))}
              />
            ) : (
              <p className={styles.emptyState}>No bookings found.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}