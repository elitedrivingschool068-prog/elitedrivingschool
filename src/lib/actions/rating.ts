'use server'

import { createServerActionClient } from '@/lib/supabase/actions'
import { revalidatePath } from 'next/cache'

export async function submitInstructorRating(formData: FormData) {
  const supabase = await createServerActionClient()
  const instructorId = formData.get('instructorId') as string
  const rating = parseInt(formData.get('rating') as string)
  const reviewText = formData.get('reviewText') as string

  if (!instructorId || !rating || rating < 1 || rating > 5) {
    console.error('Invalid rating data:', { instructorId, rating })
    return { success: false, error: 'Invalid rating data' }
  }

  try {
    // Get current user - authentication is required for reviews
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.error('User not authenticated for rating submission')
      return { success: false, error: 'You must be logged in to submit a rating' }
    }

    // Insert the review into instructor_reviews table
    const { error: reviewError } = await supabase
      .from('instructor_reviews')
      .insert({
        instructor_id: instructorId,
        client_id: user.id,
        rating: rating,
        review_text: reviewText || null,
        created_at: new Date().toISOString()
      })

    if (reviewError) {
      console.error('Error inserting review:', reviewError.message)
      return { success: false, error: 'Failed to submit rating' }
    }

    // Calculate and update the instructor's average rating
    await updateInstructorAverageRating(instructorId)

    // Revalidate relevant pages
    revalidatePath('/instructors')
    revalidatePath('/admin/instructors')

    console.log('Rating submitted successfully for instructor:', instructorId)
    return { success: true, error: null }
  } catch (error) {
    console.error('Error during rating submission:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function updateInstructorAverageRating(instructorId: string) {
  const supabase = await createServerActionClient()

  try {
    // Calculate the average rating from all reviews for this instructor
    const { data: reviews, error: reviewsError } = await supabase
      .from('instructor_reviews')
      .select('rating')
      .eq('instructor_id', instructorId)

    if (reviewsError) {
      console.error('Error fetching reviews for rating calculation:', reviewsError.message)
      return { success: false, error: 'Failed to calculate average rating' }
    }

    if (!reviews || reviews.length === 0) {
      // No reviews yet, set rating to null
      const { error: updateError } = await supabase
        .from('instructors')
        .update({ rating: null })
        .eq('id', instructorId)

      if (updateError) {
        console.error('Error updating instructor rating to null:', updateError.message)
        return { success: false, error: 'Failed to update instructor rating' }
      }

      return { success: true, rating: null }
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / reviews.length
    const roundedRating = Math.round(averageRating * 10) / 10 // Round to 1 decimal place

    // Update the instructor's rating in the instructors table
    const { error: updateError } = await supabase
      .from('instructors')
      .update({ rating: roundedRating })
      .eq('id', instructorId)

    if (updateError) {
      console.error('Error updating instructor rating:', updateError.message)
      return { success: false, error: 'Failed to update instructor rating' }
    }

    console.log(`Updated instructor ${instructorId} average rating to:`, roundedRating)
    return { success: true, rating: roundedRating }
  } catch (error) {
    console.error('Error calculating average rating:', error)
    return { success: false, error: 'An unexpected error occurred during rating calculation' }
  }
}

// Function to trigger rating popup (can be called from various places)
export async function triggerRatingModal(instructorId: string, instructorName: string) {
  // This will be used by components to show the rating modal
  // The actual modal state management will be handled in the components
  return {
    instructorId,
    instructorName,
    shouldShow: true
  }
}
