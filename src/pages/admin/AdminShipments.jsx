import { useState } from 'react';
import { Alert, Button, EmptyState, Mono, PageHeader, Select, Spinner } from '../../components/ui';
import { Pagination, StatusBadge, TableWrap, Td, Th } from '../../components/bits';
import Modal from '../../components/Modal';
import { useAdminDriversQuery, useAdminStatusMutation, useAssignDriverMutation, useListShipmentsQuery } from '../../app/api';
import { errorMessage } from '../../lib/errors';
import { formatDate, formatNaira, NEXT_STATUS, PAYMENT_LABEL, STATUS_LABEL } from '../../lib/format';

function AssignModal({ shipment, onClose }) {
  const { data } = useAdminDriversQuery();
  const [assign, { isLoading }] = useAssignDriverMutation();
  const [driverId, setDriverId] = useState('');
  const [error, setError] = useState('');
  const drivers = (data?.data ?? []).filter((d) => d.verification.status === 'verified' && d.user?.status === 'active');
  const go = async () => {
    try { await assign({ id: shipment.id, driverId }).unwrap(); onClose(); } catch (e) { setError(errorMessage(e)); }
  };
  return (
    <Modal title={`Assign driver, ${shipment.trackingId}`} onClose={onClose}>
      <div className="space-y-4">
        <Alert>{error}</Alert>
        {!drivers.length && <Alert kind="info">No verified drivers yet. Verify a driver on the Drivers page first.</Alert>}
        <Select label="Driver" value={driverId} onChange={setDriverId} placeholder="Choose a driver" options={drivers.map((d) => ({ value: d.user.id, label: `${d.user.fullName} (${d.vehicle.type}, ${d.vehicle.plate})` }))} />
        <Button onClick={go} loading={isLoading} disabled={!driverId}>Assign</Button>
      </div>
    </Modal>
  );
}

function StatusModal({ shipment, onClose }) {
  const [change, { isLoading }] = useAdminStatusMutation();
  const options = NEXT_STATUS[shipment.status].filter((s) => s !== 'assigned');
  const [status, setStatus] = useState(options[0] ?? '');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const go = async () => {
    try { await change({ id: shipment.id, status, note }).unwrap(); onClose(); } catch (e) { setError(errorMessage(e)); }
  };
  return (
    <Modal title={`Change status, ${shipment.trackingId}`} onClose={onClose}>
      <div className="space-y-4">
        <Alert>{error}</Alert>
        {!options.length ? <p className="text-sm text-muted">This shipment is {STATUS_LABEL[shipment.status].toLowerCase()} and cannot change.</p> : (
          <>
            <Select label="New status" value={status} onChange={setStatus} placeholder="Choose" options={options.map((s) => ({ value: s, label: STATUS_LABEL[s] }))} />
            {status === 'cancelled' && shipment.paymentStatus === 'paid' && <Alert kind="info">This shipment is paid. Cancelling marks it refund due.</Alert>}
            <div>
              <label htmlFor="note" className="mb-1.5 block text-sm font-medium">Reason (recorded in the history)</label>
              <textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} className="w-full rounded-lg border border-line p-3 text-[15px]" />
            </div>
            <Button variant={status === 'cancelled' ? 'danger' : 'primary'} onClick={go} loading={isLoading} disabled={!status || note.trim().length < 3}>Save</Button>
          </>
        )}
      </div>
    </Modal>
  );
}

export default function AdminShipments() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [modal, setModal] = useState(null); // { kind: 'assign' | 'status', shipment }
  const { data, error, isLoading, isFetching } = useListShipmentsQuery({ page, limit: 20, ...(status && { status }), ...(paymentStatus && { paymentStatus }) });
  const filter = (set) => (v) => { set(v); setPage(1); };

  return (
    <>
      <PageHeader title="Shipments" />
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:max-w-xl">
        <Select label="Status" value={status} onChange={filter(setStatus)} options={Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))} />
        <Select label="Payment" value={paymentStatus} onChange={filter(setPaymentStatus)} options={Object.entries(PAYMENT_LABEL).map(([value, label]) => ({ value, label }))} />
      </div>
      {isLoading && <Spinner />}
      {error && <Alert>{errorMessage(error)}</Alert>}
      {data && !data.data.length && <EmptyState title="No shipments match" />}
      {!!data?.data.length && (
        <div className={isFetching ? 'opacity-60' : ''}>
          <TableWrap>
            <thead><tr><Th>Tracking</Th><Th>Customer</Th><Th>Route</Th><Th>Price</Th><Th>Payment</Th><Th>Status</Th><Th>Driver</Th><Th>Booked</Th><Th>Actions</Th></tr></thead>
            <tbody>
              {data.data.map((s) => (
                <tr key={s.id}>
                  <Td><Mono className="font-medium">{s.trackingId}</Mono></Td>
                  <Td>{s.customer?.fullName ?? '-'}</Td>
                  <Td className="whitespace-nowrap">{s.pickup.city} to {s.delivery.city}</Td>
                  <Td>{formatNaira(s.priceKobo)}</Td>
                  <Td><StatusBadge kind="payment" status={s.paymentStatus} /></Td>
                  <Td><StatusBadge status={s.status} /></Td>
                  <Td>{s.driver?.fullName ?? <span className="text-muted">Unassigned</span>}</Td>
                  <Td className="whitespace-nowrap">{formatDate(s.createdAt)}</Td>
                  <Td>
                    <div className="flex gap-2">
                      {s.paymentStatus === 'paid' && ['pending', 'assigned'].includes(s.status) && <Button variant="dark" className="min-h-9 px-3 text-sm" onClick={() => setModal({ kind: 'assign', shipment: s })}>{s.driver ? 'Reassign' : 'Assign'}</Button>}
                      <Button variant="ghost" className="min-h-9 px-3 text-sm" onClick={() => setModal({ kind: 'status', shipment: s })}>Status</Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </div>
      )}
      {data && <Pagination page={data.page} limit={data.limit} total={data.total} onPage={setPage} />}
      {modal?.kind === 'assign' && <AssignModal shipment={modal.shipment} onClose={() => setModal(null)} />}
      {modal?.kind === 'status' && <StatusModal shipment={modal.shipment} onClose={() => setModal(null)} />}
    </>
  );
}
