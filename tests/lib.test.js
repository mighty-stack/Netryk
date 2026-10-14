import { describe, expect, it } from 'vitest';
import { formatNaira, NEXT_STATUS, STATUS_LABEL } from '../src/lib/format';
import { applyServerErrors, errorMessage } from '../src/lib/errors';
import { STATES } from '../src/lib/states';

describe('format', () => {
  it('shows kobo as naira', () => {
    expect(formatNaira(150000)).toMatch(/1,500\.00/);
    expect(formatNaira(0)).toMatch(/0\.00/);
  });
  it('covers every status and 37 states', () => {
    expect(Object.keys(NEXT_STATUS).every((s) => STATUS_LABEL[s])).toBe(true);
    expect(STATES).toHaveLength(37);
  });
  it('never offers a move the API forbids', () => {
    expect(NEXT_STATUS.pending).not.toContain('delivered');
    expect(NEXT_STATUS.delivered).toEqual([]);
  });
});

describe('errors', () => {
  it('turns API and network errors into plain messages', () => {
    expect(errorMessage({ status: 400, data: { message: 'Nope' } })).toBe('Nope');
    expect(errorMessage({ status: 'FETCH_ERROR' })).toMatch(/Cannot reach/);
    expect(errorMessage(undefined)).toBe('');
  });
  it('maps field errors onto form fields', () => {
    const seen = {};
    const applied = applyServerErrors({ data: { errors: [{ path: 'pickup.contactPhone', message: 'Bad phone' }] } }, (p, m) => (seen[p] = m));
    expect(applied).toBe(true);
    expect(seen['pickup.contactPhone']).toBe('Bad phone');
    expect(applyServerErrors({ data: {} }, () => {})).toBe(false);
  });
});
