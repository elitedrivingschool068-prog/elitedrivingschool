'use server'

import { createServerActionClient } from '@/lib/supabase/actions'
import { requireAdmin } from '@/lib/admin'
import { revalidatePath } from 'next/cache'

// User Management Actions
export async function updateUserRole(formData: FormData) {
  await requireAdmin()
  
  const supabase = await createServerActionClient()
  const userId = formData.get('userId') as string
  const role = formData.get('role') as string

  if (!userId || !role) {
    console.error('User ID and role are required')
    return
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user role:', error.message)
    return
  }

  revalidatePath('/admin/users')
}

export async function deleteUser(formData: FormData) {
  await requireAdmin()
  
  const supabase = await createServerActionClient()
  const userId = formData.get('userId') as string

  if (!userId) {
    console.error('User ID is required')
    return
  }

  try {
    // Delete related bookings first (both as user and as instructor)
    await supabase
      .from('bookings')
      .delete()
      .eq('user_id', userId)

    await supabase
      .from('bookings')
      .delete()
      .eq('instructor_id', userId)

    // Delete instructor reviews (both given and received)
    await supabase
      .from('instructor_reviews')
      .delete()
      .eq('client_id', userId)

    await supabase
      .from('instructor_reviews')
      .delete()
      .eq('instructor_id', userId)

    // Delete instructor record if exists
    await supabase
      .from('instructors')
      .delete()
      .eq('id', userId)

    // Finally, delete profile
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (error) {
      console.error('Error deleting user:', error.message)
      return
    }

    console.log('User deleted successfully:', userId)
  } catch (error) {
    console.error('Error during user deletion process:', error)
    return
  }

  revalidatePath('/admin/users')
}

// Instructor Management Actions
export async function createInstructor(formData: FormData) {
  await requireAdmin()
  
  const supabase = await createServerActionClient()
  const email = formData.get('email') as string
  const bio = formData.get('bio') as string
  const lessonPrice = parseFloat(formData.get('lessonPrice') as string)

  if (!email || !bio || !lessonPrice) {
    console.error('Email, bio, and lesson price are required')
    return { success: false, error: 'Email, bio, and lesson price are required' }
  }

  try {
    // Step 1: Find the profile with the provided email and check if role is 'instructor'
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, first_name, last_name')
      .eq('email', email)
      .single()

    if (profileError || !profile) {
      console.error('Profile not found for email:', email)
      return { success: false, error: `No user found with email: ${email}` }
    }

    // Step 2: Verify the user has 'instructor' role
    if (profile.role !== 'instructor') {
      console.error('User role is not instructor:', profile.role)
      return { success: false, error: `User with email ${email} does not have instructor role. Current role: ${profile.role}` }
    }

    // Step 3: Check if instructor record already exists
    const { data: existingInstructor } = await supabase
      .from('instructors')
      .select('id')
      .eq('id', profile.id)
      .single()

    if (existingInstructor) {
      console.error('Instructor record already exists for user:', profile.id)
      return { success: false, error: `Instructor record already exists for ${profile.first_name} ${profile.last_name}` }
    }

    // Step 4: Create the instructor record
    const { error: instructorError } = await supabase
      .from('instructors')
      .insert({
        id: profile.id,
        bio: bio,
        lesson_price: lessonPrice,
        rating: null // Rating starts as null, will be calculated from reviews
      })

    if (instructorError) {
      console.error('Error creating instructor record:', instructorError.message)
      return { success: false, error: 'Failed to create instructor record' }
    }

    console.log('Instructor created successfully for:', profile.first_name, profile.last_name)
    revalidatePath('/admin/instructors')
    return { success: true, error: null }
  } catch (error) {
    console.error('Error during instructor creation process:', error)
    return { success: false, error: 'An unexpected error occurred during instructor creation' }
  }
}

export async function updateInstructor(formData: FormData) {
  await requireAdmin()
  
  const supabase = await createServerActionClient()
  const instructorId = formData.get('instructorId') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const bio = formData.get('bio') as string
  const lessonPrice = parseFloat(formData.get('lessonPrice') as string)

  if (!instructorId) {
    console.error('Instructor ID is required')
    return
  }

  // Update profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      first_name: firstName,
      last_name: lastName
    })
    .eq('id', instructorId)

  if (profileError) {
    console.error('Error updating instructor profile:', profileError.message)
    return
  }

  // Update instructor record
  const { error: instructorError } = await supabase
    .from('instructors')
    .update({
      bio,
      lesson_price: lessonPrice
    })
    .eq('id', instructorId)

  if (instructorError) {
    console.error('Error updating instructor:', instructorError.message)
    return
  }

  revalidatePath('/admin/instructors')
}

export async function deleteInstructor(formData: FormData) {
  await requireAdmin()
  
  const supabase = await createServerActionClient()
  const instructorId = formData.get('instructorId') as string

  if (!instructorId) {
    console.error('Instructor ID is required')
    return
  }

  // Delete bookings first
  await supabase
    .from('bookings')
    .delete()
    .eq('instructor_id', instructorId)

  // Delete instructor record
  await supabase
    .from('instructors')
    .delete()
    .eq('id', instructorId)

  // Update profile role to user
  const { error } = await supabase
    .from('profiles')
    .update({ role: 'user' })
    .eq('id', instructorId)

  if (error) {
    console.error('Error removing instructor:', error.message)
    return
  }

  revalidatePath('/admin/instructors')
}

// Booking Management Actions
export async function updateBookingStatus(formData: FormData) {
  await requireAdmin()
  
  const supabase = await createServerActionClient()
  const bookingId = formData.get('bookingId') as string
  const status = formData.get('status') as string

  if (!bookingId || !status) {
    console.error('Booking ID and status are required')
    return
  }

  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)

  if (error) {
    console.error('Error updating booking status:', error.message)
    return
  }

  revalidatePath('/admin/bookings')
}

export async function deleteBookingAdmin(formData: FormData) {
  await requireAdmin()
  
  const supabase = await createServerActionClient()
  const bookingId = formData.get('bookingId') as string

  if (!bookingId) {
    console.error('Booking ID is required')
    return
  }

  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId)

  if (error) {
    console.error('Error deleting booking:', error.message)
    return
  }

  revalidatePath('/admin/bookings')
}
