'use server';

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-08-27.basil',
});

interface PaymentIntentResponse {
  client_secret?: string;
  error?: string;
}

export async function createPaymentIntent(amount: number): Promise<PaymentIntentResponse> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects amount in cents
      currency: 'zar', // South African Rand
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return { client_secret: paymentIntent.client_secret || undefined };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}