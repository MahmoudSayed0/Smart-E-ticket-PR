'use client';

import * as React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  CheckCircle2,
  BadgeCheck,
  Clock,
  Calendar,
  MapPin,
  Ticket as TicketIcon,
  Loader2,
} from 'lucide-react';
import { cn } from '../app/lib/utils';

const EVENT_BANNER_BY_TYPE: Record<string, string> = {
  CONCERT: '/ticket-images/concert.png',
  CONFERENCE: '/ticket-images/conference.png',
  SPORTS: '/ticket-images/sports.png',
};

const HOLD_DURATION_MS = 1500;

// Vertical ticket SVG path (475 wide × 1112 tall). Has two concave bites at
// the top corners, rounded bottom corners, and a horizontal perforation line
// with dashed ticks at y≈770 that divides the card into:
//   - Top STUB (y ≈ 68 → 770)  →  Banner image + event title + QR code
//   - Bottom BODY (y ≈ 770 → 1043)  →  Details grid + countdown + redeem button
const TICKET_SVG_PATH =
  'M-4.55949e-05 67.9299L0.60994 68.01L-4.55914e-05 68.01L-1.50804e-05 766.02L18.33 766.02C19.5257 765.997 20.6873 766.419 21.5892 767.204C22.4911 767.99 23.0688 769.082 23.21 770.27C23.267 770.913 23.1892 771.562 22.9818 772.173C22.7744 772.785 22.4418 773.347 22.0053 773.823C21.5688 774.299 21.0379 774.679 20.4464 774.938C19.8549 775.198 19.2159 775.331 18.57 775.33L-1.46735e-05 775.33C-1.46735e-05 775.33 -1.46735e-05 775.33 -1.46713e-05 775.38L-2.97237e-06 1043.02C120.69 1043.02 144.55 1111.02 144.55 1111.02L330.33 1111.02C330.33 1111.02 354.18 1043.02 474.87 1043.02L474.87 775.44L474.87 775.39L455.22 775.39C454.023 775.334 452.893 774.82 452.065 773.953C451.238 773.086 450.776 771.934 450.776 770.735C450.776 769.536 451.238 768.384 452.065 767.517C452.893 766.65 454.023 766.136 455.22 766.08L474.87 766.08L474.87 68.0801L474.26 68.0801L474.87 68C354.18 68 330.33 -1.44392e-05 330.33 -1.44392e-05L144.53 -6.31761e-06C144.53 -6.31761e-06 120.67 67.9299 -4.55949e-05 67.9299ZM433.9 766.08C434.546 766.08 435.186 766.215 435.777 766.476C436.369 766.736 436.899 767.117 437.336 767.594C437.772 768.071 438.105 768.633 438.312 769.245C438.519 769.858 438.597 770.506 438.54 771.15C438.394 772.335 437.815 773.424 436.914 774.207C436.013 774.99 434.854 775.411 433.66 775.39L372.13 775.39C370.933 775.334 369.803 774.82 368.975 773.953C368.148 773.086 367.686 771.934 367.686 770.735C367.686 769.536 368.148 768.384 368.975 767.517C369.803 766.65 370.933 766.136 372.13 766.08L433.9 766.08ZM350.84 766.08C351.486 766.08 352.126 766.215 352.717 766.476C353.309 766.736 353.839 767.117 354.276 767.594C354.712 768.071 355.044 768.633 355.252 769.245C355.459 769.858 355.537 770.506 355.48 771.15C355.339 772.337 354.761 773.428 353.859 774.212C352.956 774.996 351.795 775.416 350.6 775.39L289.07 775.39C287.873 775.334 286.743 774.82 285.915 773.953C285.088 773.086 284.626 771.934 284.626 770.735C284.626 769.536 285.088 768.384 285.915 767.517C286.743 766.65 287.873 766.136 289.07 766.08L350.84 766.08ZM267.54 766.08C268.736 766.057 269.897 766.479 270.799 767.264C271.701 768.05 272.279 769.142 272.42 770.33C272.477 770.973 272.399 771.622 272.192 772.233C271.984 772.845 271.652 773.407 271.215 773.883C270.779 774.359 270.248 774.739 269.656 774.998C269.065 775.258 268.426 775.391 267.78 775.39L206 775.39C204.803 775.334 203.673 774.82 202.845 773.953C202.018 773.086 201.556 771.934 201.556 770.735C201.556 769.536 202.018 768.384 202.845 767.517C203.673 766.65 204.803 766.136 206 766.08L267.54 766.08ZM184.54 766.08C185.734 766.059 186.893 766.482 187.793 767.268C188.693 768.053 189.269 769.144 189.41 770.33C189.468 770.973 189.392 771.621 189.186 772.233C188.98 772.844 188.648 773.406 188.212 773.882C187.777 774.359 187.246 774.739 186.655 774.998C186.064 775.258 185.426 775.391 184.78 775.39L122.94 775.39C122.311 775.419 121.682 775.32 121.091 775.1C120.501 774.879 119.962 774.541 119.506 774.106C119.051 773.67 118.688 773.147 118.44 772.568C118.192 771.989 118.064 771.365 118.064 770.735C118.064 770.105 118.192 769.481 118.44 768.902C118.688 768.323 119.051 767.8 119.506 767.364C119.962 766.929 120.501 766.591 121.091 766.37C121.682 766.15 122.311 766.051 122.94 766.08L184.54 766.08ZM101.48 766.08C102.676 766.057 103.837 766.479 104.739 767.264C105.641 768.05 106.219 769.142 106.36 770.33C106.417 770.973 106.339 771.622 106.132 772.233C105.924 772.845 105.592 773.407 105.155 773.883C104.719 774.359 104.188 774.739 103.596 774.998C103.005 775.258 102.366 775.391 101.72 775.39L39.88 775.39C39.2505 775.419 38.6217 775.32 38.0315 775.1C37.4413 774.879 36.902 774.541 36.4463 774.106C35.9905 773.67 35.6277 773.147 35.3798 772.568C35.1319 771.989 35.0042 771.365 35.0042 770.735C35.0042 770.105 35.1319 769.481 35.3798 768.902C35.6277 768.323 35.9905 767.8 36.4463 767.365C36.902 766.929 37.4413 766.591 38.0315 766.37C38.6217 766.15 39.2505 766.051 39.88 766.08L101.48 766.08Z';

