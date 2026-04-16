# Software Requirements Specification (SRS)
## Smart E-Ticketing System

**Version:** 1.1
**Date:** April 2026
**Prepared by:** [Team Name]
**Course:** Software Engineering
**Owner:** Product Owner (Teammate A)

---

## 1. Introduction

### 1.1 Purpose
This document describes the functional and non-functional requirements of the **Smart E-Ticketing System**, a web-based application that enables event administrators to create events, generate one-time-use tickets, and allows ticket holders to view and redeem their tickets through a unique link.

The purpose of this SRS is to serve as a contract between the development team and stakeholders, defining the scope, behavior, and constraints of the system before development begins.

### 1.2 Scope
The Smart E-Ticketing System is an **MVP (Minimum Viable Product)** developed as an academic exercise to practice core software engineering principles: Agile methodology, SOLID design, design patterns, clean code, unit testing, and version control.

**In Scope:**
- Creation and management of general-admission events by an administrator
- Generation of unique, one-time-use tickets tied to events
- Public viewing of a ticket via a unique URL
- Ticket redemption (marking as "used") at the venue gate
- Prevention of reusing an already-redeemed ticket
- **Prevention of operations on expired events (added v1.1)**
- In-memory data persistence abstracted behind the Repository pattern

**Out of Scope (intentionally excluded for the MVP):**
- Payment processing or financial transactions
- Seat selection or real-time seat locking
- User registration, login, or password management
- Email or SMS notifications
- Refund, cancellation, or ticket transfer workflows
- Multi-language or accessibility localization
- Mobile native application
- Persistent database (PostgreSQL, MySQL, etc.) — simulated via in-memory repository

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|---|---|
| **Event** | A scheduled happening (concert, conference, match) for which tickets are sold |
| **Ticket** | A unique, one-time-use entry pass associated with an event |
| **Ticket Code** | A unique alphanumeric identifier printed/shown on the ticket |
| **Redemption** | The act of using a ticket to gain entry; once redeemed, the ticket becomes invalid |
| **Expired Event** | An event whose `eventDate` is in the past; the system rejects ticket operations on expired events |
| **Admin** | User with privileges to create events and generate tickets |
| **Ticket Holder** | End user who possesses a ticket and may redeem it |
| **MVP** | Minimum Viable Product |
| **SRS** | Software Requirements Specification |
| **API** | Application Programming Interface |
| **DTO** | Data Transfer Object |
| **SOLID** | Five object-oriented design principles (SRP, OCP, LSP, ISP, DIP) |

### 1.4 References
- IEEE Std 830-1998: Recommended Practice for Software Requirements Specifications
- Course Guidelines: *Software Engineering Project Guidelines*
- Gang of Four, *Design Patterns: Elements of Reusable Object-Oriented Software*

---

## 2. Overall Description

### 2.1 Product Perspective
The Smart E-Ticketing System is a **standalone web application** consisting of:
- A **backend REST API** (NestJS + TypeScript) exposing endpoints for event and ticket management
- A **frontend web client** (Next.js + TypeScript) providing the admin dashboard and public ticket page
- An **in-memory data store** accessed exclusively through Repository interfaces, designed to be swappable with a relational database in the future without affecting business logic

The system has no dependencies on external services.

### 2.2 Product Functions
At a high level, the system shall:
1. Allow an administrator to create new events
2. Allow an administrator to generate one-time-use tickets for an event
3. Allow an administrator to view a list of all events and their ticket counts
4. Allow a ticket holder to view the details of a specific ticket via a unique URL
5. Allow a ticket holder (or gate staff) to redeem a ticket, marking it as used
6. Prevent the redemption of an already-used ticket
7. Prevent the generation of tickets beyond the event's defined capacity
8. Prevent the generation and redemption of tickets on expired events (v1.1)

### 2.3 User Classes and Characteristics

