'use client'

import { useState } from 'react'
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'
import { deleteBookingWithResult } from '@/lib/actions/booking'
import styles from './UpcomingLessons.module.css' // Reuse the same CSS module
import DeleteButton from './DeleteButton'

const DeleteBookingForm = ({ bookingId }: { bookingId: string }) => {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const handleDelete = async (formData: FormData) => {
    setStatus('idle')
    setMessage(null)

    const result = await deleteBookingWithResult(formData)
    
    if (result.success) {
      setStatus('success')
      setMessage('Booking deleted successfully!')
    } else {
      setStatus('error')
      setMessage(result.error || 'An unexpected error occurred.')
    }
  }

  return (
    <>
      <form action={handleDelete}>
        <input type="hidden" name="id" value={bookingId} />
        <DeleteButton />
      </form>
      {status === 'success' && (
        <div className={`${styles.statusMessage} ${styles.success}`}>
          <FaCheckCircle className={styles.statusIcon} />
          <span>{message}</span>
        </div>
      )}
      {status === 'error' && (
        <div className={`${styles.statusMessage} ${styles.error}`}>
          <FaExclamationCircle className={styles.statusIcon} />
          <span>{message}</span>
        </div>
      )}
    </>
  )
}

export default DeleteBookingForm