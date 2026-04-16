import { Injectable } from '@nestjs/common';
import { ITicketCodeStrategy } from './ticket-code-strategy.interface';

@Injectable()
export class NumericCodeStrategy implements ITicketCodeStrategy {
  private readonly MIN = 100000;
  private readonly MAX = 999999;

  generate(): string {
    const value = Math.floor(this.MIN + Math.random() * (this.MAX - this.MIN + 1));
    return value.toString();
  }
}
