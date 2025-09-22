import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../shared/ui/Button';

export function AdminOrderDetail() {
  const params = useParams() as { id?: string };
  const id = params.id || '';
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error('Order not found');
        const data = await res.json();
        setOrder(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (!id) return <div className="p-6">No order id</div>;
  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Order {order.id}</h1>
        <div>
          <Button onClick={() => navigate('/admin/orders')} variant="ghost">Back</Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2 bg-card border rounded-md p-4">
          <h2 className="text-lg font-medium mb-2">Items</h2>
          <ul className="space-y-2">
            {(order.items || []).map((it: any, idx: number) => (
              <li key={idx} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{it.productName || it.name || it.title || it.productId}</div>
                  <div className="text-sm text-muted-foreground">Qty: {it.quantity}</div>
                </div>
                <div>${((it.total || it.price || 0)).toFixed(2)}</div>
              </li>
            ))}
          </ul>
        </div>

        <aside className="bg-card border rounded-md p-4">
          <h2 className="text-lg font-medium mb-2">Summary</h2>
          <div className="mb-2">Status: <strong>{order.status}</strong></div>
          <div className="mb-2">Total: <strong>${((order.total || order.totalAmount || 0)).toFixed(2)}</strong></div>
          {order.payment && (
            <div className="mt-2">
              <h3 className="text-sm font-medium">Payment</h3>
              <div>Amount: {(order.payment.amount_received || 0) / 100} {order.payment.currency}</div>
              <div>Payment intent: {order.payment.payment_intent}</div>
              <div>Payment status: {order.payment.payment_status}</div>
            </div>
          )}
        </aside>
      </div>

      <div className="mt-6 bg-card border rounded-md p-4">
        <h2 className="text-lg font-medium mb-2">Event History</h2>
        <ul className="space-y-2">
          {(order.events || []).map((ev: any) => (
            <li key={ev.id} className="text-sm">
              <div className="font-medium">{ev.type}</div>
              <div className="text-muted-foreground text-xs">{ev.receivedAt}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
