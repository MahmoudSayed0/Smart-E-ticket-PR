import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ITicketCodeStrategy } from './ticket-code-strategy.interface';

@Injectable()
export class UuidCodeStrategy implements ITicketCodeStrategy {
  generate(): string {
    return randomUUID();
  }
}
