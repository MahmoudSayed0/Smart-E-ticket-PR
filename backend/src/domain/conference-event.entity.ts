import { Event } from './event.entity';
import { EventType } from './event-type.enum';

export class ConferenceEvent extends Event {
  public readonly speaker: string;

  constructor(
    id: string,
    name: string,
    description: string,
    venue: string,
    eventDate: Date,
    totalCapacity: number,
    speaker: string,
    remainingCapacity?: number,
    createdAt?: Date,
  ) {
    super(id, name, description, venue, eventDate, totalCapacity, remainingCapacity, createdAt);
    this.speaker = speaker;
  }

  getType(): EventType {
    return EventType.CONFERENCE;
  }
}
