import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import Logo from '../../components/Logo';
import { Alert, Button, Card, Mono, Spinner } from '../../components/ui';
import { StatusBadge, Timeline } from '../../components/bits';
import { useGetTrackingQuery } from '../../app/api';
import { errorMessage } from '../../lib/errors';

export function TrackBox({ className = '', dark = false }) {
  const [id, setId] = useState('');
  const navigate = useNavigate();
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (id.trim()) navigate(`/track/${id.trim().toUpperCase()}`); }} className={className}>
      <label htmlFor="trk" className={`mb-2 block font-mono text-xs font-medium uppercase tracking-widest ${dark ? 'text-goldtx' : 'text-goldtx'}`}>Track a shipment</label>
      <div className="flex flex-wrap gap-2.5">
        <input id="trk" value={id} onChange={(e) => setId(e.target.value)} placeholder="Enter tracking ID" autoCapitalize="characters" className="min-h-12 min-w-44 flex-1 rounded-lg border border-[#c9c3b4] bg-white px-4 font-mono text-base text-ink focus:border-ink focus:outline-none" />
        <Button type="submit" variant="dark" className="min-h-12"><Search className="size-4" aria-hidden="true" />Track</Button>
      </div>
    </form>
  );
}

export default function Track() {
  const { trackingId } = useParams();
  const { data, error, isFetching } = useGetTrackingQuery(trackingId, { skip: !trackingId });
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link to="/" className="mb-8 inline-block" aria-label="Netryk home"><Logo /></Link>
      <Card className="mb-6"><TrackBox /></Card>
      {isFetching && <Spinner label="Looking up your shipment" />}
      {error && <Alert>{error.status === 404 ? 'We could not find that tracking ID. Check it and try again.' : errorMessage(error)}</Alert>}
      {data && !isFetching && (
        <Card>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <Mono className="text-base font-medium">{data.trackingId}</Mono>
              <p className="mt-1 text-sm text-muted">{data.origin.city}, {data.origin.state} to {data.destination.city}, {data.destination.state}</p>
            </div>
            <StatusBadge status={data.status} />
          </div>
          <Timeline history={data.history} />
        </Card>
      )}
    </div>
  );
}
