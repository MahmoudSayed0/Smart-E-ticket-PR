# Demo Script & Q&A Cheat Sheet
## Smart E-Ticketing System — Live Demo

**Duration:** 3 minutes live + 3 minutes Q&A
**Driver:** Mahmoud (clicks through the app)
**Narrators:** The whole team takes turns describing what's happening

---

## 🔧 Pre-Demo Setup Checklist

Do **all** of these 30 minutes before the presentation:

- [ ] Laptop fully charged or plugged in
- [ ] Close every app except Chrome, VS Code, and two terminal windows
- [ ] Terminal 1: `cd backend && npm run start:dev` (wait for green "Nest application successfully started")
- [ ] Terminal 2: `cd frontend && npm run dev` (wait for "Ready in Xs")
- [ ] Open Chrome with these tabs in order:
  1. `http://localhost:3000/admin`
  2. `http://localhost:4000/api-docs`
  3. The rendered class diagram PNG (for slide 5)
  4. The Notion workspace root page
- [ ] Zoom the browser to **125%** so the back row of the classroom can read it
- [ ] Pre-seed the database with **one sample event** (3-hour capacity, date 1 day from now, name "Coldplay Live at Cairo Stadium") — so the dashboard isn't empty when the demo starts
- [ ] Record a backup screencast of the demo flow just in case
- [ ] Test the projector connection before the professor arrives

---

## 🎬 Demo Walkthrough — Click by Click

### Step 1 — Open the admin dashboard (20 sec)

**Action:** Click the pre-opened `http://localhost:3000/admin` tab.

**Narration (Mahmoud):**
> "This is our admin dashboard. You can see a left sidebar with navigation, a sticky header at the top, four KPI cards showing total events, tickets issued, valid, and redeemed, a bar chart showing tickets per event, and the events list with our pre-seeded sample."

**What to point out:**
- The sidebar's active state highlight
- The "New Event" CTA in the sidebar
- Search box in the header

---

### Step 2 — Create a new event (30 sec)

**Action:**
- Fill the form on the left:
  - Name: `SE Demo Event`
  - Venue: `University Hall`
  - Description: `Project demo`
  - Date: **2 minutes from now**
  - Capacity: `3`
  - Type: `Conference`
  - Speaker: `Smart E-Ticketing Team`
- Click **Create Event**

**Narration:**
> "I'm creating a new Conference event. Notice the backend validates every field using class-validator. When I submit, the NestJS controller receives the DTO, the `EventService` calls the `EventFactory` to create a polymorphic `ConferenceEvent` instance, the factory returns it, and the service saves it via the `IEventRepository` interface."

**What to point out:**
- The event appears in the right column immediately
- The KPI card "Total Events" increments
- The capacity bar shows `0 / 3`

---

### Step 3 — Generate a ticket (30 sec)

**Action:** Click **Generate** on the event you just created.

**Narration:**
> "Now I'm generating a ticket. The `TicketService` first checks that the event isn't expired — we enforce time limits at the backend level — then it checks remaining capacity, asks the `ITicketCodeStrategy` to produce a unique code, creates a `Ticket` entity, decrements the event's capacity, and persists everything. The strategy we're using is `ShortCodeStrategy` — you'll see it in the ticket page."

**What to point out:**
- The new ticket appears with a "New" highlight ring + "New" badge
- The capacity bar updates to `1 / 3`
- The chart bar updates

---

### Step 4 — Open the ticket page (45 sec)

**Action:** Click **Open** on the generated ticket → new tab opens.

**Narration:**
> "This is the ticket page. Notice the live **countdown timer** — 'Ends in X minutes' — updating every second. If you move your mouse over the card, it tilts in 3D using a custom TiltedCard component. You see the QR code for scanning at the venue, the ticket's unique short code, the event details panel with venue and date, and the Redeem button. If the event expires before redemption, the backend will reject the redemption."

**What to point out:**
- The 3D tilt effect (move mouse over the card)
- The countdown ticking
- The QR code
- The VALID badge

