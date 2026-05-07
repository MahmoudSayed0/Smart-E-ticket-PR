import { Injectable } from '@nestjs/common';
import { Ticket } from '../domain/ticket.entity';
import { TicketStatus } from '../domain/ticket-status.enum';
import { ITicketRepository } from './ticket.repository.interface';
import { getDatabase } from './sqlite-database';

interface TicketRow {
  id: string;
  event_id: string;
  code: string;
  status: string;
  created_at: string;
  redeemed_at: string | null;
}

@Injectable()
export class SqliteTicketRepository implements ITicketRepository {
  private readonly db = getDatabase();

  save(ticket: Ticket): Ticket {
    const stmt = this.db.prepare(`
      INSERT INTO tickets (id, event_id, code, status, created_at, redeemed_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        status=excluded.status,
        redeemed_at=excluded.redeemed_at
    `);
    stmt.run(
      ticket.id,
      ticket.eventId,
      ticket.code,
      ticket.status,
      ticket.createdAt.toISOString(),
      ticket.redeemedAt ? ticket.redeemedAt.toISOString() : null,
    );
    return ticket;
  }

  findById(id: string): Ticket | null {
    const row = this.db
      .prepare('SELECT * FROM tickets WHERE id = ?')
      .get(id) as TicketRow | undefined;
    return row ? this.rowToTicket(row) : null;
  }

  findByEventId(eventId: string): Ticket[] {
    const rows = this.db
      .prepare('SELECT * FROM tickets WHERE event_id = ? ORDER BY created_at DESC')
      .all(eventId) as TicketRow[];
    return rows.map((row) => this.rowToTicket(row));
  }

  update(ticket: Ticket): Ticket {
    return this.save(ticket);
  }

  private rowToTicket(row: TicketRow): Ticket {
    return new Ticket(
      row.id,
      row.event_id,
      row.code,
      row.status as TicketStatus,
      new Date(row.created_at),
      row.redeemed_at ? new Date(row.redeemed_at) : null,
    );
  }
}
