import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('h-7 w-7', className)} aria-hidden>
      <rect width="32" height="32" rx="7" fill="rgb(var(--accent-strong))" />
      <path d="M16 6.5l7.5 2.9v5.7c0 4.7-3.2 8.3-7.5 9.8-4.3-1.5-7.5-5.1-7.5-9.8V9.4L16 6.5z" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="16" cy="15" r="2.4" fill="#fff" />
    </svg>
  );
}

interface LogoProps {
  to?: string;
  className?: string;
  compact?: boolean;
}

export function Logo({ to = '/', className, compact }: LogoProps) {
  return (
    <Link to={to} className={cn('inline-flex items-center gap-2.5', className)} aria-label="PhishGuard, ir al inicio">
      <LogoMark />
      {!compact && <span className="font-wide text-[15px] font-semibold uppercase tracking-[0.04em] text-fg">PhishGuard</span>}
    </Link>
  );
}
