-- Run this file once in Supabase Dashboard > SQL Editor.

create table if not exists public.phrasechu_sync_backups (
  sync_hash text primary key check (sync_hash ~ '^[0-9a-f]{64}$'),
  payload jsonb not null,
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);

alter table public.phrasechu_sync_backups enable row level security;
revoke all on table public.phrasechu_sync_backups from public, anon, authenticated;

create or replace function public.get_phrasechu_backup(p_sync_hash text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  result jsonb;
begin
  if p_sync_hash is null or p_sync_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid sync hash' using errcode = '22023';
  end if;

  select jsonb_build_object(
    'payload', backup.payload,
    'revision', backup.revision,
    'updatedAt', backup.updated_at
  )
  into result
  from public.phrasechu_sync_backups as backup
  where backup.sync_hash = p_sync_hash;

  return result;
end;
$function$;

create or replace function public.put_phrasechu_backup(
  p_sync_hash text,
  p_expected_revision bigint,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  backup public.phrasechu_sync_backups%rowtype;
begin
  if p_sync_hash is null or p_sync_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid sync hash' using errcode = '22023';
  end if;
  if p_expected_revision is null or p_expected_revision < 0 then
    raise exception 'Invalid revision' using errcode = '22023';
  end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Invalid backup payload' using errcode = '22023';
  end if;
  if p_payload->>'format' is distinct from 'phrasechu-backup'
     or p_payload->>'version' is distinct from '1'
     or jsonb_typeof(p_payload->'data') is distinct from 'object' then
    raise exception 'Invalid backup format' using errcode = '22023';
  end if;
  if octet_length(p_payload::text) > 4000000 then
    raise exception 'Backup payload is too large' using errcode = '22023';
  end if;

  if p_expected_revision = 0 then
    insert into public.phrasechu_sync_backups (sync_hash, payload)
    values (p_sync_hash, p_payload)
    on conflict (sync_hash) do nothing
    returning * into backup;

    if found then
      return jsonb_build_object(
        'applied', true,
        'payload', backup.payload,
        'revision', backup.revision,
        'updatedAt', backup.updated_at
      );
    end if;
  end if;

  select * into backup
  from public.phrasechu_sync_backups
  where sync_hash = p_sync_hash
  for update;

  if not found then
    return jsonb_build_object(
      'applied', false,
      'payload', null,
      'revision', 0,
      'updatedAt', null
    );
  end if;

  if backup.revision <> p_expected_revision then
    return jsonb_build_object(
      'applied', false,
      'payload', backup.payload,
      'revision', backup.revision,
      'updatedAt', backup.updated_at
    );
  end if;

  update public.phrasechu_sync_backups
  set payload = p_payload,
      revision = revision + 1,
      updated_at = now()
  where sync_hash = p_sync_hash
  returning * into backup;

  return jsonb_build_object(
    'applied', true,
    'payload', backup.payload,
    'revision', backup.revision,
    'updatedAt', backup.updated_at
  );
end;
$function$;

revoke all on function public.get_phrasechu_backup(text) from public;
revoke all on function public.put_phrasechu_backup(text, bigint, jsonb) from public;
grant execute on function public.get_phrasechu_backup(text) to anon, authenticated;
grant execute on function public.put_phrasechu_backup(text, bigint, jsonb) to anon, authenticated;
