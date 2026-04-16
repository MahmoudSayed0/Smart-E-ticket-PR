import { Injectable } from '@nestjs/common';
import { Ticket } from '../domain/ticket.entity';
import { ITicketRepository } from './ticket.repository.interface';

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
    return Array.from(this.store.values()).filter((ticket) => ticket.eventId === eventId);
  }

  update(ticket: Ticket): Ticket {
    this.store.set(ticket.id, ticket);
    return ticket;
  }
}
