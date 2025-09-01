'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error || !profile) {
        // Handle cases where profile is not found
        console.error("Profile not found:", error);
        router.push('/login');
        return;
      }

      if (profile.role === 'instructor') {
        router.push('/instructor');
      } else {
        router.push('/booking');
      }
    };
    
    checkUser();
  }, [router]);

  return (
    <div>
      {/* This page content is not visible, as it will redirect immediately */}
    </div>
  );
}