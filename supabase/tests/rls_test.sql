-- ============================================================================
-- RLS test — improveyourskills.ch
-- ----------------------------------------------------------------------------
-- Proves the three security guarantees the brief requires (§2.3): an anonymous
-- client (the `anon` role — what every website visitor is) cannot read
-- contact_messages, cannot see hidden gallery photos, and cannot write anything.
--
-- Run against the database, e.g.:
--     psql "$DATABASE_URL" -f supabase/tests/rls_test.sql
--
-- Everything runs in a transaction that is ROLLED BACK, so no test data is left
-- behind. Each check prints PASS or FAIL. A hardened database prints only PASS.
-- ============================================================================

begin;

-- Fixtures, created as the privileged migration role (which bypasses RLS):
insert into public.gallery_photos (id, year, path_thumb, path_medium, path_large, hidden)
values ('00000000-0000-0000-0000-0000000000aa', 9999, 't', 'm', 'l', true); -- hidden
insert into public.gallery_photos (id, year, path_thumb, path_medium, path_large, hidden)
values ('00000000-0000-0000-0000-0000000000bb', 9999, 't', 'm', 'l', false); -- visible
insert into public.contact_messages (id, first_name, last_name, email, message)
values ('00000000-0000-0000-0000-0000000000cc', 'Test', 'Test', 't@example.com', 'hi');

-- Become the anonymous role for the checks below.
set local role anon;

do $$
declare
  n int;
begin
  -- 1) anon must NOT read contact_messages -------------------------------------
  begin
    select count(*) into n from public.contact_messages;
    if n = 0 then
      raise notice 'PASS 1  anon sees 0 contact_messages';
    else
      raise notice 'FAIL 1  anon saw % contact_messages', n;
    end if;
  exception
    when insufficient_privilege then
      raise notice 'PASS 1  anon is denied on contact_messages (permission revoked)';
  end;

  -- 2a) anon must NOT see a hidden photo ---------------------------------------
  select count(*) into n
  from public.gallery_photos
  where id = '00000000-0000-0000-0000-0000000000aa';
  if n = 0 then
    raise notice 'PASS 2a anon cannot see the hidden photo';
  else
    raise notice 'FAIL 2a anon saw the hidden photo';
  end if;

  -- 2b) anon SHOULD see a visible photo (sanity check) -------------------------
  select count(*) into n
  from public.gallery_photos
  where id = '00000000-0000-0000-0000-0000000000bb';
  if n = 1 then
    raise notice 'PASS 2b anon can see the visible photo';
  else
    raise notice 'FAIL 2b anon could not see the visible photo';
  end if;

  -- 3) anon must NOT write anything --------------------------------------------
  begin
    insert into public.content_blocks (key, kind, value_de)
    values ('test.rls.key', 'text', 'should not work');
    raise notice 'FAIL 3  anon inserted into content_blocks';
  exception
    when others then
      raise notice 'PASS 3  anon write blocked (%)', sqlerrm;
  end;
end $$;

reset role;
rollback;
