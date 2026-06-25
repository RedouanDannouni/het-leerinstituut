# TDD — Het Leerinstituut platform (v2)

> Technisch ontwerp bij `docs/prd/platform-prd.md`. Status: **concept ter bespreking**.
>
> Dit document beschrijft hoe we de PRD-functionaliteit bouwen: architectuur, datamodel
> (Supabase Postgres + RLS), rol-/toegangsmodel, migraties, domeinlaag, API/routes, Storage,
> publieke formulieren, 360°-mapping, het hernoemplan `school_opleider` → `coach`, en de
> teststrategie. SQL is illustratief en richtinggevend, geen kant-en-klare migratie.

---

## 1. Doel, scope en uitgangspunten

- **Doel.** De v2-scope (traject, planning, rollen, 360°, leerplatform, publieke forms)
  technisch verankeren bovenop het bestaande fundament.
- **Vertrekpunt (bestaand).** Next.js App Router + TypeScript; Supabase Auth + Postgres met
  tabellen `tenants`, `profiles`, `invitations`; profiel-gebaseerde rol/tenant; demo seed-data
  als terugval (`src/lib/domain/seed-data.ts`); rapport-export via `jspdf`/`pptxgenjs`.
- **Leidend principe.** **Toegang wordt in de database afgedwongen via RLS**, niet alleen in
  de UI. De domeinlaag (`access.ts`, `permissions.ts`, `selectors.ts`) blijft bestaan maar
  wordt secundair t.o.v. RLS.
- **Identiteit.** `identiteit.md` blijft toetssteen: geen docent-ranglijst voor schoolleiders;
  AI/360° dienen dialoog, niet afrekenen; strikte tenant-scheiding.

### 1.1 Besluiten B3–B6 (defaults voor dit ontwerp)
Tenzij anders besloten, ontwerpen we met deze defaults (PRD §11):

- **B3** — coaches zien elkaars beoordelingen + docent-zelfreflecties **alleen als het traject
  dat aan zet** (`trajectories.coach_cross_view = false` default).
- **B4** — schoolleider-data is **actueel-bij-laden** (server fetch), realtime later.
- **B5** — leerlingfeedback toont resultaten pas vanaf een **drempel** (`min_responses`,
  default 5).
- **B6** — publieke formulieren worden **alleen door Leerinstituut (admin/planner)** gepubliceerd.

---

## 2. Architectuuroverzicht

```
Browser ──► Next.js App Router (RSC + Server Actions/Route Handlers)
                  │
                  ├─ Supabase JS (anon, RLS afgedwongen)  ── leesacties met sessie-JWT
                  ├─ Supabase service-role (alleen server) ── admin/batch/publieke inzendingen
                  │
                  ▼
        Supabase Postgres (RLS) + Auth + Storage
```

- **Datatoegang.** Standaard via de **anon-client met gebruikers-JWT**, zodat RLS geldt.
  De **service-role-client** (`src/lib/supabase/admin.ts`) blijft strikt server-side en alleen
  voor: gebruikers aanmaken, batch-import, en het verwerken van publieke (anonieme) inzendingen.
- **Rendering.** Cockpits en lijsten zijn Server Components die data met de sessie ophalen.
  Mutaties via Server Actions of Route Handlers (`/app/api/...`).
- **Geen externe AI.** De conceptgenerator blijft lokaal/deterministisch (identiteit).

---

## 3. Rol- en toegangsmodel

### 3.1 Rollen (na rename + planner)

```
type Role = "coach" | "planner" | "school_leider" | "docent" | "admin";
```

- `coach` (was `school_opleider`), `planner` en `admin` horen functioneel bij het **instituut**
  en werken **cross-tenant**.
- `school_leider` en `docent` zijn strikt aan **één** school gebonden.

### 3.2 Cross-tenant via `tenant_memberships`

Het huidige model (`profiles.tenant_id` = één school) volstaat niet voor coaches/planners die
bij meerdere scholen werken. We introduceren een koppeltabel:

- `profiles.tenant_id` blijft de **thuis-tenant** (voor instituutsmedewerkers: `instituut`).
- **`tenant_memberships`** bepaalt tot welke **schooldata** een instituutsmedewerker toegang
  heeft. Voor coaches wordt membership **afgeleid uit planning** (ingepland op een traject van
  school X ⇒ membership op X), aangevuld met handmatige toekenning door admin/planner.

