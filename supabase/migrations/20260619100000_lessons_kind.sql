-- Learning Path Builder — additieve discriminator op lessen.
-- Page/Quiz/Assignment/Wiki delen dezelfde blok-engine; alleen 'kind' erbij.
-- Dit is de enige wijziging aan bestaande Fase-1-data.

alter table public.lessons
  add column if not exists kind text not null default 'page'
  check (kind in ('page', 'quiz', 'assignment', 'wiki'));
