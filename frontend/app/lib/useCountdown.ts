'use client';

import { useEffect, useState } from 'react';

export interface CountdownState {
  expired: boolean;
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  label: string;
}

function buildLabel(totalMs: number): string {
  if (totalMs <= 0) return 'Ended';

  const totalSeconds = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  if (minutes > 0) return `${minutes}m ${seconds}s left`;
  return `${seconds}s left`;
}

export function useCountdown(targetIso: string | Date): CountdownState {
  const targetMs =
    typeof targetIso === 'string' ? new Date(targetIso).getTime() : targetIso.getTime();

  const compute = (): CountdownState => {
    const diff = targetMs - Date.now();
    const totalSeconds = Math.max(0, Math.floor(diff / 1000));
    return {
      expired: diff <= 0,
      totalMs: Math.max(0, diff),
      days: Math.floor(totalSeconds / 86_400),
      hours: Math.floor((totalSeconds % 86_400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
      label: buildLabel(diff),
    };
  };

  const [state, setState] = useState<CountdownState>(compute);

  useEffect(() => {
    setState(compute());
    const interval = setInterval(() => setState(compute()), 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetMs]);

  return state;
}