Toegangsregel (samengevat):

| Rol | Ziet schooldata van |
| --- | --- |
| `admin` | alle tenants |
| `planner` | alle tenants (of toegewezen subset — zie B-open) |
| `coach` | tenants waar een actieve `tenant_membership` voor bestaat (afgeleid uit planning) |
| `school_leider` / `docent` | uitsluitend eigen `profiles.tenant_id` |

### 3.3 SQL-helperfuncties (security definer)

Om recursieve RLS en herhaling te voorkomen, definiëren we helpers in schema `public`
(of `private`), `SECURITY DEFINER`, `STABLE`:

```sql
-- Rol van de ingelogde gebruiker.
create or replace function auth_role() returns text
language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = (select auth.uid())
$$;

-- Is de gebruiker instituutsmedewerker (cross-tenant rollen)?
create or replace function is_institute_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select auth_role() in ('admin','planner','coach')
$$;

-- Heeft de gebruiker toegang tot tenant t?
create or replace function has_tenant_access(t text) returns boolean
language sql stable security definer set search_path = '' as $$
  select
    auth_role() = 'admin'
    or exists (select 1 from public.profiles p
               where p.id = (select auth.uid()) and p.tenant_id = t)
    or exists (select 1 from public.tenant_memberships m
               where m.profile_id = (select auth.uid()) and m.tenant_id = t and m.active)
$$;

-- Mag de gebruiker ruwe observatie/beoordelingsdata zien? (schoolleider niet)
create or replace function can_view_raw() returns boolean
language sql stable security definer set search_path = '' as $$
  select auth_role() in ('admin','planner','coach')
$$;
```

> `can_view_raw()` is de databasespiegel van `canViewRawObservations` in
> `src/lib/domain/permissions.ts`. De harde identiteitsregel (schoolleider geen ruwe data)
> staat hiermee óók in de database, niet alleen in de UI.

### 3.4 Applicatie-RBAC

`src/lib/domain/permissions.ts` wordt uitgebreid (PRD §10.3): nieuwe permissions
`view/edit:planning`, `view/edit:assignment`, `view/edit:trajectory`, `view:360`,
`view/edit:module`, `submit:task`, `manage:publicforms`, `release:reports`, en de matrix
krijgt rijen voor `coach`, `planner`, `admin`, `school_leider`, `docent`. Dit is UI-gating;
de database blijft de waarheid via RLS.

---

## 4. Datamodel

### 4.1 ER-overzicht

```
tenants ──┐
          ├─< profiles >── tenant_memberships >── tenants
          │        │
          │        └─< coach_availability
          │
assignments (opdrachtbeschrijving) ─< assignment_notes
   │
   └─1:1─ trajectories ─< trajectory_steps ─< planning_slots >── profiles (coach)
                              │
                              └─< report_releases ── reports ─< report_blocks
themes ─< question_theme_map >── instrument_questions >── assessment_instruments
assessments >── (instrument, trajectory_step, teacher, author) ─< assessment_responses
modules ─< lessons ─< content_blocks
lessons ─< course_tasks ─< task_submissions
lessons ─< lesson_progress >── profiles (docent)
public_forms ─< public_form_submissions
audit_events
```

### 4.2 Bestaande tabellen (wijzigingen)

- **`tenants`** — toevoegen `kind text default 'school'` (`'school' | 'institute'`) om instituut
  te onderscheiden. Bestaand: `id, name, region, status, learner_count, created_at`.
- **`profiles`** — `role` accepteert nieuwe waarden (`coach`, `planner`); zie rename §10.
  `tenant_id` blijft (thuis-tenant). Eventueel `archived boolean default false`.
- **`invitations`** — `role` accepteert `coach`/`planner`.

### 4.3 Nieuwe tabellen (kernkolommen)

> Alle schoolgebonden tabellen krijgen `tenant_id text not null references tenants(id)`,
> `created_at timestamptz default now()`, en waar relevant `created_by uuid references profiles(id)`.