| User Class | Description | Technical Skill | Frequency of Use |
|---|---|---|---|
| **Administrator** | Event organizer who creates events and generates tickets | Basic web literacy | Daily during event setup |
| **Ticket Holder** | End user who receives a ticket link and views/redeems the ticket | Minimal | Once per ticket |
| **Gate Staff** | Person at the venue entrance who validates tickets | Minimal | Repeatedly during event |

### 2.4 Operating Environment
- **Client side**: Any modern web browser (Chrome, Firefox, Safari, Edge) on desktop or mobile
- **Server side**: Node.js 20+ runtime; runs locally on `localhost:3000` (frontend) and `localhost:4000` (backend) for the MVP demo
- **Development OS**: macOS, Windows, or Linux
- **Network**: Local HTTP (no HTTPS required for MVP)

### 2.5 Design and Implementation Constraints
- **CON-01**: The system **must** use at least 3 design patterns from the following list: Repository, Factory, Strategy, Observer
- **CON-02**: The system **must** follow SOLID principles throughout the codebase
- **CON-03**: Code **must** follow Clean Code guidelines: meaningful names, small functions, no duplication
- **CON-04**: The data layer **must** be implemented in-memory but architected behind Repository interfaces, such that swapping to a real relational database would require no changes to the service layer
- **CON-05**: All business logic **must** be covered by unit tests using Jest
- **CON-06**: All source code **must** be managed in Git with feature branches and pull requests
- **CON-07**: The project **must** be delivered using Agile/Scrum methodology across 4 sprints

### 2.6 Assumptions and Dependencies
- **ASM-01**: The administrator is trusted; no authentication is required for the MVP (single-admin assumption)
- **ASM-02**: Ticket holders receive the ticket URL out-of-band (manually shared); the system does not send emails
- **ASM-03**: The demo environment is a single machine running both frontend and backend locally
- **ASM-04**: Only one administrator operates the system at a time (no multi-admin conflicts)

---

## 3. Functional Requirements

### 3.1 FR-01: Create Event
**Priority**: High
**Description**: The system shall allow an administrator to create a new event by providing the event name, description, venue, date, and total ticket capacity.
**Input**: Event name (3–100 chars), description (≤500 chars), venue, event date (ISO date, must be in the future), total capacity (≥1), event type (CONCERT | CONFERENCE | SPORTS)
**Processing**: System validates input, assigns a unique event ID, initializes `remainingCapacity` equal to `totalCapacity`, timestamps creation, persists via `IEventRepository`
**Output**: Confirmation with the newly created event ID and full event details
**Error Cases**:
- E-01.1: Any required field missing → HTTP 400 with validation message
- E-01.2: Event date in the past → HTTP 400 "Event date must be in the future"
- E-01.3: Capacity ≤ 0 → HTTP 400 "Capacity must be at least 1"

### 3.2 FR-02: Generate Ticket
**Priority**: High
**Description**: The system shall allow an administrator to generate a new one-time-use ticket for an existing event.
**Input**: Event ID (UUID)
**Processing**: System locates the event via `IEventRepository`; **verifies the event has not expired**; checks remaining capacity; generates a unique ticket code using an `ITicketCodeStrategy`; creates a ticket with status `VALID`; decrements remaining capacity; persists via `ITicketRepository`
**Output**: The generated ticket including its unique code and redemption URL
**Error Cases**:
- E-02.1: Event ID not found → HTTP 404 "Event not found"
- E-02.2: Event capacity exhausted → HTTP 409 "No tickets remaining for this event"
- **E-02.3: Event has already ended → HTTP 409 "Event has already ended" (v1.1)**

### 3.3 FR-03: List Events
**Priority**: Medium
**Description**: The system shall allow an administrator to view all events with their details and remaining ticket counts.
**Input**: None
**Processing**: System fetches all events via `IEventRepository.findAll()`
**Output**: Array of events with ID, name, venue, date, total capacity, remaining capacity, and expiry status
**Error Cases**: None (empty array returned if no events exist)

