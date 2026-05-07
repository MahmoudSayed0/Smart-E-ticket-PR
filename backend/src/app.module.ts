import { Module } from '@nestjs/common';
import { EVENT_REPOSITORY } from './repository/event.repository.interface';
import { TICKET_REPOSITORY } from './repository/ticket.repository.interface';
import { TICKET_CODE_STRATEGY } from './strategy/ticket-code-strategy.interface';
import { InMemoryEventRepository } from './repository/in-memory-event.repository';
import { InMemoryTicketRepository } from './repository/in-memory-ticket.repository';
import { SqliteEventRepository } from './repository/sqlite-event.repository';
import { SqliteTicketRepository } from './repository/sqlite-ticket.repository';
import { ShortCodeStrategy } from './strategy/short-code.strategy';
import { EventFactory } from './factory/event.factory';
import { EventService } from './service/event.service';
import { TicketService } from './service/ticket.service';
import { EventController } from './controller/event.controller';
import { TicketController } from './controller/ticket.controller';
import { TestController } from './controller/test.controller';

/**
 * Repository binding is decided at boot from `process.env.DB_DRIVER`.
 *  - DB_DRIVER=sqlite → SqliteEventRepository / SqliteTicketRepository (production)
 *  - anything else    → InMemoryEventRepository / InMemoryTicketRepository (default, tests)
 *
 * The Repository pattern's whole point is on display here: swapping the
 * binding changes the storage backend, and not a single line in the
 * service layer is touched. `grep -r 'Sqlite\|InMemory' src/service/`
 * still returns zero matches.
 */
const useSqlite = process.env.DB_DRIVER === 'sqlite';

@Module({
  controllers: [EventController, TicketController, TestController],
  providers: [
    EventFactory,
    EventService,
    TicketService,
    {
      provide: EVENT_REPOSITORY,
      useClass: useSqlite ? SqliteEventRepository : InMemoryEventRepository,
    },
    {
      provide: TICKET_REPOSITORY,
      useClass: useSqlite ? SqliteTicketRepository : InMemoryTicketRepository,
    },
    {
      provide: TICKET_CODE_STRATEGY,
      useClass: ShortCodeStrategy,
    },
  ],
})
export class AppModule {}