**`tenant_memberships`** — cross-tenant toegang voor instituutsmedewerkers.
`id uuid pk, profile_id uuid → profiles, tenant_id text → tenants, role text, source text
('planning'|'manual'), active boolean default true, unique(profile_id, tenant_id)`.

**`coach_availability`** — beschikbaarheid.
`id, profile_id → profiles, date date, available boolean, hours numeric null, note text`.

**`assignments`** (opdrachtbeschrijving).
`id, tenant_id, title, goal text, scope text, components jsonb, timeline jsonb,
deliverables jsonb, status text ('concept'|'definitief'), created_by`.

**`assignment_notes`** (gespreksnotulen).
`id, assignment_id → assignments, tenant_id, body text, meeting_date date, created_by`.

**`trajectories`** (traject) — 1:1 met assignment.
`id, assignment_id → assignments, tenant_id, title, status text, start_date, end_date,
coach_cross_view boolean default false`  ← B3.

**`trajectory_steps`** (trajectstap).
`id, trajectory_id → trajectories, tenant_id, position int, kind text
('meting'|'training'|'maatwerk'), subtype text (bv. 'nulmeting','basistraining'),
title, planned_start date, planned_end date, status text, report_id uuid null → reports`.

**`planning_slots`** (inzet coach op dag/uur binnen stap).
`id, trajectory_step_id → trajectory_steps, tenant_id, coach_id uuid → profiles,
date date, unit text ('day'|'hours') default 'day', hours numeric null, status text`.
Index op `(coach_id, date)` voor conflictdetectie.

**`themes`** (gedeelde taxonomie voor 360°).
`id, key text unique, title, description`. Geseed met de bestaande criteria
(`c-instructie`, `c-activering`, `c-differentiatie`, `c-afsluiting`).

**`assessment_instruments`** (instrumentvarianten).
`id, variant text ('coach'|'zelfreflectie'|'leerling'), title, version int, active boolean`.

**`instrument_questions`**.
`id, instrument_id → assessment_instruments, position int, prompt text, scale text`.

**`question_theme_map`** (mapping vraag → thema).
`question_id → instrument_questions, theme_id → themes, primary key(question_id, theme_id)`.

**`assessments`** (een ingevuld instrument).
`id, tenant_id, instrument_id, trajectory_step_id null, teacher_id uuid null → profiles,
author_id uuid null → profiles, status text ('draft'|'completed'), observed_at,
ai_draft jsonb null` (label/text/approved_by/approved_at — herbruik bestaand `AiDraftSummary`).
> De huidige **`observations`** worden een `assessment` met `variant='coach'` (zie §10.3),
> of we behouden `observations` en mappen 1:1. Voorkeur: **één `assessments`-model**.

**`assessment_responses`** (antwoorden per vraag).
`id, assessment_id → assessments, question_id → instrument_questions, score int null,
note text, evidence jsonb`.

**`modules`** (leerplatform).
`id, tenant_id null` (instituutsbreed deelbaar of per school), `title, description,
status text ('concept'|'gepubliceerd'), position int`.

**`lessons`** (lessenreeks).
`id, module_id → modules, position int, title, summary text, status text`.

**`content_blocks`** (rich content).
`id, lesson_id → lessons, position int, kind text ('rich_text'|'image'|'video'|'audio'|'file'),
data jsonb` (rich_text: HTML/markdown; media: `storage_path`, `alt`, `caption`).

**`course_tasks`** (leeropdracht — los van `assignments`!).
`id, lesson_id → lessons, title, instructions text, due_date null`.

**`task_submissions`** (inlevering).
`id, task_id → course_tasks, tenant_id, docent_id → profiles, body text,
attachments jsonb, status text ('open'|'ingeleverd'|'beoordeeld'), submitted_at, feedback text`.

**`lesson_progress`** + **`module_progress`** (voortgang).
`profile_id → profiles, lesson_id/module_id, completed boolean, completed_at, pct numeric`.

**`public_forms`** (publiek formulier).
`id, tenant_id, instrument_id → assessment_instruments, trajectory_step_id null,
token text unique, title, active boolean, min_responses int default 5` ← B5,
`opens_at, closes_at`.

**`public_form_submissions`**.
`id, public_form_id → public_forms, tenant_id, payload jsonb, submitted_at,
client_fingerprint text null` (anti-misbruik). Geen herleidbare persoonsdata vereist.

