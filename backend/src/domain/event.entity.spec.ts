import { ConcertEvent } from './concert-event.entity';
import { EventType } from './event-type.enum';

describe('Event entity (via ConcertEvent)', () => {
  const createEvent = (capacity: number) =>
    new ConcertEvent(
      'event-1',
      'Test Concert',
      'Description',
      'Venue',
      new Date('2030-01-01'),
      capacity,
      'Some Artist',
    );

  it('initializes remainingCapacity equal to totalCapacity', () => {
    const event = createEvent(100);
    expect(event.remainingCapacity).toBe(100);
    expect(event.totalCapacity).toBe(100);
  });

  it('returns the correct subtype from getType()', () => {
    expect(createEvent(1).getType()).toBe(EventType.CONCERT);
  });

  it('decrements capacity when a ticket is generated', () => {
    const event = createEvent(5);
    event.decrementCapacity();
    expect(event.remainingCapacity).toBe(4);
  });

  it('reports hasAvailableCapacity correctly', () => {
    const event = createEvent(1);
    expect(event.hasAvailableCapacity()).toBe(true);
    event.decrementCapacity();
    expect(event.hasAvailableCapacity()).toBe(false);
  });

  it('throws when decrementing capacity below zero', () => {
    const event = createEvent(1);
    event.decrementCapacity();
    expect(() => event.decrementCapacity()).toThrow('Cannot decrement capacity');
  });

  describe('isExpired', () => {
    it('returns false when eventDate is in the future', () => {
      const futureEvent = new ConcertEvent(
        'e1',
        'Future',
        '',
        'V',
        new Date(Date.now() + 86_400_000),
        10,
        'X',
      );
      expect(futureEvent.isExpired()).toBe(false);
    });

    it('returns true when eventDate is in the past', () => {
      const pastEvent = new ConcertEvent(
        'e1',
        'Past',
        '',
        'V',
        new Date(Date.now() - 1000),
        10,
        'X',
      );
      expect(pastEvent.isExpired()).toBe(true);
    });

    it('accepts an injected "now" for deterministic testing', () => {
      const event = new ConcertEvent(
        'e1',
        'Test',
        '',
        'V',
        new Date('2026-06-01T20:00:00Z'),
        10,
        'X',
      );
      expect(event.isExpired(new Date('2026-06-01T19:59:59Z'))).toBe(false);
      expect(event.isExpired(new Date('2026-06-01T20:00:01Z'))).toBe(true);
    });
  });
});
