import { requireAdmin } from '@/lib/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { deleteInstructor } from '@/lib/actions/admin'
import AdminNav from '@/components/AdminNav'
import Link from 'next/link'
import styles from '../admin.module.css'

export default async function InstructorsManagement() {
  await requireAdmin()
  
  const supabase = await createServerSupabaseClient()

  // Fetch all instructors with their profiles and booking counts
  const { data: instructors } = await supabase
    .from('instructors')
    .select(`
      id,
      bio,
      lesson_price,
      rating,
      profiles:id (
        first_name,
        last_name,
        email
      ),
      bookings:bookings(count)
    `)
    .order('lesson_price', { ascending: false })

  return (
    <div className={styles.adminLayout}>
      <AdminNav />
      <main className={styles.adminMain}>
        <div className={styles.adminContent}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Instructor Management</h1>
              <p className={styles.subtitle}>Manage driving instructors and their details</p>
            </div>
            <Link href="/admin/instructors/new" className={styles.addButton}>
              + Add Instructor
            </Link>
          </div>

          <div className={styles.card}>
            {instructors && instructors.length > 0 ? (
              <div className={styles.table}>
                <table className={styles.tableElement}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Lesson Price</th>
                      <th>Rating</th>
                      <th>Bookings</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instructors.map((instructor) => (
                      <tr key={instructor.id}>
                        <td>
                          {instructor.profiles?.first_name || 'N/A'} {instructor.profiles?.last_name || ''}
                        </td>
                        <td>{instructor.profiles?.email || 'No email'}</td>
                        <td>R{instructor.lesson_price || 50}</td>
                        <td>
                          {instructor.rating ? (
                            <span>{instructor.rating.toFixed(1)} ⭐</span>
                          ) : (
                            <span className={styles.noRating}>No rating</span>
                          )}
                        </td>
                        <td>{instructor.bookings?.[0]?.count || 0}</td>
                        <td>
                          <div className={styles.actionGroup}>
                            <Link 
                              href={`/admin/instructors/${instructor.id}/edit`}
                              className={`${styles.actionButton} ${styles.secondary}`}
                            >
                              Edit
                            </Link>
                            
                            <form action={deleteInstructor} style={{ display: 'inline' }}>
                              <input type="hidden" name="instructorId" value={instructor.id} />
                              <button 
                                type="submit" 
                                className={`${styles.actionButton} ${styles.danger}`}
                                onClick={(e) => {
                                  if (!confirm('Are you sure you want to remove this instructor? This action cannot be undone.')) {
                                    e.preventDefault()
                                  }
                                }}
                              >
                                Remove
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>No instructors found.</p>
                <Link href="/admin/instructors/new" className={styles.addButton}>
                  Add First Instructor
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}