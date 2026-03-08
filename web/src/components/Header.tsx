import Link from 'next/link';

export default function Header() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 md:px-6">
      <Link
        href="/"
        className="font-mono text-sm uppercase tracking-[0.3em] text-[var(--accent)] hover:opacity-80 transition"
      >
        Esqueje
      </Link>
      <nav className="flex items-center gap-1">
        <Link
          href="/caracteristicas"
          className="rounded-full px-4 py-2 text-sm text-[var(--muted)] transition hover:bg-white/5 hover:text-white"
        >
          Características
        </Link>
        <Link
          href="/instalar"
          className="rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-white"
        >
          Instalar
        </Link>
      </nav>
    </header>
  );
}
