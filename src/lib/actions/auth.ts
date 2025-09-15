'use server'

import { createServerActionClient } from '@/lib/supabase/actions'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createServerActionClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Sign-in error:', error.message)
    return { success: false, error: error.message }
  }

  // Redirect only on success
  redirect('/dashboard')
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createServerActionClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error('Sign-up error:', error.message)
    return { success: false, error: error.message }
  }

  // Redirect only on success
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createServerActionClient()
  await supabase.auth.signOut()
  redirect('/auth/sign-in')
}

export async function adminSignIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createServerActionClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Admin sign-in error:', error.message)
    return { success: false, error: error.message }
  }

  // Get the user's profile to check their role
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Authentication failed' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return { success: false, error: 'User profile not found' }
  }

  // Redirect based on role
  if (profile.role === 'admin') {
    redirect('/admin')
  } else {
    redirect('/dashboard')
  }
}

export async function resetPasswordForEmail(formData: FormData) {
  const email = formData.get('email') as string
  const supabase = await createServerActionClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}
