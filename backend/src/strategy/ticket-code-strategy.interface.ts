export const TICKET_CODE_STRATEGY = 'TICKET_CODE_STRATEGY';

export interface ITicketCodeStrategy {
  generate(): string;
}
