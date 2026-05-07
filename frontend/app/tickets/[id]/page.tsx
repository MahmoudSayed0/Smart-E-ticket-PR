'use client';

import { use, useEffect, useState } from 'react';
import { XCircle } from 'lucide-react';
import TiltedCard from '../../../components/TiltedCard';
import { AnimatedTicket } from '../../../components/AnimatedTicket';
import { api, EventDto, TicketDto } from '../../lib/api';

export default function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [ticket, setTicket] = useState<TicketDto | null>(null);
  const [event, setEvent] = useState<EventDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    loadTicket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadTicket() {
    try {
      setLoading(true);
      const data = await api.getTicket(id);
      setTicket(data);
      const eventData = await api.getEvent(data.eventId);
      setEvent(eventData);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRedeem() {
    if (!ticket) return;
    try {
      setRedeeming(true);
      const updated = await api.redeemTicket(ticket.id);
      setTicket(updated);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setRedeeming(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading ticket…</p>
      </main>
    );
  }

  if (error && !ticket) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="soft-card max-w-md p-8 text-center shadow-[6px_6px_0_0_var(--border)]">
          <div className="mb-4 inline-flex rounded-full border-2 border-border bg-destructive p-4">
            <XCircle className="h-10 w-10 text-destructive-foreground" strokeWidth={2.5} />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-card-foreground">
            Ticket not found
          </h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </main>
    );
  }

  if (!ticket) return null;

  const eventExpired = event?.isExpired ?? false;
  const status: 'VALID' | 'USED' | 'EXPIRED' =
    ticket.status === 'USED'
      ? 'USED'
      : eventExpired
        ? 'EXPIRED'
        : 'VALID';

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-xs">
        <TiltedCard
          rotateAmplitude={8}
          scaleOnHover={1.03}
          showTooltip={status === 'VALID'}
          tooltipText="Scan your code"
        >
          <AnimatedTicket
            ticketCode={ticket.code}
            ticketShortId={ticket.id.slice(0, 8).toUpperCase()}
            eventName={event?.name ?? 'Event'}
            eventVenue={event?.venue ?? ''}
            eventType={event?.type ?? ''}
            eventDate={event ? new Date(event.eventDate) : new Date()}
            status={status}
            redeemedAt={ticket.redeemedAt ? new Date(ticket.redeemedAt) : null}
            onRedeem={handleRedeem}
            redeeming={redeeming}
          />
        </TiltedCard>

        {error && ticket && (
          <div className="mt-4 rounded-lg border-2 border-border bg-destructive p-3 text-sm text-destructive-foreground">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}
