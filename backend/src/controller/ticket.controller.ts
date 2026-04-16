import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TicketService } from '../service/ticket.service';
import { TicketResponseDto } from '../dto/ticket-response.dto';

@ApiTags('tickets')
@Controller()
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post('events/:eventId/tickets')
  @ApiOperation({ summary: 'Generate a one-time ticket for an event' })
  generate(@Param('eventId') eventId: string): TicketResponseDto {
    const ticket = this.ticketService.generateTicket(eventId);
    return TicketResponseDto.fromDomain(ticket);
  }

  @Get('events/:eventId/tickets')
  @ApiOperation({ summary: 'List all tickets for an event' })
  listForEvent(@Param('eventId') eventId: string): TicketResponseDto[] {
    return this.ticketService
      .getTicketsForEvent(eventId)
      .map((ticket) => TicketResponseDto.fromDomain(ticket));
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'View a ticket by id' })
  findOne(@Param('id') id: string): TicketResponseDto {
    return TicketResponseDto.fromDomain(this.ticketService.getTicketById(id));
  }

  @Post('tickets/:id/redeem')
  @ApiOperation({ summary: 'Redeem a ticket (mark as used)' })
  redeem(@Param('id') id: string): TicketResponseDto {
    return TicketResponseDto.fromDomain(this.ticketService.redeemTicket(id));
  }
}
