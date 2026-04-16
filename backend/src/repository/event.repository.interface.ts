import { Event } from '../domain/event.entity';

export const EVENT_REPOSITORY = 'EVENT_REPOSITORY';

export interface IEventRepository {
  save(event: Event): Event;
  findById(id: string): Event | null;
  findAll(): Event[];
  update(event: Event): Event;
}
