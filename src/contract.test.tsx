// @vitest-environment jsdom
// Practice 12: the same 8 test cases as the low-code app (docs/contract.md).
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { checkSlot, parseStart } from './lib/contract';
import type { ReasonCode } from './lib/contract';
import { CONTRACT_ROOM, CONTRACT_NOW, CONTRACT_BOOKINGS } from './data/contractRoom';
import ContractChecker from './components/ContractChecker';

afterEach(cleanup);

const cases: Array<[string, string, number, boolean, boolean, ReasonCode]> = [
  ['T1 valid free interval', '10:00', 60, false, true, 'AVAILABLE'],
  ['T2 overlap with existing booking', '09:30', 60, false, false, 'OVERLAP'],
  ['T3 blocked room', '10:00', 60, true, false, 'BLOCKED'],
  ['T4 duration = 0', '10:00', 0, false, false, 'INVALID_DURATION'],
  ['T5 duration = 121', '10:00', 121, false, false, 'INVALID_DURATION'],
  ['T6 past start time', '07:00', 30, false, false, 'PAST_START'],
  ['T7 adjacent non-overlapping interval', '10:00', 120, false, true, 'AVAILABLE'],
];

describe('Practice 12 contract - logic', () => {
  for (const [name, start, duration, blocked, available, code] of cases) {
    it(name, () => {
      const r = checkSlot({ start, duration, blocked }, CONTRACT_ROOM, CONTRACT_NOW, CONTRACT_BOOKINGS);
      expect(r.available).toBe(available);
      expect(r.reasonCode).toBe(code);
      expect(r.message.length).toBeGreaterThan(0);
    });
  }

  it('T8 booking data unchanged after all checks', () => {
    const before = JSON.stringify(CONTRACT_BOOKINGS);
    for (const [, start, duration, blocked] of cases) checkSlot({ start, duration, blocked }, CONTRACT_ROOM, CONTRACT_NOW, CONTRACT_BOOKINGS);
    expect(JSON.stringify(CONTRACT_BOOKINGS)).toBe(before);
    expect(CONTRACT_BOOKINGS).toEqual([{ start: 540, end: 600 }, { start: 720, end: 780 }]);
  });

  it('extra: start equal to now, bad format, decimal duration, end after midnight', () => {
    const c = (start: string, duration: number) => checkSlot({ start, duration, blocked: false }, CONTRACT_ROOM, CONTRACT_NOW, CONTRACT_BOOKINGS).reasonCode;
    expect(c('08:00', 30)).toBe('PAST_START');
    expect(c('25:00', 30)).toBe('INVALID_START');
    expect(c('abc', 30)).toBe('INVALID_START');
    expect(c('<b>10</b>', 30)).toBe('INVALID_START');
    expect(c('10:00', 1.5)).toBe('INVALID_DURATION');
    expect(c('10:00', NaN)).toBe('INVALID_DURATION');
    expect(c('23:30', 60)).toBe('END_AFTER_MIDNIGHT');
    expect(c('10:00', 1)).toBe('AVAILABLE');
    expect(parseStart(' 10:05 ')).toBe(605);
  });

  it('extra: validation comes before blocked (blocked + past start = PAST_START)', () => {
    expect(checkSlot({ start: '07:00', duration: 30, blocked: true }, CONTRACT_ROOM, CONTRACT_NOW, CONTRACT_BOOKINGS).reasonCode).toBe('PAST_START');
  });
});

describe('Practice 12 contract - UI', () => {
  function runUi(start: string, duration: string, blocked: boolean) {
    fireEvent.change(screen.getByLabelText('Start time'), { target: { value: start } });
    fireEvent.change(screen.getByLabelText('Duration'), { target: { value: duration } });
    const box = screen.getByLabelText('Room is blocked') as HTMLInputElement;
    if (box.checked !== blocked) fireEvent.click(box);
    fireEvent.click(screen.getByText('Check availability'));
    return screen.getByTestId('reason-code').textContent;
  }

  it('T1-T7 through the screen give the same codes, T8 shows bookings unchanged', () => {
    render(<ContractChecker />);
    for (const [, start, duration, blocked, , code] of cases) {
      expect(runUi(start, String(duration), blocked)).toBe(code);
    }
    expect(screen.getByTestId('data-check').textContent).toBe('Checks run: 7. Bookings unchanged: yes');
  });

  it('script-like input is shown as plain text error, not HTML', () => {
    const { container } = render(<ContractChecker />);
    expect(runUi('<img src=x onerror=alert(1)>', '30', false)).toBe('INVALID_START');
    expect(container.querySelector('img')).toBeNull();
  });
});
