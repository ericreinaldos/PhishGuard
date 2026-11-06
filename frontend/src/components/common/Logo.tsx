import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

export function LogoMark({ className }: { className?: string }) {
  return (
    <img src="/favicon.png" alt="" width={28} height={28} className={cn('h-7 w-7', className)} />
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
