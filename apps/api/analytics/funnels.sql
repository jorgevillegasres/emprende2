-- Consultas de validacion sobre la tabla `events`. Read-only: se pueden correr
-- por el MCP de Render (query_render_postgres) o psql. Responden las 3 preguntas
-- que importan a cero-usuarios: activacion, abandono y retorno en semana 2.
--
-- Eventos emitidos hoy (allowlist en routes/events.ts):
--   calculator_used (pre-auth, props.visitorId), register_completed,
--   demo_opened, dashboard_viewed, quick_capture_enabled, weekly_capture_submitted.
-- Los eventos pre-auth no tienen tenant_id pero si props->>'visitorId'.

-- =====================================================================
-- 1) ACTIVACION: ¿la calculadora convierte a registro?
--    Une por visitorId el uso de la calculadora con el registro posterior.
-- =====================================================================
with calc as (
  select props->>'visitorId' as vid, min(created_at) as first_calc
  from events
  where name = 'calculator_used' and props->>'visitorId' is not null
  group by 1
),
reg as (
  select props->>'visitorId' as vid, min(created_at) as reg_at
  from events
  where name = 'register_completed' and props->>'visitorId' is not null
  group by 1
)
select
  count(*)                                                   as calculadoras,
  count(reg.vid)                                             as registraron,
  round(100.0 * count(reg.vid) / nullif(count(*), 0), 1)     as conversion_pct,
  round(avg(extract(epoch from (reg.reg_at - calc.first_calc)) / 60)
        filter (where reg.vid is not null), 1)               as min_promedio_a_registro
from calc
left join reg using (vid);

-- =====================================================================
-- 2) ABANDONO: ¿en que paso se caen los registrados?
--    Embudo por tenant: registro -> ve tablero -> activa captura -> carga.
-- =====================================================================
select
  count(distinct tenant_id) filter (where name = 'register_completed')       as registrados,
  count(distinct tenant_id) filter (where name = 'dashboard_viewed')         as vieron_tablero,
  count(distinct tenant_id) filter (where name = 'quick_capture_enabled')    as activaron_captura,
  count(distinct tenant_id) filter (where name = 'weekly_capture_submitted') as cargaron_semana
from events
where tenant_id is not null;

-- =====================================================================
-- 3) RETORNO SEMANA 2: ¿vuelven a cargar entre el dia 7 y 14, sin empuje?
-- =====================================================================
with first_seen as (
  select tenant_id, min(created_at) as first_at
  from events
  where tenant_id is not null
  group by 1
),
week2 as (
  select distinct e.tenant_id
  from events e
  join first_seen f on e.tenant_id = f.tenant_id
  where e.name = 'weekly_capture_submitted'
    and e.created_at >= f.first_at + interval '7 days'
    and e.created_at <  f.first_at + interval '14 days'
)
select
  count(*)                                                      as cohorte,
  count(w.tenant_id)                                            as volvieron_semana2,
  round(100.0 * count(w.tenant_id) / nullif(count(*), 0), 1)    as retorno_pct
from first_seen f
left join week2 w using (tenant_id);
