'use client';

import { useCallback, useEffect, useState, FormEvent } from 'react';
import {
  Ticket,
  Plus,
  Copy,
  ExternalLink,
  Calendar,
  MapPin,
  Users,
  AlertCircle,
  CheckCircle2,
  BadgeCheck,
  RefreshCw,
  BookOpen,
  LayoutDashboard,
  FlaskConical,
} from 'lucide-react';
import TestResults from '../../components/TestResults';
import { api, EventDto, EventType, TicketDto } from '../lib/api';

type TicketsByEvent = Record<string, TicketDto[]>;
type Tab = 'dashboard' | 'tests';

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [events, setEvents] = useState<EventDto[]>([]);
  const [ticketsByEvent, setTicketsByEvent] = useState<TicketsByEvent>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newTicketId, setNewTicketId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [totalCapacity, setTotalCapacity] = useState(100);
  const [type, setType] = useState<EventType>('CONCERT');
  const [artist, setArtist] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [teams, setTeams] = useState('');

  const loadEventsAndTickets = useCallback(async () => {
    try {
      const eventList = await api.listEvents();
      setEvents(eventList);
      const ticketLists = await Promise.all(
        eventList.map((e) => api.listTicketsForEvent(e.id)),
      );
      const next: TicketsByEvent = {};
      eventList.forEach((e, i) => {
        next[e.id] = ticketLists[i];
      });
      setTicketsByEvent(next);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadEventsAndTickets();
      setLoading(false);
    })();
  }, [loadEventsAndTickets]);

  useEffect(() => {
    const onFocus = () => loadEventsAndTickets();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [loadEventsAndTickets]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadEventsAndTickets();
    setRefreshing(false);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    try {
      await api.createEvent({
        name,
        description,
        venue,
        eventDate: new Date(eventDate).toISOString(),
        totalCapacity: Number(totalCapacity),
        type,
        artist: type === 'CONCERT' ? artist : undefined,
        speaker: type === 'CONFERENCE' ? speaker : undefined,
        teams: type === 'SPORTS' ? teams : undefined,
      });
      setName('');
      setDescription('');
      setVenue('');
      setEventDate('');
      setTotalCapacity(100);
      setArtist('');
      setSpeaker('');
      setTeams('');
      setError(null);
      await loadEventsAndTickets();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleGenerateTicket(eventId: string) {
    try {
      const ticket = await api.generateTicket(eventId);
      setError(null);
      await loadEventsAndTickets();
      setNewTicketId(ticket.id);
      setTimeout(
        () => setNewTicketId((c) => (c === ticket.id ? null : c)),
        4000,
      );
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function ticketUrlFor(id: string) {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/tickets/${id}`;
  }

  async function handleCopy(ticket: TicketDto) {
    if (ticket.status !== 'VALID') return;
    await navigator.clipboard.writeText(ticketUrlFor(ticket.id));
    setCopiedId(ticket.id);
    setTimeout(() => setCopiedId((c) => (c === ticket.id ? null : c)), 1500);
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-10 border-b-2 border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border-2 border-border bg-primary shadow-[2px_2px_0_0_var(--border)]">
              <Ticket className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold text-foreground">Smart E-Tickets</span>
          </div>

          <div className="flex items-center gap-1">
            <NavButton
              active={tab === 'dashboard'}
              onClick={() => setTab('dashboard')}
              icon={<LayoutDashboard className="h-3.5 w-3.5" strokeWidth={2.5} />}
            >
              Dashboard
            </NavButton>
            <NavButton
              active={tab === 'tests'}
              onClick={() => setTab('tests')}
              icon={<FlaskConical className="h-3.5 w-3.5" strokeWidth={2.5} />}
            >
              Tests
            </NavButton>
            <a
              href="http://localhost:4000/api-docs"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-md border-2 border-transparent px-3 py-1.5 text-xs font-bold text-foreground transition hover:bg-muted"
            >
              <BookOpen className="h-3.5 w-3.5" strokeWidth={2.5} />
              API Docs
              <ExternalLink className="h-3 w-3" strokeWidth={2.5} />
            </a>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-6">
        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-md border-2 border-border bg-destructive p-3 text-sm text-destructive-foreground shadow-[3px_3px_0_0_var(--border)]">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" strokeWidth={2.5} />
            <div>
              <p className="font-bold">Error</p>
              <p className="text-xs">{error}</p>
            </div>
          </div>
        )}

        {tab === 'dashboard' ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
            <aside className="lg:col-span-2">
              <div className="soft-card p-5 shadow-[4px_4px_0_0_var(--border)] lg:sticky lg:top-20">
                <div className="mb-4 flex items-center gap-2">
                  <Plus className="h-4 w-4 text-primary" strokeWidth={2.5} />
                  <h2 className="text-sm font-bold text-foreground">Create Event</h2>
                </div>
                <form onSubmit={handleCreate} className="space-y-3">
                  <Field label="Name">
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="soft-input"
                      placeholder="Coldplay Live"
                    />
                  </Field>
                  <Field label="Venue">
                    <input
                      required
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      className="soft-input"
                      placeholder="Cairo Stadium"
                    />
                  </Field>
                  <Field label="Description">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="soft-input min-h-[60px] resize-none"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Date">
                      <input
                        type="datetime-local"
                        required
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="soft-input"
                      />
                    </Field>
                    <Field label="Capacity">
                      <input
                        type="number"
                        min={1}
                        required
                        value={totalCapacity}
                        onChange={(e) => setTotalCapacity(Number(e.target.value))}
                        className="soft-input"
                      />
                    </Field>
                  </div>
                  <Field label="Type">
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as EventType)}
                      className="soft-input"
                    >
                      <option value="CONCERT">Concert</option>
                      <option value="CONFERENCE">Conference</option>
                      <option value="SPORTS">Sports</option>
                    </select>
                  </Field>
                  {type === 'CONCERT' && (
                    <Field label="Artist">
                      <input
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                        className="soft-input"
                      />
                    </Field>
                  )}
                  {type === 'CONFERENCE' && (
                    <Field label="Speaker">
                      <input
                        value={speaker}
                        onChange={(e) => setSpeaker(e.target.value)}
                        className="soft-input"
                      />
                    </Field>
                  )}
                  {type === 'SPORTS' && (
                    <Field label="Teams">
                      <input
                        value={teams}
                        onChange={(e) => setTeams(e.target.value)}
                        className="soft-input"
                      />
                    </Field>
                  )}
                  <button
                    type="submit"
                    className="soft-button soft-button-primary w-full text-sm"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2.5} />
                    Create
                  </button>
                </form>
              </div>
            </aside>

            <section className="lg:col-span-3">
              <div className="soft-card p-5 shadow-[4px_4px_0_0_var(--border)]">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" strokeWidth={2.5} />
                    <h2 className="text-sm font-bold text-foreground">
                      Events & Tickets
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      ({events.length})
                    </span>
                  </div>
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-1.5 rounded-md border-2 border-border bg-card px-3 py-1 text-xs font-bold text-foreground transition hover:bg-muted"
                  >
                    <RefreshCw
                      className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`}
                      strokeWidth={2.5}
                    />
                    Refresh
                  </button>
                </div>

                {loading ? (
                  <p className="text-muted-foreground">Loading…</p>
                ) : events.length === 0 ? (
                  <div className="rounded-md border-2 border-dashed border-border p-8 text-center">
                    <p className="text-sm font-semibold text-foreground">
                      No events yet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Use the form on the left to create your first event.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => {
                      const eventTickets = [...(ticketsByEvent[event.id] ?? [])].sort(
                        (a, b) =>
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime(),
                      );
                      const validTickets = eventTickets.filter(
                        (t) => t.status === 'VALID',
                      );
                      const usedTickets = eventTickets.filter(
                        (t) => t.status === 'USED',
                      );

                      return (
                        <div
                          key={event.id}
                          className={`rounded-md border-2 border-border p-4 shadow-[3px_3px_0_0_var(--border)] ${
                            event.isExpired ? 'bg-muted opacity-70' : 'bg-card'
                          }`}
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex flex-wrap items-center gap-2">
                                <h3
                                  className={`font-bold ${
                                    event.isExpired
                                      ? 'text-muted-foreground line-through'
                                      : 'text-foreground'
                                  }`}
                                >
                                  {event.name}
                                </h3>
                                <span className="soft-badge bg-primary text-primary-foreground">
                                  {event.type}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" strokeWidth={2.5} />
                                  {event.venue}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" strokeWidth={2.5} />
                                  {new Date(event.eventDate).toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" strokeWidth={2.5} />
                                  <span
                                    className={`font-mono font-bold ${
                                      event.remainingCapacity === 0
                                        ? 'text-destructive'
                                        : 'text-foreground'
                                    }`}
                                  >
                                    {event.remainingCapacity}/{event.totalCapacity}
                                  </span>
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleGenerateTicket(event.id)}
                              disabled={
                                event.remainingCapacity === 0 || event.isExpired
                              }
                              className="soft-button soft-button-accent text-xs"
                            >
                              <Ticket className="h-3.5 w-3.5" strokeWidth={2.5} />
                              Generate
                            </button>
                          </div>

                          {eventTickets.length > 0 && (
                            <div className="mt-3 border-t-2 border-border pt-3">
                              <div className="mb-2 flex items-center gap-2 text-[10px]">
                                <span className="soft-badge bg-secondary text-secondary-foreground">
                                  {validTickets.length} valid
                                </span>
                                {usedTickets.length > 0 && (
                                  <span className="soft-badge bg-primary text-primary-foreground">
                                    {usedTickets.length} used
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1.5">
                                {eventTickets.map((ticket) => {
                                  const isValid = ticket.status === 'VALID';
                                  const isCopied = copiedId === ticket.id;
                                  const isNew = newTicketId === ticket.id;
                                  return (
                                    <div
                                      key={ticket.id}
                                      className={`flex flex-col gap-1.5 rounded-sm border-2 border-border px-2 py-1.5 transition sm:flex-row sm:items-center sm:justify-between ${
                                        isValid ? 'bg-card' : 'bg-muted opacity-60'
                                      } ${
                                        isNew
                                          ? 'shadow-[4px_4px_0_0_var(--accent)] ring-2 ring-accent'
                                          : ''
                                      }`}
                                    >
                                      <div className="flex flex-wrap items-center gap-2">
                                        {isValid ? (
                                          <CheckCircle2
                                            className="h-3 w-3 text-secondary"
                                            strokeWidth={3}
                                          />
                                        ) : (
                                          <BadgeCheck
                                            className="h-3 w-3 text-primary"
                                            strokeWidth={3}
                                          />
                                        )}
                                        <span
                                          className={`font-mono text-xs font-bold tracking-wider ${
                                            isValid
                                              ? 'text-foreground'
                                              : 'text-muted-foreground line-through'
                                          }`}
                                        >
                                          {ticket.code}
                                        </span>
                                        {isNew && (
                                          <span className="soft-badge bg-accent text-accent-foreground">
                                            New
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex gap-1.5">
                                        {isValid ? (
                                          <>
                                            <button
                                              onClick={() => handleCopy(ticket)}
                                              className="flex items-center gap-1 rounded border-2 border-border bg-card px-2 py-0.5 text-[10px] font-bold text-foreground hover:bg-muted"
                                            >
                                              {isCopied ? (
                                                <>
                                                  <CheckCircle2
                                                    className="h-3 w-3"
                                                    strokeWidth={3}
                                                  />
                                                  Copied
                                                </>
                                              ) : (
                                                <>
                                                  <Copy
                                                    className="h-3 w-3"
                                                    strokeWidth={2.5}
                                                  />
                                                  Copy
                                                </>
                                              )}
                                            </button>
                                            <a
                                              href={ticketUrlFor(ticket.id)}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="flex items-center gap-1 rounded border-2 border-border bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground hover:brightness-95"
                                            >
                                              <ExternalLink
                                                className="h-3 w-3"
                                                strokeWidth={2.5}
                                              />
                                              Open
                                            </a>
                                          </>
                                        ) : (
                                          <span className="text-[10px] font-semibold text-muted-foreground">
                                            Used
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : (
          <TestResults />
        )}
      </main>
    </div>
  );
}

function NavButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-md border-2 px-3 py-1.5 text-xs font-bold transition ${
        active
          ? 'border-border bg-primary text-primary-foreground shadow-[2px_2px_0_0_var(--border)]'
          : 'border-transparent text-foreground hover:bg-muted'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
