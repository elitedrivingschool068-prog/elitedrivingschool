'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/sign-in')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  return user
}

export async function isAdmin(userId?: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient()
  
  let targetUserId = userId
  
  if (!targetUserId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    targetUserId = user.id
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', targetUserId)
    .single()

  return profile?.role === 'admin' || false
}