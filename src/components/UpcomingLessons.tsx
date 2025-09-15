import { createServerSupabaseClient } from '@/lib/supabase/server'
import styles from './UpcomingLessons.module.css'
import DeleteBookingForm from './DeleteBookingForm'

const UpcomingLessons = async () => {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      id,
      created_at,
      start_time,
      status,
      instructor_id,
      instructors:instructor_id (
        lesson_price,
        profiles!instructors_id_fkey (
          first_name,
          last_name
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching bookings:', error)
    return <p className={styles.error}>Error fetching lessons. Please try again later.</p>
  }

  if (!bookings || bookings.length === 0) {
    return <p className={styles.noLessons}>You have no upcoming lessons scheduled.</p>
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Your Upcoming Lessons</h3>
      <ul className={styles.lessonList}>
        {bookings.map((booking) => {
          // Handle date and time formatting
          let displayDate = 'Date TBD';
          let displayTime = 'Time TBD';
          
          if (booking.start_time) {
            const startTime = new Date(booking.start_time);
            displayDate = startTime.toLocaleDateString('en-ZA');
            displayTime = startTime.toLocaleTimeString('en-ZA', { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
          }
          
          const instructorName = booking.instructors?.profiles ? 
            `${booking.instructors.profiles.first_name} ${booking.instructors.profiles.last_name}` : 
            'Instructor TBD';
          
          return (
            <li key={booking.id} className={styles.lessonItem}>
              <div className={styles.lessonInfo}>
                <div className={styles.instructorName}>{instructorName}</div>
                <span className={styles.lessonDate}>📅 {displayDate}</span>
                <span className={styles.lessonTime}>🕐 {displayTime}</span>
                <span className={styles.status}>Status: {booking.status || 'Pending'}</span>
              </div>
              <DeleteBookingForm bookingId={booking.id} />
            </li>
          );
        })}
      </ul>
    </div>
  )
}

export default UpcomingLessons