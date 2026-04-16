import { ConflictException, NotFoundException } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { IEventRepository } from '../repository/event.repository.interface';
import { ITicketRepository } from '../repository/ticket.repository.interface';
import { ITicketCodeStrategy } from '../strategy/ticket-code-strategy.interface';
import { ConcertEvent } from '../domain/concert-event.entity';
import { Ticket } from '../domain/ticket.entity';
import { TicketStatus } from '../domain/ticket-status.enum';

describe('TicketService', () => {
  let service: TicketService;
  let ticketRepo: jest.Mocked<ITicketRepository>;
  let eventRepo: jest.Mocked<IEventRepository>;
  let strategy: jest.Mocked<ITicketCodeStrategy>;

  const buildEvent = (capacity: number) =>
    new ConcertEvent(
      'event-1',
      'Test',
      'desc',
      'venue',
      new Date('2030-01-01'),
      capacity,
      'Artist',
    );

  const buildExpiredEvent = () =>
    new ConcertEvent(
      'event-1',
      'Past',
      'desc',
      'venue',
      new Date('2020-01-01'),
      10,
      'Artist',
    );

  beforeEach(() => {
    ticketRepo = {
      save: jest.fn((t) => t),
      findById: jest.fn(),
      findByEventId: jest.fn(),
      update: jest.fn((t) => t),
    };
    eventRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn((e) => e),
    };
    strategy = {
      generate: jest.fn().mockReturnValue('MOCK-CODE'),
    };
    service = new TicketService(ticketRepo, eventRepo, strategy);
  });

  describe('generateTicket', () => {
    it('creates a VALID ticket with a code from the strategy', () => {
      const event = buildEvent(5);
      eventRepo.findById.mockReturnValue(event);

      const ticket = service.generateTicket('event-1');

      expect(ticket.status).toBe(TicketStatus.VALID);
      expect(ticket.code).toBe('MOCK-CODE');
      expect(ticket.eventId).toBe('event-1');
      expect(strategy.generate).toHaveBeenCalled();
    });

    it('decrements the event capacity and persists both entities', () => {
      const event = buildEvent(5);
      eventRepo.findById.mockReturnValue(event);

      service.generateTicket('event-1');

      expect(event.remainingCapacity).toBe(4);
      expect(ticketRepo.save).toHaveBeenCalled();
      expect(eventRepo.update).toHaveBeenCalledWith(event);
    });

    it('throws NotFoundException when event does not exist', () => {
      eventRepo.findById.mockReturnValue(null);

      expect(() => service.generateTicket('missing')).toThrow(NotFoundException);
    });

    it('throws ConflictException when event has no remaining capacity', () => {
      const event = buildEvent(1);
      event.decrementCapacity();
      eventRepo.findById.mockReturnValue(event);

      expect(() => service.generateTicket('event-1')).toThrow(ConflictException);
      expect(ticketRepo.save).not.toHaveBeenCalled();
    });

    it('throws ConflictException when event has already ended', () => {
      eventRepo.findById.mockReturnValue(buildExpiredEvent());

      expect(() => service.generateTicket('event-1')).toThrow(ConflictException);
      expect(() => service.generateTicket('event-1')).toThrow('Event has already ended');
      expect(ticketRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('getTicketById', () => {
    it('returns the ticket when found', () => {
      const ticket = new Ticket('t1', 'event-1', 'CODE');
      ticketRepo.findById.mockReturnValue(ticket);

      expect(service.getTicketById('t1')).toBe(ticket);
    });

    it('throws NotFoundException when ticket does not exist', () => {
      ticketRepo.findById.mockReturnValue(null);
      expect(() => service.getTicketById('missing')).toThrow(NotFoundException);
    });
  });

  describe('redeemTicket', () => {
    it('marks a VALID ticket as USED and persists it', () => {
      const ticket = new Ticket('t1', 'event-1', 'CODE');
      ticketRepo.findById.mockReturnValue(ticket);
      eventRepo.findById.mockReturnValue(buildEvent(10));

      const result = service.redeemTicket('t1');

      expect(result.status).toBe(TicketStatus.USED);
      expect(result.redeemedAt).toBeInstanceOf(Date);
      expect(ticketRepo.update).toHaveBeenCalledWith(ticket);
    });

    it('throws ConflictException when ticket is already USED', () => {
      const ticket = new Ticket('t1', 'event-1', 'CODE');
      ticket.markAsUsed();
      ticketRepo.findById.mockReturnValue(ticket);

      expect(() => service.redeemTicket('t1')).toThrow(ConflictException);
    });

    it('throws NotFoundException when ticket does not exist', () => {
      ticketRepo.findById.mockReturnValue(null);
      expect(() => service.redeemTicket('missing')).toThrow(NotFoundException);
    });

    it('throws ConflictException when the event has already ended', () => {
      const ticket = new Ticket('t1', 'event-1', 'CODE');
      ticketRepo.findById.mockReturnValue(ticket);
      eventRepo.findById.mockReturnValue(buildExpiredEvent());

      expect(() => service.redeemTicket('t1')).toThrow(ConflictException);
      expect(() => service.redeemTicket('t1')).toThrow(
        'Event has ended. This ticket can no longer be redeemed',
      );
      expect(ticketRepo.update).not.toHaveBeenCalled();
    });
  });
});
