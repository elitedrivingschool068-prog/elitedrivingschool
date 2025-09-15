'use server'

import { createServerActionClient } from '@/lib/supabase/actions'
import { revalidatePath } from 'next/cache'

export async function completeProfile(formData: FormData) {
  const supabase = await createServerActionClient()

  // This line logs to your server terminal to confirm the action is being called.
  console.log('completeProfile server action received a request.');

  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'User not authenticated' }
  }

  // This block handles the password update logic
  if (password || confirmPassword) {
    if (password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match.' }
    }
    if (!password) {
      return { success: false, error: 'Password is required to confirm.' }
    }
    const { error: passwordError } = await supabase.auth.updateUser({ password })
    if (passwordError) {
      return { success: false, error: passwordError.message }
    }
  }

  // Use upsert to create or update the profile
  const profileData = {
    id: user.id,
    first_name: firstName,
    last_name: lastName,
    email: user.email,
    role: 'user' // Default role for new users
  }

  // Only perform the upsert if we have required data
  if (firstName && lastName) {
    const { error } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' })

    if (error) {
      console.error('Error upserting profile:', error)
      return { success: false, error: error.message }
    }

    console.log('Profile upserted successfully for user:', user.id)
  } else {
    return { success: false, error: 'First name and last name are required' }
  }

  revalidatePath('/dashboard')
  return { success: true, error: null }
}