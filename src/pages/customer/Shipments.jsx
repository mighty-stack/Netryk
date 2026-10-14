import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PlusCircle } from 'lucide-react';
import { Alert, Button, EmptyState, Mono, PageHeader, Spinner } from '../../components/ui';
import { Pagination, StatusBadge } from '../../components/bits';
import { useListShipmentsQuery } from '../../app/api';
import { errorMessage } from '../../lib/errors';
import { formatDate, formatNaira } from '../../lib/format';

export default function Shipments() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, error, isLoading } = useListShipmentsQuery({ page, limit });
  return (
    <>
      <PageHeader title="Your shipments">
        <Link to="/app/book"><Button><PlusCircle className="size-4" aria-hidden="true" />Book a shipment</Button></Link>
      </PageHeader>
      {isLoading && <Spinner />}
      {error && <Alert>{errorMessage(error)}</Alert>}
      {data && !data.data.length && <EmptyState title="No shipments yet"><Link to="/app/book" className="font-semibold text-ink underline">Book your first shipment</Link></EmptyState>}
      <ul className="space-y-3">
        {data?.data.map((s) => (
          <li key={s.id}>
            <Link to={`/app/shipments/${s.id}`} className="block rounded-xl border border-line bg-white p-4 transition hover:border-ink sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Mono className="font-medium">{s.trackingId}</Mono>
                <div className="flex flex-wrap gap-2">
                  {s.paymentStatus !== 'paid' && <StatusBadge kind="payment" status={s.paymentStatus} />}
                  <StatusBadge status={s.status} />
                </div>
              </div>
              <p className="mt-3 flex flex-wrap items-center gap-x-2 text-[15px] font-medium">{s.pickup.city}, {s.pickup.state} <ArrowRight className="size-4 text-muted" aria-hidden="true" /> {s.delivery.city}, {s.delivery.state}</p>
              <p className="mt-1 text-sm text-muted">{formatNaira(s.priceKobo)} · booked {formatDate(s.createdAt)}</p>
            </Link>
          </li>
        ))}
      </ul>
      {data && <Pagination page={data.page} limit={data.limit} total={data.total} onPage={setPage} />}
    </>
  );
}
