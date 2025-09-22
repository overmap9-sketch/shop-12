"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

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

  if (!sessionId) return <div className="p-6">No session specified.</div>;
  if (loading && !order) return <div className="p-6">Loading order...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Payment result</h1>
      {!order && <div>Order not found for session {sessionId}. If you just completed payment, wait a moment or contact support.</div>}
      {order && (
        <div>
          <div className="mb-2">Order ID: {order.id}</div>
          <div className="mb-2">Status: <strong>{order.status}</strong></div>
          {order.payment && (
            <div className="mb-2">
              <div>Amount: {(order.payment.amount_received || 0) / 100} {order.payment.currency}</div>
              <div>Payment intent: {order.payment.payment_intent}</div>
            </div>
          )}
          <div className="mt-4">
            {order.status === 'paid' ? (
              <div>Thank you! Your payment was received.</div>
            ) : (
              <div>Your payment is pending. If this doesn't update, we'll email you with instructions.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
