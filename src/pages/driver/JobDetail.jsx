import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Phone } from 'lucide-react';
import { Alert, Button, Card, Input, Mono, Spinner } from '../../components/ui';
import { StatusBadge, Timeline } from '../../components/bits';
import { useDriverStatusMutation, useGetShipmentQuery } from '../../app/api';
import { errorMessage } from '../../lib/errors';

const ACTIONS = { assigned: ['picked-up', 'I have picked up the parcel'], 'picked-up': ['in-transit', 'Start delivery'], 'in-transit': ['delivered', 'Complete delivery'] };

const Place = ({ title, p }) => (
  <Card>
    <h3 className="mb-2 text-base font-extrabold">{title}</h3>
    <p className="text-[15px] font-medium">{p.address}</p>
    <p className="text-sm text-muted">{p.city}, {p.state}{p.postcode ? ` · ${p.postcode}` : ''}</p>
    <a href={`tel:${p.contactPhone}`} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg border border-line px-4 text-sm font-semibold"><Phone className="size-4" aria-hidden="true" />{p.contactName} · {p.contactPhone}</a>
  </Card>
);

export default function JobDetail() {
  const { id } = useParams();
  const { data, error, isLoading } = useGetShipmentQuery(id);
  const [advance, { isLoading: saving }] = useDriverStatusMutation();
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');

  if (isLoading) return <Spinner />;
  if (error) return <Alert>{errorMessage(error, 'Job not found.')}</Alert>;
  const s = data.shipment;
  const action = ACTIONS[s.status];

  const go = async () => {
    setMsg('');
    try {
      await advance({ id, status: action[0], ...(action[0] === 'delivered' && { code }) }).unwrap();
      setCode('');
    } catch (e) { setMsg(errorMessage(e)); }
  };

  return (
    <div className="max-w-2xl">
      <Link to="/driver" className="mb-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted"><ArrowLeft className="size-4" aria-hidden="true" />All jobs</Link>
      <div className="mb-5 flex items-center justify-between gap-2"><Mono className="text-lg font-medium">{s.trackingId}</Mono><StatusBadge status={s.status} /></div>
      <div className="space-y-4">
        <Alert>{msg}</Alert>
        <Place title="Pickup" p={s.pickup} />
        <Place title="Delivery" p={s.delivery} />
        <Card>
          <h3 className="mb-1 text-base font-extrabold">Parcel</h3>
          <p className="text-[15px]">{s.parcel.description}</p>
          <p className="mt-1 text-sm text-muted">{s.parcel.weightKg} kg{s.parcel.fragile ? ' · Fragile, handle with care' : ''}{s.service === 'express' ? ' · Express' : ''}</p>
        </Card>
        {action && (
          <Card className="bg-cream">
            {action[0] === 'delivered' && (
              <div className="mb-4">
                <Input label="Delivery code from the recipient" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} hint="Ask the recipient for their 6-digit code once they have the parcel." />
              </div>
            )}
            <Button onClick={go} loading={saving} disabled={action[0] === 'delivered' && code.length !== 6} className="w-full">{action[1]}</Button>
          </Card>
        )}
        <Card><h3 className="mb-4 text-base font-extrabold">History</h3><Timeline history={s.history} /></Card>
      </div>
    </div>
  );
}
