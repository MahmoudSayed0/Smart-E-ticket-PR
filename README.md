# 🎫 Smart E-Ticketing System

> A full-stack **Software Engineering course project** demonstrating Agile/Scrum, Clean Code, SOLID principles, and three GoF design patterns: **Repository**, **Factory**, and **Strategy**.

[![CI](https://github.com/MahmoudSayed0/Smart-E-ticket-PR/actions/workflows/ci.yml/badge.svg)](https://github.com/MahmoudSayed0/Smart-E-ticket-PR/actions/workflows/ci.yml) ![Stack](https://img.shields.io/badge/backend-NestJS-red) ![Stack](https://img.shields.io/badge/frontend-Next.js-black) ![Stack](https://img.shields.io/badge/language-TypeScript-blue) ![Tests](https://img.shields.io/badge/tests-46_passing-green) ![Coverage](https://img.shields.io/badge/coverage-83%25-brightgreen) ![Storage](https://img.shields.io/badge/storage-in--memory_or_SQLite-blueviolet)

## 🌐 Live Deployment

| | URL | Stack |
|---|---|---|
| **Frontend** | [smart-e-ticket.vercel.app](https://smart-e-ticket.vercel.app) | Next.js 15 on **Vercel** |
| **Backend API** | [smart-eticketing-backend-production-0222.up.railway.app](https://smart-eticketing-backend-production-0222.up.railway.app/api-docs) | NestJS in **Docker** on **Railway** (SQLite repository binding) |
| **Swagger UI** | [`/api-docs`](https://smart-eticketing-backend-production-0222.up.railway.app/api-docs) | Auto-generated OpenAPI |
| **GitHub Actions** | [Workflow runs](https://github.com/MahmoudSayed0/Smart-E-ticket-PR/actions/workflows/ci.yml) | Lint · test · build on every push |

> ⚠️ The Railway free tier sleeps the backend after 15 min idle. Wake it by hitting the Swagger URL once before testing the live frontend.

## 🚢 CI/CD

| Pipeline | Trigger | What it runs |
|---|---|---|
| **CI** ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) | every push + every PR | install → lint → unit tests with coverage → build (backend + frontend in parallel) |
| **CD — frontend** | push to `main` | auto-deploys to **Vercel** (project Root Directory = `frontend/`). `NEXT_PUBLIC_API_BASE` env var points at the Railway backend URL. |
| **CD — backend** | push to `main` | builds **[`backend/Dockerfile`](backend/Dockerfile)** (Node 22, build tools for `better-sqlite3` native binding) and ships the container to **Railway**. `DB_DRIVER=sqlite` is set in the image so the SQLite repository binding kicks in at boot. |

### Pluggable storage — the Repository pattern in action

Storage is decided at boot from the `DB_DRIVER` environment variable:

```ts
// backend/src/app.module.ts
const useSqlite = process.env.DB_DRIVER === 'sqlite';
{ provide: EVENT_REPOSITORY,  useClass: useSqlite ? SqliteEventRepository  : InMemoryEventRepository  },
{ provide: TICKET_REPOSITORY, useClass: useSqlite ? SqliteTicketRepository : InMemoryTicketRepository },
```

| Environment | `DB_DRIVER` | Backing store |
|---|---|---|
| Local dev / `npm test` | unset | In-memory `Map<>` (fast, no setup) |
| Production (Railway, Docker) | `sqlite` | `better-sqlite3` writing to `data/eticketing.db` inside the container |

`grep -r 'Sqlite\|InMemory' backend/src/service/` returns **zero matches** — services depend only on the interfaces. That is the entire point of the pattern, and you can witness it live by hitting the deployed URL.

## 📋 Overview

The Smart E-Ticketing System is an **MVP web application** where administrators create events (concerts, conferences, sports) and generate unique one-time-use tickets for them. Ticket holders view their tickets via a unique link, see a countdown timer until the event starts, and redeem the ticket at the venue. The system prevents double-redemption and blocks operations on expired events.

This project is intentionally an **academic exercise** — the goal is to practice software engineering disciplines (SRS, UML, SOLID, patterns, tests, Agile), not to ship a commercial product.

## 🎯 Features

- ✅ Create events (Concert, Conference, Sports — polymorphic via Factory pattern)
- ✅ Generate one-time-use tickets with unique codes (Strategy pattern)
- ✅ View tickets via unique URL with live QR code and 3D tilt animation
- ✅ Redeem tickets at the venue (one-time only)
- ✅ Live countdown timer — event expires at `eventDate`
- ✅ Backend enforces: no redemption after expiry, no generation on expired events, no double-redemption
- ✅ In-memory repository behind an interface (swappable to a real DB without touching services)
- ✅ Swagger UI auto-generated at `/api-docs`
- ✅ Responsive dashboard with sidebar, KPI cards, bar chart, and sticky create form

## 🏗 Architecture

Four-layer **Layered Architecture** with strict dependency direction (top → bottom):

```
┌──────────────────────────────────────────────┐
│  PRESENTATION  (Next.js pages, React)        │
└──────────────────────────────────────────────┘
                  ↓ HTTP
┌──────────────────────────────────────────────┐
│  CONTROLLER  (NestJS REST endpoints)         │
└──────────────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────────────┐
│  SERVICE  (business logic, patterns)         │
└──────────────────────────────────────────────┘
                  ↓ depends on interfaces only
┌──────────────────────────────────────────────┐
│  REPOSITORY  (in-memory Map<>)               │
└──────────────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────────────┐
│  DOMAIN  (entities + enums)                  │
└──────────────────────────────────────────────┘
```

Every folder in `backend/src/` maps 1:1 to a layer. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full walkthrough.

## 🧩 Design Patterns Implemented

| Pattern | Location | Purpose |
|---|---|---|
| **Repository** | `backend/src/repository/` | Abstracts data access behind `IEventRepository` and `ITicketRepository`, enabling in-memory now and PostgreSQL later with zero service changes |
| **Factory** | `backend/src/factory/event.factory.ts` | Creates polymorphic `ConcertEvent`, `ConferenceEvent`, or `SportsEvent` from a single `CreateEventDto` |
| **Strategy** | `backend/src/strategy/` | Three interchangeable ticket-code algorithms (`UuidCodeStrategy`, `ShortCodeStrategy`, `NumericCodeStrategy`) selected via DI |

## 🛠 Tech Stack

| Layer | Tool | Why |
|---|---|---|
| **Backend** | NestJS 10 + TypeScript | Built-in DI container makes SOLID principles visible and enforceable |
| **Frontend** | Next.js 15 + React 19 + TypeScript | Modern web app, App Router, server/client split |
| **Styling** | Tailwind CSS 3 + Soft-pop theme (tweakcn) + shadcn-style dashboard | Unique look, fast build |
| **Icons** | Lucide React | Consistent, lightweight icon set |
| **Charts** | Recharts | Bar chart on the admin dashboard |
| **3D Animation** | Motion (Framer Motion) | TiltedCard wrapper on the ticket page |
| **Testing** | Jest + NestJS Testing utilities | 46 unit tests, 83% coverage |
| **API Docs** | @nestjs/swagger | Auto-generated OpenAPI spec at `/api-docs` |
| **Version Control** | Git + GitHub | Feature branches + PRs |
| **Agile Tracking** | Notion | Sprint plans, backlog, retrospectives |

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or newer
- npm (ships with Node)

### Setup

```bash
# 1. Clone the repo
git clone <repo-url> smart-eticketing
cd smart-eticketing

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install
```

### Run in development

Open **two terminals**:

```bash
# Terminal 1 — backend (port 4000)
cd backend
npm run start:dev
# → http://localhost:4000
# → Swagger docs at http://localhost:4000/api-docs
```

```bash
# Terminal 2 — frontend (port 3000)
cd frontend
npm run dev
# → http://localhost:3000
# → Admin dashboard at http://localhost:3000/admin
```

### Run the tests

```bash
cd backend
npm test            # run all tests
npm run test:cov    # with coverage report
```

Expected output: **46 tests passing, 8 suites green, ~83% line coverage**.

## 📂 Project Structure

```
smart-eticketing/
├── backend/                       NestJS backend
│   ├── src/
│   │   ├── domain/                Entities (Event, Ticket) + enums
│   │   ├── repository/            Repository pattern (interfaces + in-memory impls)
│   │   ├── factory/               Factory pattern (EventFactory)
│   │   ├── strategy/              Strategy pattern (3 ticket code strategies)
│   │   ├── service/               Business logic (EventService, TicketService)
│   │   ├── controller/            REST endpoints
│   │   ├── dto/                   Data Transfer Objects + class-validator rules
│   │   ├── app.module.ts          DI wiring (binds interfaces → implementations)
│   │   └── main.ts                Bootstrap + Swagger setup
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                      Next.js frontend
│   ├── app/
│   │   ├── page.tsx               Landing page
│   │   ├── admin/page.tsx         Admin dashboard (sidebar + KPIs + chart + events)
│   │   ├── tickets/[id]/page.tsx  Ticket detail (QR + countdown + redeem)
│   │   ├── lib/
│   │   │   ├── api.ts             Typed fetch client
│   │   │   ├── useCountdown.ts    React hook for live countdown
│   │   │   └── utils.ts           cn() class helper
│   │   ├── layout.tsx             Root layout with DM Sans + Space Mono
│   │   └── globals.css            Soft-pop theme CSS variables
│   ├── components/
│   │   ├── AppSidebar.tsx         Dashboard sidebar
│   │   ├── SiteHeader.tsx         Sticky header with breadcrumb + search
│   │   ├── TicketsChart.tsx       Recharts bar chart
│   │   ├── AnimatedTicket.tsx     Ticket card with cut-outs + QR + details
│   │   ├── TiltedCard.tsx         3D mouse-follow wrapper
│   │   └── Countdown.tsx          Live countdown (badge + large variants)
│   └── tailwind.config.ts
│
├── docs/                          All project documentation
│   ├── SRS.md                     Software Requirements Specification
│   ├── ARCHITECTURE.md            Architecture & design patterns walkthrough
│   ├── TEST_CASES.md              Manual test cases (QA-owned)
│   ├── PRESENTATION.md            Slide outline + speaker notes
│   ├── DEMO_SCRIPT.md             Step-by-step live demo script
│   └── uml/                       PlantUML source files
│       ├── use-case-diagram.puml
│       ├── class-diagram.puml
│       ├── sequence-generate-ticket.puml
│       ├── sequence-redeem-ticket.puml
│       └── activity-ticket-lifecycle.puml
│
└── README.md                      (this file)
```

## 🧪 Testing

The backend has **46 unit tests** across **8 test suites**:

| Suite | Tests | Coverage |
|---|---|---|
| `domain/event.entity.spec.ts` | 8 | 100% |
| `domain/ticket.entity.spec.ts` | 3 | 100% |
| `repository/in-memory-event.repository.spec.ts` | 5 | 100% |
| `repository/in-memory-ticket.repository.spec.ts` | 4 | 100% |
| `strategy/strategies.spec.ts` | 5 | 100% |
| `factory/event.factory.spec.ts` | 5 | 93% |
| `service/event.service.spec.ts` | 5 | 100% |
| `service/ticket.service.spec.ts` | 11 | 100% |

Every service test **mocks its repository and strategy dependencies**, which proves that our Dependency Inversion is correctly wired — if the code weren't depending on interfaces, mocking would not be possible in one line.

See [`docs/TEST_CASES.md`](docs/TEST_CASES.md) for the human-readable test case document used for manual QA.

## 📖 API Documentation

When the backend is running, open **http://localhost:4000/api-docs** for the interactive Swagger UI.

### Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/events` | Create a new event |
| `GET`  | `/events` | List all events |
| `GET`  | `/events/:id` | Get a single event |
| `POST` | `/events/:eventId/tickets` | Generate a ticket |
| `GET`  | `/events/:eventId/tickets` | List tickets for an event |
| `GET`  | `/tickets/:id` | View a single ticket |
| `POST` | `/tickets/:id/redeem` | Redeem a ticket |

All responses are JSON. All request DTOs are validated with `class-validator`.

## 👥 Team

| Member | Scrum Role | Primary Deliverable |
|---|---|---|
| **Mahmoud** | Product Owner & Scrum Master | SRS, scope, backlog grooming, sprint rituals, Notion workspace, Definition of Done |
| **Mohammed** | Software Engineer | Architecture, UML (use case + class), design rationale, layered architecture decisions |
| **Esraa** | Software Engineer | Sequence + activity diagrams, schema, database-swap design, SOLID review |
| **Ali** | Backend Developer | NestJS backend, the 3 GoF patterns in code (Repository · Factory · Strategy), Swagger, DI module wiring |
| **Amr** | Frontend Developer | Next.js 15 frontend, `/admin` dashboard, `/tickets/[id]` page, AnimatedTicket, soft-pop theme, SOLID audit, live demo |
| **Seif** | QA / Test Engineer | Jest unit tests, coverage reports, [test cases document](docs/TEST_CASES.md), mocking discipline |

> Supervised by **Dr. Ihab Ramadan** · Software Engineering, 2026

## 📅 Agile Process

Four one-week sprints were simulated and tracked in Notion:

1. **Sprint 1** — Requirements & Design (SRS, UML, architecture)
2. **Sprint 2** — Domain & Repository layer (entities + in-memory repos + 20 tests)
3. **Sprint 3** — Services, Patterns, REST API (Factory + Strategy + controllers + 26 tests)
4. **Sprint 4** — Frontend, Polish & Demo (Next.js, presentation, expiry enforcement)

Every sprint included Sprint Planning, Daily Standups, Sprint Review, and a Retrospective. See the Notion workspace for the full history.

## 📜 License

Academic / Educational — not for commercial use.

---

Built with 💙 by the Smart E-Ticketing team for the Software Engineering course.
