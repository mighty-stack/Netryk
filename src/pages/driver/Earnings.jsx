import { Alert, Card, EmptyState, PageHeader, Spinner } from '../../components/ui';
import { PayoutBadge, TableWrap, Td, Th } from '../../components/bits';
import { useDriverEarningsQuery } from '../../app/api';
import { errorMessage } from '../../lib/errors';
import { formatDate, formatNaira } from '../../lib/format';

export default function Earnings() {
  const { data, error, isLoading } = useDriverEarningsQuery();
  return (
    <>
      <PageHeader title="Earnings" />
      {isLoading && <Spinner />}
      {error && <Alert>{errorMessage(error)}</Alert>}
      {data && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <Card><p className="text-sm text-muted">Waiting to be paid</p><p className="font-display text-3xl font-extrabold">{formatNaira(data.pendingKobo)}</p></Card>
            <Card><p className="text-sm text-muted">Paid to you</p><p className="font-display text-3xl font-extrabold">{formatNaira(data.paidKobo)}</p></Card>
          </div>
          {!data.data.length ? <EmptyState title="No earnings yet">Completed deliveries appear here.</EmptyState> : (
            <TableWrap>
              <thead><tr><Th>Date</Th><Th>Amount</Th><Th>Status</Th><Th>Paid on</Th></tr></thead>
              <tbody>{data.data.map((e) => (
                <tr key={e.id}><Td>{formatDate(e.createdAt)}</Td><Td className="font-medium">{formatNaira(e.amountKobo)}</Td><Td><PayoutBadge status={e.status} /></Td><Td>{formatDate(e.paidAt)}</Td></tr>
              ))}</tbody>
            </TableWrap>
          )}
        </>
      )}
    </>
  );
}
