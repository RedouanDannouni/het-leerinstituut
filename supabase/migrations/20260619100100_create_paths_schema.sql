-- Learning Path Builder — datamodel.
-- Bouwt additief voort op de bestaande lessons/modules/assets/profiles/tenants.
-- Aangepast aan dit platform:
--   * tenant_id is text en verwijst naar public.tenants(id) (zoals lessons).
--   * Er is (nog) geen groups-tabel: path_assignments.group_id is een kale uuid
--     zonder FK, zodat een latere groepen-migratie de FK additief kan toevoegen.
--     In de MVP wordt alleen audience_kind = 'user' gebruikt (zie §11.3 TDD).

-- Tags / categorieen (kiezen of inline "create one")
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null references public.tenants(id),
  label text not null,
  color text,
  created_at timestamptz not null default now(),
  unique (tenant_id, label)
);

-- Leerpad: top-niveau bundel + wizard-metadata
create table if not exists public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null references public.tenants(id),
  title text not null,
  description text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  duration_amount int,
  duration_unit text check (duration_unit in ('days', 'weeks', 'months')),
  trainer_id uuid references public.profiles(id),
  language text not null default 'nl',
  sequencing text not null default 'free' check (sequencing in ('sequential', 'free')),
  thumbnail_kind text check (thumbnail_kind in ('asset', 'solid', 'illustration')),
  thumbnail_asset_id uuid references public.assets(id),
  thumbnail_value text,
  schema_version int not null default 1,
  position int not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Leerpad <-> tags (n-op-n)
create table if not exists public.learning_path_tags (
  path_id uuid not null references public.learning_paths(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (path_id, tag_id)
);

-- Stages: niveaugroepen / fases binnen een leerpad
create table if not exists public.stages (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null references public.tenants(id),
  path_id uuid not null references public.learning_paths(id) on delete cascade,
  title text not null default '',
  position int not null default 0
);

-- Path items: geordende, polymorfe verwijzing naar een les OF een module
create table if not exists public.path_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null references public.tenants(id),
  path_id uuid not null references public.learning_paths(id) on delete cascade,
  stage_id uuid references public.stages(id) on delete set null,
  item_kind text not null check (item_kind in ('lesson', 'module')),
  lesson_id uuid references public.lessons(id) on delete cascade,
  module_id uuid references public.modules(id) on delete cascade,
  position int not null default 0,
  constraint path_item_ref_consistent check (
    (item_kind = 'lesson' and lesson_id is not null and module_id is null) or
    (item_kind = 'module' and module_id is not null and lesson_id is null)
  )
);

-- Toewijzing aan publiek (wizard stap 3). MVP: alleen audience_kind = 'user'.
create table if not exists public.path_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null references public.tenants(id),
  path_id uuid not null references public.learning_paths(id) on delete cascade,
  audience_kind text not null check (audience_kind in ('user', 'group')),
  user_id uuid references public.profiles(id),
  group_id uuid,
  due_at timestamptz,
  assigned_by uuid references public.profiles(id),
  assigned_at timestamptz not null default now(),
  constraint assignment_target_consistent check (
    (audience_kind = 'user' and user_id is not null and group_id is null) or
    (audience_kind = 'group' and group_id is not null and user_id is null)
  ),
  unique (path_id, user_id, group_id)
);

create index if not exists learning_paths_tenant_position_idx on public.learning_paths (tenant_id, position);
create index if not exists stages_tenant_path_position_idx on public.stages (tenant_id, path_id, position);
create index if not exists path_items_tenant_path_stage_position_idx on public.path_items (tenant_id, path_id, stage_id, position);
create index if not exists path_assignments_tenant_path_idx on public.path_assignments (tenant_id, path_id);
