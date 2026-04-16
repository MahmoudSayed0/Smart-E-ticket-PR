import { ApiProperty } from '@nestjs/swagger';
import { Ticket } from '../domain/ticket.entity';
import { TicketStatus } from '../domain/ticket-status.enum';

export class TicketResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() eventId!: string;
  @ApiProperty() code!: string;
  @ApiProperty({ enum: TicketStatus }) status!: TicketStatus;
  @ApiProperty() createdAt!: string;
  @ApiProperty({ nullable: true }) redeemedAt!: string | null;

  static fromDomain(ticket: Ticket): TicketResponseDto {
    const dto = new TicketResponseDto();
    dto.id = ticket.id;
    dto.eventId = ticket.eventId;
    dto.code = ticket.code;
    dto.status = ticket.status;
    dto.createdAt = ticket.createdAt.toISOString();
    dto.redeemedAt = ticket.redeemedAt ? ticket.redeemedAt.toISOString() : null;
    return dto;
  }
}
