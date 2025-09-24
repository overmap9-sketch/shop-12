"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Client-side success page that reads session_id from the URL and displays order status.
 * Wrapped by a Suspense boundary in the server page for CSR bailout safety.
 */
export default function ClientSuccess() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id') || '';
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/by-session/${encodeURIComponent(sessionId)}`);
      if (!res.ok) {
        if (res.status === 404) setOrder(null);
        else throw new Error(await res.text().catch(() => 'Failed to fetch'));
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

  useEffect(() => {
    if (!sessionId) return;
    let attempts = 0;
    let stopped = false;
    const poll = async () => {
      await fetchOrder();
      attempts++;
      if (stopped) return;
      if (!order || (order && order.status === 'pending')) {
        if (attempts < 6) setTimeout(poll, 3000);
      }
    };
    poll();
    return () => { stopped = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  if (!sessionId) return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-2">Payment result</h1>
        <p>No session specified. If you were redirected from Stripe, session information may be missing.</p>
      </div>
    </div>
  );

  if (loading && !order) return (
    <div className="mx-auto max-w-2xl p-6" aria-busy="true" aria-live="polite">
      <div className="bg-card border border-border rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-2">Payment result</h1>
        <p>Loading order...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="mx-auto max-w-2xl p-6" aria-live="assertive">
      <div className="bg-destructive/10 border border-destructive rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-2">Payment result</h1>
        <p className="text-destructive">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-2">Payment result</h1>
        {!order && (
          <p>Order not found for session {sessionId}. If you just completed payment, wait a moment or contact support.</p>
        )}
        {order && (
          <div className="space-y-2">
            <div><span className="text-muted-foreground">Order ID:</span> <span className="font-medium">{order.id}</span></div>
            <div><span className="text-muted-foreground">Status:</span> <strong className="uppercase">{order.status}</strong></div>
            {order.payment && (
              <div className="mt-2">
                <div>Amount: {(order.payment.amount_received || 0) / 100} {order.payment.currency}</div>
                <div>Payment intent: {order.payment.payment_intent}</div>
              </div>
            )}
            <div className="pt-2">
              {order.status === 'paid' ? (
                <div className="text-green-700 dark:text-green-400">Thank you! Your payment was received.</div>
              ) : (
                <div className="text-foreground">Your payment is pending. This page will update shortly or we'll email you.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
