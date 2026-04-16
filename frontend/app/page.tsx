import Link from 'next/link';
import { Ticket, BookOpen, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl text-center">
        <div className="mb-6 inline-flex items-center justify-center rounded-full border-2 border-border bg-card p-5 shadow-[6px_6px_0_0_var(--border)]">
          <Ticket className="h-12 w-12 text-primary" strokeWidth={2.5} />
        </div>

        <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground md:text-6xl">
          Smart E-Ticketing
        </h1>
        <p className="mb-10 text-lg text-muted-foreground">
          Software Engineering MVP · Repository · Factory · Strategy patterns
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/admin" className="soft-button soft-button-primary text-base">
            Go to Admin Dashboard
            <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
          </Link>
          <a
            href="http://localhost:4000/api-docs"
            target="_blank"
            rel="noreferrer"
            className="soft-button soft-button-outline text-base"
          >
            <BookOpen className="h-5 w-5" strokeWidth={2.5} />
            View API Docs
          </a>
        </div>
      </div>
    </main>
  );
}
