import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from '../../components/Logo';
import { TrackBox } from './Track';
import { Select, Input } from '../../components/ui';
import { useGetQuoteQuery } from '../../app/api';
import { STATES } from '../../lib/states';
import { formatNaira } from '../../lib/format';

const PHONE = import.meta.env.VITE_SUPPORT_PHONE;
const EMAIL = import.meta.env.VITE_SUPPORT_EMAIL;
const WHATSAPP = import.meta.env.VITE_WHATSAPP_URL;
const CTA = 'inline-flex min-h-11 items-center rounded-lg px-5 text-[15px] font-semibold';
const NAV = [['#services', 'Services'], ['#how', 'How it works'], ['#pricing', 'Pricing'], ['#business', 'For business']];

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="bg-ink text-white">
      <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between px-5">
        <Link to="/" aria-label="Netryk home"><Logo /></Link>
        <nav aria-label="Main" className="hidden gap-8 text-[15px] text-ink-soft md:flex">
          {NAV.map(([h, l]) => <a key={h} href={h} className="hover:text-white">{l}</a>)}
        </nav>
        <div className="hidden items-center gap-5 md:flex">
          <Link to="/login" className="text-[15px] text-ink-soft hover:text-white">Log in</Link>
          <Link to="/app/book" className={`${CTA} bg-gold text-ink`}>Book a shipment</Link>
        </div>
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Menu" className="grid size-11 place-items-center rounded-lg hover:bg-white/10 md:hidden">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav aria-label="Mobile" className="space-y-1 border-t border-white/10 px-5 pb-5 pt-3 md:hidden">
          {NAV.map(([h, l]) => <a key={h} href={h} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-ink-soft hover:bg-white/5">{l}</a>)}
          <Link to="/login" className="block rounded-lg px-3 py-3 text-ink-soft hover:bg-white/5">Log in</Link>
          <Link to="/app/book" className={`${CTA} mt-2 w-full justify-center bg-gold text-ink`}>Book a shipment</Link>
        </nav>
      )}
    </header>
  );
}

const STAGES = ['Pending', 'Assigned', 'Picked up', 'In transit', 'Delivered'];

