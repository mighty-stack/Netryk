import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Formik, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { Alert, Button, Card, FCheck, FInput, FSelect, PageHeader } from '../../components/ui';
import { useCreateShipmentMutation, useGetQuoteQuery } from '../../app/api';
import { applyServerErrors, errorMessage } from '../../lib/errors';
import { formatNaira } from '../../lib/format';
import { STATES } from '../../lib/states';

const party = { address: '', city: '', state: '', postcode: '', contactName: '', contactPhone: '' };
const initial = { pickup: { ...party }, delivery: { ...party }, parcel: { description: '', weightKg: '', fragile: false, declaredValue: '' }, service: 'standard' };

const partySchema = Yup.object({
  address: Yup.string().trim().min(5, 'Enter the full street address').required('Required'),
  city: Yup.string().trim().min(2, 'Required').required('Required'),
  state: Yup.string().required('Select a state'),
  contactName: Yup.string().trim().min(2, 'Required').required('Required'),
  contactPhone: Yup.string().required('Required'),
});
const schema = Yup.object({
  pickup: partySchema,
  delivery: partySchema,
  parcel: Yup.object({
    description: Yup.string().trim().min(3, 'Describe what you are sending').required('Required'),
    weightKg: Yup.number().typeError('Enter the weight').positive('Must be above 0').required('Required'),
  }),
});

function PartyFields({ prefix, title, nameLabel, phoneLabel }) {
  return (
    <Card>
      <h2 className="mb-4 text-lg font-extrabold">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><FInput name={`${prefix}.address`} label="Street address" hint="Include a landmark if you can" /></div>
        <FInput name={`${prefix}.city`} label="City" />
        <FSelect name={`${prefix}.state`} label="State" options={STATES} />
        <FInput name={`${prefix}.contactName`} label={nameLabel} />
        <FInput name={`${prefix}.contactPhone`} label={phoneLabel} type="tel" hint="The driver may call this number" />
        <div className="sm:col-span-2"><FInput name={`${prefix}.postcode`} label="Digital postcode (optional)" hint="NIPOST 11-character code, if you have it" /></div>
      </div>
    </Card>
  );
}

function QuotePreview() {
  const { values: v } = useFormikContext();
  const weight = Number(v.parcel.weightKg);
  const ready = v.pickup.state && v.delivery.state && weight > 0;
  const { data, error, isFetching } = useGetQuoteQuery({ pickupState: v.pickup.state, deliveryState: v.delivery.state, weightKg: weight, service: v.service, fragile: v.parcel.fragile }, { skip: !ready });
  return (
    <Card className="bg-cream" >
      <div aria-live="polite">
        <p className="text-sm text-muted">Price</p>
        {!ready && <p className="text-sm text-muted">Choose both states and the weight to see the price.</p>}
        {ready && isFetching && <p className="text-sm text-muted">Calculating...</p>}
        {ready && !isFetching && error && <p className="text-sm text-red-700">{errorMessage(error, 'Could not get a price.')}</p>}
        {ready && !isFetching && data && <p className="font-display text-3xl font-extrabold">{formatNaira(data.priceKobo)}</p>}
      </div>
    </Card>
  );
}

export default function Book() {
  const [create] = useCreateShipmentMutation();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const submit = async (v, { setFieldError }) => {
    setError('');
    const clean = (p) => ({ address: p.address, city: p.city, state: p.state, contactName: p.contactName, contactPhone: p.contactPhone, ...(p.postcode && { postcode: p.postcode }) });
    const body = {
      pickup: clean(v.pickup),
      delivery: clean(v.delivery),
      parcel: { description: v.parcel.description, weightKg: Number(v.parcel.weightKg), fragile: v.parcel.fragile, ...(v.parcel.declaredValue && { declaredValueKobo: Math.round(Number(v.parcel.declaredValue) * 100) }) },
      service: v.service,
    };
    try {
      const r = await create(body).unwrap();
      navigate(`/app/shipments/${r.shipment.id}`, { state: { justBooked: true } });
    } catch (e) {
      if (!applyServerErrors(e, setFieldError)) setError(errorMessage(e, 'Could not create the booking.'));
    }
  };

  return (
    <div className="max-w-3xl">
      <PageHeader title="Book a shipment" />
      <Formik initialValues={initial} validationSchema={schema} onSubmit={submit}>
        {({ isSubmitting }) => (
          <Form className="space-y-5" noValidate>
            <Alert>{error}</Alert>
            <PartyFields prefix="pickup" title="Pickup" nameLabel="Contact name at pickup" phoneLabel="Contact phone at pickup" />
            <PartyFields prefix="delivery" title="Delivery" nameLabel="Recipient name" phoneLabel="Recipient phone" />
            <Card>
              <h2 className="mb-4 text-lg font-extrabold">Parcel</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2"><FInput name="parcel.description" label="What are you sending?" /></div>
                <FInput name="parcel.weightKg" label="Weight (kg)" type="number" min="0.1" step="0.1" inputMode="decimal" />
                <FInput name="parcel.declaredValue" label="Declared value in naira (optional)" type="number" min="0" inputMode="numeric" hint="Used if you need to make a claim" />
                <FSelect name="service" label="Speed" options={[{ value: 'standard', label: 'Standard' }, { value: 'express', label: 'Express' }]} placeholder="Speed" />
                <div className="self-end"><FCheck name="parcel.fragile" label="Fragile, handle with care" /></div>
              </div>
            </Card>
            <QuotePreview />
            <Button type="submit" loading={isSubmitting} className="w-full sm:w-auto">Continue to payment</Button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
