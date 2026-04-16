import { Event } from './event.entity';
import { EventType } from './event-type.enum';

export class ConcertEvent extends Event {
  public readonly artist: string;

  constructor(
    id: string,
    name: string,
    description: string,
    venue: string,
    eventDate: Date,
    totalCapacity: number,
    artist: string,
    remainingCapacity?: number,
    createdAt?: Date,
  ) {
    super(id, name, description, venue, eventDate, totalCapacity, remainingCapacity, createdAt);
    this.artist = artist;
  }

  getType(): EventType {
    return EventType.CONCERT;
  }
}
