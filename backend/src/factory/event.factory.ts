import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Event } from '../domain/event.entity';
import { ConcertEvent } from '../domain/concert-event.entity';
import { ConferenceEvent } from '../domain/conference-event.entity';
import { SportsEvent } from '../domain/sports-event.entity';
import { EventType } from '../domain/event-type.enum';
import { CreateEventDto } from '../dto/create-event.dto';

@Injectable()
export class EventFactory {
  createEvent(dto: CreateEventDto): Event {
    const id = randomUUID();
    const eventDate = new Date(dto.eventDate);

    switch (dto.type) {
      case EventType.CONCERT:
        return new ConcertEvent(
          id,
          dto.name,
          dto.description,
          dto.venue,
          eventDate,
          dto.totalCapacity,
          dto.artist ?? '',
        );

      case EventType.CONFERENCE:
        return new ConferenceEvent(
          id,
          dto.name,
          dto.description,
          dto.venue,
          eventDate,
          dto.totalCapacity,
          dto.speaker ?? '',
        );

      case EventType.SPORTS:
        return new SportsEvent(
          id,
          dto.name,
          dto.description,
          dto.venue,
          eventDate,
          dto.totalCapacity,
          dto.teams ?? '',
        );

      default:
        throw new Error(`Unsupported event type: ${dto.type}`);
    }
  }
}
