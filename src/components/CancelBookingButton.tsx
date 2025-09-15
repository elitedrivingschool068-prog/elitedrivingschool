'use client'

import { deleteBooking } from '@/lib/actions/booking'

interface CancelBookingButtonProps {
  bookingId: string
  className: string
}

const CancelBookingButton = ({ bookingId, className }: CancelBookingButtonProps) => {
  const handleCancel = async (formData: FormData) => {
    if (!confirm('Are you sure you want to cancel this lesson? This action cannot be undone.')) {
      return
    }
    
    await deleteBooking(formData)
  }

  return (
    <form action={handleCancel} style={{ display: 'inline' }}>
      <input type="hidden" name="id" value={bookingId} />
      <button type="submit" className={className}>
        Cancel Lesson
      </button>
    </form>
  )
}

export default CancelBookingButton