function Hero() {
  return (
    <section className="bg-ink pb-20 pt-10 text-white md:pb-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 md:grid-cols-2">
        <div>
          <p className="mb-5 font-mono text-xs font-medium uppercase tracking-widest text-gold">Parcel delivery across Nigeria</p>
          <h1 className="text-4xl font-extrabold leading-[1.05] md:text-6xl">Book a pickup. Follow every step to delivery.</h1>
          <p className="mb-8 mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">Enter the pickup and drop-off, pay online, and watch your shipment move from pending to delivered.</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/app/book" className={`${CTA} min-h-12 bg-gold text-ink`}>Book a shipment</Link>
            <a href="#pricing" className={`${CTA} min-h-12 border border-[#3a4a63] text-white`}>See pricing</a>
          </div>
        </div>
        <div className="rounded-2xl bg-cream p-6 text-ink sm:p-8">
          <TrackBox />
          <p className="mb-3.5 mt-7 text-[13px] text-muted">The stages you will see</p>
          <ol className="flex gap-1">
            {STAGES.map((s, i) => (
              <li key={s} className={`flex flex-1 flex-col items-center gap-1.5 text-center text-xs ${i < 3 ? 'font-semibold text-ink' : 'text-muted'}`}>
                <span className={`size-3 rounded-full border-2 ${i < 3 ? 'border-gold bg-gold' : 'border-[#c9c3b4]'}`} aria-hidden="true" />{s}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

const Section = ({ id, kicker, title, children }) => (
  <section id={id} className="px-5 py-14 md:py-20">
    <div className="mx-auto max-w-6xl">
      <p className="mb-3.5 font-mono text-xs font-medium uppercase tracking-widest text-goldtx">{kicker}</p>
      <h2 className="max-w-2xl text-3xl font-extrabold md:text-4xl">{title}</h2>
      <div className="mt-10">{children}</div>
    </div>
  </section>
);

const SERVICES = [
  ['Within your city', 'Pickup and drop-off between two addresses in the same city.'],
  ['Between states', 'Parcels sent from one state to another, priced by route and weight.'],
  ['For online sellers', 'Repeat pickups for shops that ship orders every week.'],
];
const STEPS = [
  ['Book', 'Add pickup, delivery and package details.'],
  ['Pay', 'Pay securely online. Your booking is confirmed once payment clears.'],
  ['Pickup', 'A driver is assigned and collects the parcel.'],
  ['Delivered', 'The status updates at each stage. The recipient gives the driver a code to complete delivery.'],
];

function QuoteCalculator() {
  const [f, setF] = useState({ pickupState: 'Lagos', deliveryState: '', weightKg: '1', service: 'standard' });
  const ready = f.pickupState && f.deliveryState && Number(f.weightKg) > 0;
  const { data, error, isFetching } = useGetQuoteQuery({ ...f, weightKg: Number(f.weightKg) }, { skip: !ready });
  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v }));
  return (
    <div className="grid gap-6 rounded-xl border border-line bg-white p-5 sm:p-7 md:grid-cols-[1.4fr_1fr]">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="From" value={f.pickupState} onChange={set('pickupState')} options={STATES} placeholder="Select state" />
        <Select label="To" value={f.deliveryState} onChange={set('deliveryState')} options={STATES} placeholder="Select state" />
        <Input label="Weight (kg)" type="number" min="0.1" step="0.1" value={f.weightKg} onChange={(e) => set('weightKg')(e.target.value)} />
        <Select label="Speed" value={f.service} onChange={set('service')} options={[{ value: 'standard', label: 'Standard' }, { value: 'express', label: 'Express' }]} placeholder="Speed" />
      </div>
      <div className="flex flex-col justify-center rounded-lg bg-cream p-6 text-center" aria-live="polite">
        {!ready && <p className="text-sm text-muted">Choose where it is going and the weight to see the price.</p>}
        {ready && isFetching && <p className="text-sm text-muted">Calculating...</p>}
        {ready && !isFetching && error && <p className="text-sm text-red-700">{error.data?.message || 'Could not get a price right now.'}</p>}
        {ready && !isFetching && data && (<><p className="text-sm text-muted">Price</p><p className="font-display text-4xl font-extrabold">{formatNaira(data.priceKobo)}</p><p className="mt-2 text-xs text-muted">Add pickup and delivery details when you book. Fragile items cost extra.</p></>)}
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div>
      <Header />
      <Hero />
      <Section id="services" kicker="What we move" title="Parcels, documents and small cargo.">
        <div className="grid gap-5 md:grid-cols-3">
          {SERVICES.map(([t, d]) => (
            <div key={t} className="rounded-xl border border-line bg-white p-7"><h3 className="text-xl font-extrabold">{t}</h3><p className="mt-3 leading-relaxed text-muted">{d}</p></div>
          ))}
        </div>
      </Section>
      <Section id="how" kicker="How it works" title="Four steps, all online.">
        <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([t, d], i) => (
            <li key={t}><p className="mb-2.5 font-mono text-sm font-medium text-goldtx">{String(i + 1).padStart(2, '0')}</p><h3 className="text-xl font-extrabold">{t}</h3><p className="mt-2 leading-relaxed text-muted">{d}</p></li>
          ))}
        </ol>
      </Section>
      <Section id="pricing" kicker="Pricing" title="Priced by route and weight.">
        <QuoteCalculator />
      </Section>
      <section id="business" className="px-5 pb-20 pt-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-8 rounded-2xl bg-ink p-8 text-white md:p-12">
          <div className="max-w-xl">
            <h2 className="text-3xl font-extrabold">Shipping orders every week?</h2>
            <p className="mt-3 leading-relaxed text-ink-soft">Tell us what you send and from where. We will set up repeat pickups.</p>
          </div>
          {WHATSAPP ? <a href={WHATSAPP} className={`${CTA} min-h-12 bg-gold text-ink`}>Message us on WhatsApp</a> : <Link to="/register" className={`${CTA} min-h-12 bg-gold text-ink`}>Create a business account</Link>}
        </div>
      </section>
      <footer className="bg-ink px-5 pb-8 pt-14 text-ink-soft">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 sm:grid-cols-3">
            <div><Logo className="text-white" /><p className="mt-3 font-mono text-xs font-medium uppercase tracking-widest text-gold">A Netzer company</p></div>
            <div className="space-y-2 text-sm"><p className="font-mono text-xs font-medium uppercase tracking-widest text-white">Company</p><p><a href="#services" className="hover:text-white">Services</a></p><p><a href="#pricing" className="hover:text-white">Pricing</a></p><p><Link to="/track" className="hover:text-white">Track a shipment</Link></p></div>
            {(PHONE || EMAIL) && <div className="space-y-2 text-sm"><p className="font-mono text-xs font-medium uppercase tracking-widest text-white">Contact</p>{PHONE && <p><a href={`tel:${PHONE}`} className="hover:text-white">{PHONE}</a></p>}{EMAIL && <p><a href={`mailto:${EMAIL}`} className="hover:text-white">{EMAIL}</a></p>}</div>}
          </div>
          <p className="mt-12 border-t border-[#243349] pt-6 text-[13px]">© {new Date().getFullYear()} Netryk. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
