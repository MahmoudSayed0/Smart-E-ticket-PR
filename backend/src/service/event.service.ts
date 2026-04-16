import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Event } from '../domain/event.entity';
import { EventFactory } from '../factory/event.factory';
import {
  EVENT_REPOSITORY,
  IEventRepository,
} from '../repository/event.repository.interface';
import { CreateEventDto } from '../dto/create-event.dto';

@Injectable()
export class EventService {
  constructor(
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: IEventRepository,
    private readonly eventFactory: EventFactory,
  ) {}

  createEvent(dto: CreateEventDto): Event {
    this.validateEventDate(dto.eventDate);
    const event = this.eventFactory.createEvent(dto);
    return this.eventRepository.save(event);
  }

  getAllEvents(): Event[] {
    return this.eventRepository.findAll();
  }

  getEventById(id: string): Event {
    const event = this.eventRepository.findById(id);
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }
    return event;
  }

  private validateEventDate(eventDateIso: string): void {
    const eventDate = new Date(eventDateIso);
    if (eventDate.getTime() <= Date.now()) {
      throw new BadRequestException('Event date must be in the future');
    }
  }
}