**`reports`** / **`report_blocks`** — bestaand model formaliseren in Postgres
(nu deels seed-data). `reports`: `id, tenant_id, trajectory_id null, title, status, template_id,
updated_at`. `report_blocks`: `id, report_id, type, title, content, position`.

**`report_releases`** (vrijgave naar school) ← B (PRD E11).
`id, report_id → reports, tenant_id, released_at, released_by`. Schoolleider ziet een rapport
pas als er een release bestaat.

**`audit_events`** — bestaand model formaliseren:
`id, tenant_id, actor_id, action, target, created_at`.

---

## 5. RLS-policies (patronen)

RLS wordt op **alle** tabellen aangezet. Patronen:

### 5.1 Schoolgebonden tabel, lezen op tenant-toegang
```sql
alter table public.trajectories enable row level security;

create policy "select trajectories by tenant access"
  on public.trajectories for select
  to authenticated
  using ( has_tenant_access(tenant_id) );

create policy "write trajectories institute staff"
  on public.trajectories for all
  to authenticated
  using ( is_institute_staff() and has_tenant_access(tenant_id) )
  with check ( is_institute_staff() and has_tenant_access(tenant_id) );
```

### 5.2 Ruwe beoordelingsdata afschermen voor schoolleider
```sql
create policy "select assessments raw-data gated"
  on public.assessments for select
  to authenticated
  using (
    has_tenant_access(tenant_id)
    and (
      can_view_raw()                              -- coach/planner/admin
      or teacher_id = (select auth.uid())         -- docent ziet eigen beoordelingen
    )
  );
```
> Schoolleider valt buiten `can_view_raw()` en is niet de `teacher_id` ⇒ ziet **geen** ruwe
> beoordelingen, conform identiteit. Schoolleider krijgt aggregaten via **views/RPC** (§8.4).

### 5.3 Docent ziet alleen eigen voortgang/inleveringen
```sql
create policy "docent own submissions"
  on public.task_submissions for all
  to authenticated
  using ( docent_id = (select auth.uid()) or can_view_raw() )
  with check ( docent_id = (select auth.uid()) );
```

### 5.4 Rapport pas zichtbaar voor school na release
```sql
create policy "school sees released reports only"
  on public.reports for select
  to authenticated
  using (
    has_tenant_access(tenant_id)
    and ( is_institute_staff()
          or exists (select 1 from public.report_releases r where r.report_id = id) )
  );
```

### 5.5 Publieke inzendingen
`public_form_submissions` krijgt **geen** `authenticated`-insertpolicy; anonieme inzendingen
lopen uitsluitend via een **server route met service-role** die het `token` valideert
(`public_forms.active` + tijdvenster). Lezen van inzendingen: alleen instituutsstaf met
tenant-toegang. Aggregatie respecteert `min_responses` (§7).

### 5.6 Performance
Index op elke `tenant_id`, alle foreign keys, en `planning_slots(coach_id, date)`.
Helperfuncties zijn `stable`/`security definer` om herhaalde subqueries en recursie te
vermijden (zie Supabase best practices in `.agents/skills/supabase-postgres-best-practices`).

---

## 6. Migraties (volgorde)

In `supabase/migrations/` (timestamp-prefix), idempotent waar mogelijk:

1. `..._add_tenant_kind.sql` — `tenants.kind`, instituut markeren.
2. `..._role_rename_coach.sql` — data: `update profiles set role='coach' where role='school_opleider'`; idem `invitations`; eventueel CHECK/enum (§10).
3. `..._tenant_memberships.sql` — tabel + RLS + helperfuncties (`auth_role`, `has_tenant_access`, `is_institute_staff`, `can_view_raw`).
4. `..._assignments_trajectories.sql` — assignments, assignment_notes, trajectories, trajectory_steps.
5. `..._planning.sql` — coach_availability, planning_slots + membership-trigger (planning ⇒ membership).
6. `..._assessment_model.sql` — themes, instruments, questions, mapping, assessments, responses; **migratie van `observations` → `assessments`** (§10.3).
7. `..._learning_platform.sql` — modules, lessons, content_blocks, course_tasks, task_submissions, lesson/module_progress.
8. `..._reports_releases.sql` — reports, report_blocks, report_releases (formaliseren).
9. `..._public_forms.sql` — public_forms, public_form_submissions.
10. `..._audit.sql` — audit_events formaliseren.
11. `..._seed.sql` — themes seeden (uit `criteriaTemplate`), demo-instrumenten.