### 3.4 FR-04: View Ticket
**Priority**: High
**Description**: The system shall allow any user with a valid ticket URL to view the ticket's details.
**Input**: Ticket ID (UUID) in the URL path
**Processing**: System fetches the ticket via `ITicketRepository.findById()`; fetches the associated event
**Output**: Ticket details including event name, venue, date, ticket code, status (VALID / USED / EXPIRED), countdown until event start, and a QR code representation of the ticket code
**Error Cases**:
- E-04.1: Ticket ID not found → HTTP 404 "Ticket not found"

### 3.5 FR-05: Redeem Ticket
**Priority**: High
**Description**: The system shall allow a ticket holder or gate staff to redeem a valid ticket, marking it as used and preventing future redemptions.
**Input**: Ticket ID (UUID)
**Processing**: System locates the ticket; verifies the ticket status is `VALID`; **verifies the associated event has not expired**; updates status to `USED`; records the redemption timestamp; persists the change
**Output**: Confirmation that the ticket has been redeemed
**Error Cases**:
- E-05.1: Ticket ID not found → HTTP 404 "Ticket not found"
- E-05.2: Ticket already used → HTTP 409 "This ticket has already been redeemed"
- **E-05.3: Event has ended → HTTP 409 "Event has ended. This ticket can no longer be redeemed" (v1.1)**

### 3.6 FR-06: Prevent Overselling
**Priority**: High
**Description**: The system shall never allow more tickets to be generated than the event's total capacity.
**Implementation**: Enforced atomically in `TicketService.generateTicket()` by checking and decrementing remaining capacity in the same operation, protected by the repository's thread-safe operations.

### 3.7 FR-07: Prevent Ticket Reuse
**Priority**: High
**Description**: The system shall guarantee that once a ticket has been redeemed, it cannot be redeemed again.
**Implementation**: Enforced in `TicketService.redeemTicket()` by checking the ticket's status before performing the update.

### 3.8 FR-08: Enforce Event Expiry (v1.1)
**Priority**: High
**Description**: The system shall prevent the generation and redemption of tickets for events whose `eventDate` is in the past. An event becomes "expired" the moment the current time crosses `eventDate`.
**Implementation**: A new method `Event.isExpired()` on the domain entity returns true when `eventDate <= Date.now()`. Both `TicketService.generateTicket` and `TicketService.redeemTicket` call `isExpired()` before performing their operation and throw `ConflictException` if the event has expired.
**UI Behaviour**: The frontend displays a live countdown timer via `useCountdown` hook, disables the Generate button, and shows an "EXPIRED" state with the `Clock` icon on the ticket page when the event has ended.
**Rationale**: Added in Sprint 4 after the team noticed that the previous design allowed ticket generation and redemption on past-dated events, which does not match real-world behavior.

### 3.9 FR-09: List Tickets for an Event
**Priority**: Medium
**Description**: The system shall allow an administrator to view all tickets generated for a specific event.
**Input**: Event ID (UUID)
**Processing**: `TicketService.getTicketsForEvent()` calls `ITicketRepository.findByEventId()`
**Output**: Array of tickets with id, code, status, created date, and redemption timestamp
**Error Cases**: None (empty array returned if the event has no tickets)

---

## 4. External Interface Requirements

### 4.1 User Interfaces
The frontend provides **two primary pages**:

**4.1.1 Admin Dashboard (`/admin`)**
- Sidebar navigation (Dashboard, Events, Tickets, Analytics, Settings)
- Sticky header with breadcrumb and search
- Four KPI cards: Total Events, Tickets Issued, Valid, Redeemed
- Bar chart: Tickets per Event (valid vs redeemed)
- Create event form (left column, sticky)
- Events list (right column) with capacity bar, countdown, and expandable ticket list per event
- Each ticket row shows Copy and Open actions (disabled for redeemed tickets)

