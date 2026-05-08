# Architecture & Design Patterns Document
## Smart E-Ticketing System

**Version:** 1.0
**Prepared by:** [Team Name]
**Owner:** Mohammed (Developer — formats + presents this in the demo)

---

## 1. Architectural Overview

The Smart E-Ticketing System follows a classical **Layered Architecture** (also called N-Tier Architecture), where each layer has a single responsibility and depends only on the layer directly beneath it through **interfaces**. This structure makes the system easy to understand, test, and extend.

### 1.1 The Four Layers

```
┌──────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER  (Next.js frontend)                  │
│  /admin · /tickets/[id] · React components               │
│  Talks to backend via HTTP (fetch)                       │
└──────────────────────────────────────────────────────────┘
                           ↓ HTTP
┌──────────────────────────────────────────────────────────┐
│  CONTROLLER LAYER  (NestJS)                              │
│  EventController · TicketController                      │
│  Responsibility: receive HTTP, validate DTOs, call       │
│  services, return HTTP responses. NO business logic.     │
└──────────────────────────────────────────────────────────┘
                           ↓ (method calls)
┌──────────────────────────────────────────────────────────┐
│  SERVICE LAYER  (business logic)                         │
│  EventService · TicketService · EventFactory             │
│  Responsibility: orchestrate use cases, enforce rules,   │
│  compose repositories + strategies + factories.          │
└──────────────────────────────────────────────────────────┘
                           ↓ (depends on interfaces)
┌──────────────────────────────────────────────────────────┐
│  REPOSITORY LAYER  (data access)                         │
│  IEventRepository ← InMemoryEventRepository              │
│  ITicketRepository ← InMemoryTicketRepository            │
│  Responsibility: persist and retrieve domain entities.   │
│  Services depend on the INTERFACES, not the classes.     │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│  DOMAIN LAYER  (entities, value objects, enums)          │
│  Event (abstract), ConcertEvent, ConferenceEvent,        │
│  SportsEvent, Ticket, TicketStatus, EventType            │
└──────────────────────────────────────────────────────────┘
```

### 1.2 Why Layered Architecture for this project?

| Benefit | How the MVP demonstrates it |
|---|---|
| **Separation of concerns** | HTTP handling, business rules, and persistence each live in their own layer |
| **Testability** | The service layer can be unit-tested in isolation by injecting mock repositories and strategies |
| **Swappability** | The in-memory repository can be replaced with PostgreSQL by writing a new class — zero service code changes |
| **Gradability** | Each layer lives in its own folder, so the professor can open `src/repository/` and see the Repository pattern instantly |

### 1.3 Project Folder Structure
```
backend/src/
├── domain/              Entities and enums
│   ├── event.entity.ts            (abstract)
│   ├── concert-event.entity.ts
│   ├── conference-event.entity.ts
│   ├── sports-event.entity.ts
│   ├── ticket.entity.ts
│   ├── ticket-status.enum.ts
│   └── event-type.enum.ts
├── repository/          Repository Pattern
│   ├── event.repository.interface.ts
│   ├── ticket.repository.interface.ts
│   ├── in-memory-event.repository.ts
│   └── in-memory-ticket.repository.ts
├── factory/             Factory Pattern
│   └── event.factory.ts
├── strategy/            Strategy Pattern
│   ├── ticket-code-strategy.interface.ts
│   ├── uuid-code.strategy.ts
│   ├── short-code.strategy.ts
│   └── numeric-code.strategy.ts
├── service/             Business logic
│   ├── event.service.ts
│   └── ticket.service.ts
├── controller/          REST endpoints
│   ├── event.controller.ts
│   └── ticket.controller.ts
├── dto/                 Data Transfer Objects
│   ├── create-event.dto.ts
│   ├── event-response.dto.ts
│   └── ticket-response.dto.ts
├── app.module.ts        DI wiring
└── main.ts              Bootstrap + Swagger
```

**Notice how the folder names literally match the design pattern names.** This is intentional — when the professor opens the repo, the patterns are visible before they even read a single line of code.

---

## 2. Design Patterns

The project implements **three core GoF design patterns**, each solving a real, concrete problem in the codebase.

---

### 2.1 🗂️ Repository Pattern

**Intent**: *"Mediate between the domain and data mapping layers using a collection-like interface for accessing domain objects."* — Martin Fowler

#### Problem it solves
Services should focus on business rules, not on how data is stored. If `TicketService` knew about `Map<string, Ticket>`, switching to PostgreSQL later would require rewriting every service method.

