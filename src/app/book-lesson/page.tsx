import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import BookLessonClientPage from './BookLessonClientPage';

export default async function BookLessonServerPage({ searchParams }: { searchParams: Promise<{ instructorId?: string }> }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/auth/sign-in');
  }

  const resolvedSearchParams = await searchParams;
  const instructorId = resolvedSearchParams.instructorId;

  if (!instructorId) {
    // If no instructor is selected, redirect them back to the instructors page
    return redirect('/instructors');
  }

  // Pass the instructorId to the client component
  return <BookLessonClientPage userId={user.id} instructorId={instructorId} />;
}