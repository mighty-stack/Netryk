import { useState } from 'react';
import { Alert, Button, EmptyState, Input, PageHeader, Spinner } from '../../components/ui';
import { PayoutBadge, Pagination, TableWrap, Td, Th } from '../../components/bits';
import Modal from '../../components/Modal';
import { useAdminEarningsQuery, useMarkPaidMutation } from '../../app/api';
import { errorMessage } from '../../lib/errors';
import { formatDate, formatNaira } from '../../lib/format';

export default function AdminEarnings() {
  const [page, setPage] = useState(1);
  const { data, error, isLoading } = useAdminEarningsQuery({ page, limit: 20 });
  const [markPaid, { isLoading: saving }] = useMarkPaidMutation();
  const [picked, setPicked] = useState([]);
  const [open, setOpen] = useState(false);
  const [ref, setRef] = useState('');
  const [msg, setMsg] = useState('');
  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const total = (data?.data ?? []).filter((e) => picked.includes(e.id)).reduce((n, e) => n + e.amountKobo, 0);

  const go = async () => {
    try { await markPaid({ ids: picked, payoutReference: ref }).unwrap(); setPicked([]); setRef(''); setOpen(false); } catch (e) { setMsg(errorMessage(e)); setOpen(false); }
  };

  return (
    <>
      <PageHeader title="Driver earnings"><Button disabled={!picked.length} onClick={() => setOpen(true)}>Mark {picked.length || ''} as paid</Button></PageHeader>
      <p className="mb-4 text-sm text-muted">Pay drivers outside the app (bank transfer), then record it here with your transfer reference.</p>
      <div className="mb-4"><Alert>{msg}</Alert></div>
      {isLoading && <Spinner />}
      {error && <Alert>{errorMessage(error)}</Alert>}
      {data && !data.data.length && <EmptyState title="No earnings yet">They are created when a driver completes a delivery.</EmptyState>}
      {!!data?.data.length && (
        <>
          <TableWrap>
            <thead><tr><Th>Pay</Th><Th>Driver</Th><Th>Earned</Th><Th>Amount</Th><Th>Status</Th><Th>Reference</Th></tr></thead>
            <tbody>
              {data.data.map((e) => (
                <tr key={e.id}>
                  <Td>{e.status === 'pending' && <input type="checkbox" checked={picked.includes(e.id)} onChange={() => toggle(e.id)} aria-label={`Select payout for ${e.driver?.fullName}`} className="size-5 accent-ink" />}</Td>
                  <Td className="font-medium">{e.driver?.fullName ?? '-'}</Td>
                  <Td>{formatDate(e.createdAt)}</Td>
                  <Td>{formatNaira(e.amountKobo)}</Td>
                  <Td><PayoutBadge status={e.status} /></Td>
                  <Td className="text-muted">{e.payoutReference ?? '-'}</Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
          <Pagination page={data.page} limit={data.limit} total={data.total} onPage={setPage} />
        </>
      )}
      {open && (
        <Modal title="Record payout" onClose={() => setOpen(false)}>
          <div className="space-y-4">
            <p className="text-sm">{picked.length} earning{picked.length > 1 ? 's' : ''}, {formatNaira(total)} in total.</p>
            <Input label="Transfer reference" value={ref} onChange={(e) => setRef(e.target.value)} hint="From your bank or Paystack transfer" />
            <Button onClick={go} loading={saving} disabled={ref.trim().length < 3}>Mark as paid</Button>
          </div>
        </Modal>
      )}
    </>
  );
}
