import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Alert, Button, PageHeader, Spinner } from '../../components/ui';
import { Pagination, TableWrap, Td, Th } from '../../components/bits';
import { useAdminUpdateUserMutation, useAdminUsersQuery } from '../../app/api';
import { errorMessage } from '../../lib/errors';
import { formatDate } from '../../lib/format';

export default function Users() {
  const me = useSelector((s) => s.auth.user);
  const [page, setPage] = useState(1);
  const { data, error, isLoading } = useAdminUsersQuery({ page, limit: 20 });
  const [update] = useAdminUpdateUserMutation();
  const [msg, setMsg] = useState('');
  const toggle = async (u) => {
    setMsg('');
    try { await update({ id: u.id, status: u.status === 'active' ? 'suspended' : 'active' }).unwrap(); } catch (e) { setMsg(errorMessage(e)); }
  };
  return (
    <>
      <PageHeader title="Users" />
      <div className="mb-4"><Alert>{msg}</Alert></div>
      {isLoading && <Spinner />}
      {error && <Alert>{errorMessage(error)}</Alert>}
      {data && (
        <>
          <TableWrap>
            <thead><tr><Th>Name</Th><Th>Email</Th><Th>Phone</Th><Th>Role</Th><Th>Status</Th><Th>Joined</Th><Th>Actions</Th></tr></thead>
            <tbody>
              {data.data.map((u) => (
                <tr key={u.id}>
                  <Td className="font-medium">{u.fullName}</Td><Td>{u.email}</Td><Td>{u.phone}</Td><Td className="capitalize">{u.role}</Td>
                  <Td><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${u.status === 'active' ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}`}>{u.status}</span></Td>
                  <Td>{formatDate(u.createdAt)}</Td>
                  <Td>{u.id !== me.id && <Button variant="ghost" className="min-h-9 px-3 text-sm" onClick={() => toggle(u)}>{u.status === 'active' ? 'Suspend' : 'Reactivate'}</Button>}</Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
          <Pagination page={data.page} limit={data.limit} total={data.total} onPage={setPage} />
        </>
      )}
    </>
  );
}
