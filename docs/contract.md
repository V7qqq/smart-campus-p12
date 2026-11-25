# Practice 12 - shared contract (same for code-based and low-code)

User story: As a student, I want to choose a future start time and a duration for room A-101,
so I can see if the room is Available or Unavailable and why.

## Fixed fictional data
- Room: A-101, one room only.
- Current time ("now"): 08:00 (480 min), fixed so tests are repeatable.
- Existing bookings of A-101: 09:00-10:00 and 12:00-13:00. Shown only as "Booked", no names.
- Blocked flag: a switch, default off.

## Inputs
- start time: HH:MM (00:00-23:59)
- duration: whole minutes
- blocked: true / false
- bookings: the fixed list above (read only)

## Outputs
- available: true / false
- reason code: one of AVAILABLE, INVALID_START, PAST_START, INVALID_DURATION, END_AFTER_MIDNIGHT, BLOCKED, OVERLAP
- message: one clear sentence for the student

Validation codes (INVALID_START, PAST_START, INVALID_DURATION, END_AFTER_MIDNIGHT) are shown as input errors.
Order: validation first, then blocked, then overlap.

## Acceptance criteria
- AC1: Start time must be in the future (start > now). Start equal to now is rejected.
- AC2: Duration must be greater than zero and at most 120 minutes (whole minutes).
- AC3: Overlapping bookings are unavailable (start < b.end and end > b.start). Touching is not overlap.
- AC4: Blocked room is unavailable.
- AC5: Display a clear decision without changing existing bookings.
- AC6: Invalid input receives understandable feedback.

## Common test inputs (prepared before implementation)
| ID | Start | Duration | Blocked | Expected |
|----|-------|----------|---------|----------|
| T1 | 10:00 | 60  | no  | Available, AVAILABLE |
| T2 | 09:30 | 60  | no  | Unavailable, OVERLAP (09:00-10:00) |
| T3 | 10:00 | 60  | yes | Unavailable, BLOCKED |
| T4 | 10:00 | 0   | no  | validation error, INVALID_DURATION |
| T5 | 10:00 | 121 | no  | validation error, INVALID_DURATION |
| T6 | 07:00 | 30  | no  | validation error, PAST_START |
| T7 | 10:00 | 120 | no  | Available (10:00-12:00 touches both bookings) |
| T8 | run T1-T7 | - | - | bookings are the same before and after |
