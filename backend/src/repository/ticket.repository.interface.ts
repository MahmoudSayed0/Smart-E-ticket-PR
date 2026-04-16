import { Ticket } from '../domain/ticket.entity';

export const TICKET_REPOSITORY = 'TICKET_REPOSITORY';

export interface ITicketRepository {
  save(ticket: Ticket): Ticket;
  findById(id: string): Ticket | null;
  findByEventId(eventId: string): Ticket[];
  update(ticket: Ticket): Ticket;
}
