'use client'

import { useState } from 'react'
import { FaStar, FaTimes } from 'react-icons/fa'
import { submitInstructorRating } from '@/lib/actions/rating'
import styles from './RatingModal.module.css'

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  instructorId: string
  instructorName: string
}

const RatingModal = ({ isOpen, onClose, instructorId, instructorName }: RatingModalProps) => {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      alert('Please select a rating')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('instructorId', instructorId)
      formData.append('rating', rating.toString())
      formData.append('reviewText', reviewText)

      const result = await submitInstructorRating(formData)
      
      if (result.success) {
        setSubmitted(true)
        setTimeout(() => {
          onClose()
          // Reset form
          setRating(0)
          setReviewText('')
          setSubmitted(false)
        }, 2000)
      } else {
        alert(result.error || 'Failed to submit rating')
      }
    } catch (error) {
      alert('An error occurred while submitting your rating')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Rate Your Instructor</h3>
          <button 
            onClick={onClose}
            className={styles.closeButton}
            type="button"
          >
            <FaTimes />
          </button>
        </div>

        {submitted ? (
          <div className={styles.successMessage}>
            <h4>Thank you for your feedback!</h4>
            <p>Your rating has been submitted successfully.</p>
          </div>
        ) : (
          <>
            <div className={styles.instructorInfo}>
              <p>How was your lesson with <strong>{instructorName}</strong>?</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.ratingSection}>
                <label className={styles.ratingLabel}>Your Rating:</label>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`${styles.star} ${
                        star <= (hoveredRating || rating) ? styles.starFilled : styles.starEmpty
                      }`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                    >
                      <FaStar />
                    </button>
                  ))}
                </div>
                <span className={styles.ratingText}>
                  {rating > 0 && `${rating} out of 5 stars`}
                </span>
              </div>

              <div className={styles.reviewSection}>
                <label className={styles.reviewLabel} htmlFor="reviewText">
                  Share your experience (optional):
                </label>
                <textarea
                  id="reviewText"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className={styles.reviewTextarea}
                  placeholder="Tell us about your lesson..."
                  rows={4}
                  maxLength={500}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={onClose}
                  className={styles.cancelButton}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting || rating === 0}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default RatingModal