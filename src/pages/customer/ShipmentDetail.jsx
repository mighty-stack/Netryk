import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Alert, Button, Card, Mono, Spinner } from '../../components/ui';
import { StatusBadge, Timeline } from '../../components/bits';
import Modal from '../../components/Modal';
import { useCancelShipmentMutation, useGetShipmentQuery, usePayShipmentMutation } from '../../app/api';
import { errorMessage } from '../../lib/errors';
import { formatNaira } from '../../lib/format';

const Row = ({ k, v }) => <div className="flex justify-between gap-4 py-1.5 text-sm"><dt className="text-muted">{k}</dt><dd className="text-right font-medium">{v}</dd></div>;
const Place = ({ title, p }) => (
  <Card>
    <h3 className="mb-2 text-base font-extrabold">{title}</h3>
    <p className="text-[15px]">{p.address}</p>
    <p className="text-sm text-muted">{p.city}, {p.state}{p.postcode ? ` · ${p.postcode}` : ''}</p>
    <p className="mt-2 text-sm">{p.contactName} · {p.contactPhone}</p>
  </Card>
);

export default function ShipmentDetail() {
  const { id } = useParams();
  const { state } = useLocation();
  const { data, error, isLoading } = useGetShipmentQuery(id);
  const [pay, { isLoading: paying }] = usePayShipmentMutation();
  const [cancel, { isLoading: cancelling }] = useCancelShipmentMutation();
  const [msg, setMsg] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [reason, setReason] = useState('');

  if (isLoading) return <Spinner />;
  if (error) return <Alert>{errorMessage(error, 'Shipment not found.')}</Alert>;
  const s = data.shipment;

  const doPay = async () => {
    setMsg('');
    try {
      const r = await pay(id).unwrap();
      window.location.assign(r.authorizationUrl); // hosted Paystack checkout
    } catch (e) { setMsg(errorMessage(e)); }
  };
  const doCancel = async () => {
    try { await cancel({ id, ...(reason && { reason }) }).unwrap(); setConfirm(false); } catch (e) { setMsg(errorMessage(e)); setConfirm(false); }
  };
  const showCode = s.deliveryCode && s.paymentStatus === 'paid' && !['delivered', 'cancelled'].includes(s.status);

  return (
    <div className="max-w-4xl">
      <Link to="/app" className="mb-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"><ArrowLeft className="size-4" aria-hidden="true" />All shipments</Link>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Mono className="text-lg font-medium">{s.trackingId}</Mono>
          <p className="text-sm text-muted">Share this ID with anyone who needs to follow the delivery.</p>
        </div>
        <div className="flex gap-2"><StatusBadge kind="payment" status={s.paymentStatus} /><StatusBadge status={s.status} /></div>
      </div>

      <div className="mb-5 space-y-3">
        {state?.justBooked && s.paymentStatus === 'unpaid' && <Alert kind="info">Booking saved. Pay below to confirm it. Unpaid bookings expire after 3 days.</Alert>}
        <Alert>{msg}</Alert>
        {s.paymentStatus === 'refund-due' && <Alert kind="info">This shipment was cancelled after payment. Netryk will refund you; contact support if you have not heard back.</Alert>}
      </div>

      {s.paymentStatus === 'unpaid' && s.status === 'pending' && (
        <Card className="mb-5 flex flex-wrap items-center justify-between gap-4 bg-cream">
          <div><p className="text-sm text-muted">Amount to pay</p><p className="font-display text-3xl font-extrabold">{formatNaira(s.priceKobo)}</p></div>
          <Button onClick={doPay} loading={paying}>Pay now</Button>
        </Card>
      )}

      {showCode && (
        <Card className="mb-5">
          <p className="text-sm text-muted">Delivery code</p>
          <p className="font-mono text-3xl font-medium tracking-[0.3em]">{s.deliveryCode}</p>
          <p className="mt-2 text-sm text-muted">Give this code to the recipient. They tell it to the driver only when they have the parcel in hand.</p>
        </Card>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <Place title="Pickup" p={s.pickup} />
        <Place title="Delivery" p={s.delivery} />
        <Card>
          <h3 className="mb-2 text-base font-extrabold">Parcel</h3>
          <p className="text-[15px]">{s.parcel.description}</p>
          <dl className="mt-2">
            <Row k="Weight" v={`${s.parcel.weightKg} kg`} />
            <Row k="Speed" v={s.service === 'express' ? 'Express' : 'Standard'} />
            {s.parcel.fragile && <Row k="Handling" v="Fragile" />}
            {s.driver && <Row k="Driver" v={s.driver.fullName} />}
          </dl>
        </Card>
        <Card>
          <h3 className="mb-2 text-base font-extrabold">Price</h3>
          <dl>
            <Row k="Base" v={formatNaira(s.priceBreakdown.baseKobo)} />
            {s.priceBreakdown.extraKgKobo > 0 && <Row k="Extra weight" v={formatNaira(s.priceBreakdown.extraKgKobo)} />}
            {s.priceBreakdown.expressKobo > 0 && <Row k="Express" v={formatNaira(s.priceBreakdown.expressKobo)} />}
            {s.priceBreakdown.fragileKobo > 0 && <Row k="Fragile handling" v={formatNaira(s.priceBreakdown.fragileKobo)} />}
            <div className="mt-2 border-t border-line pt-2"><Row k="Total" v={formatNaira(s.priceKobo)} /></div>
          </dl>
        </Card>
      </div>

      <Card className="mt-5"><h3 className="mb-4 text-base font-extrabold">Progress</h3><Timeline history={s.history} /></Card>

      {s.status === 'pending' && (
        <div className="mt-5"><Button variant="ghost" onClick={() => setConfirm(true)}>Cancel shipment</Button></div>
      )}
      {confirm && (
        <Modal title="Cancel this shipment?" onClose={() => setConfirm(false)}>
          <p className="mb-4 text-sm text-muted">{s.paymentStatus === 'paid' ? 'It is already paid, so a refund will be arranged.' : 'It has not been paid for.'}</p>
          <label htmlFor="reason" className="mb-1.5 block text-sm font-medium">Reason (optional)</label>
          <textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={300} className="mb-4 w-full rounded-lg border border-line p-3 text-[15px]" />
          <div className="flex gap-2"><Button variant="danger" loading={cancelling} onClick={doCancel}>Cancel shipment</Button><Button variant="ghost" onClick={() => setConfirm(false)}>Keep it</Button></div>
        </Modal>
      )}
    </div>
  );
}
