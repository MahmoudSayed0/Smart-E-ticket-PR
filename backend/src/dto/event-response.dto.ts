import { ApiProperty } from '@nestjs/swagger';
import { Event } from '../domain/event.entity';
import { EventType } from '../domain/event-type.enum';

export class EventResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() description!: string;
  @ApiProperty() venue!: string;
  @ApiProperty() eventDate!: string;
  @ApiProperty() totalCapacity!: number;
  @ApiProperty() remainingCapacity!: number;
  @ApiProperty({ enum: EventType }) type!: EventType;
  @ApiProperty() createdAt!: string;
  @ApiProperty({ description: 'True when current time is past eventDate' })
  isExpired!: boolean;

  static fromDomain(event: Event): EventResponseDto {
    const dto = new EventResponseDto();
    dto.id = event.id;
    dto.name = event.name;
    dto.description = event.description;
    dto.venue = event.venue;
    dto.eventDate = event.eventDate.toISOString();
    dto.totalCapacity = event.totalCapacity;
    dto.remainingCapacity = event.remainingCapacity;
    dto.type = event.getType();
    dto.createdAt = event.createdAt.toISOString();
    dto.isExpired = event.isExpired();
    return dto;
  }
}
