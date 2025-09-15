'use client';

import { useState } from 'react'
import { createInstructor } from '@/lib/actions/admin'
import styles from '../../admin.module.css'
import Link from 'next/link'

export function InstructorForm() {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (formData: FormData) => {
    try {
      const result = await createInstructor(formData)
      if (result.success) {
        setMessage({ type: 'success', text: 'Instructor created successfully!' })
        // Reset form
        const form = document.querySelector('form') as HTMLFormElement
        if (form) form.reset()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to create instructor' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    }
  }

  return (
    <div className={styles.card}>
      <form action={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="firstName">
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            required
            className={styles.formInput}
            placeholder="Enter first name"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="lastName">
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            required
            className={styles.formInput}
            placeholder="Enter last name"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="email">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className={styles.formInput}
            placeholder="instructor@example.com"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="bio">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            className={styles.formTextarea}
            placeholder="Tell us about this instructor's experience and qualifications"
          ></textarea>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="lessonPrice">
            Lesson Price (R)
          </label>
          <input
            type="number"
            id="lessonPrice"
            name="lessonPrice"
            min="20"
            step="5"
            defaultValue="50"
            className={styles.formInput}
            placeholder="50"
          />
        </div>

        {message && (
          <div className={`${styles.formMessage} ${message.type === 'error' ? styles.errorMessage : styles.successMessage}`}>
            <div style={{ whiteSpace: 'pre-line' }}>{message.text}</div>
          </div>
        )}

        <div className={styles.formActions}>
          <Link href="/admin/instructors" className={`${styles.actionButton} ${styles.secondary}`}>
            Cancel
          </Link>
          <button type="submit" className={styles.actionButton}>
            Create Instructor
          </button>
        </div>
      </form>
    </div>
  )
}