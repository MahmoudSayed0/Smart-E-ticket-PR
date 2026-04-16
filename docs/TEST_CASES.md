# Test Cases Document
## Smart E-Ticketing System

**Version:** 1.0
**Prepared by:** QA / Test Engineer (Teammate D)
**Last updated:** Sprint 4

---

## 1. Purpose

This document describes the human-readable manual test cases for the Smart E-Ticketing System, each mapped to an automated Jest unit test. It is used by the QA engineer during sprint reviews and by the whole team during the final demo.

## 2. Test Strategy

We use a **two-level testing approach**:

| Level | Tool | Target | Count |
|---|---|---|---|
| **Unit tests** | Jest + Mockito-style mocks | Services, repositories, domain entities, factory, strategies | 46 |
| **Manual tests** | Browser + Swagger UI | End-to-end user flows | 15 |

**Coverage target**: ≥70% on the service layer. **Actual: 100% on service layer, 83% overall.**

## 3. Test Environment

- **Operating System**: macOS / Windows / Linux
- **Node.js**: 20+
- **Backend**: `npm run start:dev` on `localhost:4000`
- **Frontend**: `npm run dev` on `localhost:3000`
- **Browser**: Chrome / Firefox / Safari (latest)

## 4. How to Run the Automated Tests

```bash
cd backend
npm test                 # run all tests
npm run test:cov         # with coverage report
```

Expected output: **Test Suites: 8 passed · Tests: 46 passed**.

## 5. Test Case Catalogue

### 5.1 Domain Entity Tests

| Test ID | Feature | Description | Expected Result | Status |
|---|---|---|---|---|
| TC-D-01 | Ticket entity | A newly created ticket is in VALID state | `ticket.status === 'VALID'` and `redeemedAt` is null | ✅ Pass |
| TC-D-02 | Ticket entity | Marking a ticket as used sets status to USED and records timestamp | `ticket.status === 'USED'` and `redeemedAt` is a Date | ✅ Pass |
| TC-D-03 | Ticket entity | Cannot mark an already-used ticket as used again | Throws `Cannot redeem a ticket that is not in VALID state` | ✅ Pass |
| TC-D-04 | Event entity | A newly created event has `remainingCapacity === totalCapacity` | Both capacity values are equal | ✅ Pass |
| TC-D-05 | Event entity | `getType()` returns the correct EventType for each subclass | Concert → `CONCERT`, Conference → `CONFERENCE`, Sports → `SPORTS` | ✅ Pass |
| TC-D-06 | Event entity | `decrementCapacity()` reduces remaining by 1 | `remainingCapacity` is `capacity - 1` | ✅ Pass |
| TC-D-07 | Event entity | `hasAvailableCapacity()` returns true/false correctly | True when remaining > 0, false when remaining = 0 | ✅ Pass |
| TC-D-08 | Event entity | Cannot decrement below zero | Throws `Cannot decrement capacity: no tickets remaining` | ✅ Pass |
| TC-D-09 | Event entity | `isExpired()` returns false for future event | Returns false | ✅ Pass |
| TC-D-10 | Event entity | `isExpired()` returns true for past event | Returns true | ✅ Pass |
| TC-D-11 | Event entity | `isExpired(now)` accepts an injected time | Returns false at t−1s, true at t+1s | ✅ Pass |

### 5.2 Repository Pattern Tests

| Test ID | Feature | Description | Expected Result | Status |
|---|---|---|---|---|
| TC-R-01 | Event repository | `save(event)` stores it and `findById(id)` returns it | Retrieved event is identical | ✅ Pass |
| TC-R-02 | Event repository | `findById` returns null for unknown id | Returns `null` | ✅ Pass |
| TC-R-03 | Event repository | `findAll` returns all stored events | Returns array of all events | ✅ Pass |
| TC-R-04 | Event repository | `findAll` returns empty array when no events exist | Returns `[]` | ✅ Pass |
| TC-R-05 | Event repository | `update(event)` persists the new state | Retrieved event reflects the update | ✅ Pass |
| TC-R-06 | Ticket repository | `save(ticket)` stores it and `findById(id)` returns it | Retrieved ticket is identical | ✅ Pass |
| TC-R-07 | Ticket repository | `findById` returns null for unknown id | Returns `null` | ✅ Pass |
| TC-R-08 | Ticket repository | `findByEventId` returns only tickets for that event | Correctly filtered array | ✅ Pass |
| TC-R-09 | Ticket repository | `update(ticket)` persists the new status | Retrieved ticket status is USED | ✅ Pass |

