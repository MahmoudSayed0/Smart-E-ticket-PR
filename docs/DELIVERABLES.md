# Smart E-Ticketing System — Final Delivery Package

**Course:** Software Engineering · 2026
**Supervisor:** Dr. Ihab Ramadan
**Team:** Mahmoud · Mohammed · Esraa · Ali · Amr · Seif

---

## How to use this document

This is the **single index** of everything the team is delivering. It maps each rubric item to the file or live system that satisfies it, so the supervising doctor can verify all 100% of the rubric in one sweep.

---

## 1. Live System (verify first)

| | URL | What to do |
|---|---|---|
| **Frontend dashboard** | [smart-e-ticket.vercel.app](https://smart-e-ticket.vercel.app) | Click *Admin Dashboard*, create an event, generate a ticket, copy URL, redeem it |
| **Backend API + Swagger** | [Swagger UI](https://smart-eticketing-backend-production-0222.up.railway.app/api-docs) | Browse all endpoints, try them in-place |
| **Source code on GitHub** | [MahmoudSayed0/Smart-E-ticket-PR](https://github.com/MahmoudSayed0/Smart-E-ticket-PR) | Read the code, the README, the docs, and the green CI badge |
| **CI history** | [GitHub Actions runs](https://github.com/MahmoudSayed0/Smart-E-ticket-PR/actions/workflows/ci.yml) | Confirm every push has passed all 46 tests |

> ⚠️ **Cold start:** Railway free tier sleeps the backend after 15 min idle. Wake it by hitting the Swagger URL once before testing the frontend.

---

## 2. Documentation deliverables

All documents below are inside the `docs/` folder of the repository.

| Rubric item | Weight | Document | Location |
|---|---|---|---|
| **SRS & Requirements** | 20% | [SRS.md](SRS.md) | Functional + non-functional requirements, 9 user stories, 5 use cases, acceptance criteria |
| **UML Diagrams** | 15% | [`uml/`](uml/) | 5 PlantUML diagrams (use-case, class, generate-ticket sequence, redeem-ticket sequence, activity/lifecycle) — both `.puml` source and rendered `.png` |
| **Architecture & Design Patterns** | 20% | [ARCHITECTURE.md](ARCHITECTURE.md) | Layered architecture rationale + Repository / Factory / Strategy patterns explained with code citations |
| **Clean Code (SOLID)** | 15% | [ARCHITECTURE.md § SOLID](ARCHITECTURE.md) + the source itself | One concrete example per letter; `grep -r 'Sqlite\|InMemory' backend/src/service/` returns 0 (live DIP proof) |
| **Testing** | 10% | [TEST_CASES.md](TEST_CASES.md) | 46 unit tests + 15 manual cases · 100% on repositories · ≥ 80% on services |
| **Agile Process** | 10% | [Notion workspace](https://www.notion.so/33f8db03ec9e81d7a1b6f9462c926791) (read-only) | 4 sprints, retrospectives, Jira-style backlog with 5 Epics / 9 Stories / 36 Tasks |
| **Presentation** | 10% | [`presentation/deck.html`](presentation/deck.html) + [`presentation/study-guide.html`](presentation/study-guide.html) | The slide deck used on demo day, plus the team's internal study guide |

---

## 3. Bonus deliverables (beyond rubric)

| Bonus | What it is | Where |
|---|---|---|
| **CI / CD** | GitHub Actions workflow runs lint + tests + build on every push and PR | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) · [Live runs](https://github.com/MahmoudSayed0/Smart-E-ticket-PR/actions/workflows/ci.yml) |
| **Docker** | Single-stage container, Node 22, build tools for native bindings, ships to any container host unchanged | [`backend/Dockerfile`](../backend/Dockerfile) · `docker build -t eticketing ./backend` |
| **Live deployment** | Frontend on Vercel + Backend (Docker) on Railway with SQLite repository binding via `DB_DRIVER=sqlite` | URLs in section 1 above |
| **Pluggable storage** | Same code, two storage backends, chosen at boot from one env var. Demonstrates the Repository pattern delivering on its promise live in production. | [`backend/src/repository/`](../backend/src/repository/) — `InMemory*` + `Sqlite*` siblings of the same interfaces |

---

## 4. Source-code structure

```
Smart-E-ticket-PR/
├── README.md                       project overview, badges, setup
├── docs/
│   ├── SRS.md                      ← rubric: SRS & Requirements
│   ├── ARCHITECTURE.md             ← rubric: Architecture & Patterns + Clean Code
│   ├── TEST_CASES.md               ← rubric: Testing
│   ├── DEMO_SCRIPT.md              click-by-click demo walkthrough
│   ├── PRESENTATION.md             slide outline (legacy)
│   ├── DELIVERABLES.md             this file
│   ├── uml/                        ← rubric: UML Diagrams (5 .puml + 5 .png)
│   └── presentation/
│       ├── deck.html               ← rubric: Presentation
│       ├── deck-stage.js           reusable web-component for navigation
│       ├── study-guide.html        team study guide (Q&A + roles)
│       └── img/                    UML PNGs + ticket banners used in slides
├── backend/                        NestJS backend (port 4000)
│   ├── Dockerfile                  ← bonus: Docker
│   ├── src/
│   │   ├── domain/                 Entities + enums
│   │   ├── repository/             Interfaces + InMemory + Sqlite implementations
│   │   ├── factory/                EventFactory
│   │   ├── strategy/               Three ticket-code strategies
│   │   ├── service/                Business logic
│   │   └── controller/             REST + Swagger
│   └── package.json                npm test runs the 46 unit tests
├── frontend/                       Next.js 15 frontend (port 3000)
│   ├── app/                        App Router pages: /, /admin, /tickets/[id]
│   ├── components/                 AnimatedTicket, TestResults, etc.
│   └── package.json
├── .github/workflows/ci.yml        ← bonus: CI/CD
└── render.yaml + nixpacks.toml     deploy blueprints (Railway uses Dockerfile)
```

---

## 5. How to run locally (alternative to live system)

```bash
# 1. Clone
git clone https://github.com/MahmoudSayed0/Smart-E-ticket-PR.git
cd Smart-E-ticket-PR

# 2. Backend (terminal 1)
cd backend
npm install
npm test                 # → 46 tests passing
npm run start:dev        # → http://localhost:4000

# 3. Frontend (terminal 2)
cd frontend
npm install
npm run dev              # → http://localhost:3000/admin
```

Or, if you have Docker installed:

```bash
docker build -t eticketing ./backend
docker run -p 4000:4000 eticketing
```

---

## 6. Rubric coverage at a glance

| Rubric | Weight | Covered by |
|---|---|---|
| SRS & Requirements | 20% | `docs/SRS.md` |
| UML Diagrams | 15% | `docs/uml/` (5 diagrams) |
| Architecture & Design Patterns | 20% | `docs/ARCHITECTURE.md` + `backend/src/{repository,factory,strategy}` |
| Clean Code (SOLID) | 15% | Source code itself + grep proof + `docs/ARCHITECTURE.md` |
| Testing | 10% | `docs/TEST_CASES.md` + `backend/src/**/*.spec.ts` (46 tests) |
| Agile Process | 10% | Notion workspace + `docs/presentation/study-guide.html` (team roles) |
| Presentation | 10% | `docs/presentation/deck.html` |
| **TOTAL** | **100%** | All accounted for |
| **Bonus — CI/CD** | + | `.github/workflows/ci.yml` (live runs visible on GitHub) |
| **Bonus — Docker** | + | `backend/Dockerfile` |
| **Bonus — Live Deploy** | + | Vercel + Railway URLs above |

---

## 7. Team roles

| Member | Scrum Role | Owns |
|---|---|---|
| **Mahmoud** | Product Owner & Scrum Master | SRS, scope, backlog grooming, sprint rituals, Notion |
| **Mohammed** | Software Engineer | Architecture, use case + class diagrams, layered design |
| **Esraa** | Software Engineer | Sequence + activity diagrams, schema, database-swap design |
| **Ali** | Backend Developer | NestJS backend, Repository / Factory / Strategy in code, DI wiring |
| **Amr** | Frontend Developer | Next.js 15 app, AnimatedTicket, soft-pop theme, SOLID audit, live demo |
| **Seif** | QA / Test Engineer | Jest unit tests, coverage reports, this Test Cases document |

---

*End of delivery package — Smart E-Ticketing System v1.0 · Software Engineering 2026 · Supervised by Dr. Ihab Ramadan.*
