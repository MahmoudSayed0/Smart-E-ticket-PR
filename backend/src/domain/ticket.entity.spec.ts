import { Ticket } from './ticket.entity';
import { TicketStatus } from './ticket-status.enum';

describe('Ticket entity', () => {
  let ticket: Ticket;

  beforeEach(() => {
    ticket = new Ticket('ticket-1', 'event-1', 'CODE-ABCD');
  });

  it('is created in VALID state by default', () => {
    expect(ticket.status).toBe(TicketStatus.VALID);
    expect(ticket.isValid()).toBe(true);
    expect(ticket.redeemedAt).toBeNull();
  });

  it('marks itself as USED when redeemed', () => {
    ticket.markAsUsed();

    expect(ticket.status).toBe(TicketStatus.USED);
    expect(ticket.isValid()).toBe(false);
    expect(ticket.redeemedAt).toBeInstanceOf(Date);
  });

  it('throws when trying to redeem an already-used ticket', () => {
    ticket.markAsUsed();

    expect(() => ticket.markAsUsed()).toThrow('Cannot redeem a ticket that is not in VALID state');
  });
});