### 5.3 Factory Pattern Tests

| Test ID | Feature | Description | Expected Result | Status |
|---|---|---|---|---|
| TC-F-01 | EventFactory | Creates `ConcertEvent` when type is `CONCERT` | `instanceof ConcertEvent` is true | ✅ Pass |
| TC-F-02 | EventFactory | Creates `ConferenceEvent` when type is `CONFERENCE` | `instanceof ConferenceEvent` is true | ✅ Pass |
| TC-F-03 | EventFactory | Creates `SportsEvent` when type is `SPORTS` | `instanceof SportsEvent` is true | ✅ Pass |
| TC-F-04 | EventFactory | Initializes `remainingCapacity === totalCapacity` | Values are equal | ✅ Pass |
| TC-F-05 | EventFactory | Each created event has a unique id | UUIDs differ across invocations | ✅ Pass |

### 5.4 Strategy Pattern Tests

| Test ID | Feature | Description | Expected Result | Status |
|---|---|---|---|---|
| TC-S-01 | UuidCodeStrategy | Generates a valid UUID v4 | Matches UUID v4 regex | ✅ Pass |
| TC-S-02 | UuidCodeStrategy | Generates a unique value on each call | Two consecutive calls return different strings | ✅ Pass |
| TC-S-03 | ShortCodeStrategy | Generates `XXXX-XXXX` format | Matches `/^[A-Z2-9]{4}-[A-Z2-9]{4}$/` | ✅ Pass |
| TC-S-04 | ShortCodeStrategy | Produces diverse codes | 20 consecutive codes → ≥16 unique | ✅ Pass |
| TC-S-05 | NumericCodeStrategy | Generates a 6-digit numeric code | Matches `/^\d{6}$/` | ✅ Pass |

### 5.5 Service Layer Tests

| Test ID | Feature | Description | Expected Result | Status |
|---|---|---|---|---|
| TC-SV-01 | EventService | `createEvent` creates and saves a valid event | Event is instance of correct subclass, `repo.save` called | ✅ Pass |
| TC-SV-02 | EventService | Rejects an event with a past `eventDate` | Throws `BadRequestException`, `repo.save` not called | ✅ Pass |
| TC-SV-03 | EventService | `getAllEvents` returns all events from repo | Returns the mocked array | ✅ Pass |
| TC-SV-04 | EventService | `getEventById` returns the event | Returns the mocked event | ✅ Pass |
| TC-SV-05 | EventService | `getEventById` throws when not found | Throws `NotFoundException` | ✅ Pass |
| TC-SV-06 | TicketService | Creates a VALID ticket using the injected strategy | Status `VALID`, code is strategy output | ✅ Pass |
| TC-SV-07 | TicketService | Decrements event capacity and persists both entities | `remainingCapacity - 1`, both repos called | ✅ Pass |
| TC-SV-08 | TicketService | Throws when event does not exist | `NotFoundException` | ✅ Pass |
| TC-SV-09 | TicketService | Throws when event has no remaining capacity | `ConflictException`, no save | ✅ Pass |
| TC-SV-10 | TicketService | **Throws when event has already ended (expired)** | `ConflictException`, message "Event has already ended" | ✅ Pass |
| TC-SV-11 | TicketService | `getTicketById` returns the ticket | Returns the mocked ticket | ✅ Pass |
| TC-SV-12 | TicketService | `getTicketById` throws when not found | `NotFoundException` | ✅ Pass |
| TC-SV-13 | TicketService | Redeems a VALID ticket | Status becomes `USED`, `redeemedAt` set | ✅ Pass |
| TC-SV-14 | TicketService | Throws when ticket is already USED | `ConflictException` | ✅ Pass |
| TC-SV-15 | TicketService | Throws when ticket does not exist | `NotFoundException` | ✅ Pass |
| TC-SV-16 | TicketService | **Throws when the event has already ended** | `ConflictException`, message "Event has ended" | ✅ Pass |

