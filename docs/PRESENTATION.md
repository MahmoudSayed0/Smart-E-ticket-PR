# Presentation Outline & Speaker Notes
## Smart E-Ticketing System — Software Engineering Project

**Duration:** 15 minutes (12 min presentation + 3 min Q&A)
**Team Size:** 6
**Owner:** Scrum Master (Esraa) — coordinates slide ownership

---

## 🎯 Goal of the Presentation

Demonstrate to the professor that our team applied **every single rubric item**:
1. SRS & Requirements (20%)
2. UML Diagrams (15%)
3. Architecture & Design Patterns (20%)
4. Clean Code / SOLID (15%)
5. Testing (10%)
6. Agile Process (10%)
7. Presentation & Demo (10%)

Each teammate owns 1–2 slides and speaks about their ownership area.

---

## 🎬 Slide-by-Slide Outline

### Slide 1 — Title (30 sec) · **Mahmoud**
**Content:** Project name, team members, course, date.
**Speaker notes:**
> "Good morning. We are the Smart E-Ticketing team. Today we'll walk through our full-stack MVP, explain the architecture and design patterns we used, demonstrate the live application, and show how we applied Agile Scrum with a 6-person team over 4 sprints."

---

### Slide 2 — Problem & Scope (1 min) · **Mahmoud (Product Owner)**
**Content:**
- One-sentence problem statement
- In-scope bullets: Create events, generate one-time tickets, view/redeem, enforce expiry
- Out-of-scope bullets: Payments, seat selection, auth, emails, real database

**Speaker notes:**
> "Event organizers need a simple way to issue and validate tickets without the overhead of a full ticketing platform. Our MVP focuses on **General Admission** — capacity-based ticket pools, no seat locking. We deliberately excluded payments, authentication, and email notifications because this is an **academic exercise** to practice software engineering fundamentals, not a commercial product."

---

### Slide 3 — Requirements Summary (1 min) · **Mahmoud**
**Content:**
- 9 user stories across 4 sprints (30 story points)
- Key functional requirements: FR-01 (create event), FR-02 (generate ticket), FR-04 (view ticket), FR-05 (redeem), FR-08 (enforce expiry)
- Non-functional highlights: ≥70% test coverage, SOLID compliance, swappable data layer

**Speaker notes:**
> "We wrote a full IEEE-style SRS with 9 user stories in INVEST format and 5 detailed use cases. Beyond the functional requirements, we focused on three non-functional goals that matter to the rubric: **maintainability** through SOLID, **testability** through dependency injection, and **swappability** of the data layer through the Repository pattern."

---

### Slide 4 — Architecture Overview (2 min) · **Mohammed**
**Content:**
- Four-layer diagram (Presentation → Controller → Service → Repository → Domain)
- Each layer's responsibility in one line
- Dependency arrow direction

**Speaker notes:**
> "We chose a classical **Layered Architecture** because the rubric weights OOP and SOLID at 50%, and a layered approach makes every principle visible to a reviewer. Each folder in `backend/src/` maps 1:1 to a layer — the grader can open `src/repository/` and see the Repository pattern instantly. Dependencies always flow downward, and high-level modules depend only on abstractions."

---

### Slide 5 — Class Diagram Walkthrough (2 min) · **Amr (Developer)**
**Content:**
- Full class diagram rendered from `docs/uml/class-diagram.puml`
- Point to the 3 labeled pattern notes (Repository, Factory, Strategy)

**Speaker notes:**
> "Here's our class diagram. Notice the three notes at the top labeling each pattern. We have: an abstract `Event` with three subclasses (Concert, Conference, Sports), two repository interfaces with in-memory implementations, the `EventFactory` that creates polymorphic events, and the `ITicketCodeStrategy` with three interchangeable implementations. Every service class depends on interfaces only — you can `grep` our service layer for 'InMemory' and get zero matches. That's Dependency Inversion in practice."

---

### Slide 6 — Design Pattern #1: Repository (1 min) · **Mohammed**
**Content:**
- `ITicketRepository` interface (4 methods)
- `InMemoryTicketRepository` implementation
- Quote from the assignment: *"mocked in-memory via the Repository pattern"*

**Speaker notes:**
> "The Repository pattern abstracts data access behind an interface. Our `TicketService` only knows about `ITicketRepository` — it doesn't care whether data lives in a `Map`, PostgreSQL, or a cloud service. To swap to a real database later, we'd write one new class implementing the interface and change one line in `app.module.ts`. Zero service code would change. This is exactly what the assignment asked for."

---

### Slide 7 — Design Pattern #2: Factory (1 min) · **Mohammed**
**Content:**
- `EventFactory.createEvent(dto)` with the `switch` statement
- Shows polymorphic return type `Event`

**Speaker notes:**
> "The Factory centralizes the creation logic for our three event types. The service layer calls `eventFactory.createEvent(dto)` and receives an abstract `Event` — it doesn't know or care which concrete subclass was instantiated. To add a new event type like `WorkshopEvent`, we add one new class and one new case in the factory. Nothing else changes. That's the Open/Closed Principle."

---

### Slide 8 — Design Pattern #3: Strategy (1 min) · **Mohammed**
**Content:**
- `ITicketCodeStrategy` interface (1 method)
- 3 implementations: `UuidCodeStrategy`, `ShortCodeStrategy`, `NumericCodeStrategy`
- Module wiring showing how DI selects one at runtime

