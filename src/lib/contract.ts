// Practice 12 shared contract (docs/contract.md).
// Three separate steps: 1) validation, 2) availability calculation, 3) message for display.
// The booking rules themselves stay in src/booking.js (not changed for this practice).
import { getBookingViolations, MAX_BOOKING_LENGTH, MINUTES_PER_DAY } from '@/booking';
import { minutesToLabel } from '@/lib/format';

export type ReasonCode =
  | 'AVAILABLE'
  | 'INVALID_START'
  | 'PAST_START'
  | 'INVALID_DURATION'
  | 'END_AFTER_MIDNIGHT'
  | 'BLOCKED'
  | 'OVERLAP';

export interface Interval {
  start: number;
  end: number;
}

export interface SlotRequest {
  start: string; // "HH:MM"
  duration: number; // whole minutes
  blocked: boolean;
}

export interface SlotResult {
  available: boolean;
  reasonCode: ReasonCode;
  message: string;
  isInputError: boolean;
}

const INPUT_ERRORS: ReadonlySet<ReasonCode> = new Set(['INVALID_START', 'PAST_START', 'INVALID_DURATION', 'END_AFTER_MIDNIGHT']);

// ── 1. Validation ────────────────────────────────────────────────
export function parseStart(text: string): number | null {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(text.trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

export function validateRequest(req: SlotRequest, now: number): ReasonCode | null {
  const start = parseStart(req.start);
  if (start === null) return 'INVALID_START';
  if (start <= now) return 'PAST_START';
  if (!Number.isInteger(req.duration) || req.duration <= 0 || req.duration > MAX_BOOKING_LENGTH) return 'INVALID_DURATION';
  if (start + req.duration > MINUTES_PER_DAY) return 'END_AFTER_MIDNIGHT';
  return null;
}

// ── 2. Availability (uses the existing rule engine) ─────────────
export function calculate(start: number, end: number, now: number, blocked: boolean, bookings: readonly Interval[]): { code: ReasonCode; overlap?: Interval } {
  const violations = getBookingViolations({ start, end, now, blocked, bookings: [...bookings] });
  if (violations.some((v) => v.rule === 'blocked')) return { code: 'BLOCKED' };
  const overlap = violations.find((v) => v.rule === 'overlap');
  if (overlap) return { code: 'OVERLAP', overlap: overlap.bookings?.[0] };
  return { code: 'AVAILABLE' };
}

// ── 3. Message for display ──────────────────────────────────────
export function messageFor(code: ReasonCode, room: string, now: number, start?: number, end?: number, overlap?: Interval): string {
  switch (code) {
    case 'AVAILABLE':
      return `${room} is available from ${minutesToLabel(start ?? 0)} to ${minutesToLabel(end ?? 0)}.`;
    case 'INVALID_START':
      return 'Enter the start time as HH:MM, for example 10:00.';
    case 'PAST_START':
      return `Start time must be after the current time ${minutesToLabel(now)}.`;
    case 'INVALID_DURATION':
      return `Duration must be a whole number from 1 to ${MAX_BOOKING_LENGTH} minutes.`;
    case 'END_AFTER_MIDNIGHT':
      return 'The booking must end by 24:00.';
    case 'BLOCKED':
      return `${room} is blocked and cannot be booked.`;
    case 'OVERLAP':
      return `Overlaps existing booking ${minutesToLabel(overlap?.start ?? 0)}-${minutesToLabel(overlap?.end ?? 0)}.`;
  }
}

export function checkSlot(req: SlotRequest, room: string, now: number, bookings: readonly Interval[]): SlotResult {
  const invalid = validateRequest(req, now);
  if (invalid) {
    return { available: false, reasonCode: invalid, message: messageFor(invalid, room, now), isInputError: INPUT_ERRORS.has(invalid) };
  }
  const start = parseStart(req.start) as number;
  const end = start + req.duration;
  const { code, overlap } = calculate(start, end, now, req.blocked, bookings);
  return { available: code === 'AVAILABLE', reasonCode: code, message: messageFor(code, room, now, start, end, overlap), isInputError: false };
}
