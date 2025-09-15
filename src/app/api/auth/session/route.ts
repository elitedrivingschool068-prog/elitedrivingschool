// src/app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Get user profile to include role information
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return NextResponse.json({ 
      authenticated: true, 
      role: profile?.role || 'user' 
    });
  }

  return NextResponse.json({ authenticated: false });
}
