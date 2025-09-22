"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

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
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Payment cancelled</h1>
      {!sessionId && <div>No session specified. If you were redirected here from Stripe, session info may be missing.</div>}
      {loading && <div>Loading order...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {order && (
        <div>
          <div className="mb-2">Order ID: {order.id}</div>
          <div className="mb-2">Status: <strong>{order.status}</strong></div>
          <div className="mt-4">
            <button disabled={retrying} onClick={handleRetry} className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
              {retrying ? 'Redirecting...' : 'Retry Payment'}
            </button>
          </div>
        </div>
      )}
      {!order && <div className="mt-4">If you'd like to retry payment, contact support or try again from your cart.</div>}
    </div>
  );
}
