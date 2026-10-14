const naira = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 });
export const formatNaira = (kobo) => naira.format((kobo ?? 0) / 100);

export const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '-');
export const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '-';

export const STATUS_LABEL = { pending: 'Pending', assigned: 'Assigned', 'picked-up': 'Picked up', 'in-transit': 'In transit', delivered: 'Delivered', cancelled: 'Cancelled' };
export const PAYMENT_LABEL = { unpaid: 'Awaiting payment', paid: 'Paid', 'refund-due': 'Refund due', refunded: 'Refunded' };

export const STATUS_STYLE = {
  pending: 'bg-amber-100 text-amber-900',
  assigned: 'bg-sky-100 text-sky-900',
  'picked-up': 'bg-sky-100 text-sky-900',
  'in-transit': 'bg-indigo-100 text-indigo-900',
  delivered: 'bg-green-100 text-green-900',
  cancelled: 'bg-red-100 text-red-900',
  unpaid: 'bg-amber-100 text-amber-900',
  paid: 'bg-green-100 text-green-900',
  'refund-due': 'bg-red-100 text-red-900',
  refunded: 'bg-slate-200 text-slate-800',
};

// Mirrors the API's state machine so the UI only offers moves the server will accept.
export const NEXT_STATUS = {
  pending: ['assigned', 'cancelled'],
  assigned: ['picked-up', 'cancelled'],
  'picked-up': ['in-transit', 'cancelled'],
  'in-transit': ['delivered'],
  delivered: [],
  cancelled: [],
};
