-- Rename rol `school_opleider` -> `coach` + rolset uitbreiden met `coach`/`planner`.
--
-- De rol "schoolopleider" heet voortaan "coach" (zie docs/prd/platform-prd.md B1
-- en docs/tdd/platform-tdd.md §10). De coach werkt cross-tenant; dat is al
-- geregeld in 20260619100300_institute_staff_cross_tenant_rls.sql, waar
-- `public.is_institute_staff()` zowel 'school_opleider' als 'coach' accepteert.
--
-- De bestaande CHECK-constraints op profiles.role en invitations.role staan
-- alleen ('school_opleider','school_leider','docent','admin') toe. Die verbreden
-- we naar de nieuwe rolset, zodat coach én planner toegekend kunnen worden.
-- Daarna zetten we eventuele bestaande school_opleider-rijen om naar coach.

-- 1) Rol-CHECK-constraints verbreden naar de nieuwe rolset.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('coach', 'school_leider', 'docent', 'admin', 'planner'));

alter table public.invitations drop constraint if exists invitations_role_check;
alter table public.invitations add constraint invitations_role_check
  check (role in ('coach', 'school_leider', 'docent', 'admin', 'planner'));

-- 2) Bestaande data omzetten.
update public.profiles
  set role = 'coach'
  where role = 'school_opleider';

update public.invitations
  set role = 'coach'
  where role = 'school_opleider';
