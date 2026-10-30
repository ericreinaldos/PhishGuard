import type { ReactNode } from 'react';
import { ArrowRight, Check, CircleCheck, Minus } from 'lucide-react';
import { Panel } from '@/components/common/Panel';
import { cn } from '@/utils/cn';

/*
 * Ilustraciones de cada paso de «¿Cómo funcionamos?».
 * Son maquetas estáticas del producto: no ejecutan ningún análisis.
 */

const MESSAGE = [
  { text: 'Hemos detectado un acceso inusual y su cuenta ha sido ' },
  { text: 'SUSPENDIDA', flag: true },
  { text: '. Verifique sus datos ' },
  { text: 'en las próximas 24 horas', flag: true },
  { text: ' en ' },
  { text: 'banco-seguro-verificacion.co', flag: true, mono: true },
  { text: '. Atentamente, ' },
  { text: 'Departamento de Seguridad', flag: true },
];

function MessageText({ marked }: { marked: boolean }) {
  return (
    <p className="text-[14px] leading-[1.9] text-muted sm:text-[15px]">
      {MESSAGE.map((part, i) =>
        part.flag ? (
          <span
            key={i}
            className={cn(
              'transition-[background-color,color,box-shadow] duration-500',
              part.mono && 'font-mono text-[12px] sm:text-[13px]',
              marked ? 'text-fg shadow-[inset_0_-2px_0_rgb(var(--accent-strong))]' : '',
            )}
          >
            {part.text}
          </span>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </p>
  );
}

function FrameInput() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex gap-6 border-b border-line text-sm">
        {['Mensaje', 'URL', 'Cabeceras'].map((m, i) => (
          <span key={m} className={cn('relative pb-3', i === 0 ? 'text-fg' : 'text-subtle')}>
            {m}
            {i === 0 && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-accent-strong" />}
          </span>
        ))}
      </div>
      <div className="mt-5 flex-1 rounded-xl border border-line-strong/70 bg-bg/60 p-4 sm:p-5">
        <MessageText marked={false} />
        <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 animate-pulse bg-accent" />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-mono text-[11px] text-subtle">214 caracteres</span>
        <span className="rounded-lg bg-accent-strong px-4 py-2 text-sm font-medium text-white">Analizar</span>
      </div>
    </div>
  );
}

const RULES = [
  { id: 'TON-003', name: 'Tono alarmista', hit: true },
  { id: 'URG-001', name: 'Plazo con amenaza', hit: true },
  { id: 'LNK-004', name: 'Dominio que imita a otro', hit: true },
  { id: 'IMP-002', name: 'Remitente genérico', hit: true },
  { id: 'CRD-001', name: 'Petición de contraseña', hit: false },
  { id: 'ATT-002', name: 'Adjunto ejecutable', hit: false },
];

function FrameAnalyze({ active }: { active: boolean }) {
  return (
    <div className="grid h-full gap-5 sm:grid-cols-[1.2fr_1fr]">
      <div className="rounded-xl border border-line bg-bg/60 p-4 sm:p-5">
        <MessageText marked={active} />
      </div>
      <ul className="space-y-2.5 text-[13px]">
        {RULES.map((r, i) => (
          <li
            key={r.id}
            className={cn('flex items-center gap-3 transition-opacity duration-500', active ? 'opacity-100' : 'opacity-0')}
            style={{ transitionDelay: active ? `${i * 90}ms` : '0ms' }}
          >
            {r.hit ? <Check className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden /> : <Minus className="h-3.5 w-3.5 shrink-0 text-subtle" aria-hidden />}
            <span className="font-mono text-[11px] text-subtle">{r.id}</span>
            <span className={r.hit ? 'text-fg' : 'text-subtle'}>{r.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Mismas señales y pesos que el boceto de resultados de Figma. */
const SCORES = [
  { label: 'Urgencia', points: 25 },
  { label: 'Enlaces sospechosos', points: 35 },
  { label: 'Suplantación', points: 25 },
  { label: 'Tono', points: 5 },
];

function FrameScore({ active }: { active: boolean }) {
  const total = SCORES.reduce((s, x) => s + x.points, 0);
  return (
    <div className="flex h-full flex-col justify-center">
      <ul className="space-y-6">
        {SCORES.map((s, i) => (
          <li key={s.label}>
            <div className="flex justify-between text-sm">
              <span className="text-muted">{s.label}</span>
              <span className="font-mono text-fg">+{s.points}</span>
            </div>
            <div className="mt-2 h-1.5 bg-surface-3">
              <div
                className="h-full bg-accent-strong transition-[width] duration-700 ease-out"
                style={{ width: active ? `${s.points}%` : '0%', transitionDelay: active ? `${i * 120}ms` : '0ms' }}
              />
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex items-baseline justify-between border-t border-line pt-5">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">Puntuación</span>
        <span className="font-wide text-4xl font-bold tabular-nums text-fg">
          {total}
          <span className="ml-1 font-mono text-sm font-normal text-subtle">/100</span>
        </span>
      </div>
    </div>
  );
}

function FrameResult() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between rounded-xl border border-danger/40 bg-danger/10 px-5 py-4">
        <span className="text-sm text-fg sm:text-base">Nivel de riesgo:</span>
        <span className="font-wide text-3xl font-bold uppercase text-danger sm:text-4xl">Alto</span>
      </div>
      <ul className="mt-6 space-y-4">
        {['No abras el enlace: entra en tu banco escribiendo tú la dirección.', 'No facilites datos ni códigos por este canal.', 'Reenvía el mensaje al canal de fraude de tu entidad.'].map((t) => (
          <li key={t} className="flex gap-3 text-[14px] leading-relaxed text-muted">
            <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            {t}
          </li>
        ))}
      </ul>
      <span className="mt-auto inline-flex items-center gap-2 self-start pt-6 text-sm text-accent">
        Ver informe completo <ArrowRight className="h-4 w-4" aria-hidden />
      </span>
    </div>
  );
}

export function HowFrame({ step, active = true }: { step: number; active?: boolean }) {
  switch (step) {
    case 0:
      return <FrameInput />;
    case 1:
      return <FrameAnalyze active={active} />;
    case 2:
      return <FrameScore active={active} />;
    default:
      return <FrameResult />;
  }
}

/** Marco común que envuelve cada ilustración. */
export function FrameShell({ step, total, children, className }: { step: number; total: number; children: ReactNode; className?: string }) {
  return (
    <Panel
      aria-hidden
      className={className}
      padding="lg"
      label={`Paso ${String(step + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`}
      aside={<span className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle sm:text-[11px] sm:tracking-[0.16em]">Ejemplo ilustrativo</span>}
    >
      {children}
    </Panel>
  );
}
