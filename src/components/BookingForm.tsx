'use client'

import { useState } from 'react'
import { FaCalendarAlt, FaClock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'
import { createBooking } from '@/lib/actions/booking'
import styles from './BookingForm.module.css'
import SubmitButton from './SubmitButton'

const BookingForm = () => {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setStatus('idle')
    setMessage(null)

    const result = await createBooking(formData)

    if (result.success) {
      setStatus('success')
      setMessage('Booking created successfully!')
    } else {
      setStatus('error')
      setMessage(result.error || 'An unexpected error occurred.')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h2 className={styles.title}>Book a Driving Lesson</h2>
        <p className={styles.subtitle}>Select your preferred date and time below.</p>
        <form action={handleSubmit}>
          <div className={styles.inputGroup}>
            <div className={styles.icon}>
              <FaCalendarAlt />
            </div>
            <input
              type="date"
              name="lessonDate"
              required
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <div className={styles.icon}>
              <FaClock />
            </div>
            <input
              type="time"
              name="lessonTime"
              required
              className={styles.input}
            />
          </div>
          <SubmitButton>Confirm Booking</SubmitButton>
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
      </div>
    </div>
  )
}

export default BookingForm