**4.1.2 Ticket Page (`/tickets/[id]`)**
- Animated ticket card with cut-out circles and dashed separators
- Header: icon (CheckCircle2 / BadgeCheck / Clock) + E-TICKET label + status badge
- Event name and type
- Details rows (Venue, Date, Ticket ID, Redeemed at)
- Live countdown ("Ends in X")
- QR code with the ticket code displayed below
- Redeem button (shown only for VALID tickets)
- 3D tilt effect on mouse hover

### 4.2 Software Interfaces
The backend exposes a REST API under `http://localhost:4000` with the following endpoints:

| Method | Endpoint | Description | Maps to |
|---|---|---|---|
| POST | `/events` | Create a new event | FR-01 |
| GET | `/events` | List all events | FR-03 |
| GET | `/events/:id` | Get a single event | FR-03 |
| POST | `/events/:id/tickets` | Generate a ticket for an event | FR-02, FR-06, FR-08 |
| GET | `/events/:id/tickets` | List all tickets for an event | FR-09 |
| GET | `/tickets/:id` | View ticket details | FR-04 |
| POST | `/tickets/:id/redeem` | Redeem a ticket | FR-05, FR-07, FR-08 |

All responses are JSON. Interactive API documentation is available at `http://localhost:4000/api-docs` (Swagger UI).

### 4.3 Communications Interfaces
- HTTP/1.1 over TCP on localhost
- JSON request/response bodies (`Content-Type: application/json`)
- CORS enabled between frontend (`:3000`) and backend (`:4000`)

---

## 5. Non-Functional Requirements

### 5.1 Performance
- **NFR-01**: API responses shall complete in under 100ms for any single-entity operation
- **NFR-02**: The admin dashboard shall render its initial view in under 1 second on a modern browser

### 5.2 Usability
- **NFR-03**: The admin shall be able to create an event in no more than 7 form fields and 1 button click
- **NFR-04**: The ticket page shall be readable on screens as small as 320px wide (mobile-friendly)
- **NFR-05**: Error messages shall be displayed in plain language, not as raw stack traces

### 5.3 Maintainability
- **NFR-06**: The codebase shall achieve ≥70% unit-test coverage on the service layer (actual: 100%)
- **NFR-07**: All classes shall adhere to SOLID principles, verifiable by code review
- **NFR-08**: No method shall exceed 30 lines of code; no file shall exceed 300 lines
- **NFR-09**: The data-access layer shall be replaceable by implementing the repository interfaces without modifying service or controller code

### 5.4 Reliability
- **NFR-10**: The system shall guarantee that a ticket can never be redeemed twice
- **NFR-11**: The system shall guarantee that the number of generated tickets never exceeds an event's capacity
- **NFR-12**: The system shall guarantee that no operations succeed on expired events (v1.1)

### 5.5 Portability
- **NFR-13**: The system shall run on macOS, Windows, and Linux without code changes
- **NFR-14**: The system shall require only Node.js 20+ and npm as host dependencies

### 5.6 Testability
- **NFR-15**: Every service class shall be unit-testable in isolation by injecting mock repositories
- **NFR-16**: The test suite shall run in under 30 seconds (actual: ~3 seconds)

---

## 6. User Stories

| ID | User Story | Priority | Points |
|---|---|---|---|
| US-01 | As an **admin**, I want to **create a new event** with name, venue, date, and capacity, so that I can prepare for ticket sales. | High | 5 |
| US-02 | As an **admin**, I want to **see all events I have created**, so that I can manage them from one place. | Medium | 2 |
| US-03 | As an **admin**, I want to **generate a new ticket for an event**, so that I can give attendees access to the event. | High | 5 |
| US-04 | As an **admin**, I want to **see the remaining capacity of each event**, so that I don't oversell tickets. | Medium | 3 |
| US-05 | As a **ticket holder**, I want to **view my ticket details via a unique link**, so that I have proof of my entry. | High | 3 |
| US-06 | As a **ticket holder**, I want to **see a QR code of my ticket**, so that I can be scanned quickly at the venue. | Medium | 2 |
| US-07 | As a **gate staff / admin**, I want to **redeem a ticket and mark it as used**, so that it cannot be reused. | High | 5 |
| US-08 | As a **gate staff**, I want the system to **reject already-used tickets**, so that no one enters twice with the same ticket. | High | 3 |
| US-09 | As a **gate staff**, I want the system to **reject invalid ticket IDs**, so that fraudulent attempts are blocked. | Medium | 2 |
| US-10 | As a **gate staff**, I want **expired events to reject all operations**, so that tickets can't be generated or redeemed after an event ends. | High | 3 |