#### Implementation

**Step 1 — Interface:**
```typescript
// src/repository/ticket.repository.interface.ts
export const TICKET_REPOSITORY = 'TICKET_REPOSITORY';

export interface ITicketRepository {
  save(ticket: Ticket): Ticket;
  findById(id: string): Ticket | null;
  findByEventId(eventId: string): Ticket[];
  update(ticket: Ticket): Ticket;
}
```

**Step 2 — In-memory implementation:**
```typescript
// src/repository/in-memory-ticket.repository.ts
@Injectable()
export class InMemoryTicketRepository implements ITicketRepository {
  private readonly store = new Map<string, Ticket>();

  save(ticket: Ticket): Ticket {
    this.store.set(ticket.id, ticket);
    return ticket;
  }

  findById(id: string): Ticket | null {
    return this.store.get(id) ?? null;
  }

  findByEventId(eventId: string): Ticket[] {
    return Array.from(this.store.values())
      .filter(ticket => ticket.eventId === eventId);
  }

  update(ticket: Ticket): Ticket {
    this.store.set(ticket.id, ticket);
    return ticket;
  }
}
```

**Step 3 — Service depends on the interface:**
```typescript
@Injectable()
export class TicketService {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: ITicketRepository,
  ) {}
}
```

**Step 4 — Module wires the binding:**
```typescript
providers: [
  { provide: TICKET_REPOSITORY, useClass: InMemoryTicketRepository },
]
```

#### Why it satisfies the assignment
The assignment says: *"The database layer should be mocked in-memory via the Repository pattern, but architected as if it were a real relational database."* To swap to PostgreSQL we'd write `PostgresTicketRepository implements ITicketRepository` and change one line. Zero business-logic changes.

---

### 2.2 🏭 Factory Pattern

**Intent**: *"Define an interface for creating an object, but let subclasses decide which class to instantiate."* — GoF

#### Problem it solves
We support three kinds of events — Concerts, Conferences, Sports — each a polymorphic subtype of the abstract `Event` with its own extra fields (artist, speaker, teams). We need one place that decides which subclass to instantiate based on a DTO, rather than scattering `switch` blocks across the service layer.

#### Implementation

**Abstract entity:**
```typescript
export abstract class Event {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string,
    public venue: string,
    public eventDate: Date,
    public readonly totalCapacity: number,
    public remainingCapacity: number,
    public readonly createdAt: Date = new Date(),
  ) {}

  decrementCapacity(): void { /* ... */ }
  hasAvailableCapacity(): boolean { /* ... */ }
  isExpired(now: Date = new Date()): boolean { /* ... */ }
  abstract getType(): EventType;
}
```

**Factory:**
```typescript
@Injectable()
export class EventFactory {
  createEvent(dto: CreateEventDto): Event {
    const id = randomUUID();
    const eventDate = new Date(dto.eventDate);

    switch (dto.type) {
      case EventType.CONCERT:
        return new ConcertEvent(id, dto.name, /* ... */, dto.artist ?? '');
      case EventType.CONFERENCE:
        return new ConferenceEvent(id, dto.name, /* ... */, dto.speaker ?? '');
      case EventType.SPORTS:
        return new SportsEvent(id, dto.name, /* ... */, dto.teams ?? '');
      default:
        throw new Error(`Unsupported event type: ${dto.type}`);
    }
  }
}
```

**Service uses the factory:**
```typescript
createEvent(dto: CreateEventDto): Event {
  const event = this.eventFactory.createEvent(dto);  // ← polymorphic result
  return this.eventRepository.save(event);
}
```

#### Why it matters
- **SRP**: `EventService` doesn't know which subclass was created
- **OCP**: Adding `WorkshopEvent` requires a new subclass + one factory case
- **Testability**: The factory can be unit-tested in complete isolation

---

### 2.3 🎯 Strategy Pattern

**Intent**: *"Define a family of algorithms, encapsulate each one, and make them interchangeable."* — GoF

#### Problem it solves
Ticket codes can be generated in many ways: UUIDs, short human-friendly codes, or numeric codes. The algorithm should be **swappable without touching `TicketService`**.

#### Implementation

**Interface (one method):**
```typescript
export const TICKET_CODE_STRATEGY = 'TICKET_CODE_STRATEGY';

export interface ITicketCodeStrategy {
  generate(): string;
}
```

