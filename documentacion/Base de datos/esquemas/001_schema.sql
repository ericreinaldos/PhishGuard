-- =====================================================================
-- PhishGuard · 001_schema.sql
-- Crea las 11 tablas, restricciones, índices, triggers y RLS.
-- Ejecutar UNA vez en Supabase → SQL Editor.
-- Basado en: documentacion/Diccionario de Datos PhishGuard.md
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 0. Función común: actualizar updated_at automáticamente
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================================
-- 1. IDENTIDAD
-- =====================================================================

create table public.profiles (
  id          uuid         primary key references auth.users (id) on delete cascade,
  name        varchar(100) not null check (char_length(name) >= 2),
  role        varchar(10)  not null default 'USER'   check (role in ('USER', 'ADMIN')),
  status      varchar(10)  not null default 'ACTIVE' check (status in ('ACTIVE', 'DISABLED')),
  created_at  timestamptz  not null default now(),
  updated_at  timestamptz  not null default now()
);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Crea el perfil automáticamente al registrarse un usuario en Supabase Auth.
-- El nombre se toma de los metadatos del registro (campo "name"); si no viene,
-- se usa la parte del email anterior a la @.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- 2. MOTOR DE DETECCIÓN
-- (se crea antes que "análisis" porque verdicts depende de estas tablas)
-- =====================================================================

create table public.detection_rules (
  id           uuid         primary key default gen_random_uuid(),
  code         varchar(60)  not null unique check (code ~ '^[A-Z0-9_]+$'),
  name         varchar(120) not null,
  description  text,
  category     varchar(12)  not null check (category in ('URL', 'MESSAGE', 'HEADERS', 'REPUTATION', 'AI')),
  created_at   timestamptz  not null default now(),
  updated_at   timestamptz  not null default now()
);

create trigger trg_detection_rules_updated_at
  before update on public.detection_rules
  for each row execute function public.set_updated_at();

create table public.engine_versions (
  id            uuid         primary key default gen_random_uuid(),
  version       varchar(20)  not null unique check (version ~ '^\d+\.\d+\.\d+$'),
  description   text,
  status        varchar(10)  not null default 'DRAFT' check (status in ('DRAFT', 'PUBLISHED', 'RETIRED')),
  created_at    timestamptz  not null default now(),
  published_at  timestamptz,
  constraint ck_engine_versions_published_at
    check (status <> 'PUBLISHED' or published_at is not null)
);

-- Solo una versión publicada (activa) a la vez
create unique index uq_engine_versions_published
  on public.engine_versions (status)
  where status = 'PUBLISHED';

create table public.engine_version_rules (
  id                 uuid    primary key default gen_random_uuid(),
  engine_version_id  uuid    not null references public.engine_versions (id) on delete cascade,
  rule_id            uuid    not null references public.detection_rules (id) on delete restrict,
  configured_score   integer not null check (configured_score between 0 and 100),
  is_enabled         boolean not null default true,
  constraint uq_engine_version_rules unique (engine_version_id, rule_id)
);

create index idx_evr_rule on public.engine_version_rules (rule_id);

create table public.engine_version_thresholds (
  id                 uuid        primary key default gen_random_uuid(),
  engine_version_id  uuid        not null references public.engine_versions (id) on delete cascade,
  classification     varchar(10) not null check (classification in ('LOW', 'MEDIUM', 'HIGH')),
  min_score          integer     not null check (min_score between 0 and 100),
  max_score          integer     not null check (max_score between 0 and 100),
  constraint uq_engine_version_thresholds unique (engine_version_id, classification),
  constraint ck_thresholds_range check (min_score <= max_score)
);

-- =====================================================================
-- 3. ANÁLISIS Y RESULTADOS
-- =====================================================================

