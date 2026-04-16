import { Module } from '@nestjs/common';
import { EVENT_REPOSITORY } from './repository/event.repository.interface';
import { TICKET_REPOSITORY } from './repository/ticket.repository.interface';
import { TICKET_CODE_STRATEGY } from './strategy/ticket-code-strategy.interface';
import { InMemoryEventRepository } from './repository/in-memory-event.repository';
import { InMemoryTicketRepository } from './repository/in-memory-ticket.repository';
import { ShortCodeStrategy } from './strategy/short-code.strategy';
import { EventFactory } from './factory/event.factory';
import { EventService } from './service/event.service';
import { TicketService } from './service/ticket.service';
import { EventController } from './controller/event.controller';
import { TicketController } from './controller/ticket.controller';
import { TestController } from './controller/test.controller';

@Module({
  controllers: [EventController, TicketController, TestController],
  providers: [
    EventFactory,
    EventService,
    TicketService,
    {
      provide: EVENT_REPOSITORY,
      useClass: InMemoryEventRepository,
    },
    {
      provide: TICKET_REPOSITORY,
      useClass: InMemoryTicketRepository,
    },
    {
      provide: TICKET_CODE_STRATEGY,
      useClass: ShortCodeStrategy,
    },
  ],
})
export class AppModule {}
