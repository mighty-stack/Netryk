import { useId } from 'react';
import { useField } from 'formik';
import { Loader2 } from 'lucide-react';

const BTN = {
  primary: 'bg-gold text-ink hover:brightness-95',
  dark: 'bg-ink text-white hover:bg-ink/90',
  ghost: 'border border-line bg-white text-ink hover:bg-cream',
  danger: 'bg-red-700 text-white hover:bg-red-800',
};

export function Button({ variant = 'primary', loading = false, className = '', children, disabled, ...p }) {
  return (
    <button
      {...p}
      disabled={disabled || loading}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-[15px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${BTN[variant]} ${className}`}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

const CONTROL = 'block w-full min-h-11 rounded-lg border bg-white px-3.5 text-[15px] text-ink placeholder:text-muted/70 focus:border-ink focus:outline-none';

export function Field({ label, error, hint, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p role="alert" className="mt-1 text-xs font-medium text-red-700">{error}</p>}
    </div>
  );
}

// Formik-bound inputs: <FInput name="email" label="Email" />
function useBound(name) {
  const [field, meta] = useField(name);
  return { field, error: meta.touched && meta.error ? meta.error : '' };
}

export function FInput({ name, label, hint, ...p }) {
  const id = useId();
  const { field, error } = useBound(name);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</label>
      <input id={id} {...field} {...p} value={field.value ?? ''} aria-invalid={!!error} className={`${CONTROL} ${error ? 'border-red-600' : 'border-line'}`} />
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p role="alert" className="mt-1 text-xs font-medium text-red-700">{error}</p>}
    </div>
  );
}

export function FSelect({ name, label, options, placeholder = 'Select', ...p }) {
  const id = useId();
  const { field, error } = useBound(name);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</label>
      <select id={id} {...field} {...p} value={field.value ?? ''} aria-invalid={!!error} className={`${CONTROL} ${error ? 'border-red-600' : 'border-line'}`}>
        <option value="">{placeholder}</option>
        {options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o)).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p role="alert" className="mt-1 text-xs font-medium text-red-700">{error}</p>}
    </div>
  );
}

export function FCheck({ name, label }) {
  const [field] = useField({ name, type: 'checkbox' });
  return (
    <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
      <input type="checkbox" {...field} checked={!!field.value} className="size-5 accent-ink" />
      {label}
    </label>
  );
}

// Plain (non-Formik) select/input for filters.
export function Select({ label, value, onChange, options, placeholder = 'All', className = '' }) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={`${CONTROL} border-line`}>
        <option value="">{placeholder}</option>
        {options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o)).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export const Input = ({ label, hint, error, ...p }) => {
  const id = useId();
  return (
    <Field label={label} hint={hint} error={error}>
      <input id={id} {...p} className={`${CONTROL} ${error ? 'border-red-600' : 'border-line'}`} />
    </Field>
  );
};

export const Card = ({ className = '', children }) => <div className={`rounded-xl border border-line bg-white p-5 sm:p-6 ${className}`}>{children}</div>;

export function Alert({ kind = 'error', children }) {
  if (!children) return null;
  const s = { error: 'border-red-200 bg-red-50 text-red-900', ok: 'border-green-200 bg-green-50 text-green-900', info: 'border-amber-200 bg-amber-50 text-amber-900' }[kind];
  return <div role={kind === 'error' ? 'alert' : 'status'} className={`rounded-lg border px-4 py-3 text-sm ${s}`}>{children}</div>;
}

export const Spinner = ({ label = 'Loading' }) => (
  <div className="flex items-center justify-center gap-2 py-12 text-muted" role="status">
    <Loader2 className="size-5 animate-spin" aria-hidden="true" /> {label}...
  </div>
);

export const EmptyState = ({ title, children }) => (
  <div className="rounded-xl border border-dashed border-line bg-white px-6 py-12 text-center">
    <p className="font-display text-lg font-semibold">{title}</p>
    {children && <div className="mt-2 text-sm text-muted">{children}</div>}
  </div>
);

export const PageHeader = ({ title, children }) => (
  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
    <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
    {children && <div className="flex flex-wrap gap-2">{children}</div>}
  </div>
);

export const Mono = ({ children, className = '' }) => <span className={`font-mono text-[13px] tracking-wide ${className}`}>{children}</span>;