---

### Step 5 — Redeem the ticket (20 sec)

**Action:** Click **Redeem Ticket**.

**Narration:**
> "When I click Redeem, the backend checks three things: the ticket exists, it's still VALID, and the event hasn't expired. All three pass, so the ticket's status becomes USED and the redemption timestamp is recorded. The icon flips from a checkmark to a verified badge, the status pill changes, and the Redeem button disappears."

**What to point out:**
- Icon changes from `CheckCircle2` (teal) → `BadgeCheck` (purple)
- Title changes to "Redeemed"
- Redeem button is gone

---

### Step 6 — Show admin auto-refresh (25 sec)

**Action:** Switch back to the `/admin` tab.

**Narration:**
> "When I switch back to the admin tab, the dashboard auto-refreshes — we listen to the window focus event. Notice the ticket we just redeemed is now greyed out, its code is struck-through, and the Copy and Open buttons are gone — you can't re-share a used ticket. The KPI cards now show 1 redeemed ticket."

**What to point out:**
- Struck-through code
- "Redeemed" label replacing Copy/Open
- KPI counts updated

---

### Step 7 — Try to double-redeem via Swagger (20 sec) *(optional — skip if time is tight)*

**Action:**
1. Open the pre-loaded `http://localhost:4000/api-docs` tab
2. Expand `POST /tickets/{id}/redeem`
3. Paste the ticket ID
4. Click "Execute"

**Narration:**
> "To prove the backend enforces the rule — not just the frontend — I'll try to redeem the same ticket again via the Swagger API. The backend returns a `409 Conflict` with the message 'This ticket has already been redeemed'. This is how we satisfy FR-07 — prevention of double redemption."

**What to point out:**
- 409 response code
- Clear error message
- The pattern is enforced at the service layer, not the UI

---

### Step 8 — Run the tests (30 sec) *(optional — skip if time is tight)*

**Action:** Open a terminal, run `npm test` in the backend folder.

**Narration:**
> "Finally, let me run our test suite to prove everything we just demonstrated is covered by automated tests. 46 tests across 8 suites, all green, in under 3 seconds. Our coverage is 100% on the service, repository, and strategy layers."

**What to point out:**
- All green PASS lines
- Total count: 46 tests
- Execution time

---

## 🎯 Anticipated Questions & Memorized Answers

### Q1: "What is the Repository pattern and why did you use it?"
**A (Teammate C):**
> "The Repository pattern is an abstraction over data persistence. It hides storage details behind an interface so that our business logic doesn't know whether data lives in RAM, a SQL database, or a cloud service. We have two repositories — `IEventRepository` and `ITicketRepository` — each with an in-memory implementation. Swapping to PostgreSQL later would only require writing one new class and changing one line in `app.module.ts`. The service layer wouldn't change at all. That's why the pattern is worth it even for an in-memory store."

### Q2: "Why did you pick the Strategy pattern for ticket codes?"
**A (Teammate C):**
> "Because ticket codes can be generated in many ways — UUIDs, short human-friendly codes like 'YNBJ-3NVP', or numeric codes. The choice should be swappable without modifying `TicketService`. Strategy encapsulates each algorithm behind an interface and lets us inject the desired one at runtime. This also makes it Open/Closed compliant — adding a new strategy never touches existing code."

### Q3: "Show me an example of Liskov Substitution in your code."
**A (Mahmoud):**
> "Look at the class diagram. `ConcertEvent`, `ConferenceEvent`, and `SportsEvent` all extend the abstract `Event` class. The repository stores them generically as `Event`, and the service operates on them without caring about the subtype. Each subclass respects the base class's contract — same constructor signature, same behavior for `decrementCapacity()`, `hasAvailableCapacity()`, and `isExpired()`. The only difference is an extra field per subtype, which adds information without breaking anything."

