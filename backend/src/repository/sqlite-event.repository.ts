import { Injectable } from '@nestjs/common';
import { Event } from '../domain/event.entity';
import { ConcertEvent } from '../domain/concert-event.entity';
import { ConferenceEvent } from '../domain/conference-event.entity';
import { SportsEvent } from '../domain/sports-event.entity';
import { EventType } from '../domain/event-type.enum';
import { IEventRepository } from './event.repository.interface';
import { getDatabase } from './sqlite-database';

interface EventRow {
  id: string;
  type: string;
  name: string;
  description: string;
  venue: string;
  event_date: string;
  total_capacity: number;
  remaining_capacity: number;
  created_at: string;
  subclass_field: string;
}

@Injectable()
export class SqliteEventRepository implements IEventRepository {
  private readonly db = getDatabase();

  save(event: Event): Event {
    const stmt = this.db.prepare(`
      INSERT INTO events
        (id, type, name, description, venue, event_date, total_capacity, remaining_capacity, created_at, subclass_field)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        type=excluded.type, name=excluded.name, description=excluded.description,
        venue=excluded.venue, event_date=excluded.event_date,
        total_capacity=excluded.total_capacity, remaining_capacity=excluded.remaining_capacity,
        subclass_field=excluded.subclass_field
    `);
    stmt.run(
      event.id,
      event.getType(),
      event.name,
      event.description,
      event.venue,
      event.eventDate.toISOString(),
      event.totalCapacity,
      event.remainingCapacity,
      event.createdAt.toISOString(),
      this.extractSubclassField(event),
    );
    return event;
  }

  findById(id: string): Event | null {
    const row = this.db
      .prepare('SELECT * FROM events WHERE id = ?')
      .get(id) as EventRow | undefined;
    return row ? this.rowToEvent(row) : null;
  }

  findAll(): Event[] {
    const rows = this.db
      .prepare('SELECT * FROM events ORDER BY created_at DESC')
      .all() as EventRow[];
    return rows.map((row) => this.rowToEvent(row));
  }

  update(event: Event): Event {
    return this.save(event);
  }

  private extractSubclassField(event: Event): string {
    if (event instanceof ConcertEvent) return event.artist;
    if (event instanceof ConferenceEvent) return event.speaker;
    if (event instanceof SportsEvent) return event.teams;
    return '';
  }

  private rowToEvent(row: EventRow): Event {
    const eventDate = new Date(row.event_date);
    const createdAt = new Date(row.created_at);
    switch (row.type as EventType) {
      case EventType.CONCERT:
        return new ConcertEvent(
          row.id, row.name, row.description, row.venue, eventDate,
          row.total_capacity, row.subclass_field,
          row.remaining_capacity, createdAt,
        );
      case EventType.CONFERENCE:
        return new ConferenceEvent(
          row.id, row.name, row.description, row.venue, eventDate,
          row.total_capacity, row.subclass_field,
          row.remaining_capacity, createdAt,
        );
      case EventType.SPORTS:
        return new SportsEvent(
          row.id, row.name, row.description, row.venue, eventDate,
          row.total_capacity, row.subclass_field,
          row.remaining_capacity, createdAt,
        );
      default:
        throw new Error(`Unknown event type: ${row.type}`);
    }
  }
}
