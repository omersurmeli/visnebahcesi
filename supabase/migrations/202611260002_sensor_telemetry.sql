-- V2.5: test project only. Device credentials are server-only; owners can only read telemetry.
begin;
create table public.sensor_stations (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 label text not null check (length(label) between 1 and 100),
 zone text not null default '' check (length(zone)<=100),
 active boolean not null default true,
 last_received_at timestamptz
);
create table public.sensor_device_keys (
 station_id uuid primary key references public.sensor_stations(id) on delete cascade,
 token_hash bytea not null check(octet_length(token_hash)=32)
);
create table public.sensor_readings (
 station_id uuid not null references public.sensor_stations(id) on delete cascade,
 sample_id uuid not null,
 observed_at timestamptz not null,
 received_at timestamptz not null default now(),
 metrics jsonb not null check(jsonb_typeof(metrics)='object' and octet_length(metrics::text)<=4096),
 primary key(station_id,sample_id)
);
create index sensor_stations_owner_idx on public.sensor_stations(owner_id);
create index sensor_readings_time_idx on public.sensor_readings(station_id,observed_at desc);
alter table public.sensor_stations enable row level security;
alter table public.sensor_device_keys enable row level security;
alter table public.sensor_readings enable row level security;
revoke all on public.sensor_stations,public.sensor_device_keys,public.sensor_readings from public,anon,authenticated;
grant select(id,label,zone,active,owner_id) on public.sensor_stations to authenticated;
grant select on public.sensor_readings to authenticated;
grant select,insert,update,delete on public.sensor_stations,public.sensor_device_keys,public.sensor_readings to service_role;
create policy own_stations on public.sensor_stations for select to authenticated using ((select auth.uid())=owner_id and coalesce((select auth.jwt()->>'is_anonymous'),'false')='false');
create policy own_readings on public.sensor_readings for select to authenticated using (exists(select 1 from public.sensor_stations s where s.id=station_id and s.owner_id=(select auth.uid()) and coalesce((select auth.jwt()->>'is_anonymous'),'false')='false'));
create function public.ingest_orchard_reading(p_station uuid,p_sample uuid,p_observed timestamptz,p_metrics jsonb,p_token text)
returns text language plpgsql security invoker set search_path='' as $$
declare last_seen timestamptz; existing public.sensor_readings%rowtype; kv record; v numeric; lo numeric; hi numeric;
begin
 if p_token is null or p_token !~ '^[a-f0-9]{64}$' then return 'denied'; end if;
 select s.last_received_at into last_seen from public.sensor_stations s join public.sensor_device_keys k on k.station_id=s.id
 where s.id=p_station and s.active and k.token_hash=pg_catalog.sha256(pg_catalog.convert_to(p_token,'UTF8')) for update of s;
 if not found then return 'denied'; end if;
 if p_observed is null or p_observed > now()+interval '2 minutes' or p_observed < now()-interval '7 days' or p_metrics is null or jsonb_typeof(p_metrics)<>'object' or p_metrics='{}'::jsonb or octet_length(p_metrics::text)>4096 then return 'invalid'; end if;
 for kv in select * from jsonb_each(p_metrics) loop
  if jsonb_typeof(kv.value)<>'number' then return 'invalid'; end if;
  v:=(kv.value::text)::numeric;
  case kv.key
  when 'air_c' then lo:=-60;hi:=80;
  when 'rh_pct' then lo:=0;hi:=100;
  when 'soil_c' then lo:=-40;hi:=80;
  when 'vwc_shallow' then lo:=0;hi:=100;
  when 'vwc_deep' then lo:=0;hi:=100;
  when 'rain_mm' then lo:=0;hi:=500;
  when 'flow_l_min' then lo:=0;hi:=100000;
  when 'pressure_bar' then lo:=0;hi:=100;
  when 'water_total_m3' then lo:=0;hi:=1000000000;
  when 'water_ph' then lo:=0;hi:=14;
  when 'water_ec_ms_cm' then lo:=0;hi:=100;
  when 'battery_v' then lo:=0;hi:=60;
  when 'rssi_dbm' then lo:=-150;hi:=0;
  else return 'invalid'; end case;
  if v<lo or v>hi then return 'invalid';end if;
 end loop;
 select * into existing from public.sensor_readings where station_id=p_station and sample_id=p_sample;
 if found then
  if existing.observed_at=p_observed and existing.metrics=p_metrics then return 'duplicate'; else return 'conflict';end if;
 end if;
 if last_seen is not null and last_seen>now()-interval '30 seconds' then return 'rate';end if;
 insert into public.sensor_readings(station_id,sample_id,observed_at,metrics) values(p_station,p_sample,p_observed,p_metrics);
 update public.sensor_stations set last_received_at=now() where id=p_station;
 return 'accepted';
end;$$;
revoke all on function public.ingest_orchard_reading(uuid,uuid,timestamptz,jsonb,text) from public,anon,authenticated;
grant execute on function public.ingest_orchard_reading(uuid,uuid,timestamptz,jsonb,text) to service_role;
commit;
