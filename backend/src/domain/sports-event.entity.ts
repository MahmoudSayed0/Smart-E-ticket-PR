import { Event } from './event.entity';
import { EventType } from './event-type.enum';

export class SportsEvent extends Event {
  public readonly teams: string;

  constructor(
    id: string,
    name: string,
    description: string,
    venue: string,
    eventDate: Date,
    totalCapacity: number,
    teams: string,
    remainingCapacity?: number,
    createdAt?: Date,
  ) {
    super(id, name, description, venue, eventDate, totalCapacity, remainingCapacity, createdAt);
    this.teams = teams;
  }

  getType(): EventType {
    return EventType.SPORTS;
  }
}