Na elke migratie `database.types.ts` regenereren (`supabase gen types typescript`).

### 6.1 Trigger: planning ⇒ membership
```sql
create or replace function sync_coach_membership() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.tenant_memberships(profile_id, tenant_id, role, source, active)
  values (new.coach_id, new.tenant_id, 'coach', 'planning', true)
  on conflict (profile_id, tenant_id) do update set active = true;
  return new;
end $$;

create trigger trg_planning_membership
  after insert on public.planning_slots
  for each row execute function sync_coach_membership();
```
> Verwijderen van de laatste slot ⇒ optioneel membership op `active=false` (revoke), tenzij
> handmatig (`source='manual'`).

---

## 7. Publieke formulieren — security

- **Route:** `POST /api/public-forms/[token]` (Route Handler, Node runtime, service-role).
  Valideert `public_forms.active` + tijdvenster; schrijft `public_form_submissions`.
- **Anti-misbruik:** rate limiting per IP/fingerprint, honeypot-veld, optioneel CAPTCHA;
  maximale payloadgrootte. Geen login, dus géén tenant-data lekken in de response.
- **QR:** server-side QR-generatie (`qrcode`) op basis van de publieke URL
  `/(public)/forms/[token]`; beheer in admin/planner-scherm.
- **Aggregatie-drempel (B5):** resultaten/360° tonen leerlingfeedback pas als
  `count(submissions) >= public_forms.min_responses`; anders "te weinig responses".

---

## 8. Domein-/applicatielaag (TypeScript)

### 8.1 `types.ts`
- `Role` rename + `planner`. Nieuwe interfaces: `TenantMembership`, `CoachAvailability`,
  `Assignment`, `AssignmentNote`, `Trajectory`, `TrajectoryStep`, `PlanningSlot`, `Theme`,
  `AssessmentInstrument`, `InstrumentQuestion`, `Assessment`, `AssessmentResponse`, `Module`,
  `Lesson`, `ContentBlock`, `CourseTask`, `TaskSubmission`, `LessonProgress`, `PublicForm`,
  `PublicFormSubmission`, `ReportRelease`.
- `MaterialType`/`LessonMaterial` blijft of gaat op in `content_blocks` (voorkeur: behouden
  voor projectmateriaal, lessen gebruiken `content_blocks`).

### 8.2 `access.ts` — van `tenant_id` naar memberships
`scopedTenantIds()` wordt membership-bewust:
```ts
function scopedTenantIds(ctx: SessionContext): TenantId[] {
  if (ctx.user.role === "admin" || ctx.user.role === "planner") return allTenantIds;
  if (isInstituteStaff(ctx.user.role)) return ctx.memberships.map(m => m.tenantId);
  return [ctx.user.tenantId];
}
```
`SessionContext` krijgt een `memberships`-veld (uit `tenant_memberships`). `canAccessTenant`
houdt rekening met memberships.

### 8.3 `permissions.ts`
Matrix uitbreiden (§3.4). `canViewRawObservations` → `canViewRaw` met `coach|planner|admin`.

### 8.4 Selectors / aggregaten
Schoolleider-aggregaten (gemiddelde leskwaliteit, fase-distributie, **modulevoortgang %**,
360°-themavergelijking) via Postgres **views of RPC** die alleen aggregaten teruggeven, zodat
ruwe data nooit naar de schoolleider-client gaat. Bestaande `getSchoolLeaderMetrics` /
`getPhaseDistribution` verhuizen naar server-side queries.

### 8.5 360°-mapping (berekening)
Per thema: haal `assessment_responses` op, join via `question_theme_map` naar `themes`,
en aggregeer per `variant` (coach/zelfreflectie/leerling) tot een gemiddelde per thema.
Resultaat voedt bestaande blocks (`TrendLine`, `BulletMetric`, `KpiCard`). Presentatie in
groeitaal (`scoreLabel`), nooit als ranking.

