import { InMemoryTicketRepository } from './in-memory-ticket.repository';
import { Ticket } from '../domain/ticket.entity';

describe('InMemoryTicketRepository', () => {
  let repository: InMemoryTicketRepository;

  beforeEach(() => {
    repository = new InMemoryTicketRepository();
  });

  it('saves and retrieves a ticket by id', () => {
    const ticket = new Ticket('t1', 'e1', 'CODE-1');
    repository.save(ticket);

    expect(repository.findById('t1')).toBe(ticket);
  });

  it('returns null for an unknown ticket id', () => {
    expect(repository.findById('unknown')).toBeNull();
  });

  it('finds tickets by event id', () => {
    repository.save(new Ticket('t1', 'e1', 'A'));
    repository.save(new Ticket('t2', 'e1', 'B'));
    repository.save(new Ticket('t3', 'e2', 'C'));

    expect(repository.findByEventId('e1')).toHaveLength(2);
    expect(repository.findByEventId('e2')).toHaveLength(1);
    expect(repository.findByEventId('e3')).toEqual([]);
  });

  it('updates an existing ticket', () => {
    const ticket = new Ticket('t1', 'e1', 'CODE-1');
    repository.save(ticket);

    ticket.markAsUsed();
    repository.update(ticket);

    expect(repository.findById('t1')?.status).toBe('USED');
  });
});