create table public.analyses (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references public.profiles (id) on delete cascade,
  analysis_type    varchar(10) not null check (analysis_type in ('MESSAGE', 'URL', 'HEADERS')),
  message_channel  varchar(10)          check (message_channel in ('EMAIL', 'SMS', 'WHATSAPP', 'OTHER')),
  input_content    text                 check (char_length(input_content) <= 50000),
  input_metadata   jsonb       not null default '{}'::jsonb,
  status           varchar(12) not null default 'PENDING'
                               check (status in ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  created_at       timestamptz not null default now(),
  completed_at     timestamptz,
  deleted_at       timestamptz,
  constraint ck_analyses_channel_only_message
    check (message_channel is null or analysis_type = 'MESSAGE'),
  constraint ck_analyses_completed_after_created
    check (completed_at is null or completed_at >= created_at)
);

create index idx_analyses_user_created on public.analyses (user_id, created_at desc);
create index idx_analyses_status       on public.analyses (status);

create table public.verdicts (
  id                 uuid        primary key default gen_random_uuid(),
  analysis_id        uuid        not null references public.analyses (id) on delete cascade,
  engine_version_id  uuid        not null references public.engine_versions (id) on delete restrict,
  execution_number   integer     not null default 1 check (execution_number > 0),
  score              integer     not null check (score between 0 and 100),
  classification     varchar(10) not null check (classification in ('LOW', 'MEDIUM', 'HIGH')),
  verdict            text        not null,
  summary            text,
  recommendations    jsonb       not null default '[]'::jsonb,
  duration_ms        integer              check (duration_ms >= 0),
  rules_evaluated    integer              check (rules_evaluated >= 0),
  created_at         timestamptz not null default now(),
  constraint uq_verdicts_execution unique (analysis_id, execution_number)
);

create index idx_verdicts_engine_version on public.verdicts (engine_version_id);
-- (analysis_id ya queda indexado por uq_verdicts_execution)

create table public.detected_rules (
  id                      uuid        primary key default gen_random_uuid(),
  verdict_id              uuid        not null references public.verdicts (id) on delete cascade,
  engine_version_rule_id  uuid        not null references public.engine_version_rules (id) on delete restrict,
  applied_score           integer     not null check (applied_score between 0 and 100),
  explanation             text        not null,
  evidence                text                 check (char_length(evidence) <= 1000),
  details                 jsonb       not null default '{}'::jsonb,
  created_at              timestamptz not null default now(),
  constraint uq_detected_rules unique (verdict_id, engine_version_rule_id)
);

create index idx_detected_rules_evr on public.detected_rules (engine_version_rule_id);
-- (verdict_id ya queda indexado por uq_detected_rules)

-- =====================================================================
-- 4. LABORATORIO
-- =====================================================================

create table public.lab_campaigns (
  id             uuid         primary key default gen_random_uuid(),
  name           varchar(120) not null,
  description    text,
  scenario_type  varchar(50)  not null,
  status         varchar(10)  not null default 'DRAFT' check (status in ('DRAFT', 'ACTIVE', 'COMPLETED')),
  created_by     uuid                  references public.profiles (id) on delete set null,
  created_at     timestamptz  not null default now(),
  completed_at   timestamptz
);

create table public.lab_test_cases (
  id                       uuid         primary key default gen_random_uuid(),
  campaign_id              uuid         not null references public.lab_campaigns (id) on delete cascade,
  name                     varchar(120) not null,
  description              text,
  input_type               varchar(10)  not null check (input_type in ('MESSAGE', 'URL', 'HEADERS')),
  test_content             text         not null check (char_length(test_content) <= 50000),
  expected_classification  varchar(10)  not null check (expected_classification in ('LOW', 'MEDIUM', 'HIGH')),
  expected_min_score       integer               check (expected_min_score between 0 and 100),
  expected_max_score       integer               check (expected_max_score between 0 and 100),
  created_at               timestamptz  not null default now(),
  constraint ck_lab_cases_score_range
    check (expected_min_score is null or expected_max_score is null
           or expected_min_score <= expected_max_score)
);

create index idx_lab_cases_campaign on public.lab_test_cases (campaign_id);

create table public.lab_test_runs (
  id                 uuid        primary key default gen_random_uuid(),
  test_case_id       uuid        not null references public.lab_test_cases (id) on delete cascade,
  engine_version_id  uuid        not null references public.engine_versions (id) on delete restrict,
  analysis_id        uuid                 references public.analyses (id) on delete set null,
  verdict_id         uuid                 references public.verdicts (id) on delete set null,
  status             varchar(12) not null default 'PENDING'
                                 check (status in ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  passed             boolean,
  executed_at        timestamptz not null default now()
);

create index idx_lab_runs_case    on public.lab_test_runs (test_case_id);
create index idx_lab_runs_version on public.lab_test_runs (engine_version_id);

-- =====================================================================
-- 5. SEGURIDAD: Row Level Security
-- ---------------------------------------------------------------------
-- La web NO accede a las tablas directamente: todo pasa por FastAPI.
-- Activamos RLS sin políticas, así la API pública de Supabase
-- (claves anon / authenticated) no puede leer ni escribir nada.
-- FastAPI se conecta con un rol de base de datos y aplica sus permisos.
-- =====================================================================

alter table public.profiles                  enable row level security;
alter table public.detection_rules           enable row level security;
alter table public.engine_versions           enable row level security;
alter table public.engine_version_rules      enable row level security;
alter table public.engine_version_thresholds enable row level security;
alter table public.analyses                  enable row level security;
alter table public.verdicts                  enable row level security;
alter table public.detected_rules            enable row level security;
alter table public.lab_campaigns             enable row level security;
alter table public.lab_test_cases            enable row level security;
alter table public.lab_test_runs             enable row level security;

commit;
