import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Alert, EmptyState, Mono, PageHeader, Spinner } from '../../components/ui';
import { StatusBadge } from '../../components/bits';
import { useListShipmentsQuery } from '../../app/api';
import { errorMessage } from '../../lib/errors';
import { formatDateTime } from '../../lib/format';

const ACTIVE = ['assigned', 'picked-up', 'in-transit'];

function JobCard({ s }) {
  return (
    <li>
      <Link to={`/driver/jobs/${s.id}`} className="block rounded-xl border border-line bg-white p-4 active:bg-cream">
        <div className="flex items-center justify-between gap-2"><Mono className="font-medium">{s.trackingId}</Mono><StatusBadge status={s.status} /></div>
        <p className="mt-3 text-[15px] font-medium">{s.pickup.address}, {s.pickup.city}</p>
        <p className="my-1 flex items-center gap-1.5 text-muted"><ArrowRight className="size-4" aria-hidden="true" />to</p>
        <p className="text-[15px] font-medium">{s.delivery.address}, {s.delivery.city}</p>
        <p className="mt-2 text-xs text-muted">Assigned {formatDateTime(s.createdAt)}</p>
      </Link>
    </li>
  );
}

export default function Jobs() {
  const { data, error, isLoading } = useListShipmentsQuery({ page: 1, limit: 50 });
  const jobs = data?.data ?? [];
  const active = jobs.filter((j) => ACTIVE.includes(j.status));
  const done = jobs.filter((j) => !ACTIVE.includes(j.status));
  return (
    <>
      <PageHeader title="Your jobs" />
      {isLoading && <Spinner />}
      {error && <Alert>{errorMessage(error)}</Alert>}
      {data && !active.length && <EmptyState title="No active jobs">New jobs appear here when dispatch assigns them to you.</EmptyState>}
      <ul className="space-y-3">{active.map((s) => <JobCard key={s.id} s={s} />)}</ul>
      {!!done.length && (
        <>
          <h2 className="mb-3 mt-8 text-lg font-extrabold">Finished</h2>
          <ul className="space-y-3">{done.map((s) => <JobCard key={s.id} s={s} />)}</ul>
        </>
      )}
    </>
  );
}
