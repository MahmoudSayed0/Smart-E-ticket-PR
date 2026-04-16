'use client';

import { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Play,
  Loader2,
  AlertTriangle,
  Square,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { getTestMetadata } from '../app/lib/test-metadata';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000';

interface LiveTest {
  suiteName: string;
  name: string;
  title: string;
  status: string;
  duration: number;
  failureMessages: string[];
  timestamp: number;
}

interface LiveSuite {
  suiteName: string;
  status: string;
  numPassing: number;
  numFailing: number;
  duration: number;
}

interface RunSummary {
  success: boolean;
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  numTotalTestSuites: number;
  numPassedTestSuites: number;
  numFailedTestSuites: number;
}

type StreamEvent =
  | { type: 'runStart'; numTotalTestSuites: number; timestamp: number }
  | { type: 'suiteStart'; suiteName: string; timestamp: number }
  | ({ type: 'testCase' } & LiveTest)
  | ({ type: 'suiteResult' } & LiveSuite & { timestamp: number })
  | ({ type: 'runComplete' } & RunSummary & { timestamp: number })
  | { type: 'done'; exitCode: number; stderr?: string }
  | { type: 'error'; message: string };

export default function TestResults() {
  const [tests, setTests] = useState<LiveTest[]>([]);
  const [summary, setSummary] = useState<RunSummary | null>(null);
  const [currentSuite, setCurrentSuite] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const controllerRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  // Elapsed timer
  useEffect(() => {
    if (!running || !startTime) return;
    const id = setInterval(() => setElapsed(Date.now() - startTime), 100);
    return () => clearInterval(id);
  }, [running, startTime]);

  // Auto-scroll only INSIDE the test list container (not the whole page)
  useEffect(() => {
    if (!running || tests.length === 0) return;
    const container = listRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [tests.length, running]);

  function toggleCard(index: number) {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  }

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  async function handleRunTests() {
    // Reset state
    setTests([]);
    setSummary(null);
    setError(null);
    setCurrentSuite(null);
    setRunning(true);
    setStartTime(Date.now());
    setElapsed(0);
    setExpanded({});

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const response = await fetch(`${API_BASE}/tests/stream`, {
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const messages = buffer.split('\n\n');
        buffer = messages.pop() ?? '';

        for (const msg of messages) {
          const dataLine = msg.split('\n').find((l) => l.startsWith('data: '));
          if (!dataLine) continue;
          const json = dataLine.slice(6);
          try {
            const event = JSON.parse(json) as StreamEvent;
            handleStreamEvent(event);
          } catch {
            // ignore parse errors
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError((err as Error).message);
      }
    } finally {
      setRunning(false);
      setCurrentSuite(null);
    }
  }

  function handleStreamEvent(event: StreamEvent) {
    switch (event.type) {
      case 'runStart':
        break;
      case 'suiteStart':
        setCurrentSuite(event.suiteName);
        break;
      case 'testCase':
        setTests((prev) => [
          ...prev,
          {
            suiteName: event.suiteName,
            name: event.name,
            title: event.title,
            status: event.status,
            duration: event.duration,
            failureMessages: event.failureMessages,
            timestamp: event.timestamp,
          },
        ]);
        break;
      case 'suiteResult':
        break;
      case 'runComplete':
        setSummary({
          success: event.success,
          numTotalTests: event.numTotalTests,
          numPassedTests: event.numPassedTests,
          numFailedTests: event.numFailedTests,
          numTotalTestSuites: event.numTotalTestSuites,
          numPassedTestSuites: event.numPassedTestSuites,
          numFailedTestSuites: event.numFailedTestSuites,
        });
        break;
      case 'error':
        setError(event.message);
        break;
      case 'done':
        break;
    }
  }

  function handleStop() {
    controllerRef.current?.abort();
    setRunning(false);
  }

  const passedCount = tests.filter((t) => t.status === 'passed').length;
  const failedCount = tests.filter((t) => t.status !== 'passed').length;
  const passRate = tests.length === 0 ? 0 : Math.round((passedCount / tests.length) * 100);
  const elapsedSeconds = (elapsed / 1000).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="soft-card p-5 shadow-[4px_4px_0_0_var(--border)]">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Live Test Runner</h2>
            <p className="text-xs text-muted-foreground">
              Tests appear one by one as Jest executes them on the backend (SSE stream)
            </p>
          </div>
          <div className="flex items-center gap-2">
            {running && (
              <button
                onClick={handleStop}
                className="soft-button soft-button-outline text-sm"
              >
                <Square className="h-3.5 w-3.5" strokeWidth={2.5} />
                Stop
              </button>
            )}
            <button
              onClick={handleRunTests}
              disabled={running}
              className="soft-button soft-button-primary text-sm"
            >
              {running ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                  Running…
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" strokeWidth={2.5} />
                  Run Tests
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-md border-2 border-border bg-destructive p-3 text-sm text-destructive-foreground">
            <AlertTriangle className="mt-0.5 h-4 w-4" strokeWidth={2.5} />
            <div>
              <p className="font-bold">Error</p>
              <p className="text-xs">{error}</p>
            </div>
          </div>
        )}

        {(running || tests.length > 0) && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile
                label="Tests"
                value={`${tests.length}${summary ? ` / ${summary.numTotalTests}` : ''}`}
              />
              <StatTile
                label="Passed"
                value={String(passedCount)}
                success
              />
              <StatTile
                label="Failed"
                value={String(failedCount)}
                success={failedCount === 0}
              />
              <StatTile label="Elapsed" value={`${elapsedSeconds}s`} />
            </div>

            {running && (
              <div className="flex items-center gap-2 rounded-md border-2 border-border bg-muted px-3 py-2 text-xs">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" strokeWidth={2.5} />
                <span className="font-mono text-muted-foreground">
                  {currentSuite
                    ? `Running ${currentSuite}…`
                    : 'Starting Jest runner…'}
                </span>
              </div>
            )}

            {summary && !running && (
              (() => {
                const allPassed =
                  summary.numFailedTests === 0 &&
                  summary.numTotalTests > 0 &&
                  failedCount === 0;
                return (
                  <div
                    className={`flex items-center gap-2 rounded-md border-2 border-border px-4 py-3 text-sm font-bold ${
                      allPassed
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-destructive text-destructive-foreground'
                    }`}
                  >
                    {allPassed ? (
                      <>
                        <CheckCircle2 className="h-5 w-5" strokeWidth={2.5} />
                        All {summary.numTotalTests} tests passed in {elapsedSeconds}s
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5" strokeWidth={2.5} />
                        {summary.numFailedTests} / {summary.numTotalTests} tests failed
                      </>
                    )}
                  </div>
                );
              })()
            )}

            {tests.length > 0 && (
              <div className="h-1.5 w-full overflow-hidden rounded-full border-2 border-border bg-card">
                <div
                  className="h-full bg-secondary transition-[width]"
                  style={{
                    width: summary
                      ? '100%'
                      : `${Math.min(100, (tests.length / 46) * 100)}%`,
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {tests.length > 0 && (
        <div className="soft-card shadow-[4px_4px_0_0_var(--border)]">
          <div className="flex items-center justify-between border-b-2 border-border px-4 py-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Test Results
            </h3>
            <span className="font-mono text-[10px] text-muted-foreground">
              {tests.length} test{tests.length === 1 ? '' : 's'}
            </span>
          </div>
          <div
            ref={listRef}
            className="max-h-[600px] space-y-2 overflow-y-auto p-3"
          >
            {tests.map((test, index) => (
              <TestCard
                key={`${test.suiteName}-${test.name}-${index}`}
                test={test}
                index={index + 1}
                isNewest={index === tests.length - 1 && running}
                isExpanded={expanded[index] ?? false}
                onToggle={() => toggleCard(index)}
              />
            ))}
          </div>
        </div>
      )}

      {!running && tests.length === 0 && !error && (
        <div className="soft-card p-10 text-center shadow-[4px_4px_0_0_var(--border)]">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-border bg-muted">
            <Play className="h-5 w-5 text-muted-foreground" strokeWidth={2.5} />
          </div>
          <p className="font-semibold text-foreground">Click Run Tests to begin</p>
          <p className="text-sm text-muted-foreground">
            Jest runs each test one at a time, streaming results live via SSE
          </p>
        </div>
      )}
    </div>
  );
}

function TestCard({
  test,
  index,
  isNewest,
  isExpanded,
  onToggle,
}: {
  test: LiveTest;
  index: number;
  isNewest: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const meta = getTestMetadata(test.suiteName, test.title);
  const passed = test.status === 'passed';

  return (
    <div
      className={`rounded-md border-2 border-border bg-card shadow-[2px_2px_0_0_var(--border)] transition duration-300 animate-in fade-in-0 slide-in-from-bottom-1 ${
        isNewest ? 'ring-2 ring-accent' : ''
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          {isExpanded ? (
            <ChevronDown
              className="h-4 w-4 flex-shrink-0 text-muted-foreground"
              strokeWidth={2.5}
            />
          ) : (
            <ChevronRight
              className="h-4 w-4 flex-shrink-0 text-muted-foreground"
              strokeWidth={2.5}
            />
          )}
          {passed ? (
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 border-border bg-secondary">
              <CheckCircle2
                className="h-3.5 w-3.5 text-secondary-foreground"
                strokeWidth={3}
              />
            </div>
          ) : (
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 border-border bg-destructive">
              <XCircle
                className="h-3.5 w-3.5 text-destructive-foreground"
                strokeWidth={3}
              />
            </div>
          )}
          <span className="truncate text-base font-bold text-foreground">
            {test.title}
          </span>
        </div>
        <div className="flex flex-shrink-0 items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground">
            {test.duration}ms
          </span>
          <span className="soft-badge bg-muted text-muted-foreground text-[10px]">
            #{index}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="space-y-3 border-t-2 border-dashed border-border px-4 py-4">
          <p className="font-mono text-xs text-muted-foreground">
            {test.suiteName}
          </p>
          <Section title="Description" color="text-foreground">
            {meta.description}
          </Section>
          <Section title="Expected" color="text-primary">
            {meta.expected}
          </Section>
          <Section title="Why it passes" color="text-secondary">
            {meta.why}
          </Section>
          {test.failureMessages.length > 0 && (
            <Section title="Failure" color="text-destructive">
              <pre className="whitespace-pre-wrap font-mono text-xs">
                {test.failureMessages.join('\n').slice(0, 800)}
              </pre>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className={`text-xs font-bold uppercase tracking-widest ${color}`}>
        {title}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-foreground">{children}</p>
    </div>
  );
}

function StatTile({
  label,
  value,
  success,
}: {
  label: string;
  value: string;
  success?: boolean;
}) {
  return (
    <div className="rounded-md border-2 border-border bg-card px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1 font-mono text-lg font-bold ${
          success === false ? 'text-destructive' : 'text-foreground'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
