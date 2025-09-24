"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

/**
 * Client-side cancel page with retry flow. Wrapped by Suspense in the server page.
 */
export default function ClientCancel() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id') || '';
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const fetchOrder = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/by-session/${encodeURIComponent(sessionId)}`);
      if (!res.ok) {
        setOrder(null);
      } else {
        const data = await res.json();
        setOrder(data);
      }
    } catch (err: any) {
      setError(err?.message || 'Fetch error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (sessionId) fetchOrder(); }, [sessionId]);

  const handleRetry = async () => {
    if (!order?.id) return alert('Order not found');
    setRetrying(true);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(order.id)}/retry-session`, { method: 'POST' });
      if (!res.ok) throw new Error(await res.text().catch(() => 'Retry failed'));
      const data = await res.json();
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
      if (data.id && stripe) {
        const redirectRes = await stripe.redirectToCheckout({ sessionId: data.id });
        if ((redirectRes as any)?.error) {
          if (data.url) window.location.href = data.url;
        }
      } else if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No session returned');
      }
    } catch (err: any) {
      setError(err?.message || 'Retry error');
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-2">Payment cancelled</h1>
        {!sessionId && (
          <p>No session specified. If you were redirected here from Stripe, session info may be missing.</p>
        )}
        {loading && <p aria-busy="true">Loading order...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {order && (
          <div className="space-y-2">
            <div><span className="text-muted-foreground">Order ID:</span> <span className="font-medium">{order.id}</span></div>
            <div><span className="text-muted-foreground">Status:</span> <strong className="uppercase">{order.status}</strong></div>
            <div className="pt-2">
              <button
                disabled={retrying}
                onClick={handleRetry}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                aria-busy={retrying}
              >
                {retrying ? 'Redirecting…' : 'Retry Payment'}
              </button>
            </div>
          </div>
        )}
        {!order && (
          <p className="mt-4">If you'd like to retry payment, contact support or try again from your cart.</p>
        )}
      </div>
    </div>
  );
}
