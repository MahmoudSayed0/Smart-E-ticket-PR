export interface TestMeta {
  description: string;
  expected: string;
  why: string;
}

// Test metadata keyed by "<suite-file-name>::<test-name>"
export const TEST_METADATA: Record<string, TestMeta> = {
  // ── Ticket entity ──────────────────────────────────────────
  'ticket.entity.spec.ts::is created in VALID state by default': {
    description:
      'Verifies that a newly-constructed Ticket defaults to the VALID state with no redemption timestamp.',
    expected:
      "ticket.status === 'VALID' and ticket.redeemedAt === null and ticket.isValid() === true.",
    why: 'The Ticket constructor uses TicketStatus.VALID as the default status parameter and initializes redeemedAt to null — matching the real-world state of a freshly issued ticket.',
  },
  'ticket.entity.spec.ts::marks itself as USED when redeemed': {
    description:
      'Calling markAsUsed() on a VALID ticket must transition its status to USED and capture the redemption time.',
    expected:
      "After markAsUsed(): status is 'USED', isValid() is false, and redeemedAt is a Date instance.",
    why: 'markAsUsed() updates the status field to TicketStatus.USED and assigns a new Date() to redeemedAt — this is the FR-05 use case implemented at the domain layer.',
  },
  'ticket.entity.spec.ts::throws when trying to redeem an already-used ticket': {
    description:
      'A ticket that has already been redeemed must reject any attempt to redeem it again.',
    expected:
      "Calling markAsUsed() twice throws the error 'Cannot redeem a ticket that is not in VALID state'.",
    why: 'The entity checks isValid() before mutating state. This enforces FR-07 (prevent ticket reuse) at the domain layer, so the rule cannot be bypassed by calling the service or repository directly.',
  },

  // ── Event entity ───────────────────────────────────────────
  'event.entity.spec.ts::initializes remainingCapacity equal to totalCapacity': {
    description:
      'A newly created event must have all of its capacity available (no tickets issued yet).',
    expected: 'remainingCapacity === totalCapacity === 100.',
    why: 'The abstract Event constructor defaults remainingCapacity to totalCapacity when the caller omits it — this represents the state before any tickets are generated.',
  },
  'event.entity.spec.ts::returns the correct subtype from getType()': {
    description:
      'Each concrete Event subclass (Concert, Conference, Sports) must return its matching EventType enum.',
    expected: 'ConcertEvent.getType() returns EventType.CONCERT.',
    why: 'getType() is an abstract method on Event. Each subclass overrides it to return the matching enum value — this is how the Factory pattern and polymorphism work together.',
  },
  'event.entity.spec.ts::decrements capacity when a ticket is generated': {
    description:
      'After one decrementCapacity() call, remainingCapacity must drop by exactly one.',
    expected: 'After capacity=5 → decrementCapacity() → remainingCapacity === 4.',
    why: 'decrementCapacity() applies the capacity-- rule at the domain layer, keeping invariants close to the data. FR-06 (prevent overselling) relies on this.',
  },
  'event.entity.spec.ts::reports hasAvailableCapacity correctly': {
    description:
      'hasAvailableCapacity() returns true while tickets remain and false once capacity is exhausted.',
    expected: 'capacity=1 → true; after decrement → false.',
    why: 'Simple predicate method (remainingCapacity > 0) used by TicketService to reject generation requests when the event is fully booked.',
  },
  'event.entity.spec.ts::throws when decrementing capacity below zero': {
    description:
      'Attempting to decrement capacity past zero must throw — the domain prevents negative ticket counts.',
    expected: "Second decrement throws 'Cannot decrement capacity: no tickets remaining'.",
    why: 'Pre-condition check in the entity guarantees the invariant: remainingCapacity >= 0 at all times. This is tell-don\'t-ask in action.',
  },
  'event.entity.spec.ts::returns false when eventDate is in the future': {
    description:
      'An event whose start time is in the future must NOT be marked as expired.',
    expected: 'isExpired() === false for an event one day from now.',
    why: 'isExpired() compares eventDate.getTime() <= now.getTime(). A future date is greater than now, so the comparison is false.',
  },
  'event.entity.spec.ts::returns true when eventDate is in the past': {
    description:
      'An event whose start time has already passed must be marked as expired.',
    expected: 'isExpired() === true for an event one second ago.',
    why: 'eventDate.getTime() is less than or equal to Date.now(), so the comparison is true — enforcing FR-08 (prevent operations on expired events).',
  },
  'event.entity.spec.ts::accepts an injected "now" for deterministic testing': {
    description:
      'isExpired(now) accepts an optional Date parameter so tests can simulate any point in time without mocking system clocks.',
    expected: 'At t-1s: false. At t+1s: true.',
    why: 'Dependency injection applied to time — pass the Date as a parameter rather than calling Date.now() directly. This makes the method deterministic and easy to test.',
  },

  // ── In-memory Event repository ─────────────────────────────
  'in-memory-event.repository.spec.ts::saves and retrieves an event by id': {
    description:
      'save(event) persists an entity and findById(id) returns the same instance.',
    expected: 'findById(savedEvent.id) === savedEvent.',
    why: 'Repository wraps a Map<string, Event>. save() calls Map.set and findById() calls Map.get — this is the Repository pattern\'s simplest happy path.',
  },
  'in-memory-event.repository.spec.ts::returns null when finding a non-existent event': {
    description: 'Looking up an unknown id returns null rather than throwing.',
    expected: "findById('missing') === null.",
    why: 'Map.get() returns undefined for missing keys, and we normalize with ?? null so the service layer gets a typed Event | null.',
  },
  'in-memory-event.repository.spec.ts::returns all saved events': {
    description: 'findAll() returns every stored event as an array.',
    expected: 'findAll() has length 2 after saving two events.',
    why: 'Array.from(store.values()) converts the Map values into an array. Callers like EventService.getAllEvents() rely on this.',
  },
  'in-memory-event.repository.spec.ts::returns an empty array when no events exist': {
    description: 'findAll() must return [] (not null or undefined) when the repository is empty.',
    expected: 'findAll() deep-equals an empty array.',
    why: 'Contract: callers can always iterate the result safely. Returning null would force every caller to null-check first.',
  },
  'in-memory-event.repository.spec.ts::updates an existing event': {
    description: 'update(event) must persist mutated state so subsequent findById returns the new version.',
    expected: "After decrementing capacity and calling update(), findById(id).remainingCapacity === 99.",
    why: "Map.set() with the same key overwrites the value. Since we store references, mutating the event already updates the map entry, but update() makes the intent explicit.",
  },

  // ── In-memory Ticket repository ────────────────────────────
  'in-memory-ticket.repository.spec.ts::saves and retrieves a ticket by id': {
    description: 'Basic save/findById round-trip for tickets.',
    expected: 'findById(ticket.id) returns the same instance that was saved.',
    why: 'Same pattern as the event repository — just instantiated for the Ticket type. This is why the Repository pattern scales.',
  },
  'in-memory-ticket.repository.spec.ts::returns null for an unknown ticket id': {
    description: 'Unknown ticket id returns null, not undefined or an error.',
    expected: "findById('unknown') === null.",
    why: 'Normalized null return — lets the service layer throw a typed NotFoundException cleanly.',
  },
  'in-memory-ticket.repository.spec.ts::finds tickets by event id': {
    description: 'findByEventId() returns only tickets that belong to the given event.',
    expected: "event e1 → 2 tickets, e2 → 1 ticket, e3 → [].",
    why: 'Filters the in-memory store by eventId. A real database would use an index on the event_id column — but the service layer does not know or care.',
  },
  'in-memory-ticket.repository.spec.ts::updates an existing ticket': {
    description: 'update(ticket) persists changes to a ticket entity (e.g. redemption).',
    expected: "After markAsUsed() + update(), findById(t1).status === 'USED'.",
    why: 'Same Map.set overwrite pattern as the event repository. Keeps the interface consistent across all repositories — ISP in action.',
  },

  // ── Strategies ─────────────────────────────────────────────
  'strategies.spec.ts::generates a valid UUID v4': {
    description: 'UuidCodeStrategy must produce strings matching the RFC 4122 v4 UUID format.',
    expected: "Matches the regex /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.",
    why: 'Wraps crypto.randomUUID() which is the Node standard library implementation of UUID v4 — cryptographically strong and guaranteed unique.',
  },
  'strategies.spec.ts::generates a unique code on each call': {
    description: 'Calling generate() twice must never produce the same UUID.',
    expected: 'strategy.generate() !== strategy.generate().',
    why: 'UUID v4 has 122 bits of randomness — collision is astronomically unlikely across any reasonable run.',
  },
  'strategies.spec.ts::generates a code in the format XXXX-XXXX': {
    description: 'ShortCodeStrategy produces human-friendly 9-character codes (4 + dash + 4).',
    expected: "Matches /^[A-Z2-9]{4}-[A-Z2-9]{4}$/.",
    why: 'Uses a custom alphabet (A-Z without I/O, 2-9 without 0/1) to avoid visually ambiguous characters. Joins two 4-char groups with a dash for readability.',
  },
  'strategies.spec.ts::produces different codes across invocations': {
    description: '20 consecutive ShortCode calls must produce at least 16 unique values.',
    expected: 'Set size after 20 generations ≥ 16.',
    why: 'With 31 alphabet chars × 8 positions = ~852 billion combinations — duplicates in 20 tries are essentially impossible. Soft threshold of 16/20 tolerates any statistical flukes.',
  },
  'strategies.spec.ts::generates a 6-digit numeric code': {
    description: 'NumericCodeStrategy returns a 6-digit string suitable for simple PIN-style codes.',
    expected: 'Matches /^\\d{6}$/.',
    why: 'Uses Math.floor(100000 + Math.random() * 900000) to guarantee a number between 100000 and 999999 — always 6 digits.',
  },

  // ── Factory ────────────────────────────────────────────────
  'event.factory.spec.ts::creates a ConcertEvent when type is CONCERT': {
    description: 'Given a DTO with type=CONCERT, the factory returns a ConcertEvent instance with the artist field populated.',
    expected: 'result instanceof ConcertEvent === true and result.artist === "Coldplay".',
    why: 'The factory\'s switch matches EventType.CONCERT and calls new ConcertEvent(...) — this is the core of the Factory pattern, encapsulating creation logic.',
  },
  'event.factory.spec.ts::creates a ConferenceEvent when type is CONFERENCE': {
    description: 'Given type=CONFERENCE, returns a ConferenceEvent with the speaker field.',
    expected: 'result instanceof ConferenceEvent === true and result.speaker === "Dr. Doe".',
    why: 'Factory branches to new ConferenceEvent() — demonstrates polymorphic creation from a single entry point.',
  },
  'event.factory.spec.ts::creates a SportsEvent when type is SPORTS': {
    description: 'Given type=SPORTS, returns a SportsEvent with the teams field.',
    expected: "result instanceof SportsEvent === true and result.teams === 'A vs B'.",
    why: 'Third branch in the factory — proves all three subtypes can be created from the same interface. Adding a new type (e.g. Workshop) requires only a new branch here.',
  },
  'event.factory.spec.ts::initializes remainingCapacity equal to totalCapacity': {
    description: 'Factory-created events have full capacity available (matches the entity\'s default).',
    expected: 'remainingCapacity === totalCapacity === 50.',
    why: 'Factory delegates to the Event constructor which defaults remainingCapacity. The factory does not override this — keeping creation logic centralized in the entity.',
  },
  'event.factory.spec.ts::assigns a unique id to each created event': {
    description: 'Multiple factory calls produce events with different UUIDs.',
    expected: 'event1.id !== event2.id.',
    why: 'Factory generates a fresh randomUUID() for every event — the factory owns ID assignment so callers never have to.',
  },

  // ── Event service ──────────────────────────────────────────
  'event.service.spec.ts::creates and saves a valid event': {
    description: 'The happy path: EventService.createEvent builds an entity via the factory and persists it via the repository.',
    expected: 'The returned event is a ConcertEvent and repo.save was called with it.',
    why: 'EventService depends on the IEventRepository interface — the test injects a Jest mock, which is only possible because of Dependency Inversion. This single test proves both SRP and DIP.',
  },
  'event.service.spec.ts::throws BadRequestException if event date is in the past': {
    description: 'Event creation must reject past dates before attempting to persist.',
    expected: 'Throws BadRequestException and repo.save is never called.',
    why: 'EventService.validateEventDate is a pre-condition check. It throws immediately, preventing any wasted work at the repository layer.',
  },
  'event.service.spec.ts::returns all events from the repository': {
    description: 'getAllEvents is a thin pass-through to the repository.',
    expected: 'service.getAllEvents() === mockRepo.findAll() return value.',
    why: 'No business logic needed — the service just forwards to the repository. This is correct separation of concerns.',
  },
  'event.service.spec.ts::returns the event when found': {
    description: 'getEventById returns the event instance when it exists.',
    expected: 'service.getEventById(id) returns the mocked event.',
    why: 'Simple repository lookup + return. The service layer adds the NotFoundException contract on top.',
  },
  'event.service.spec.ts::throws NotFoundException when the event does not exist': {
    description: 'Missing event results in a typed 404 exception rather than null or undefined.',
    expected: "Throws NotFoundException with message including the id.",
    why: 'The service layer converts the repository\'s null return into a proper NestJS exception that the framework transforms into an HTTP 404 response automatically.',
  },

  // ── Ticket service ─────────────────────────────────────────
  'ticket.service.spec.ts::creates a VALID ticket with a code from the strategy': {
    description: 'generateTicket calls the injected code strategy and produces a VALID ticket.',
    expected: "ticket.status === 'VALID', ticket.code === 'MOCK-CODE', strategy.generate was called.",
    why: 'The test mocks ITicketCodeStrategy to return a predictable value. This proves the Strategy pattern: TicketService does not know which algorithm it is using, only the interface.',
  },
  'ticket.service.spec.ts::decrements the event capacity and persists both entities': {
    description: 'Generating a ticket must reduce remaining capacity by 1 and save both the event and the ticket.',
    expected: 'event.remainingCapacity === 4 (was 5), ticketRepo.save called, eventRepo.update called with the mutated event.',
    why: 'Service orchestrates the full generation flow: check capacity → generate code → create ticket → decrement capacity → persist. This is the Service layer\'s responsibility — composing domain operations.',
  },
  'ticket.service.spec.ts::throws NotFoundException when event does not exist': {
    description: 'Cannot generate a ticket for an event that does not exist.',
    expected: 'Throws NotFoundException and ticket is not saved.',
    why: 'Pre-condition check. Fails fast at the service layer so no garbage data reaches the repository.',
  },
  'ticket.service.spec.ts::throws ConflictException when event has no remaining capacity': {
    description: 'When the event is fully booked, ticket generation must be rejected.',
    expected: 'Throws ConflictException and ticketRepo.save is never called.',
    why: 'Calls event.hasAvailableCapacity() — the domain entity holds the rule. FR-06 (prevent overselling) is enforced here.',
  },
  'ticket.service.spec.ts::throws ConflictException when event has already ended': {
    description: 'Cannot generate tickets for events whose date has already passed.',
    expected: "Throws ConflictException with message 'Event has already ended'. Ticket is not saved.",
    why: 'Calls event.isExpired(). Implements FR-08 — events become unusable the moment eventDate passes, without needing a background job.',
  },
  'ticket.service.spec.ts::returns the ticket when found': {
    description: 'getTicketById returns the entity when it exists.',
    expected: 'service.getTicketById(id) returns the mocked ticket.',
    why: 'Wraps ticketRepository.findById with a proper not-found exception. Symmetric with getEventById.',
  },
  'ticket.service.spec.ts::throws NotFoundException when ticket does not exist': {
    description: 'Missing ticket results in a typed 404 exception.',
    expected: "Throws NotFoundException with 'Ticket with id missing not found'.",
    why: 'Consistent with the other service-layer 404s — converts null repository results into HTTP-mapped exceptions.',
  },
  'ticket.service.spec.ts::marks a VALID ticket as USED and persists it': {
    description: 'The redemption happy path: VALID ticket → USED ticket with timestamp, persisted.',
    expected: "result.status === 'USED', redeemedAt is a Date, ticketRepo.update called with the ticket.",
    why: 'Service delegates the state transition to the domain (ticket.markAsUsed()), then persists via the repository. Classic Tell-Don\'t-Ask: the entity knows how to redeem itself.',
  },
  'ticket.service.spec.ts::throws ConflictException when ticket is already USED': {
    description: 'Already-redeemed tickets cannot be redeemed again.',
    expected: "Throws ConflictException with 'This ticket has already been redeemed'.",
    why: 'Service checks ticket.isValid() before redeeming. If false, throws immediately — FR-07 prevents ticket reuse at the HTTP boundary.',
  },
  'ticket.service.spec.ts::throws ConflictException when the event has already ended': {
    description: 'Even a VALID ticket cannot be redeemed if its event has already ended.',
    expected: "Throws ConflictException with 'Event has ended. This ticket can no longer be redeemed'. ticketRepo.update is not called.",
    why: 'Service looks up the associated event and calls event.isExpired(). Implements FR-08 for the redeem flow — the rule is consistent between generation and redemption.',
  },
};

export function getTestMetadata(
  suiteFileName: string,
  testName: string,
): TestMeta {
  const key = `${suiteFileName}::${testName}`;
  return (
    TEST_METADATA[key] ?? {
      description: testName,
      expected: 'The assertion described by the test name succeeds.',
      why: 'See the test source for the detailed assertion.',
    }
  );
}
