import { Injectable } from '@nestjs/common';
import { Event } from '../domain/event.entity';
import { IEventRepository } from './event.repository.interface';

@Injectable()
export class InMemoryEventRepository implements IEventRepository {
  private readonly store = new Map<string, Event>();

  save(event: Event): Event {
    this.store.set(event.id, event);
    return event;
  }

  findById(id: string): Event | null {
    return this.store.get(id) ?? null;
  }

  findAll(): Event[] {
    return Array.from(this.store.values());
  }

  update(event: Event): Event {
    this.store.set(event.id, event);
    return event;
  }
}
