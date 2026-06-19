-- Learning Path Builder — RLS.
-- Patroon identiek aan de bestaande lessons-policies: tenant-isolatie via
-- public.current_tenant_id(). Geen tabel zonder policy.

alter table public.tags enable row level security;
alter table public.learning_paths enable row level security;
alter table public.learning_path_tags enable row level security;
alter table public.stages enable row level security;
alter table public.path_items enable row level security;
alter table public.path_assignments enable row level security;

-- Tabellen met directe tenant_id-kolom: read/write binnen de eigen tenant.
create policy tags_rw on public.tags for all
  using ((select public.current_tenant_id()) = tenant_id)
  with check ((select public.current_tenant_id()) = tenant_id);

create policy learning_paths_rw on public.learning_paths for all
  using ((select public.current_tenant_id()) = tenant_id)
  with check ((select public.current_tenant_id()) = tenant_id);

create policy stages_rw on public.stages for all
  using ((select public.current_tenant_id()) = tenant_id)
  with check ((select public.current_tenant_id()) = tenant_id);

create policy path_items_rw on public.path_items for all
  using ((select public.current_tenant_id()) = tenant_id)
  with check ((select public.current_tenant_id()) = tenant_id);

create policy path_assignments_rw on public.path_assignments for all
  using ((select public.current_tenant_id()) = tenant_id)
  with check ((select public.current_tenant_id()) = tenant_id);

-- learning_path_tags heeft geen eigen tenant_id-kolom -> isoleren via de parent.
create policy lpt_rw on public.learning_path_tags for all
  using (exists (
    select 1 from public.learning_paths lp
    where lp.id = path_id
      and lp.tenant_id = (select public.current_tenant_id())
  ))
  with check (exists (
    select 1 from public.learning_paths lp
    where lp.id = path_id
      and lp.tenant_id = (select public.current_tenant_id())
  ));
