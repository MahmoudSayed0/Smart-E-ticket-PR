'use client';

import Link from 'next/link';
import {
  LayoutDashboard,
  Ticket,
  Calendar,
  BarChart3,
  BookOpen,
  Settings,
  User,
  Plus,
} from 'lucide-react';
import { API_BASE } from '../app/lib/api';

const mainNav = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin', active: true },
  { icon: Calendar, label: 'Events', href: '#events' },
  { icon: Ticket, label: 'Tickets', href: '#tickets' },
  { icon: BarChart3, label: 'Analytics', href: '#analytics' },
];

const toolsNav = [
  {
    icon: BookOpen,
    label: 'API Docs',
    href: `${API_BASE}/api-docs`,
    external: true,
  },
  { icon: Settings, label: 'Settings', href: '#settings' },
];

export default function AppSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r-2 border-border bg-card p-4 lg:flex">
      <div className="mb-6 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-border bg-primary shadow-[3px_3px_0_0_var(--border)]">
          <Ticket className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-foreground">E-Tickets</p>
          <p className="truncate text-xs text-muted-foreground">Admin Panel</p>
        </div>
      </div>

      <div className="mb-4">
        <a
          href="#create-event"
          className="soft-button soft-button-primary w-full text-sm"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          New Event
        </a>
      </div>

      <nav className="flex-1 space-y-1">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Main
        </p>
        {mainNav.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition ${
                item.active
                  ? 'border-2 border-border bg-primary text-primary-foreground shadow-[3px_3px_0_0_var(--border)]'
                  : 'border-2 border-transparent text-foreground hover:bg-muted'
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={2.5} />
              {item.label}
            </Link>
          );
        })}

        <p className="mb-2 mt-6 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Tools
        </p>
        {toolsNav.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.label}
              href={item.href}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noreferrer' : undefined}
              className="flex items-center gap-3 rounded-md border-2 border-transparent px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              <Icon className="h-4 w-4" strokeWidth={2.5} />
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="mt-4 flex items-center gap-3 rounded-lg border-2 border-border bg-muted p-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-border bg-accent">
          <User className="h-4 w-4 text-accent-foreground" strokeWidth={2.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-foreground">Admin User</p>
          <p className="truncate text-xs text-muted-foreground">admin@e-tickets.io</p>
        </div>
      </div>
    </aside>
  );
}
