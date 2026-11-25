import { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, CalendarClock } from 'lucide-react';
import { checkSlot } from '@/lib/contract';
import type { SlotResult } from '@/lib/contract';
import { minutesToLabel } from '@/lib/format';
import { CONTRACT_ROOM, CONTRACT_NOW, CONTRACT_BOOKINGS } from '@/data/contractRoom';

const SNAPSHOT = JSON.stringify(CONTRACT_BOOKINGS);

export default function ContractChecker() {
  const [start, setStart] = useState('10:00');
  const [duration, setDuration] = useState('60');
  const [blocked, setBlocked] = useState(false);
  const [result, setResult] = useState<SlotResult | null>(null);
  const [checks, setChecks] = useState(0);

  function onCheck() {
    const d = duration.trim() === '' ? NaN : Number(duration);
    setResult(checkSlot({ start, duration: d, blocked }, CONTRACT_ROOM, CONTRACT_NOW, CONTRACT_BOOKINGS));
    setChecks((c) => c + 1);
  }

  const unchanged = JSON.stringify(CONTRACT_BOOKINGS) === SNAPSHOT;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white">
          <CalendarClock className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 sm:text-xl">Room {CONTRACT_ROOM} - availability check</h1>
          <p className="text-sm text-slate-500">Practice 12 contract. Current time {minutesToLabel(CONTRACT_NOW)} (fixed). Fictional data.</p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="block text-sm font-medium text-slate-700">
            Start time (HH:MM)
            <input aria-label="Start time" value={start} onChange={(e) => setStart(e.target.value)} placeholder="10:00"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Duration (minutes)
            <input aria-label="Duration" inputMode="numeric" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="60"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input aria-label="Room is blocked" type="checkbox" checked={blocked} onChange={(e) => setBlocked(e.target.checked)} className="h-4 w-4" />
            Room is blocked
          </label>
          <button type="button" onClick={onCheck} className="w-full rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700">
            Check availability
          </button>
        </div>

        <div className="space-y-4">
          <div role="status" aria-live="polite"
            className={`rounded-2xl border-2 p-5 ${!result ? 'border-slate-200 bg-white' : result.available ? 'border-emerald-200 bg-emerald-50' : result.isInputError ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'}`}>
            {!result && <p className="text-sm text-slate-500">Enter a start time and duration, then press Check availability.</p>}
            {result && (
              <div className="flex items-start gap-3">
                {result.available ? <CheckCircle2 className="h-7 w-7 shrink-0 text-emerald-600" />
                  : result.isInputError ? <AlertTriangle className="h-7 w-7 shrink-0 text-amber-600" />
                  : <XCircle className="h-7 w-7 shrink-0 text-red-600" />}
                <div>
                  <p className="text-lg font-bold">{result.available ? 'Available' : result.isInputError ? 'Check your input' : 'Unavailable'}</p>
                  <p className="text-sm">{result.message}</p>
                  <p className="mt-1 text-xs text-slate-500">Reason code: <span data-testid="reason-code">{result.reasonCode}</span></p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold text-slate-700">Existing bookings - {CONTRACT_ROOM}</h2>
            <ul className="space-y-1 text-sm">
              {CONTRACT_BOOKINGS.map((b) => (
                <li key={b.start} className="flex justify-between rounded-lg bg-slate-50 px-3 py-1.5">
                  <span>{minutesToLabel(b.start)} - {minutesToLabel(b.end)}</span><span className="text-slate-400">Booked</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-slate-500" data-testid="data-check">
              Checks run: {checks}. Bookings unchanged: {unchanged ? 'yes' : 'NO'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
