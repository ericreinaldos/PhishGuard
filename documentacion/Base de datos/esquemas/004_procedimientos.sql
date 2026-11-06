-- =====================================================================
-- PhishGuard · 004_procedimientos.sql
-- Triggers de protección y procedimientos almacenados.
--   · Trigger:        protege la configuración de las versiones publicadas
--   · Procedimientos: publish_engine_version, clone_engine_version,
--                     purge_analysis_content
-- Documentación: documentacion/Base de datos/6. Triggers y procedimientos almacenados.md
-- Ejecutar después de 003_ajuste_reglas.sql. Se puede ejecutar varias veces.
-- =====================================================================

begin;

-- =====================================================================
-- 0. CORRECCIÓN de handle_new_user() (001_schema.sql)
--    Antes, un email con 1 carácter antes de la @ (p. ej. "a@gmail.com")
--    o un nombre de más de 100 caracteres hacía fallar el registro,
--    porque profiles.name exige entre 2 y 100 caracteres.
-- =====================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text;
begin
  v_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    split_part(new.email, '@', 1)
  );

  if v_name is null or char_length(v_name) < 2 then
    v_name := 'Usuario';
  end if;

  insert into public.profiles (id, name)
  values (new.id, left(v_name, 100));

  return new;
end;
$$;

-- =====================================================================
-- 1. TRIGGER: proteger las versiones del motor que no están en borrador
-- =====================================================================

create or replace function public.protect_published_version()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_version_id uuid;
  v_version    varchar;
  v_status     varchar;
begin
  -- En un DELETE solo existe la fila antigua; en INSERT/UPDATE, la nueva
  if tg_op = 'DELETE' then
    v_version_id := old.engine_version_id;
  else
    v_version_id := new.engine_version_id;
  end if;

  select version, status into v_version, v_status
  from public.engine_versions
  where id = v_version_id;

  if v_status is not null and v_status <> 'DRAFT' then
    raise exception 'La versión % está % y no se puede modificar. Créala de nuevo con clone_engine_version().',
      v_version, v_status;
  end if;

  -- En un UPDATE que mueve la fila a otra versión, se comprueba también la de origen
  if tg_op = 'UPDATE' and old.engine_version_id <> new.engine_version_id then
    select version, status into v_version, v_status
    from public.engine_versions
    where id = old.engine_version_id;

    if v_status is not null and v_status <> 'DRAFT' then
      raise exception 'La versión % está % y no se puede modificar.', v_version, v_status;
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_evr_protect_published on public.engine_version_rules;
create trigger trg_evr_protect_published
  before insert or update or delete on public.engine_version_rules
  for each row execute function public.protect_published_version();

drop trigger if exists trg_evt_protect_published on public.engine_version_thresholds;
create trigger trg_evt_protect_published
  before insert or update or delete on public.engine_version_thresholds
  for each row execute function public.protect_published_version();

-- =====================================================================
-- 2. PROCEDIMIENTO: publicar una versión del motor
--    CALL publish_engine_version('1.0.0');
-- =====================================================================

create or replace procedure public.publish_engine_version(p_version varchar)
language plpgsql
set search_path = ''
as $$
declare
  v_id            uuid;
  v_status        varchar;
  v_enabled_rules integer;
  v_expected      text[] := array['LOW', 'MEDIUM', 'HIGH'];
  v_position      integer := 1;
  v_next_min      integer := 0;
  v_previous      varchar;
  t               record;
begin
  -- 1. La versión existe y está en borrador
  select id, status into v_id, v_status
  from public.engine_versions
  where version = p_version
  for update;

  if not found then
    raise exception 'La versión % no existe.', p_version;
  end if;

  if v_status <> 'DRAFT' then
    raise exception 'La versión % está % y solo se pueden publicar versiones en DRAFT.', p_version, v_status;
  end if;

  -- 2. Tiene al menos una regla activa
  select count(*) into v_enabled_rules
  from public.engine_version_rules
  where engine_version_id = v_id and is_enabled;

  if v_enabled_rules = 0 then
    raise exception 'La versión % no tiene ninguna regla activa.', p_version;
  end if;

  -- 3. Umbrales: LOW, MEDIUM y HIGH, de 0 a 100, sin huecos ni solapamientos
  for t in
    select classification, min_score, max_score
    from public.engine_version_thresholds
    where engine_version_id = v_id
    order by min_score
  loop
    if v_position > 3 or t.classification <> v_expected[v_position] then
      raise exception 'Umbrales de la versión % mal ordenados: se esperaba % y hay %.',
        p_version, coalesce(v_expected[v_position], 'ninguno más'), t.classification;
    end if;

    if t.min_score <> v_next_min then
      raise exception 'Umbrales de la versión %: % empieza en % y debería empezar en % (hueco o solapamiento).',
        p_version, t.classification, t.min_score, v_next_min;
    end if;

    v_next_min := t.max_score + 1;
    v_position := v_position + 1;
  end loop;

  if v_position <> 4 then
    raise exception 'La versión % debe tener exactamente tres umbrales (LOW, MEDIUM y HIGH).', p_version;
  end if;

  if v_next_min <> 101 then
    raise exception 'Los umbrales de la versión % deben terminar en 100.', p_version;
  end if;

  -- 4. Retirar la versión publicada actual (si hay)
  update public.engine_versions
  set status = 'RETIRED'
  where status = 'PUBLISHED'
  returning version into v_previous;

  -- 5. Publicar la nueva
  update public.engine_versions
  set status = 'PUBLISHED', published_at = now()
  where id = v_id;

  if v_previous is null then
    raise notice 'Versión % publicada (% reglas activas).', p_version, v_enabled_rules;
  else
    raise notice 'Versión % publicada (% reglas activas). La versión % pasa a RETIRED.',
      p_version, v_enabled_rules, v_previous;
  end if;
