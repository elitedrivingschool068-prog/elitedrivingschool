'use server';

import { createServerActionClient } from '@/lib/supabase/actions';
import { revalidatePath } from 'next/cache';

export async function createBooking(formData: FormData) {
  const supabase = await createServerActionClient();

  const instructorId = formData.get('instructorId') as string;
  const lessonDate = formData.get('lessonDate') as string;
  const lessonTime = formData.get('lessonTime') as string;

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  if (!instructorId) {
    return { success: false, error: 'Instructor ID is required' };
  }

  if (!lessonDate || !lessonTime) {
    return { success: false, error: 'Date and time are required' };
  }

  // Create proper timestamp from date and time
  const bookingTime = new Date(`${lessonDate}T${lessonTime}:00`);
  
  // Validate that the booking is in the future
  if (bookingTime <= new Date()) {
    return { success: false, error: 'Booking must be in the future' };
  }

  // Check if the instructor is already booked at this exact time
  const { data: existingBooking, error: checkError } = await supabase
    .from('bookings')
    .select('id')
    .eq('instructor_id', instructorId)
    .eq('start_time', bookingTime.toISOString())
    .single();

  if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows found
    console.error('Error checking for existing booking:', checkError);
    return { success: false, error: 'Failed to check availability.' };
  }

  if (existingBooking) {
    return { success: false, error: 'This time slot is already booked.' };
  }

  // Create the new booking
  const { error } = await supabase
    .from('bookings')
    .insert({
      user_id: user.id,
      instructor_id: instructorId,
      start_time: bookingTime.toISOString(),
      status: 'pending'
    });

  if (error) {
    console.error('Error creating booking:', error);
    return { success: false, error: 'Failed to create booking.' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/bookings');
  revalidatePath('/admin/bookings');
  return { success: true, error: null };
}

export async function deleteBooking(formData: FormData) {
  const supabase = await createServerActionClient();
  const bookingId = formData.get('id') as string;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId)
    .eq('user_id', user.id); // Ensure only the owner can delete

  if (error) {
    console.error('Error deleting booking:', error.message);
    throw new Error(error.message);
  }

  revalidatePath('/dashboard');
  revalidatePath('/bookings');
}

export async function deleteBookingWithResult(formData: FormData) {
  const supabase = await createServerActionClient();
  const bookingId = formData.get('id') as string;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId)
    .eq('user_id', user.id); // Ensure only the owner can delete

  if (error) {
    console.error('Error deleting booking:', error.message);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/bookings');
  return { success: true, error: null };
}
