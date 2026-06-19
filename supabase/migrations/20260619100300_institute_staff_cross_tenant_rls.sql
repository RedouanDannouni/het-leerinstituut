-- Cross-tenant toegang voor instituutsrollen (schoolopleider, planner, admin).
--
-- PROBLEEM
-- De bestaande RLS isoleert álles strikt per school via
-- `(select public.current_tenant_id()) = tenant_id`. Daardoor zien óók
-- instituutsmedewerkers (schoolopleider/planner/admin) maar één school, terwijl
-- zij juist met álle scholen werken. Conform docs/tdd/platform-tdd.md §3 horen
-- `school_opleider` (later `coach`), `planner` en `admin` functioneel bij het
-- instituut en werken cross-tenant; `school_leider` en `docent` blijven aan één
-- school gebonden.
--
-- AANPAK (additief, niet-destructief)
-- PostgreSQL RLS-policies zijn PERMISSIVE en worden per command met OR
-- gecombineerd. We laten de bestaande tenant-policies ongemoeid en VOEGEN per
-- tabel één extra permissive policy toe die instituutsstaf toegang geeft. De
-- effectieve regel wordt daardoor:
--     (current_tenant_id() = tenant_id)  OR  is_institute_staff()
-- Voordeel: we hoeven de buiten deze repo aangemaakte policy-namen niet te
-- kennen of te verwijderen, en de migratie is idempotent.
--
-- LET OP
-- * Dit werkt alleen als de bestaande policies PERMISSIVE zijn (de standaard).
--   Bestaat er een RESTRICTIVE tenant-policy, dan moet die apart worden herzien.
-- * Deze migratie hoort thuis in het Leerinstituut-project (NEXT_PUBLIC_SUPABASE_URL
--   in .env). Draai bijv. `supabase db push` tegen dat project.

-- 1) Helperfuncties --------------------------------------------------------
-- SECURITY DEFINER zodat ze public.profiles mogen lezen zonder RLS-recursie
-- (de definer omzeilt RLS). STABLE + lege search_path conform Supabase best
-- practices (zie .agents/skills/supabase-postgres-best-practices).

create or replace function public.auth_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid())
$$;

create or replace function public.is_institute_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  -- 'coach' is alvast meegenomen voor de geplande rename school_opleider -> coach.
  select public.auth_role() in ('school_opleider', 'coach', 'planner', 'admin')
$$;

revoke all on function public.auth_role() from public;
revoke all on function public.is_institute_staff() from public;
grant execute on function public.auth_role() to authenticated;
grant execute on function public.is_institute_staff() to authenticated;

-- 2) Additieve cross-tenant policies per tenant-gebonden tabel --------------
-- Eén ALL-policy per tabel: instituutsstaf mag lezen én schrijven in elke tenant.
-- De policy verwijst bewust niet naar tenant_id, zodat hij ook werkt voor
-- koppeltabellen zonder eigen tenant_id-kolom (bijv. learning_path_tags).
do $$
declare
  t text;
  tbls text[] := array[
    'assets', 'invitations', 'learning_paths', 'learning_path_tags',
    'lesson_progress', 'lesson_versions', 'lessons', 'modules',
    'path_assignments', 'path_items', 'profiles', 'stages', 'tags'
  ];
  pname text;
begin
  foreach t in array tbls loop
    execute format('alter table public.%I enable row level security', t);
    pname := t || '_institute_staff_all';
    execute format('drop policy if exists %I on public.%I', pname, t);
    execute format(
      'create policy %I on public.%I for all to authenticated '
      || 'using (public.is_institute_staff()) with check (public.is_institute_staff())',
      pname, t
    );
  end loop;
end $$;

-- 3) Scholenoverzicht: instituutsstaf ziet alle tenants -------------------
-- `tenants` heeft geen tenant_id-kolom (het ís de school). Een extra SELECT-
-- policy garandeert dat instituutsstaf de volledige scholenlijst kan lezen,
-- ook als de bestaande policy strenger zou zijn. Schoolaanmaak/-beheer blijft
-- via de applicatie aan `manage:admin` gekoppeld.
alter table public.tenants enable row level security;
drop policy if exists tenants_institute_staff_select on public.tenants;
create policy tenants_institute_staff_select on public.tenants
  for select to authenticated
  using (public.is_institute_staff());
