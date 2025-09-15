import { requireAdmin } from '@/lib/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import AdminNav from '@/components/AdminNav'
import styles from './admin.module.css'

export default async function AdminDashboard() {
  await requireAdmin()
  
  const supabase = await createServerSupabaseClient()

  // Fetch statistics
  const [
    { count: totalUsers },
    { count: totalInstructors },
    { count: totalBookings },
    { count: pendingBookings }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('instructors').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending')
  ])

  // Fetch recent activity
  const { data: recentBookings } = await supabase
    .from('bookings')
    .select(`
      id,
      created_at,
      start_time,
      profiles:user_id (first_name, last_name),
      instructors:instructor_id (
        profiles:id (first_name, last_name)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className={styles.adminLayout}>
      <AdminNav />
      <main className={styles.adminMain}>
        <div className={styles.adminContent}>
          <div className={styles.header}>
            <h1 className={styles.title}>Admin Dashboard</h1>
            <p className={styles.subtitle}>Manage your driving school operations</p>
          </div>

          {/* Statistics Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>👥</div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{totalUsers || 0}</div>
                <div className={styles.statLabel}>Total Users</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>🚗</div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{totalInstructors || 0}</div>
                <div className={styles.statLabel}>Instructors</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>📅</div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{totalBookings || 0}</div>
                <div className={styles.statLabel}>Total Bookings</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>⏳</div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{pendingBookings || 0}</div>
                <div className={styles.statLabel}>Pending Bookings</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Recent Bookings</h2>
            <div className={styles.card}>
              {recentBookings && recentBookings.length > 0 ? (
                <div className={styles.table}>
                  <table className={styles.tableElement}>
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Instructor</th>
                        <th>Lesson Date</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                    {recentBookings.map((booking) => (
                        <tr key={booking.id}>
                          <td>
                            {booking.profiles?.first_name} {booking.profiles?.last_name}
                          </td>
                          <td>
                            {booking.instructors?.profiles?.first_name} {booking.instructors?.profiles?.last_name}
                          </td>
                          <td>
                            {booking.start_time ? new Date(booking.start_time).toLocaleDateString() : 'TBD'}
                          </td>
                          <td>
                            {new Date(booking.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={styles.emptyState}>No recent bookings found.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}