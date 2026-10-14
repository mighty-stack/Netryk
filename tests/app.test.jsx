import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App';
import { makeStore } from '../src/app/store';

const customer = { id: 'u1', role: 'customer', fullName: 'Ada Obi', email: 'ada@x.com', phone: '+2348031234567', mustChangePassword: false };
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

function mount(path, auth = { token: null, user: null, ready: true }, routes = {}) {
  vi.stubGlobal('fetch', vi.fn(async (req) => {
    const url = new URL(typeof req === 'string' ? req : req.url);
    for (const [frag, body] of Object.entries(routes)) if (url.pathname.includes(frag)) return json(body);
    return json({ message: 'unmocked' }, 404);
  }));
  const store = makeStore({ auth });
  render(<Provider store={store}><MemoryRouter initialEntries={[path]}><App /></MemoryRouter></Provider>);
  return store;
}

afterEach(() => vi.unstubAllGlobals());

describe('access control', () => {
  it('sends signed-out visitors from a protected page to login', async () => {
    mount('/app');
    expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });
  it('keeps a customer out of admin screens', async () => {
    mount('/admin', { token: 't', user: customer, ready: true }, { '/shipments': { data: [], page: 1, limit: 10, total: 0 } });
    expect(await screen.findByRole('heading', { name: /your shipments/i })).toBeInTheDocument();
  });
  it('forces a temporary password to be changed first', async () => {
    mount('/app', { token: 't', user: { ...customer, mustChangePassword: true }, ready: true });
    expect(await screen.findByRole('heading', { name: /choose a new password/i })).toBeInTheDocument();
  });
});

describe('session', () => {
  it('restores a stored session from /auth/me before rendering the page', async () => {
    mount('/app', { token: 't', user: null, ready: false }, { '/auth/me': { user: customer }, '/shipments': { data: [], page: 1, limit: 10, total: 0 } });
    expect(await screen.findByText(/no shipments yet/i)).toBeInTheDocument();
  });
  it('drops an invalid stored token and shows login', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json({ message: 'Session expired or invalid' }, 401)));
    const store = makeStore({ auth: { token: 'stale', user: null, ready: false } });
    render(<Provider store={store}><MemoryRouter initialEntries={['/app']}><App /></MemoryRouter></Provider>);
    expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(store.getState().auth.token).toBeNull();
  });
});

describe('forms and pages', () => {
  it('login validates before calling the server', async () => {
    mount('/login');
    await userEvent.click(await screen.findByRole('button', { name: /sign in/i }));
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(await screen.findByText('Password is required')).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });
  it('registration offers customer accounts only (no role choice)', async () => {
    mount('/register');
    expect(await screen.findByRole('heading', { name: /create your account/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/role/i)).toBeNull();
  });
  it('landing page carries no invented numbers or testimonials', async () => {
    mount('/');
    expect(await screen.findByRole('heading', { name: /book a pickup/i })).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/1200|850 |happy clients|swiftship/i);
    expect(screen.getByText(/a netzer company/i)).toBeInTheDocument();
  });
  it('an unpaid shipment shows the server price and a pay button', async () => {
    const shipment = { id: 's1', trackingId: 'NTKABC234DEF', status: 'pending', paymentStatus: 'unpaid', service: 'standard', priceKobo: 350000, priceBreakdown: { baseKobo: 350000, extraKgKobo: 0, expressKobo: 0, fragileKobo: 0 }, parcel: { description: 'Shoes', weightKg: 2, fragile: false }, pickup: { address: '1 A St', city: 'Ikeja', state: 'Lagos', contactName: 'Ada', contactPhone: '+2348031234567' }, delivery: { address: '2 B St', city: 'Kano', state: 'Kano', contactName: 'Bala', contactPhone: '+2348031234568' }, history: [{ status: 'pending', at: new Date().toISOString(), note: 'Booked' }] };
    mount('/app/shipments/s1', { token: 't', user: customer, ready: true }, { '/shipments/s1': { shipment } });
    expect(await screen.findByRole('button', { name: /pay now/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByText(/3,500\.00/).length).toBeGreaterThan(0));
    expect(screen.queryByText(/delivery code/i)).toBeNull(); // only shown once paid
  });
});
