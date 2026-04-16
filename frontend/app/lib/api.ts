const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000';

export type EventType = 'CONCERT' | 'CONFERENCE' | 'SPORTS';

export interface EventDto {
  id: string;
  name: string;
  description: string;
  venue: string;
  eventDate: string;
  totalCapacity: number;
  remainingCapacity: number;
  type: EventType;
  createdAt: string;
  isExpired: boolean;
}

export interface TicketDto {
  id: string;
  eventId: string;
  code: string;
  status: 'VALID' | 'USED';
  createdAt: string;
  redeemedAt: string | null;
}

export interface CreateEventPayload {
  name: string;
  description: string;
  venue: string;
  eventDate: string;
  totalCapacity: number;
  type: EventType;
  artist?: string;
  speaker?: string;
  teams?: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message ?? `HTTP ${response.status}`);
  }
  return response.json();
}

export const api = {
  async listEvents(): Promise<EventDto[]> {
    const res = await fetch(`${API_BASE}/events`, { cache: 'no-store' });
    return handleResponse<EventDto[]>(res);
  },

  async createEvent(payload: CreateEventPayload): Promise<EventDto> {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<EventDto>(res);
  },

  async generateTicket(eventId: string): Promise<TicketDto> {
    const res = await fetch(`${API_BASE}/events/${eventId}/tickets`, {
      method: 'POST',
    });
    return handleResponse<TicketDto>(res);
  },

  async listTicketsForEvent(eventId: string): Promise<TicketDto[]> {
    const res = await fetch(`${API_BASE}/events/${eventId}/tickets`, {
      cache: 'no-store',
    });
    return handleResponse<TicketDto[]>(res);
  },

  async getTicket(ticketId: string): Promise<TicketDto> {
    const res = await fetch(`${API_BASE}/tickets/${ticketId}`, { cache: 'no-store' });
    return handleResponse<TicketDto>(res);
  },

  async redeemTicket(ticketId: string): Promise<TicketDto> {
    const res = await fetch(`${API_BASE}/tickets/${ticketId}/redeem`, {
      method: 'POST',
    });
    return handleResponse<TicketDto>(res);
  },

  async getEvent(eventId: string): Promise<EventDto> {
    const res = await fetch(`${API_BASE}/events/${eventId}`, { cache: 'no-store' });
    return handleResponse<EventDto>(res);
  },

  async runTests(): Promise<TestSummary> {
    const res = await fetch(`${API_BASE}/tests`, { cache: 'no-store' });
    return handleResponse<TestSummary>(res);
  },
};

export interface TestCase {
  name: string;
  status: string;
  duration: number;
  failureMessages: string[];
}

export interface TestSuite {
  name: string;
  status: string;
  duration: number;
  numPassing: number;
  numFailing: number;
  tests: TestCase[];
}

export interface TestSummary {
  success: boolean;
  totalSuites: number;
  passedSuites: number;
  failedSuites: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  durationMs: number;
  suites: TestSuite[];
  error?: string;
}
