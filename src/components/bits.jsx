import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PAYMENT_LABEL, STATUS_LABEL, STATUS_STYLE, formatDateTime } from '../lib/format';

export function StatusBadge({ status, kind = 'shipment' }) {
  const label = kind === 'payment' ? PAYMENT_LABEL[status] : STATUS_LABEL[status];
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[status] ?? 'bg-slate-100'}`}>{label ?? status}</span>;
}

export function Timeline({ history = [] }) {
  const items = [...history].reverse();
  return (
    <ol className="space-y-4">
      {items.map((h, i) => (
        <li key={i} className="flex gap-3">
          <span className={`mt-1.5 size-3 shrink-0 rounded-full ${i === 0 ? 'bg-gold' : 'bg-line'}`} aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold">{STATUS_LABEL[h.status] ?? h.status}{h.note ? <span className="font-normal text-muted"> - {h.note}</span> : null}</p>
            <p className="text-xs text-muted">{formatDateTime(h.at)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function Pagination({ page, limit, total, onPage }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between text-sm">
      <span className="text-muted">Page {page} of {pages} ({total} total)</span>
      <div className="flex gap-2">
        <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page" className="grid size-10 place-items-center rounded-lg border border-line bg-white disabled:opacity-40"><ChevronLeft className="size-4" /></button>
        <button type="button" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page" className="grid size-10 place-items-center rounded-lg border border-line bg-white disabled:opacity-40"><ChevronRight className="size-4" /></button>
      </div>
    </div>
  );
}

export const TableWrap = ({ children }) => (
  <div className="overflow-x-auto rounded-xl border border-line bg-white">
    <table className="w-full min-w-[720px] text-left text-sm">{children}</table>
  </div>
);
export const Th = ({ children }) => <th className="whitespace-nowrap border-b border-line bg-cream px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-widest text-muted">{children}</th>;
export const Td = ({ children, className = '' }) => <td className={`border-b border-line px-4 py-3 align-middle last:border-b-0 ${className}`}>{children}</td>;

export function PayoutBadge({ status }) {
  const paid = status === 'paid';
  return <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${paid ? 'bg-green-100 text-green-900' : 'bg-amber-100 text-amber-900'}`}>{paid ? 'Paid' : 'Waiting'}</span>;
}