**Total: 33 story points across 4 sprints** (~8 points per sprint average).

---

## 7. Use Cases

### UC-01: Create Event
- **Actor**: Administrator
- **Precondition**: Admin is on the admin dashboard
- **Main Flow**: Admin clicks "Create Event" → fills form → submits → system validates → persists via `IEventRepository.save()` → displays success
- **Alternate Flow A1.1**: Validation fails → inline error messages; no event created
- **Postcondition**: New event exists with `remainingCapacity === totalCapacity`

### UC-02: Generate Ticket
- **Actor**: Administrator
- **Precondition**: Event exists, has remaining capacity, and has not expired
- **Main Flow**: Admin clicks "Generate Ticket" → system checks expiry → system checks capacity → `ITicketCodeStrategy` generates code → `Ticket` created with `VALID` status → capacity decremented → ticket URL returned
- **Alternate Flow A2.1**: Event expired → "Event has already ended"
- **Alternate Flow A2.2**: Capacity exhausted → "No tickets remaining"
- **Postcondition**: Ticket exists in `VALID` state; event remaining capacity decreased by 1

### UC-03: View Ticket
- **Actor**: Ticket Holder
- **Precondition**: Ticket holder has a valid URL
- **Main Flow**: Opens URL → system fetches ticket and event → displays details + QR + countdown
- **Alternate Flow A3.1**: Ticket ID not found → "Ticket not found"
- **Postcondition**: Ticket holder sees ticket details; ticket state unchanged

### UC-04: Redeem Ticket
- **Actor**: Ticket Holder / Gate Staff
- **Precondition**: Ticket exists and is VALID, event has not expired
- **Main Flow**: User clicks "Redeem Ticket" → system verifies status is VALID → verifies event not expired → marks as USED → records timestamp → displays success
- **Alternate Flow A4.1**: Already USED → "This ticket has already been used"
- **Alternate Flow A4.2**: Event expired → "Event has ended — ticket expired"
- **Alternate Flow A4.3**: Ticket not found → "Ticket not found"
- **Postcondition**: Ticket is in `USED` state and cannot be redeemed again

### UC-05: List Events
- **Actor**: Administrator
- **Main Flow**: Admin navigates to dashboard → system fetches all events → renders table with name, date, venue, remaining capacity, expiry status, and actions
- **Postcondition**: Admin sees all events and can take actions on non-expired ones

---

## 8. Glossary

| Term | Meaning |
|---|---|
| **Admin Dashboard** | The web page at `/admin` used by the administrator |
| **API** | The REST interface exposed by the NestJS backend |
| **Capacity** | The total number of tickets that may be issued for an event |
| **DTO (Data Transfer Object)** | Plain object used to move data between the client and server |
| **Event** | A real-world happening to which tickets may grant entry |
| **Expired** | An event past its `eventDate`; tickets cannot be generated or redeemed |
| **In-Memory Repository** | A class that stores data in a `Map` in RAM, conforming to a repository interface |
| **One-Time Ticket** | A ticket that becomes invalid after its first successful redemption |
| **QR Code** | A 2D barcode encoding the ticket's unique code for quick visual scanning |
| **Redemption** | The act of marking a ticket as used |
| **Repository** | An abstraction over data persistence, hiding storage details from the business layer |
| **Ticket Code** | The unique alphanumeric identifier generated by an `ITicketCodeStrategy` |
| **VALID / USED / EXPIRED** | The three possible states of a ticket as perceived by the UI |

---

**END OF SRS v1.1**
