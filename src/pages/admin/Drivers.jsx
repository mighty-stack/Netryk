import { useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Alert, Button, EmptyState, FInput, FSelect, PageHeader, Select, Input, Spinner } from '../../components/ui';
import { TableWrap, Td, Th } from '../../components/bits';
import Modal from '../../components/Modal';
import { useAdminDriversQuery, useAdminUpdateUserMutation, useCreateDriverMutation, useUpdateDriverMutation } from '../../app/api';
import { applyServerErrors, errorMessage } from '../../lib/errors';

const VERIFY_STYLE = { verified: 'bg-green-100 text-green-900', pending: 'bg-amber-100 text-amber-900', rejected: 'bg-red-100 text-red-900' };

const schema = Yup.object({
  fullName: Yup.string().min(2).required('Required'),
  email: Yup.string().email('Enter a valid email').required('Required'),
  phone: Yup.string().required('Required'),
  vehicle: Yup.object({ type: Yup.string().required('Select a type'), plate: Yup.string().min(3, 'Required').required('Required') }),
  guarantor: Yup.object({ name: Yup.string(), phone: Yup.string() }).test('both', 'Give the guarantor name and phone, or leave both empty', (g) => !!g.name === !!g.phone),
});

function CreateModal({ onClose }) {
  const [create] = useCreateDriverMutation();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const submit = async (v, { setFieldError }) => {
    setError('');
    const body = {
      fullName: v.fullName, email: v.email, phone: v.phone,
      vehicle: { type: v.vehicle.type, plate: v.vehicle.plate, ...(v.vehicle.model && { model: v.vehicle.model }) },
      ...(v.guarantor.name && { guarantor: v.guarantor }),
      employmentType: v.employmentType, vehicleOwnership: v.vehicleOwnership, payModel: v.payModel,
    };
    try { setResult(await create(body).unwrap()); } catch (e) { if (!applyServerErrors(e, setFieldError)) setError(errorMessage(e)); }
  };
  if (result) {
    return (
      <Modal title="Driver created" onClose={onClose}>
        <p className="mb-3 text-sm">Give {result.user.fullName} this temporary password. It is shown only once, and they must change it at first sign-in.</p>
        <p className="mb-4 select-all rounded-lg bg-cream p-4 text-center font-mono text-lg">{result.temporaryPassword}</p>
        <p className="mb-4 text-sm text-muted">The driver cannot receive jobs until you verify them.</p>
        <Button onClick={onClose}>Done</Button>
      </Modal>
    );
  }
  return (
    <Modal title="Add a driver" onClose={onClose}>
      <Formik initialValues={{ fullName: '', email: '', phone: '', vehicle: { type: '', plate: '', model: '' }, guarantor: { name: '', phone: '' }, employmentType: 'contractor', vehicleOwnership: 'own', payModel: 'per-delivery' }} validationSchema={schema} onSubmit={submit}>
        {({ isSubmitting }) => (
          <Form className="space-y-4" noValidate>
            <Alert>{error}</Alert>
            <FInput name="fullName" label="Full name" />
            <div className="grid gap-4 sm:grid-cols-2"><FInput name="email" label="Email" type="email" /><FInput name="phone" label="Phone" type="tel" /></div>
            <div className="grid gap-4 sm:grid-cols-3">
              <FSelect name="vehicle.type" label="Vehicle" options={['bike', 'car', 'van', 'truck']} />
              <FInput name="vehicle.plate" label="Plate number" />
              <FInput name="vehicle.model" label="Model (optional)" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2"><FInput name="guarantor.name" label="Guarantor name" /><FInput name="guarantor.phone" label="Guarantor phone" type="tel" /></div>
            <div className="grid gap-4 sm:grid-cols-3">
              <FSelect name="employmentType" label="Engagement" options={['contractor', 'employee']} placeholder="Select" />
              <FSelect name="vehicleOwnership" label="Vehicle owned by" options={['own', 'company', 'financed']} placeholder="Select" />
              <FSelect name="payModel" label="Pay model" options={[{ value: 'per-delivery', label: 'Per delivery' }, { value: 'salary', label: 'Salary' }]} placeholder="Select" />
            </div>
            <Button type="submit" loading={isSubmitting}>Create driver</Button>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}

function VerifyModal({ driver, onClose }) {
  const [update, { isLoading }] = useUpdateDriverMutation();
  const [f, setF] = useState({ status: driver.verification.status, provider: driver.verification.provider ?? '', reference: driver.verification.reference ?? '' });
  const [error, setError] = useState('');
  const go = async () => {
    try {
      await update({ id: driver.user.id, verification: { status: f.status, ...(f.provider && { provider: f.provider }), ...(f.reference && { reference: f.reference }) } }).unwrap();
      onClose();
    } catch (e) { setError(errorMessage(e)); }
  };
  return (
    <Modal title={`Verification, ${driver.user.fullName}`} onClose={onClose}>
      <div className="space-y-4">
        <Alert>{error}</Alert>
        <p className="text-sm text-muted">Record the result from your identity provider. Keep the provider's reference here, not the NIN or ID images.</p>
        <Select label="Status" value={f.status} onChange={(v) => setF({ ...f, status: v })} placeholder="Status" options={['pending', 'verified', 'rejected']} />
        <Input label="Provider (optional)" value={f.provider} onChange={(e) => setF({ ...f, provider: e.target.value })} />
        <Input label="Provider reference (optional)" value={f.reference} onChange={(e) => setF({ ...f, reference: e.target.value })} />
        <Button onClick={go} loading={isLoading} disabled={!f.status}>Save</Button>
      </div>
    </Modal>
  );
}

export default function Drivers() {
  const { data, error, isLoading } = useAdminDriversQuery();
  const [setUserStatus] = useAdminUpdateUserMutation();
  const [modal, setModal] = useState(null);
  const [msg, setMsg] = useState('');
  const toggle = async (d) => {
    setMsg('');
    try { await setUserStatus({ id: d.user.id, status: d.user.status === 'active' ? 'suspended' : 'active' }).unwrap(); } catch (e) { setMsg(errorMessage(e)); }
  };
  return (
    <>
      <PageHeader title="Drivers"><Button onClick={() => setModal({ kind: 'create' })}>Add a driver</Button></PageHeader>
      <div className="mb-4"><Alert>{msg}</Alert></div>
      {isLoading && <Spinner />}
      {error && <Alert>{errorMessage(error)}</Alert>}
      {data && !data.data.length && <EmptyState title="No drivers yet">Add your first driver, then verify them so they can receive jobs.</EmptyState>}
      {!!data?.data.length && (
        <TableWrap>
          <thead><tr><Th>Name</Th><Th>Phone</Th><Th>Vehicle</Th><Th>Roster</Th><Th>Verification</Th><Th>Account</Th><Th>Actions</Th></tr></thead>
          <tbody>
            {data.data.map((d) => (
              <tr key={d.id}>
                <Td className="font-medium">{d.user?.fullName}</Td>
                <Td>{d.user?.phone}</Td>
                <Td className="whitespace-nowrap">{d.vehicle.type}, {d.vehicle.plate}</Td>
                <Td className="text-xs text-muted">{d.employmentType}<br />{d.vehicleOwnership} vehicle<br />{d.payModel}</Td>
                <Td><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${VERIFY_STYLE[d.verification.status]}`}>{d.verification.status}</span></Td>
                <Td>{d.user?.status}</Td>
                <Td><div className="flex gap-2"><Button variant="dark" className="min-h-9 px-3 text-sm" onClick={() => setModal({ kind: 'verify', driver: d })}>Verify</Button><Button variant="ghost" className="min-h-9 px-3 text-sm" onClick={() => toggle(d)}>{d.user?.status === 'active' ? 'Suspend' : 'Reactivate'}</Button></div></Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
      {modal?.kind === 'create' && <CreateModal onClose={() => setModal(null)} />}
      {modal?.kind === 'verify' && <VerifyModal driver={modal.driver} onClose={() => setModal(null)} />}
    </>
  );
}