end;
$$;

-- =====================================================================
-- 3. PROCEDIMIENTO: crear una versión nueva copiando otra
--    CALL clone_engine_version('1.0.0', '1.1.0', 'Añade la regla de IA');
-- =====================================================================

create or replace procedure public.clone_engine_version(
  p_from        varchar,
  p_to          varchar,
  p_description text default null
)
language plpgsql
set search_path = ''
as $$
declare
  v_from_id    uuid;
  v_to_id      uuid;
  v_rules      integer;
  v_thresholds integer;
begin
  -- 1. Comprobaciones
  select id into v_from_id
  from public.engine_versions
  where version = p_from;

  if not found then
    raise exception 'La versión de origen % no existe.', p_from;
  end if;

  if p_to is null or p_to !~ '^\d+\.\d+\.\d+$' then
    raise exception 'La versión de destino "%" no tiene el formato correcto (por ejemplo, 1.1.0).', p_to;
  end if;

  if exists (select 1 from public.engine_versions where version = p_to) then
    raise exception 'La versión de destino % ya existe.', p_to;
  end if;

  -- 2. Crear la versión nueva en borrador
  insert into public.engine_versions (version, description, status)
  values (p_to, coalesce(p_description, 'Copia de la versión ' || p_from), 'DRAFT')
  returning id into v_to_id;

  -- 3. Copiar reglas con sus puntos y estado
  insert into public.engine_version_rules (engine_version_id, rule_id, configured_score, is_enabled)
  select v_to_id, rule_id, configured_score, is_enabled
  from public.engine_version_rules
  where engine_version_id = v_from_id;
  get diagnostics v_rules = row_count;

  -- 4. Copiar umbrales
  insert into public.engine_version_thresholds (engine_version_id, classification, min_score, max_score)
  select v_to_id, classification, min_score, max_score
  from public.engine_version_thresholds
  where engine_version_id = v_from_id;
  get diagnostics v_thresholds = row_count;

  raise notice 'Versión % creada en DRAFT a partir de la % (% reglas, % umbrales).',
    p_to, p_from, v_rules, v_thresholds;
end;
$$;

-- =====================================================================
-- 4. PROCEDIMIENTO: borrar el contenido original de los análisis antiguos
--    CALL purge_analysis_content(30);
-- =====================================================================

create or replace procedure public.purge_analysis_content(p_days integer default 30)
language plpgsql
set search_path = ''
as $$
declare
  v_count integer;
begin
  if p_days is null or p_days < 1 then
    raise exception 'El número de días debe ser 1 o más (recibido: %).', p_days;
  end if;

  update public.analyses
  set input_content = null
  where input_content is not null
    and created_at < now() - make_interval(days => p_days);
  get diagnostics v_count = row_count;

  raise notice 'Contenido borrado en % análisis con más de % días.', v_count, p_days;
end;
$$;

-- =====================================================================
-- 5. SEGURIDAD: nadie salvo el backend y los administradores puede ejecutarlos
-- =====================================================================

revoke all on function  public.protect_published_version()                     from public;
revoke all on procedure public.publish_engine_version(varchar)                 from public;
revoke all on procedure public.clone_engine_version(varchar, varchar, text)    from public;
revoke all on procedure public.purge_analysis_content(integer)                 from public;

-- Roles de la API pública de Supabase (solo existen en Supabase)
do $$
declare
  r text;
begin
  foreach r in array array['anon', 'authenticated'] loop
    if exists (select 1 from pg_roles where rolname = r) then
      execute format('revoke all on function  public.protect_published_version()                  from %I', r);
      execute format('revoke all on procedure public.publish_engine_version(varchar)              from %I', r);
      execute format('revoke all on procedure public.clone_engine_version(varchar, varchar, text) from %I', r);
      execute format('revoke all on procedure public.purge_analysis_content(integer)              from %I', r);
    end if;
  end loop;
end;
$$;

commit;

-- ---------------------------------------------------------------------
-- Comprobación (debe devolver 5 triggers y 3 procedimientos)
-- ---------------------------------------------------------------------
select
  (select count(distinct trigger_name) from information_schema.triggers
    where trigger_name in ('on_auth_user_created', 'trg_profiles_updated_at',
                           'trg_detection_rules_updated_at',
                           'trg_evr_protect_published', 'trg_evt_protect_published')) as triggers,
  (select count(*) from information_schema.routines
    where routine_schema = 'public' and routine_type = 'PROCEDURE') as procedimientos;
