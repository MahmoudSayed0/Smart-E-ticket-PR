import { EventType } from './event-type.enum';

export abstract class Event {
  public readonly id: string;
  public name: string;
  public description: string;
  public venue: string;
  public eventDate: Date;
  public readonly totalCapacity: number;
  public remainingCapacity: number;
  public readonly createdAt: Date;

  constructor(
    id: string,
    name: string,
    description: string,
    venue: string,
    eventDate: Date,
    totalCapacity: number,
    remainingCapacity?: number,
    createdAt?: Date,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.venue = venue;
    this.eventDate = eventDate;
    this.totalCapacity = totalCapacity;
    this.remainingCapacity = remainingCapacity ?? totalCapacity;
    this.createdAt = createdAt ?? new Date();
  }

  hasAvailableCapacity(): boolean {
    return this.remainingCapacity > 0;
  }

  isExpired(now: Date = new Date()): boolean {
    return this.eventDate.getTime() <= now.getTime();
  }

  decrementCapacity(): void {
    if (!this.hasAvailableCapacity()) {
      throw new Error('Cannot decrement capacity: no tickets remaining');
    }
    this.remainingCapacity -= 1;
  }

  abstract getType(): EventType;
}