**Three implementations:**
```typescript
@Injectable()
export class UuidCodeStrategy implements ITicketCodeStrategy {
  generate(): string {
    return randomUUID();
  }
}

@Injectable()
export class ShortCodeStrategy implements ITicketCodeStrategy {
  private readonly ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  generate(): string { /* 8 chars with dash → XXXX-XXXX */ }
}

@Injectable()
export class NumericCodeStrategy implements ITicketCodeStrategy {
  generate(): string { /* 6-digit number */ }
}
```

**Service uses the strategy via DI:**
```typescript
@Injectable()
export class TicketService {
  constructor(
    @Inject(TICKET_CODE_STRATEGY) private readonly codeStrategy: ITicketCodeStrategy,
    /* ... */
  ) {}

  generateTicket(eventId: string): Ticket {
    /* ... */
    const code = this.codeStrategy.generate();   // ← Strategy in action
    /* ... */
  }
}
```

**Module selects which strategy is active:**
```typescript
providers: [
  { provide: TICKET_CODE_STRATEGY, useClass: ShortCodeStrategy },  // ← swap in one line
]
```

#### Why it matters
- **OCP**: Adding a new code-generation algorithm requires a new class, no modifications
- **Runtime flexibility**: Different environments can use different strategies
- **Testability**: Each strategy tested independently; services mock the strategy in tests

---

## 3. SOLID Principles in Action

### 3.1 S — Single Responsibility Principle
*A class should have one reason to change.*

| Class | Reason to change |
|---|---|
| `EventService` | Event-related business rules change |
| `TicketService` | Ticket-related business rules change |
| `EventFactory` | New event type added |
| `InMemoryTicketRepository` | Storage mechanism changes |
| `UuidCodeStrategy` | UUID generation algorithm changes |
| `EventController` | HTTP contract for events changes |

### 3.2 O — Open/Closed Principle
*Open for extension, closed for modification.*

**Concrete example**: Adding `WorkshopEvent` requires:
- ✅ Creating a new `WorkshopEvent` subclass (extension)
- ✅ Adding one case in `EventFactory` (minimal addition)

Zero changes to `EventService`, `EventController`, `IEventRepository`, or any tests.

### 3.3 L — Liskov Substitution Principle
*Subtypes must be substitutable for their base types.*

`ConcertEvent`, `ConferenceEvent`, and `SportsEvent` can all be used anywhere `Event` is expected. The repository operates on `Event` generically:

```typescript
save(event: Event): Event {
  this.store.set(event.id, event);
  return event;
}
```

### 3.4 I — Interface Segregation Principle
*Clients should not depend on methods they don't use.*

We split data access into **two narrow interfaces** — `IEventRepository` and `ITicketRepository` — rather than one fat `IRepository`. Similarly, `ITicketCodeStrategy` has exactly one method.

### 3.5 D — Dependency Inversion Principle
*High-level modules should not depend on low-level modules. Both should depend on abstractions.*

This is the principle the whole architecture is built on:

```
TicketService (high-level)
    ↓ depends on
ITicketRepository (abstraction)
    ↑ implemented by
InMemoryTicketRepository (low-level)
```

**Proof**: 
```bash
$ grep -r "InMemory" backend/src/service/
# (no results — DIP verified)
```

---

## 4. Clean Code Principles Applied

| Principle | Applied by |
|---|---|
| **Meaningful names** | `generateTicket` not `genTkt`; `hasAvailableCapacity` not `check` |
| **Small functions** | No method > 30 lines |
| **One level of abstraction per function** | Services don't mix "call repository" with "format HTTP response" |
| **No magic numbers** | `SHORT_CODE_LENGTH`, `ALPHABET` as named constants |
| **No duplication** | Repository logic reused via the interface contract |
| **Fail fast** | Input validation via DTOs + `class-validator` at the controller boundary |
| **Comments only where necessary** | Code is self-documenting |

---

## 5. Summary — What the Professor Sees

| Rubric section | Where to point |
|---|---|
| **Repository Pattern** | `src/repository/` — interface + implementation side by side |
| **Factory Pattern** | `src/factory/event.factory.ts` — one class, polymorphic creation |
| **Strategy Pattern** | `src/strategy/` — one interface, three implementations |
| **SRP** | Any single file — one reason to change |
| **OCP** | Imagine adding `WorkshopEvent` — only the factory case changes |
| **LSP** | Repository stores `Event` generically |
| **ISP** | Two narrow repository interfaces instead of one fat one |
| **DIP** | `grep InMemory src/service/` returns nothing |
| **Clean Code** | No method > 30 lines, meaningful names, no magic numbers |

---

**END OF Architecture & Design Patterns Document v1.0**
