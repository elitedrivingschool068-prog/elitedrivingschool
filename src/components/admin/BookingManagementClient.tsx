'use client'

import { updateBookingStatus, deleteBookingAdmin } from '@/lib/actions/admin'
import { useTransition } from 'react'
import styles from '@/app/admin/admin.module.css'

type Booking = {
  id: string
  created_at: string
  start_time: string | null
  status: string | null
  profiles: {
    first_name: string
    last_name: string
    email: string
  } | null
  instructors: {
    lesson_price: number
    profiles: {
      first_name: string
      last_name: string
    } | null
  } | null
}

type BookingManagementClientProps = {
  bookings: Booking[]
}

export default function BookingManagementClient({ bookings }: BookingManagementClientProps) {
  const [isPending, startTransition] = useTransition()

  const handleStatusChange = (bookingId: string, newStatus: string) => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('bookingId', bookingId)
      formData.append('status', newStatus)
      await updateBookingStatus(formData)
    })
  }

  const handleDeleteBooking = (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return
    }
    
    startTransition(async () => {
      const formData = new FormData()
      formData.append('bookingId', bookingId)
      await deleteBookingAdmin(formData)
    })
  }

  return (
    <div className={styles.table}>
      <table className={styles.tableElement}>
        <thead>
          <tr>
            <th>Student</th>
            <th>Instructor</th>
            <th>Lesson Date</th>
            <th>Price</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td>
                <div>
                  <div>{booking.profiles?.first_name} {booking.profiles?.last_name}</div>
                  <div className={styles.subText}>{booking.profiles?.email}</div>
                </div>
              </td>
              <td>
                {booking.instructors?.profiles?.first_name} {booking.instructors?.profiles?.last_name}
              </td>
              <td>
                {booking.start_time ? (
                  <div>
                    <div>{new Date(booking.start_time).toLocaleDateString()}</div>
                    <div className={styles.subText}>
                      {new Date(booking.start_time).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                ) : (
                  <span className={styles.noDate}>To be scheduled</span>
                )}
              </td>
              <td>R{booking.instructors?.lesson_price || 50}</td>
              <td>
                <select 
                  name="status" 
                  defaultValue={booking.status || 'pending'}
                  className={styles.statusSelect}
                  disabled={isPending}
                  onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
              <td>{new Date(booking.created_at).toLocaleDateString()}</td>
              <td>
                <div className={styles.actionGroup}>
                  <button 
                    type="button" 
                    className={`${styles.actionButton} ${styles.danger}`}
                    disabled={isPending}
                    onClick={() => handleDeleteBooking(booking.id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}