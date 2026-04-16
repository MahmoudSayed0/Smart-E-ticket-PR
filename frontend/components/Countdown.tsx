'use client';

import { Clock, XCircle } from 'lucide-react';
import { useCountdown } from '../app/lib/useCountdown';

interface CountdownProps {
  targetIso: string;
  variant?: 'badge' | 'large';
}

export default function Countdown({ targetIso, variant = 'badge' }: CountdownProps) {
  const countdown = useCountdown(targetIso);

  if (variant === 'large') {
    if (countdown.expired) {
      return (
        <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-border bg-destructive p-3 text-sm font-bold uppercase tracking-widest text-destructive-foreground">
          <XCircle className="h-4 w-4" strokeWidth={3} />
          Event ended
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border-2 border-border bg-muted p-3">
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Clock className="h-3.5 w-3.5" strokeWidth={2.5} />
          Ends in
        </span>
        <div className="flex items-center gap-2 font-mono text-sm font-bold tabular-nums text-foreground">
          {countdown.days > 0 && (
            <span>
              {countdown.days}
              <span className="text-muted-foreground">d</span>
            </span>
          )}
          <span>
            {String(countdown.hours).padStart(2, '0')}
            <span className="text-muted-foreground">h</span>
          </span>
          <span>
            {String(countdown.minutes).padStart(2, '0')}
            <span className="text-muted-foreground">m</span>
          </span>
          <span>
            {String(countdown.seconds).padStart(2, '0')}
            <span className="text-muted-foreground">s</span>
          </span>
        </div>
      </div>
    );
  }

  if (countdown.expired) {
    return (
      <span className="soft-badge bg-destructive text-destructive-foreground">
        <XCircle className="h-3 w-3" strokeWidth={3} />
        Ended
      </span>
    );
  }

  return (
    <span className="soft-badge bg-muted text-muted-foreground">
      <Clock className="h-3 w-3" strokeWidth={3} />
      {countdown.label}
    </span>
  );
}