## 6. Manual End-to-End Test Cases

These tests are executed manually through the browser during the demo and during sprint reviews.

| Test ID | Feature | Steps | Expected Result | Status |
|---|---|---|---|---|
| TC-M-01 | Event creation | 1. Open `/admin` 2. Fill form 3. Click Create | Event appears in list, capacity bar shows 0% used | ⬜ |
| TC-M-02 | Form validation | 1. Open `/admin` 2. Fill form with past date 3. Click Create | Error banner: "Event date must be in the future" | ⬜ |
| TC-M-03 | Capacity validation | 1. Fill form with capacity `0` 2. Click Create | Inline validation error | ⬜ |
| TC-M-04 | Ticket generation | 1. Click Generate on an event | New ticket appears in the event's ticket list with "New" badge | ⬜ |
| TC-M-05 | Ticket URL copy | 1. Click "Copy" on a valid ticket | Clipboard contains `http://localhost:3000/tickets/<id>`, button shows "Copied" | ⬜ |
| TC-M-06 | Open ticket page | 1. Click "Open" on a valid ticket | New tab opens with ticket detail page, QR code visible, status VALID | ⬜ |
| TC-M-07 | Countdown display | 1. Open a ticket page for a future event | "Ends in" countdown ticks every second | ⬜ |
| TC-M-08 | Ticket redemption | 1. Open a VALID ticket 2. Click Redeem | Status flips to USED, BadgeCheck icon, "Ticket redeemed" title | ⬜ |
| TC-M-09 | Prevent double redemption | 1. Redeem a ticket 2. Refresh the page | Redeem button is gone, USED state shown, API returns 409 if called | ⬜ |
| TC-M-10 | Admin sees redeemed tickets | 1. Return to `/admin` after redeeming | The redeemed ticket shows struck-through code + "Redeemed" label, no Copy/Open buttons | ⬜ |
| TC-M-11 | Capacity decrements | 1. Generate 3 tickets for a 5-capacity event | Capacity bar shows 60% used, `2/5` remaining | ⬜ |
| TC-M-12 | Prevent overselling | 1. Generate tickets until capacity is exhausted 2. Try to generate one more | Generate button disabled, backend returns 409 "No tickets remaining" | ⬜ |
| TC-M-13 | **Expired event: cannot generate** | 1. Create event with `eventDate` 2 min from now 2. Wait until past that time 3. Click Generate | Button disabled, backend returns 409 "Event has already ended" | ⬜ |
| TC-M-14 | **Expired event: cannot redeem** | 1. Generate ticket on an event 2. Let event expire 3. Open ticket → click Redeem | Ticket page shows "Expired" badge with Clock icon, Redeem button replaced with red error banner | ⬜ |
| TC-M-15 | Live expiry | 1. Open ticket page for an event 2 min away 2. Watch until countdown hits zero | Status auto-transitions to EXPIRED without page refresh | ⬜ |

## 7. How to Execute Manual Tests

**Before starting**, make sure both servers are running:

```bash
# Terminal 1
cd backend && npm run start:dev

# Terminal 2
cd frontend && npm run dev
```

Then open Chrome and walk through each TC-M-* case, filling the Status column with ✅ Pass or ❌ Fail.

## 8. Defect Log

Any failing test during manual execution should be recorded here:

| Defect ID | Test ID | Description | Severity | Status |
|---|---|---|---|---|
| *(none)* | | | | |

## 9. Sign-off

| Role | Name | Date | Signature |
|---|---|---|---|
| QA Engineer | Teammate D | __________ | __________ |
| Lead Engineer | Mahmoud | __________ | __________ |
| Product Owner | Teammate A | __________ | __________ |

---

**END OF TEST CASES DOCUMENT v1.0**
