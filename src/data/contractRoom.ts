// Practice 12: one fictional room with fixed bookings (taken from the existing fixtures, not changed).
import { sampleBookings, FIXED_CURRENT_TIME } from '@/data/rooms';
import { getRoomBookings } from '@/lib/bookingLogic';
import type { Interval } from '@/lib/contract';

export const CONTRACT_ROOM = 'A-101';
export const CONTRACT_NOW = FIXED_CURRENT_TIME; // 08:00
export const CONTRACT_BOOKINGS: readonly Interval[] = Object.freeze(
  getRoomBookings(sampleBookings, 'r1').map((b) => Object.freeze({ start: b.start, end: b.end }))
); // 09:00-10:00, 12:00-13:00
