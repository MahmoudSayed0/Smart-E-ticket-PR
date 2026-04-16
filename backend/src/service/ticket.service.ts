import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Ticket } from '../domain/ticket.entity';
import {
  TICKET_REPOSITORY,
  ITicketRepository,
} from '../repository/ticket.repository.interface';
import {
  EVENT_REPOSITORY,
  IEventRepository,
} from '../repository/event.repository.interface';
import {
  TICKET_CODE_STRATEGY,
  ITicketCodeStrategy,
} from '../strategy/ticket-code-strategy.interface';

@Injectable()
export class TicketService {
  constructor(
    @Inject(TICKET_REPOSITORY) private readonly ticketRepository: ITicketRepository,
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: IEventRepository,
    @Inject(TICKET_CODE_STRATEGY) private readonly codeStrategy: ITicketCodeStrategy,
  ) {}

  generateTicket(eventId: string): Ticket {
    const event = this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException(`Event with id ${eventId} not found`);
    }
    if (event.isExpired()) {
      throw new ConflictException('Event has already ended');
    }
    if (!event.hasAvailableCapacity()) {
      throw new ConflictException('No tickets remaining for this event');
    }

    const code = this.codeStrategy.generate();
    const ticket = new Ticket(randomUUID(), event.id, code);
    this.ticketRepository.save(ticket);

    event.decrementCapacity();
    this.eventRepository.update(event);

    return ticket;
  }

  getTicketById(id: string): Ticket {
    const ticket = this.ticketRepository.findById(id);
    if (!ticket) {
      throw new NotFoundException(`Ticket with id ${id} not found`);
    }
    return ticket;
  }

  getTicketsForEvent(eventId: string): Ticket[] {
    return this.ticketRepository.findByEventId(eventId);
  }

  redeemTicket(id: string): Ticket {
    const ticket = this.getTicketById(id);
    if (!ticket.isValid()) {
      throw new ConflictException('This ticket has already been redeemed');
    }
    const event = this.eventRepository.findById(ticket.eventId);
    if (event?.isExpired()) {
      throw new ConflictException('Event has ended. This ticket can no longer be redeemed');
    }
    ticket.markAsUsed();
    return this.ticketRepository.update(ticket);
  }
}
