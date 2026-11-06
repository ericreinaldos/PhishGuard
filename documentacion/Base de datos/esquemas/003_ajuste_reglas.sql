-- =====================================================================
-- PhishGuard · 003_ajuste_reglas.sql
-- Ajuste del catálogo de reglas y de la configuración de la versión 1.0.0:
--   · Añade 5 reglas nuevas (estafas habituales en España)
--   · Baja la puntuación de NO_HTTPS, SPF_FAILURE y DKIM_FAILURE
--   · Elimina RETURN_PATH_MISMATCH (demasiados falsos positivos)
-- Resultado: 25 reglas en el catálogo, 22 activas en la versión 1.0.0.
-- Ejecutar después de 002_seed.sql. Se puede ejecutar varias veces.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 0. Seguridad: solo se modifica la 1.0.0 si sigue en borrador
-- ---------------------------------------------------------------------
do $$
begin
  if (select status from public.engine_versions where version = '1.0.0') <> 'DRAFT' then
    raise exception 'La versión 1.0.0 ya no está en DRAFT: crea una versión nueva en lugar de modificarla.';
  end if;
end;
$$;

-- ---------------------------------------------------------------------
-- 1. Reglas nuevas en el catálogo
-- ---------------------------------------------------------------------
insert into public.detection_rules (code, name, description, category) values
  ('BRAND_DOMAIN_MISMATCH', 'Marca con enlace no oficial',
   'El mensaje dice ser de una marca (Correos, un banco, Hacienda...), pero el enlace no pertenece a su dominio oficial.', 'MESSAGE'),
  ('DISPLAY_NAME_SPOOF',    'Nombre de remitente suplantado',
   'El nombre visible del remitente es una marca, pero la dirección de correo pertenece a otro dominio.',               'HEADERS'),
  ('FAMILY_IMPERSONATION',  'Suplantación de un familiar',
   'El mensaje se hace pasar por un familiar que estrena número de teléfono o necesita dinero urgente.',                'MESSAGE'),
  ('PRIZE_OR_REFUND',       'Premio o devolución inesperada',
   'El mensaje anuncia un premio, un sorteo o una devolución de dinero que el usuario no esperaba.',                    'MESSAGE'),
  ('CALLBACK_REQUEST',      'Petición de llamada',
   'El mensaje pide llamar a un número de teléfono para resolver un supuesto problema.',                               'MESSAGE')
on conflict (code) do nothing;

-- ---------------------------------------------------------------------
-- 2. Ajuste de puntuaciones en la versión 1.0.0
-- ---------------------------------------------------------------------
update public.engine_version_rules evr
set configured_score = 5
from public.detection_rules r, public.engine_versions v
where evr.rule_id = r.id
  and evr.engine_version_id = v.id
  and v.version = '1.0.0'
  and r.code in ('NO_HTTPS', 'SPF_FAILURE', 'DKIM_FAILURE');

-- ---------------------------------------------------------------------
-- 3. Eliminar RETURN_PATH_MISMATCH (configuración y catálogo)
-- ---------------------------------------------------------------------
delete from public.engine_version_rules evr
using public.detection_rules r
where evr.rule_id = r.id
  and r.code = 'RETURN_PATH_MISMATCH';

delete from public.detection_rules
where code = 'RETURN_PATH_MISMATCH';

-- ---------------------------------------------------------------------
-- 4. Activar las reglas nuevas en la versión 1.0.0
-- ---------------------------------------------------------------------
insert into public.engine_version_rules (engine_version_id, rule_id, configured_score, is_enabled)
select v.id, r.id, cfg.score, true
from (values
  ('BRAND_DOMAIN_MISMATCH', 30),
  ('DISPLAY_NAME_SPOOF',    25),
  ('FAMILY_IMPERSONATION',  25),
  ('PRIZE_OR_REFUND',       15),
  ('CALLBACK_REQUEST',      15)
) as cfg(code, score)
join public.detection_rules r on r.code = cfg.code
cross join (select id from public.engine_versions where version = '1.0.0') v
on conflict (engine_version_id, rule_id) do nothing;

commit;

-- ---------------------------------------------------------------------
-- Comprobación (debe devolver 25 · 22)
-- ---------------------------------------------------------------------
select
  (select count(*) from public.detection_rules) as reglas_catalogo,
  (select count(*) from public.engine_version_rules evr
     join public.engine_versions v on v.id = evr.engine_version_id
    where v.version = '1.0.0')                  as reglas_v1_0_0;
