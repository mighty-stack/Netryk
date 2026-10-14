import { Link } from 'react-router-dom';
import { Alert, Card, EmptyState, Mono, PageHeader, Spinner } from '../../components/ui';
import { StatusBadge } from '../../components/bits';
import { useAdminStatsQuery, useListShipmentsQuery } from '../../app/api';
import { errorMessage } from '../../lib/errors';
import { formatNaira, STATUS_LABEL } from '../../lib/format';

export default function Overview() {
  const { data, error, isLoading } = useAdminStatsQuery();
  const { data: queue } = useListShipmentsQuery({ page: 1, limit: 5, status: 'pending', paymentStatus: 'paid' });
  if (isLoading) return <Spinner />;
  if (error) return <Alert>{errorMessage(error)}</Alert>;
  const max = Math.max(1, ...data.deliveredLast7Days.map((d) => d.count));
  return (
    <>
      <PageHeader title="Overview" />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><p className="text-sm text-muted">Revenue, last 30 days</p><p className="font-display text-2xl font-extrabold">{formatNaira(data.revenueLast30DaysKobo)}</p></Card>
        {['pending', 'assigned', 'in-transit', 'delivered'].map((k) => (
          <Card key={k}><p className="text-sm text-muted">{STATUS_LABEL[k]}</p><p className="font-display text-2xl font-extrabold">{data.byStatus[k] ?? 0}</p></Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-extrabold">Needs dispatch</h2>
          {!queue?.data.length ? <EmptyState title="Nothing waiting">Paid shipments with no driver appear here.</EmptyState> : (
            <ul className="divide-y divide-line">
              {queue.data.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div><Mono className="font-medium">{s.trackingId}</Mono><p className="text-sm text-muted">{s.pickup.city} to {s.delivery.city}</p></div>
                  <StatusBadge status={s.status} />
                </li>
              ))}
            </ul>
          )}
          <Link to="/admin/shipments" className="mt-4 inline-block text-sm font-semibold underline">Open shipments</Link>
        </Card>
        <Card>
          <h2 className="mb-4 text-lg font-extrabold">Deliveries, last 7 days</h2>
          {!data.deliveredLast7Days.length ? <p className="text-sm text-muted">No deliveries yet.</p> : (
            <ul className="space-y-2.5">
              {data.deliveredLast7Days.map((d) => (
                <li key={d.date} className="flex items-center gap-3 text-sm">
                  <span className="w-24 shrink-0 font-mono text-xs text-muted">{d.date}</span>
                  <span className="h-3 rounded bg-gold" style={{ width: `${(d.count / max) * 100}%`, minWidth: 6 }} aria-hidden="true" />
                  <span className="font-medium">{d.count}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
