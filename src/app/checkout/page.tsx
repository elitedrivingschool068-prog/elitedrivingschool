import PaymentForm from '@/components/PaymentForm';
import { Suspense } from 'react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import styles from './checkout.module.css';

const CheckoutContent = async ({ searchParams }: { searchParams: Promise<{ instructorId?: string, bookingInfo?: string }> }) => {
  const supabase = await createServerSupabaseClient()
  const resolvedSearchParams = await searchParams;
  const { instructorId, bookingInfo } = resolvedSearchParams;

  if (!instructorId || !bookingInfo) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Error</h1>
          <p className={styles.subtitle}>No booking information was provided.</p>
        </div>
      </div>
    );
  }

  // Decode and parse the booking information from the URL
  const decodedBookingInfo = JSON.parse(decodeURIComponent(bookingInfo));
  const { date, time } = decodedBookingInfo;

  // Fetch the lesson price from the database
  const { data: instructorData, error } = await supabase
    .from('instructors')
    .select('lesson_price')
    .eq('id', instructorId)
    .single();

  if (error || !instructorData) {
    console.error('Error fetching instructor price:', error);
    return redirect('/instructors');
  }

  const lessonPrice = instructorData.lesson_price ?? 50;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Complete Your Booking</h1>
        <p className={styles.subtitle}>
          Your lesson on **{date}** at **{time}** has been reserved.
        </p>
        <p className={styles.subtitle}>Pay for your lesson with our secure payment gateway.</p>
        <PaymentForm amount={lessonPrice} instructorId={instructorId} />
      </div>
    </div>
  );
};

export default function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ instructorId?: string, bookingInfo?: string }>;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutContent searchParams={searchParams} />
    </Suspense>
  );
}