type TicketVisualStatus = 'VALID' | 'USED' | 'EXPIRED';

export interface AnimatedTicketProps extends React.HTMLAttributes<HTMLDivElement> {
  ticketCode: string;
  ticketShortId: string;
  eventName: string;
  eventVenue: string;
  eventType: string;
  eventDate: Date;
  status: TicketVisualStatus;
  redeemedAt?: Date | null;
  onRedeem?: () => void;
  redeeming?: boolean;
}

function QrPanel({ value }: { value: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="rounded-md border-2 border-border bg-white p-2">
        <QRCodeSVG value={value} size={110} level="H" />
      </div>
      <p className="mt-2 font-mono text-xs font-bold tracking-[0.25em] text-foreground">
        {value}
      </p>
    </div>
  );
}

interface HoldButtonProps {
  onComplete: () => void;
  disabled?: boolean;
  redeeming?: boolean;
}

function HoldToRedeemButton({ onComplete, disabled, redeeming }: HoldButtonProps) {
  const [progress, setProgress] = React.useState(0);
  const [holding, setHolding] = React.useState(false);
  const rafRef = React.useRef<number | null>(null);
  const startRef = React.useRef<number | null>(null);
  const completedRef = React.useRef(false);

  const cancel = React.useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    startRef.current = null;
    setHolding(false);
    if (!completedRef.current) setProgress(0);
  }, []);

  React.useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const start = React.useCallback(() => {
    if (disabled || redeeming) return;
    completedRef.current = false;
    startRef.current = performance.now();
    setHolding(true);
    const tick = (now: number) => {
      if (startRef.current === null) return;
      const elapsed = now - startRef.current;
      const pct = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
      setProgress(pct);
      if (pct >= 100) {
        completedRef.current = true;
        startRef.current = null;
        setHolding(false);
        onComplete();
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [disabled, redeeming, onComplete]);

  const label = redeeming
    ? 'Redeeming…'
    : holding
      ? `${Math.round(progress)}%`
      : 'Hold Redeem';

  return (
    <button
      type="button"
      disabled={disabled || redeeming}
      onMouseDown={start}
      onMouseUp={cancel}
      onMouseLeave={cancel}
      onTouchStart={(e) => {
        e.preventDefault();
        start();
      }}
      onTouchEnd={cancel}
      onTouchCancel={cancel}
      className={cn(
        'relative w-full select-none overflow-hidden rounded-full border-2 border-border bg-card text-[9px] font-bold uppercase tracking-wider transition',
        'hover:shadow-[2px_2px_0_0_var(--border)]',
        'active:translate-x-[1px] active:translate-y-[1px] active:shadow-none',
        (disabled || redeeming) && 'cursor-not-allowed opacity-60',
      )}
      style={{ height: 22 }}
    >
      <span
        className="absolute inset-y-0 left-0 bg-primary transition-[width]"
        style={{ width: `${progress}%` }}
        aria-hidden="true"
      />
      <span
        className={cn(
          'relative z-10 flex items-center justify-center gap-1',
          progress > 50 ? 'text-primary-foreground' : 'text-foreground',
        )}
      >
        {redeeming ? (
          <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2.5} />
        ) : (
          <CheckCircle2 className="h-3 w-3" strokeWidth={2.5} />
        )}
        {label}
      </span>
    </button>
  );
}

export const AnimatedTicket = React.forwardRef<HTMLDivElement, AnimatedTicketProps>(
  (
    {
      className,
      ticketCode,
      ticketShortId,
      eventName,
      eventVenue,
      eventType,
      eventDate,
      status,
      redeemedAt,
      onRedeem,
      redeeming,
      ...props
    },
    ref,
  ) => {
    const isValid = status === 'VALID';
    const isUsed = status === 'USED';
    const isExpired = status === 'EXPIRED';
    const dimmed = isUsed || isExpired;
    const bannerSrc = EVENT_BANNER_BY_TYPE[eventType];
    const [bannerReady, setBannerReady] = React.useState(false);
    const [bannerBroken, setBannerBroken] = React.useState(false);
    const clipId = React.useId();
    const topFadeId = `${clipId}-top-fade`;
    const bottomFadeId = `${clipId}-bottom-fade`;
    const ticketClipId = `${clipId}-clip`;

    const day = eventDate.getDate();
    const month = eventDate
      .toLocaleString('en-GB', { month: 'short' })
      .toUpperCase();
    const time = eventDate.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    let statusPillClass = 'bg-secondary text-secondary-foreground';
    let StatusIcon = CheckCircle2;
    let statusLabel = 'VALID';

    if (isUsed) {
      statusPillClass = 'bg-primary text-primary-foreground';
      StatusIcon = BadgeCheck;
      statusLabel = 'USED';
    } else if (isExpired) {
      statusPillClass = 'bg-destructive text-destructive-foreground';
      StatusIcon = Clock;
      statusLabel = 'EXPIRED';
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative z-10 w-full font-sans text-card-foreground',
          'animate-in fade-in-0 zoom-in-95 duration-500',
          dimmed && 'opacity-75',
          className,
        )}
        style={{ aspectRatio: '475 / 1112' }}
        {...props}
      >
        {bannerSrc && (
          <img
            src={bannerSrc}
            alt=""
            className="hidden"
            onLoad={() => setBannerReady(true)}
            onError={() => setBannerBroken(true)}
            aria-hidden="true"
          />
        )}

        <svg
          viewBox="0 0 475 1112"
          className="absolute inset-0 h-full w-full drop-shadow-[8px_8px_0_var(--border)]"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            <clipPath id={ticketClipId}>
              <path d={TICKET_SVG_PATH} />
            </clipPath>
            <linearGradient id={bottomFadeId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="55%" stopColor="white" stopOpacity="0.9" />
              <stop offset="100%" stopColor="white" stopOpacity="1" />
            </linearGradient>
          </defs>

          <path d={TICKET_SVG_PATH} fill="white" />

          {bannerSrc && bannerReady && !bannerBroken && (
            <g clipPath={`url(#${ticketClipId})`}>
              <image
                href={bannerSrc}
                x="0"
                y="0"
                width="475"
                height="770"
                preserveAspectRatio="xMidYMid slice"
              />
              <rect x="0" y="380" width="475" height="390" fill={`url(#${bottomFadeId})`} />
            </g>
          )}

          <path
            d={TICKET_SVG_PATH}
            fill="none"
            stroke="var(--border)"
            strokeWidth="4"
            strokeLinejoin="round"
          />
        </svg>

        <div className="relative z-10 flex h-full w-full flex-col">
          <div className="flex h-[69.2%] flex-col justify-end px-6 pt-6 pb-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  E-Ticket
                </p>
                <h1 className="truncate text-xl font-bold leading-tight text-foreground">
                  {eventName}
                </h1>
                <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                  <MapPin className="h-3 w-3 flex-shrink-0" strokeWidth={2.5} />
                  {eventVenue}
                </p>
              </div>
              <span
                className={cn(
                  'soft-badge flex-shrink-0 text-[10px]',
                  statusPillClass,
                )}
              >
                <StatusIcon className="h-3 w-3" strokeWidth={3} />
                {statusLabel}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-1 text-center">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
                  Gate
                </p>
                <p className="font-mono text-xs font-bold text-foreground">A</p>
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
                  Time
                </p>
                <p className="font-mono text-xs font-bold text-foreground">{time}</p>
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
                  Date
                </p>
                <p className="font-mono text-xs font-bold text-foreground">
                  {day}
                  <span className="text-muted-foreground">/</span>
                  {month}
                </p>
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
                  ID
                </p>
                <p className="truncate font-mono text-[10px] font-bold text-foreground">
                  {ticketShortId.slice(0, 4)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center px-6 pt-4 pb-0">
            <div className="flex flex-col items-center">
              <div className="rounded-md border-2 border-border bg-white p-2">
                <QRCodeSVG value={ticketCode} size={115} level="H" />
              </div>
              <p className="mt-1.5 font-mono text-[11px] font-bold tracking-[0.25em] text-foreground">
                {ticketCode}
              </p>
            </div>

            <div className="mt-auto w-full max-w-[120px] pb-2">
              {isValid && onRedeem ? (
                <HoldToRedeemButton onComplete={onRedeem} redeeming={redeeming} />
              ) : isExpired ? (
                <div className="flex items-center justify-center gap-1 rounded-full border-2 border-border bg-destructive py-1 text-[9px] font-bold uppercase tracking-wider text-destructive-foreground">
                  <Clock className="h-2.5 w-2.5" strokeWidth={2.5} />
                  Ended
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1 rounded-full border-2 border-border bg-muted py-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                  <BadgeCheck className="h-2.5 w-2.5" strokeWidth={2.5} />
                  Used
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

AnimatedTicket.displayName = 'AnimatedTicket';