---

## 9. API / routes

Aanvullend op bestaande routes (`/app/cockpit`, `/app/observations/new`, `/app/reports`,
`/app/admin`):

| Route | Type | Doel |
| --- | --- | --- |
| `/app/planning` | RSC + Server Actions | Trajectbouwer + drag-and-drop planningsbord |
| `/app/assignments/[id]` | RSC | Opdrachtbeschrijving + notulen |
| `/app/trajectories/[id]` | RSC | Trajectdetail, stappen, voortgang |
| `/app/assessments/[id]` | RSC | Beoordeling invullen/inzien (vervangt observatiescherm) |
| `/app/insights/360` | RSC + RPC | 360°-vergelijking per thema |
| `/app/learn` + `/app/learn/[moduleId]/[lessonId]` | RSC | Docent-leeromgeving |
| `/app/admin/learning` | RSC + Server Actions | Content-authoring (modules/lessen/blokken) |
| `/app/admin/imports` | Route Handler | Batch-/multimodal upload (§9.1) |
| `/api/public-forms/[token]` | Route Handler (service-role) | Anonieme inzending |
| `/(public)/forms/[token]` | RSC (geen auth) | Publiek formulier |

Mutaties valideren server-side met **zod**; nooit vertrouwen op client-RBAC.

### 9.1 Batch-/multimodal upload (E8)
- **Input:** plakken (TSV/CSV uit klembord), CSV-upload, XLSX (via `xlsx`/SheetJS server-side).
- **Template:** downloadbare blanco CSV/XLSX (`/api/admin/imports/template`).
- **Flow:** parse → per-rij valideren (zod) → preview met fout-markering per rij →
  bevestigen → service-role maakt `auth.users` + `profiles` (+ memberships) → audit-event.
- **Idempotentie:** dedupe op e-mail; bestaande gebruikers overslaan/updaten.

### 9.2 Storage (media leerplatform)
Supabase Storage buckets: `lesson-media` (afbeeldingen/video), `task-attachments`,
`report-exports`. Toegang via RLS-achtige Storage policies op pad-prefix `tenant_id/...`.
`content_blocks.data.storage_path` verwijst naar het object. Grote video's via signed upload URLs.

---

## 10. Hernoemplan `school_opleider` → `coach`

Concrete, veilige volgorde (data + code):

1. **DB-migratie** (stap 6.2): `update public.profiles set role='coach' where role='school_opleider';`
   idem `invitations`. Als er een enum/CHECK is: nieuwe waarde toevoegen vóór de update,
   oude pas verwijderen ná code-deploy.
2. **Types/domein:** in `src/lib/domain/types.ts` `Role` aanpassen; `roles.ts`
   (`roleLabels`/`roleIntents`) sleutel `coach` + label "Coach"; `permissions.ts` matrix-sleutel.
3. **Seed/demo:** `seed-data.ts` users `role: "school_opleider"` → `"coach"`; userId's mogen
   blijven (`u-opleider-noord`) of hernoemen naar `u-coach-noord` (optioneel, kost extra refs).
4. **Componenten/copy:** `SchoolOpleiderCockpit.tsx` → `CoachCockpit.tsx`; teksten
   "Schoolopleider" → "Coach". Grep op `school_opleider`, `opleider`, `Schoolopleider`.
5. **Tests:** Playwright/Vitest updaten (rolnamen, labels).
6. **Compat:** kort een mapping `school_opleider→coach` aanhouden bij het lezen van bestaande
   sessies/JWT-metadata, daarna verwijderen.

> Aandachtspunt: bestaande Supabase `user_metadata.role` van reeds aangemaakte accounts moet
> ook gemigreerd worden (admin-script via service-role), anders bouwt `loadProfileUser` een
> verouderde rol op. (`profiles.role` is leidend, dus DB-update dekt dit grotendeels.)

---

## 11. Teststrategie

- **Unit (Vitest):** RBAC-matrix, `scopedTenantIds` met memberships, 360°-aggregatie,
  trajectstap-ordening, importparser/validatie, conflictdetectie planning.
- **RLS-tests:** SQL-/integratietests die per rol verifiëren dat:
  schoolleider geen ruwe `assessments` ziet en geen niet-released `reports`; docent alleen
  eigen submissions; coach alleen tenants met membership; publieke insert alleen via service-route.
