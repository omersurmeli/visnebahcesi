-- Apply once to a NEW test Supabase project, review before production.
begin;
create table public.orchard_snapshots (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  revision bigint not null default 1 check (revision >= 1),
  updated_at timestamptz not null default now(),
  payload jsonb not null,
  constraint orchard_payload_shape check (
    jsonb_typeof(payload) = 'object'
    and payload @> '{"version":1}'::jsonb
    and coalesce(jsonb_typeof(payload->'trees')='array',false)
    and coalesce(jsonb_typeof(payload->'tasks')='array',false)
    and coalesce(jsonb_typeof(payload->'products')='array',false)
    and coalesce(jsonb_typeof(payload->'moves')='array',false)
    and coalesce(jsonb_typeof(payload->'ledger')='array',false)
    and coalesce(jsonb_typeof(payload->'photos')='array',false)
    and octet_length(payload::text) <= 8 * 1024 * 1024
  )
);
alter table public.orchard_snapshots enable row level security;
alter table public.orchard_snapshots force row level security;
revoke all on public.orchard_snapshots from public, anon, authenticated;
grant select, insert on public.orchard_snapshots to authenticated;
grant update (payload, revision) on public.orchard_snapshots to authenticated;
create policy orchard_read_own on public.orchard_snapshots for select to authenticated
  using ((select auth.uid()) = owner_id and coalesce((select auth.jwt()->>'is_anonymous'),'false')='false');
create policy orchard_insert_own on public.orchard_snapshots for insert to authenticated
  with check ((select auth.uid()) = owner_id and coalesce((select auth.jwt()->>'is_anonymous'),'false')='false' and revision=1);
create policy orchard_update_own on public.orchard_snapshots for update to authenticated
  using ((select auth.uid()) = owner_id and coalesce((select auth.jwt()->>'is_anonymous'),'false')='false')
  with check ((select auth.uid()) = owner_id and coalesce((select auth.jwt()->>'is_anonymous'),'false')='false');
create function public.orchard_snapshot_revision() returns trigger
language plpgsql security invoker set search_path = ''
as $$
begin
  if tg_op='UPDATE' then
    if new.owner_id <> old.owner_id or new.revision <> old.revision + 1 then
      raise exception 'revision conflict' using errcode='23514';
    end if;
  end if;
  new.updated_at := clock_timestamp();
  return new;
end;
$$;
revoke all on function public.orchard_snapshot_revision() from public, anon, authenticated;
create trigger orchard_snapshot_revision_guard before insert or update on public.orchard_snapshots
for each row execute function public.orchard_snapshot_revision();
commit;
