'use client';

import { useState, useEffect } from 'react';
import {
  Elements,
  useStripe,
  useElements,
  PaymentElement,
  LinkAuthenticationElement,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { createPaymentIntent } from '@/lib/actions/stripe';
import styles from './PaymentForm.module.css';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Update the props of CheckoutForm to remove the slotId
const CheckoutForm = ({ amount, instructorId }: { amount: number, instructorId: string; }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );
    
    const redirectStatus = new URLSearchParams(window.location.search).get(
      'redirect_status'
    );

    if (!clientSecret) {
      return;
    }

    if (redirectStatus === 'succeeded') {
      // Payment succeeded, redirect to success page
      window.location.href = '/payment-success';
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case 'succeeded':
          window.location.href = '/payment-success';
          break;
        case 'processing':
          setMessage('Your payment is processing.');
          break;
        case 'requires_payment_method':
          setMessage('Your payment was not successful, please try again.');
          break;
        default:
          setMessage('Something went wrong.');
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error: submitError } = await elements.submit();

    if (submitError) {
      // Use nullish coalescing to handle a potentially undefined message
      setMessage(submitError.message ?? 'An unknown error occurred during submission.');
      setIsLoading(false);
      return;
    }

    const { client_secret, error: intentError } = await createPaymentIntent(amount);

    if (intentError) {
      setMessage(intentError);
      setIsLoading(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret: client_secret!,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
    });

    if (error.type === 'card_error' || error.type === 'validation_error') {
      // Use nullish coalescing to handle a potentially undefined message
      setMessage(error.message ?? 'An unknown card error occurred.');
    } else {
      setMessage('An unexpected error occurred.');
    }

    setIsLoading(false);
  };

  return (
    <form className={styles.paymentForm} onSubmit={handleSubmit}>
      <LinkAuthenticationElement
        id="link-authentication-element"
        onChange={(e) => setEmail(e.value.email)}
      />
      <PaymentElement id="payment-element" className={styles.paymentElement} />
      <button disabled={isLoading || !stripe || !elements} className={styles.submitButton}>
        <span id="button-text">
          {isLoading ? 'Processing...' : `Pay R${amount}`}
        </span>
      </button>
      {message && <div id="payment-message" className={styles.message}>{message}</div>}
    </form>
  );
};

// Update the props of the PaymentForm component to remove the slotId
const PaymentForm = ({ amount, instructorId }: { amount: number, instructorId: string }) => {
  return (
    <Elements stripe={stripePromise} options={{ mode: 'payment', amount: amount * 100, currency: 'zar' }}>
      <CheckoutForm amount={amount} instructorId={instructorId} />
    </Elements>
  );
};

export default PaymentForm;