- **E2E (Playwright):** bestaande kernflow + nieuw: planner richt traject in en plant coach
  (drag + toetsenbord-fallback); coach voert beoordeling uit; schoolleider ziet coach-card,
  modulevoortgang en alleen aggregaten; docent volgt les met media en levert opdracht in;
  publiek formulier invullen via token.
- **Toegankelijkheid:** planningsbord met toetsenbord; 44px-targets; `prefers-reduced-motion`.

---

## 12. Rollout / fasering (gekoppeld aan PRD §12)

- **Fase 1 (MVP):** migraties 1–6 (deels), rename (§10), `assignments`/`trajectories`/
  `planning` + RLS, coach-werkomgeving op `assessments`, batch-upload basis.
- **Fase 2:** 360°-mapping (instruments/themes/mapping), schoolleider-aggregaten (views/RPC,
  modulevoortgang), reports + releases + evaluatie, uren-planning.
- **Fase 3:** leerplatform (modules/lessons/content_blocks/tasks/progress) + authoring +
  Storage, leerplatform-tijdlijn, publieke formulieren + QR.

Elke fase: migratie → `database.types.ts` regenereren → domeinlaag → UI → tests.

---

## 13. Open technische punten

- **OT1 — Planner-scope (B-open):** ziet een planner *alle* scholen of een toegewezen subset?
  Bepaalt of `planner` in `has_tenant_access` net als `admin` (alles) of via memberships werkt.
  *Voorstel: alles in MVP, subset-optie later.*
- **OT2 — `observations` behouden of mergen naar `assessments`?** *Voorstel: mergen* (één model,
  minder duplicatie). Vergt datamigratie + refactor van `ObservationForm`/selectors.
- **OT3 — Modules instituutsbreed deelbaar of per school?** `modules.tenant_id` nullable
  ondersteunt beide. *Voorstel: instituutsbreed sjabloon + per-school instanties later.*
- **OT4 — Realtime (B4):** later via Supabase Realtime op `planning_slots`/`assessments`.
- **OT5 — Demo seed-data vs Supabase:** wanneer schakelen we de seed-/localStorage-terugval uit
  ten gunste van uitsluitend Supabase? *Voorstel: na Fase 1 voor de echte rollen, demo behouden
  voor showcases.*

---

## 14. Kwaliteitsmonitor-vragenlijsten — uitzetten per school (update na DAN-briefing)

> Deze sectie actualiseert §4.3 (`public_forms`), §7 en besluit **B6** op basis van de
> DAN Analytics-briefing (v3) en de productwens "Het Leerinstituut zet formulieren uit
> naar scholen en kan ze openen en sluiten". De rest van het document blijft leidend.

### 14.1 Twee instrumenten, drie respondent-varianten

De Kwaliteitsmonitor bestaat uit **2 instrumenten**, elk met **3 respondent-varianten**.
In de UI worden de zes formulieren onder deze twee instrumenten gegroepeerd:

| Instrument | Coach / Leiding | Deelnemer (docent) | Leerling |
| --- | --- | --- | --- |
| **Lesobservatie** | `lesobservatie_coaches` | `zelfevaluatie` | `leerlingfeedback` |
| **PLC-scan** | `plc_schoolleiding` | `plc_docenten` | `plc_leerlingen` |

Dit komt overeen met `assessment_instruments.variant` uit §4.3, uitgebreid met het
**PLC-scan-instrument** (stond nog niet in v2). Instrument + variant zijn in de huidige
implementatie metadata op de `FormDefinition` (`src/lib/forms/`), niet (nog) genormaliseerde
tabellen.

> **Divergentie t.o.v. §4.2/§4.3 (bewuste keuze).** De huidige implementatie gebruikt **6 brede,
> gedenormaliseerde tabellen** (één kolom per vraag, bv. `b1_q1`, `sl_q1`, `dd_q1`, `q1` + per
> bouwsteen `b#_analyse`), conform de DAN-briefing en de oude Google Forms/PowerBI-export. Dit
> wijkt af van het genormaliseerde `assessments`/`instrument_questions`/`assessment_responses`-model
> uit §4.3. **Voor nu houden we de brede tabellen aan** (1-op-1 met de briefing en eenvoudige
> export). Het genormaliseerde model blijft een toekomstoptie wanneer 360°-aggregatie over
> instrumenten heen nodig is; mapping gebeurt dan via een view of ETL. Zie OT2.

