import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EventService } from '../service/event.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { EventResponseDto } from '../dto/event-response.dto';

@ApiTags('events')
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  create(@Body() dto: CreateEventDto): EventResponseDto {
    const event = this.eventService.createEvent(dto);
    return EventResponseDto.fromDomain(event);
  }

  @Get()
  @ApiOperation({ summary: 'List all events' })
  findAll(): EventResponseDto[] {
    return this.eventService.getAllEvents().map((event) => EventResponseDto.fromDomain(event));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an event by id' })
  findOne(@Param('id') id: string): EventResponseDto {
    return EventResponseDto.fromDomain(this.eventService.getEventById(id));
  }
}
