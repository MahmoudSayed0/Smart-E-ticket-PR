import { InMemoryEventRepository } from './in-memory-event.repository';
import { ConcertEvent } from '../domain/concert-event.entity';

describe('InMemoryEventRepository', () => {
  let repository: InMemoryEventRepository;

  const buildEvent = (id: string) =>
    new ConcertEvent(
      id,
      `Event ${id}`,
      'desc',
      'Venue',
      new Date('2030-01-01'),
      100,
      'Artist',
    );

  beforeEach(() => {
    repository = new InMemoryEventRepository();
  });

  it('saves and retrieves an event by id', () => {
    const event = buildEvent('e1');
    repository.save(event);

    expect(repository.findById('e1')).toBe(event);
  });

  it('returns null when finding a non-existent event', () => {
    expect(repository.findById('missing')).toBeNull();
  });

  it('returns all saved events', () => {
    repository.save(buildEvent('e1'));
    repository.save(buildEvent('e2'));

    expect(repository.findAll()).toHaveLength(2);
  });

  it('returns an empty array when no events exist', () => {
    expect(repository.findAll()).toEqual([]);
  });

  it('updates an existing event', () => {
    const event = buildEvent('e1');
    repository.save(event);

    event.decrementCapacity();
    repository.update(event);

    expect(repository.findById('e1')?.remainingCapacity).toBe(99);
  });
});