### 14.2 `form_windows` — openen/sluiten per school (generalisatie van B6)

**B6 verbreed.** In v2 konden alleen **anonieme** `public_forms` worden opengezet/gesloten.
De wens is dat het Leerinstituut **alle zes** formulieren (ook de ingelogde) per school kan
**openen en sluiten**. We introduceren daarom één generieke tabel:

**`form_windows`** — venster ("uitzetting") van één formulier voor één school.
`id uuid pk, tenant_id text not null → tenants, form_key text not null, status text not null
default 'gesloten' check (status in ('open','gesloten')), opened_by uuid → profiles,
opened_at timestamptz, closed_at timestamptz, updated_at, created_at,
unique(tenant_id, form_key)`.

- **Handmatig** open/sluiten (besluit gebruiker, juni 2026): geen automatische datumvensters in
  MVP. `opens_at`/`closes_at` kunnen later worden toegevoegd voor geplande vensters.
- **Granulariteit:** los **per formulier per school** (geen gebundelde meetmoment-rondes in MVP).
  Een `meetmoment`-label kan later worden toegevoegd om een set vensters in één keer te openen.
- **Afdwinging:** een inzending (ingelogd én anoniem) wordt **geweigerd** als er geen `open`
  venster bestaat voor `(tenant_id, form_key)`. Dit wordt server-side gecontroleerd in de
  submit-action en de anonieme route, niet alleen in de UI.

**RLS `form_windows`:**
```sql
alter table public.form_windows enable row level security;

-- Lezen: instituutsstaf ziet alles; schoolgebruikers alleen hun eigen tenant.
create policy "read form_windows" on public.form_windows for select to authenticated
  using ( is_institute_staff() or tenant_id = current_tenant_id() );

-- Beheren (open/sluiten): alleen instituutsstaf (admin/planner/coach).
create policy "manage form_windows" on public.form_windows for all to authenticated
  using ( is_institute_staff() ) with check ( is_institute_staff() );
```

> **Bijwerking 6 formuliertabellen.** De SELECT-policies (`read tenant *`) lazen alleen
> `tenant_id = current_tenant_id()` of rol ∈ {admin, planner}. Ze worden verbreed naar
> `is_institute_staff() or tenant_id = current_tenant_id()`, zodat een **coach** die voor een
> school invult de zojuist ingevoegde rij ook kan teruglezen (PostgREST `insert ... select`).
> Dit is een tijdelijke verbreding zolang `tenant_memberships` (§3.2) nog niet is gebouwd:
> instituutsstaf ziet voorlopig formulierdata van álle scholen. Aanscherpen via memberships is
> een vervolgstap.

### 14.3 Navigatie: "kies eerst een school"

- **Instituutsstaf** (admin/planner/coach) ziet op `/app/forms` eerst een **schoolkiezer** en
  komt daarna op `/app/forms/school/[tenantId]`, met per formulier een **open/sluit-toggle**,
  een **invullen**-knop (voor de eigen rol) en een **deellink** (leerlingen).
- **Schoolgebruikers** (school_leider/docent) worden direct naar hun eigen
  `/app/forms/school/[tenantId]` geleid en zien **alleen de opengezette** formulieren.
- **Leerlingen** vullen anoniem in via `/feedback/[tenant]/[formKey]`; die route toont een
  "gesloten"-melding zolang er geen open venster is.

Routes (aanvulling op §9):

| Route | Type | Doel |
| --- | --- | --- |
| `/app/forms` | RSC/CSR | Schoolkiezer (instituut) of redirect naar eigen school |
| `/app/forms/school/[tenantId]` | CSR | Overzicht 2 instrumenten × 3 varianten + open/sluit |
| `/app/forms/school/[tenantId]/[formKey]` | CSR | Ingelogd formulier invullen (tenant-bewust) |
| `/app/forms/school/[tenantId]/resultaten` | CSR | Resultaten gefilterd op de gekozen school |