**Speaker notes:**
> "Ticket codes can be generated in many ways — UUIDs, short human-friendly codes, or numeric codes. We encapsulate each algorithm behind a one-method interface. `TicketService` depends only on the interface and receives the strategy via NestJS's dependency injection container. To change the algorithm across the entire system, we change one line in the module. This proves both Strategy and Open/Closed in the same example."

---

### Slide 9 — SOLID Principles in Action (2 min) · **Mahmoud**
**Content:** 5 bullets, one per letter, each with a concrete example from the code.

**Speaker notes:**
> "Let me quickly walk through SOLID with examples from our code.
> - **S — Single Responsibility**: `EventService` only knows about events, `TicketService` only about tickets, `EventFactory` only about creating events.
> - **O — Open/Closed**: Adding a new event type touches only the new subclass and one factory case.
> - **L — Liskov Substitution**: The repository stores `Event` generically — `ConcertEvent`, `ConferenceEvent`, and `SportsEvent` all substitute cleanly.
> - **I — Interface Segregation**: We split repositories into `IEventRepository` and `ITicketRepository` rather than one fat interface. Each service depends only on what it needs.
> - **D — Dependency Inversion**: Services depend on interfaces, not concrete classes. Our unit tests prove this — we mock the repository in one line of Jest code, which would be impossible without DIP."

---

### Slide 10 — Live Demo (3 min) · **Mahmoud drives, whole team narrates**

**Prerequisites checked before starting:**
- Backend running on `localhost:4000`
- Frontend running on `localhost:3000`
- Browser tabs pre-opened: `/admin`, `/api-docs`, class diagram PNG
- Pre-seeded with 1 sample event

**Walkthrough (timed — 30 seconds per step):**

1. **Open `/admin`** → narrate the dashboard: sidebar, KPI cards, chart, events list
2. **Create a new event** → form validation shown, submit → appears in list
3. **Generate a ticket** → new badge appears, ticket shows in the event's list
4. **Click "Open"** → new tab opens ticket page with QR code, countdown, event details
5. **Click Redeem** → status flips to USED with BadgeCheck icon
6. **Switch back to admin tab** → auto-refresh shows the redeemed ticket struck-through
7. **Try to redeem again via Swagger** → open `/api-docs`, call `/tickets/:id/redeem` → 409 Conflict
8. **Show test execution** → open terminal, run `npm test` → 46 tests passing

**If time runs out, skip steps 7 and 8. Always show steps 1–6.**

---

### Slide 11 — Testing (1 min) · **Seif (QA)**
**Content:**
- Screenshot of Jest test output (8 suites, 46 tests, green)
- Coverage report showing 100% on services/repos/strategies, 83% overall
- Quote: *"Every service test mocks its dependencies — this proves DIP works"*

**Speaker notes:**
> "We have 46 unit tests across 8 suites running in under 3 seconds. Our coverage is 100% on the domain, repository, service, and strategy layers — 83% overall. The reason we can achieve that is because our services depend only on interfaces. Our tests inject mock repositories and mock strategies in a single line using Jest's built-in mocking — if the code weren't SOLID, this would be impossible."

---

### Slide 12 — Agile Process (1 min) · **Esraa (Scrum Master)**
**Content:**
- Screenshot of the Notion workspace (sprint pages + product backlog)
- Screenshot of GitHub showing feature branches and PRs
- List of 4 sprints with goals

**Speaker notes:**
> "We simulated four one-week sprints, each with Sprint Planning, Daily Standups, Sprint Review, and Retrospective — all documented in our Notion workspace. Our product backlog has 9 user stories in INVEST format, each with acceptance criteria in Given-When-Then format. We used Git with feature branches and pull requests, and every PR references a user story ID. Here's a screenshot of the workspace — you can see every retrospective, burndown, and task."

---

### Slide 13 — Lessons Learned (30 sec) · **Mahmoud**
**Content:**
- 3 short bullets from the final retrospective

**Speaker notes:**
> "Three lessons from the final retrospective. First: **architecture first, code second** — the two days we spent on the SRS and UML before writing code paid off tenfold. Second: **TypeScript interfaces are grader-friendly** — they make SOLID visible at a glance. Third: the **Repository pattern is worth it even for an in-memory store** because the swappability is the whole point."

---

### Slide 14 — Q&A (remaining time) · **Whole team**

Anticipated questions and pre-memorized answers are in [`docs/DEMO_SCRIPT.md`](DEMO_SCRIPT.md#anticipated-questions).

---

## 🎨 Slide Design Guidelines

- Use the **soft-pop theme colors** (beige background, black borders, purple primary, teal secondary, orange accent) for visual consistency with the running app
- Max **20 words per slide** — force yourself to memorize the narrative
- **No raw code paragraphs** — use a maximum of 6 lines of code with syntax highlighting, zoomed in
- **One big idea per slide**
- **Live demo is the star** — slides are a backdrop, not the show

## 🎯 Practice Plan

- Day before: **3 full dry runs** with the whole team
- Day of: 1 final dry run 1 hour before the real presentation
- Have a **backup video recording** of the demo in case localhost fails during the real presentation

---

**END OF PRESENTATION OUTLINE**
