import React from 'react';
import { loadStripe } from '@stripe/stripe-js';

export default function CheckoutButton({ items }: { items: { productId: string; quantity: number }[] }) {
  const handleCheckout = async () => {
    try {
      const res = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error('Failed to create checkout session');
      const data = await res.json();
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
      // Prefer redirect via session id
      if (data.id) {
        try {
          if (stripe) {
            const res = await stripe.redirectToCheckout({ sessionId: data.id as string });
            if ((res as any)?.error) {
              console.error('Stripe redirectToCheckout error', res);
              // fallback to direct url
              if (data.url) window.location.href = data.url;
            }
          } else if (data.url) {
            window.location.href = data.url;
          } else {
            throw new Error('Stripe not available and no redirect URL');
          }
        } catch (err) {
          console.error('Error during stripe redirect:', err);
          if (data.url) window.location.href = data.url;
          else throw err;
        }
      } else if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No session id/url returned');
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Checkout error', err);
      alert(err?.message || 'Checkout failed');
    }
  };

  return (
    <button onClick={handleCheckout} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
      Checkout
    </button>
  );
}
