'use client';

import { Search, ChevronRight } from 'lucide-react';
import { ReactNode } from 'react';

interface SiteHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: string[];
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  actions?: ReactNode;
}

export default function SiteHeader({
  title,
  subtitle,
  breadcrumb = ['Dashboard', 'Overview'],
  searchPlaceholder = 'Search events…',
  onSearchChange,
  actions,
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b-2 border-border bg-background/95 backdrop-blur">
      <div className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <nav className="mb-1 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            {breadcrumb.map((item, index) => (
              <span key={item} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="h-3 w-3" strokeWidth={3} />}
                <span
                  className={
                    index === breadcrumb.length - 1 ? 'text-foreground' : undefined
                  }
                >
                  {item}
                </span>
              </span>
            ))}
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onSearchChange && (
            <div className="relative hidden md:block">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={2.5}
              />
              <input
                type="text"
                placeholder={searchPlaceholder}
                onChange={(e) => onSearchChange(e.target.value)}
                className="soft-input w-64 pl-9"
              />
            </div>
          )}
          {actions}
        </div>
      </div>
    </header>
  );
}
