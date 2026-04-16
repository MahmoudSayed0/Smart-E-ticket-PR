import { Injectable } from '@nestjs/common';
import { ITicketCodeStrategy } from './ticket-code-strategy.interface';

@Injectable()
export class ShortCodeStrategy implements ITicketCodeStrategy {
  private readonly ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  private readonly GROUP_SIZE = 4;
  private readonly GROUP_COUNT = 2;

  generate(): string {
    const groups: string[] = [];
    for (let g = 0; g < this.GROUP_COUNT; g++) {
      let group = '';
      for (let i = 0; i < this.GROUP_SIZE; i++) {
        const index = Math.floor(Math.random() * this.ALPHABET.length);
        group += this.ALPHABET[index];
      }
      groups.push(group);
    }
    return groups.join('-');
  }
}
