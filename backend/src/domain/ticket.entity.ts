import { TicketStatus } from './ticket-status.enum';

export class Ticket {
  public readonly id: string;
  public readonly eventId: string;
  public readonly code: string;
  public status: TicketStatus;
  public readonly createdAt: Date;
  public redeemedAt: Date | null;

  constructor(
    id: string,
    eventId: string,
    code: string,
    status: TicketStatus = TicketStatus.VALID,
    createdAt?: Date,
    redeemedAt: Date | null = null,
  ) {
    this.id = id;
    this.eventId = eventId;
    this.code = code;
    this.status = status;
    this.createdAt = createdAt ?? new Date();
    this.redeemedAt = redeemedAt;
  }

  isValid(): boolean {
    return this.status === TicketStatus.VALID;
  }

  markAsUsed(): void {
    if (!this.isValid()) {
      throw new Error('Cannot redeem a ticket that is not in VALID state');
    }
    this.status = TicketStatus.USED;
    this.redeemedAt = new Date();
  }
}
