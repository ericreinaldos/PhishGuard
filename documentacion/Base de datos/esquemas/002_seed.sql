-- =====================================================================
-- PhishGuard · 002_seed.sql
-- Datos iniciales: catálogo de reglas + versión 1.0.0 del motor
-- (reglas Python, sin IA) con su configuración y umbrales.
-- Ejecutar después de 001_schema.sql. Se puede ejecutar varias veces.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1. Catálogo de reglas
-- ---------------------------------------------------------------------
insert into public.detection_rules (code, name, description, category) values
  -- URL
  ('IP_IN_URL',             'IP en lugar de dominio',          'La URL usa una dirección IP en vez de un nombre de dominio.',                       'URL'),
  ('PUNYCODE_DOMAIN',       'Dominio con punycode',            'El dominio usa caracteres internacionales que pueden imitar letras normales.',       'URL'),
  ('LOOKALIKE_DOMAIN',      'Dominio que imita a una marca',   'El dominio se parece al de una marca conocida (bancos, Correos, Hacienda...).',      'URL'),
  ('URL_SHORTENER',         'Acortador de URL',                'El enlace usa un acortador que oculta el destino real.',                            'URL'),
  ('EXCESSIVE_SUBDOMAINS',  'Exceso de subdominios',           'La URL tiene muchos subdominios para disimular el dominio real.',                   'URL'),
  ('AT_SYMBOL_IN_URL',      'Símbolo @ en la URL',             'La URL contiene @, que puede ocultar el destino real.',                             'URL'),
  ('SUSPICIOUS_TLD',        'Extensión de dominio sospechosa', 'El dominio usa una extensión muy utilizada en campañas de phishing.',                'URL'),
  ('NO_HTTPS',              'Sin HTTPS',                       'El enlace no usa conexión cifrada.',                                                'URL'),
  -- MESSAGE
  ('URGENCY_LANGUAGE',      'Lenguaje de urgencia',            'El mensaje presiona para actuar de inmediato.',                                     'MESSAGE'),
  ('CREDENTIAL_REQUEST',    'Petición de credenciales',        'El mensaje pide contraseñas, códigos o datos bancarios.',                           'MESSAGE'),
  ('GENERIC_GREETING',      'Saludo genérico',                 'El mensaje no se dirige al destinatario por su nombre.',                            'MESSAGE'),
  ('MISMATCHED_LINK',       'Enlace engañoso',                 'El texto del enlace no coincide con su destino real.',                              'MESSAGE'),
  ('PAYMENT_REQUEST',       'Petición de pago',                'El mensaje pide un pago, normalmente pequeño, para desbloquear algo.',               'MESSAGE'),
  -- HEADERS
  ('SPF_FAILURE',           'Fallo SPF',                       'El servidor que envió el correo no está autorizado por el dominio.',                'HEADERS'),
  ('DKIM_FAILURE',          'Fallo DKIM',                      'La firma digital del correo no es válida.',                                         'HEADERS'),
  ('DMARC_FAILURE',         'Fallo DMARC',                     'El correo no supera la política de autenticación del dominio.',                     'HEADERS'),
  ('REPLY_TO_MISMATCH',     'Reply-To distinto',               'Las respuestas irían a una dirección distinta del remitente.',                       'HEADERS'),
  ('RETURN_PATH_MISMATCH',  'Return-Path distinto',            'La dirección técnica de retorno no coincide con el remitente.',                      'HEADERS'),
  -- REPUTATION
  ('KNOWN_PHISHING_URL',    'URL de phishing conocida',        'La URL aparece en listas públicas de phishing.',                                    'REPUTATION'),
  ('NEW_DOMAIN',            'Dominio de reciente creación',    'El dominio se registró hace pocos días.',                                           'REPUTATION'),
  -- AI
  ('AI_SOCIAL_ENGINEERING', 'Ingeniería social (IA)',          'Un modelo de lenguaje detecta técnicas de manipulación en el texto.',                'AI')
on conflict (code) do nothing;

-- ---------------------------------------------------------------------
-- 2. Versión 1.0.0 del motor (borrador hasta que el código esté listo)
-- ---------------------------------------------------------------------
insert into public.engine_versions (version, description, status)
values ('1.0.0', 'Primera versión: reglas en Python (URL, mensaje y cabeceras). Sin reputación externa ni IA.', 'DRAFT')
on conflict (version) do nothing;

-- ---------------------------------------------------------------------
-- 3. Puntuación de cada regla en la versión 1.0.0
-- (las reglas de reputación e IA no entran en esta versión)
-- ---------------------------------------------------------------------
insert into public.engine_version_rules (engine_version_id, rule_id, configured_score, is_enabled)
select v.id, r.id, cfg.score, true
from (values
  ('IP_IN_URL',            25),
  ('PUNYCODE_DOMAIN',      25),
  ('LOOKALIKE_DOMAIN',     30),
  ('URL_SHORTENER',        10),
  ('EXCESSIVE_SUBDOMAINS', 10),
  ('AT_SYMBOL_IN_URL',     20),
  ('SUSPICIOUS_TLD',       15),
  ('NO_HTTPS',             10),
  ('URGENCY_LANGUAGE',     15),
  ('CREDENTIAL_REQUEST',   25),
  ('GENERIC_GREETING',      5),
  ('MISMATCHED_LINK',      25),
  ('PAYMENT_REQUEST',      20),
  ('SPF_FAILURE',          15),
  ('DKIM_FAILURE',         15),
  ('DMARC_FAILURE',        20),
  ('REPLY_TO_MISMATCH',    15),
  ('RETURN_PATH_MISMATCH', 10)
) as cfg(code, score)
join public.detection_rules r on r.code = cfg.code
cross join (select id from public.engine_versions where version = '1.0.0') v
on conflict (engine_version_id, rule_id) do nothing;

-- ---------------------------------------------------------------------
-- 4. Umbrales de la versión 1.0.0
-- ---------------------------------------------------------------------
insert into public.engine_version_thresholds (engine_version_id, classification, min_score, max_score)
select v.id, t.classification, t.min_score, t.max_score
from (values
  ('LOW',     0, 29),
  ('MEDIUM', 30, 59),
  ('HIGH',   60, 100)
) as t(classification, min_score, max_score)
cross join (select id from public.engine_versions where version = '1.0.0') v
on conflict (engine_version_id, classification) do nothing;

commit;
