import { EventFactory } from './event.factory';
import { ConcertEvent } from '../domain/concert-event.entity';
import { ConferenceEvent } from '../domain/conference-event.entity';
import { SportsEvent } from '../domain/sports-event.entity';
import { EventType } from '../domain/event-type.enum';
import { CreateEventDto } from '../dto/create-event.dto';

describe('EventFactory', () => {
  let factory: EventFactory;

  beforeEach(() => {
    factory = new EventFactory();
  });

  const baseDto = (): CreateEventDto => ({
    name: 'Test Event',
    description: 'A test',
    venue: 'Venue',
    eventDate: '2030-01-01T20:00:00.000Z',
    totalCapacity: 50,
    type: EventType.CONCERT,
  });

  it('creates a ConcertEvent when type is CONCERT', () => {
    const dto = { ...baseDto(), type: EventType.CONCERT, artist: 'Coldplay' };
    const event = factory.createEvent(dto);

    expect(event).toBeInstanceOf(ConcertEvent);
    expect((event as ConcertEvent).artist).toBe('Coldplay');
    expect(event.getType()).toBe(EventType.CONCERT);
  });

  it('creates a ConferenceEvent when type is CONFERENCE', () => {
    const dto = { ...baseDto(), type: EventType.CONFERENCE, speaker: 'Dr. Doe' };
    const event = factory.createEvent(dto);

    expect(event).toBeInstanceOf(ConferenceEvent);
    expect((event as ConferenceEvent).speaker).toBe('Dr. Doe');
    expect(event.getType()).toBe(EventType.CONFERENCE);
  });

  it('creates a SportsEvent when type is SPORTS', () => {
    const dto = { ...baseDto(), type: EventType.SPORTS, teams: 'A vs B' };
    const event = factory.createEvent(dto);

    expect(event).toBeInstanceOf(SportsEvent);
    expect((event as SportsEvent).teams).toBe('A vs B');
    expect(event.getType()).toBe(EventType.SPORTS);
  });

  it('initializes remainingCapacity equal to totalCapacity', () => {
    const event = factory.createEvent(baseDto());
    expect(event.remainingCapacity).toBe(50);
    expect(event.totalCapacity).toBe(50);
  });

  it('assigns a unique id to each created event', () => {
    const event1 = factory.createEvent(baseDto());
    const event2 = factory.createEvent(baseDto());
    expect(event1.id).not.toBe(event2.id);
  });
});