### Q4: "How does your code satisfy Dependency Inversion?"
**A (Mahmoud):**
> "Our services never import concrete repository classes. They import the interfaces `IEventRepository`, `ITicketRepository`, and `ITicketCodeStrategy`. The NestJS dependency injection container wires the interface to the implementation in `app.module.ts` using custom provider tokens. To prove it, we can run `grep -r InMemory src/service/` and it returns zero matches. The service layer has no knowledge of how data is stored."

### Q5: "Why is your data store in-memory? Wouldn't a real database be better?"
**A (Mahmoud):**
> "Our assignment explicitly asks us to mock the database in-memory using the Repository pattern. The goal is to architect as if it were a real database so that swapping to PostgreSQL would require no changes in any service or controller. This was a deliberate decision to focus our time on design patterns and clean code, not on database setup — which is exactly what the course is about."

### Q6: "What is your test coverage?"
**A (Teammate D):**
> "We have 46 unit tests across 8 test suites. The domain, repository, service, and strategy layers are all at 100% line coverage. Overall we're at 83%. Every service test uses Jest's mocking to inject fake repositories and strategies, which proves our Dependency Inversion is correctly wired — if the services depended on concrete classes, we wouldn't be able to mock them in one line."

### Q7: "How did you manage Agile in a student team?"
**A (Teammate E):**
> "We used Scrum with four one-week sprints. Every sprint had a Planning meeting, Daily Standups, a Review, and a Retrospective — all documented in our Notion workspace, which I can show you now. We used GitHub with feature branches and pull requests, and every PR referenced a user story ID from the product backlog. Here's the workspace — you can see every sprint page, every retrospective, and our product backlog with acceptance criteria in Given-When-Then format."

### Q8: "Why did you add the expiry rule? That wasn't in the original requirements."
**A (Mahmoud):**
> "It's a realistic business rule we identified during Sprint 4. When we tested the app, we noticed that an event scheduled for 2pm would still accept new tickets at 3pm — which doesn't match how ticketing works in the real world. So we added FR-08: events become 'expired' past their `eventDate`, and both ticket generation and redemption are rejected for expired events. The check lives on the `Event` entity itself as `isExpired()`, so the rule is centralized. We also added 5 new unit tests for this rule."

### Q9: "What would you do differently in a future iteration?"
**A (anyone):**
> "Three things: First, we'd add the Observer pattern to notify on ticket-status changes — for example, sending an email when a ticket is redeemed. Second, we'd implement real authentication and multi-admin support with role-based access. Third, we'd add end-to-end tests with Playwright or Cypress, and integration tests that hit a real PostgreSQL instance to prove our repository interface actually works with a real DB."

### Q10: "Which principle was the hardest to apply?"
**A (Mahmoud):**
> "Interface Segregation. It's tempting to create one big `IRepository<T>` with every method any service could ever need. We had to discipline ourselves to split it into `IEventRepository` and `ITicketRepository`, each with only the methods its clients use. The result is cleaner and each interface has a clear purpose."

---

## 🛠 Emergency Recovery Procedures

### Backend crashes mid-demo
1. Stay calm, say "let me restart the backend"
2. `cd backend && npm run start:dev`
3. Wait ~5 seconds for "Nest application successfully started"
4. Continue from the last successful step

### Frontend shows a blank page
1. Refresh the page (Cmd+R / Ctrl+R)
2. If still broken: `cd frontend && npm run dev` in a new terminal
3. Announce: "The Next.js dev server needed a quick restart"

### Localhost entirely unreachable
1. **Immediately play the backup screencast** (pre-recorded)
2. Continue narrating over the video as if it were live
3. Do not attempt more live debugging during the presentation

### Chrome tab closed by mistake
1. `Cmd+Shift+T` (restore closed tab)
2. Or manually type the URL from memory:
   - `http://localhost:3000/admin`
   - `http://localhost:4000/api-docs`

---

## ✅ Post-Demo Checklist

- [ ] Thank the professor
- [ ] Pause for questions
- [ ] Let each teammate answer the questions in their ownership area
- [ ] If stumped, say "That's a great question — let me check the code" rather than guessing

---

**END OF DEMO SCRIPT**
