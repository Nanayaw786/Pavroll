-- Pavroll security step 3: company isolation (batch 1)
-- Run in the Supabase SQL Editor. If anything fails, nothing is applied.
begin;

-- Helper functions ---------------------------------------------------
create or replace function public.clerk_uid() returns text
language sql stable as $$
  select nullif((nullif(current_setting('request.jwt.claims', true), '')::json ->> 'sub'), '')
$$;

create or replace function public.my_company_ids() returns setof uuid
language sql stable security definer set search_path = public as $$
  select company_id from public.company_members
   where clerk_user_id = public.clerk_uid() and is_active = true
  union
  select id from public.companies where clerk_user_id = public.clerk_uid()
$$;

create or replace function public.is_company_admin(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.company_members m
     where m.company_id = cid and m.clerk_user_id = public.clerk_uid()
       and m.is_active = true and m.role = 'admin'
  ) or exists (
    select 1 from public.companies c
     where c.id = cid and c.clerk_user_id = public.clerk_uid()
  )
$$;

-- Leave requests -----------------------------------------------------
drop policy if exists "Leave deletable" on public.leave_requests;
drop policy if exists "Leave readable" on public.leave_requests;
drop policy if exists "Leave updatable" on public.leave_requests;
drop policy if exists "Leave writable" on public.leave_requests;
create policy leave_all on public.leave_requests for all to authenticated
  using (company_id in (select public.my_company_ids()))
  with check (company_id in (select public.my_company_ids()));

-- Loans ----------------------------------------------------------------
drop policy if exists "Loans readable" on public.loans;
drop policy if exists "Loans updatable" on public.loans;
drop policy if exists "Loans writable" on public.loans;
create policy loans_all on public.loans for all to authenticated
  using (company_id in (select public.my_company_ids()))
  with check (company_id in (select public.my_company_ids()));

-- Payroll runs ---------------------------------------------------------
drop policy if exists "Payroll runs deletable" on public.payroll_runs;
drop policy if exists "Payroll runs readable" on public.payroll_runs;
drop policy if exists "Payroll runs updatable" on public.payroll_runs;
drop policy if exists "Payroll runs writable" on public.payroll_runs;
create policy payroll_runs_all on public.payroll_runs for all to authenticated
  using (company_id in (select public.my_company_ids()))
  with check (company_id in (select public.my_company_ids()));

-- Payroll items (belong to a payroll run) ------------------------------
drop policy if exists "Payroll items deletable" on public.payroll_items;
drop policy if exists "Payroll items readable" on public.payroll_items;
drop policy if exists "Payroll items updatable" on public.payroll_items;
drop policy if exists "Payroll items writable" on public.payroll_items;
create policy payroll_items_all on public.payroll_items for all to authenticated
  using (exists (select 1 from public.payroll_runs r
                  where r.id = payroll_items.payroll_run_id
                    and r.company_id in (select public.my_company_ids())))
  with check (exists (select 1 from public.payroll_runs r
                  where r.id = payroll_items.payroll_run_id
                    and r.company_id in (select public.my_company_ids())));

-- Audit logs (read and add only, never edited or deleted) ---------------
drop policy if exists "Audit readable" on public.audit_logs;
drop policy if exists "Audit writable" on public.audit_logs;
create policy audit_select on public.audit_logs for select to authenticated
  using (company_id in (select public.my_company_ids()));
create policy audit_insert on public.audit_logs for insert to authenticated
  with check (company_id in (select public.my_company_ids()));

-- Company members (only admins add or change members) -------------------
drop policy if exists "Members readable" on public.company_members;
drop policy if exists "Members updatable" on public.company_members;
drop policy if exists "Members writable" on public.company_members;
create policy members_select on public.company_members for select to authenticated
  using (clerk_user_id = public.clerk_uid() or company_id in (select public.my_company_ids()));
create policy members_insert on public.company_members for insert to authenticated
  with check (public.is_company_admin(company_id));
create policy members_update on public.company_members for update to authenticated
  using (public.is_company_admin(company_id))
  with check (public.is_company_admin(company_id));

-- Companies: no browser deletes, new companies must be your own trial ----
drop policy if exists companies_delete on public.companies;
drop policy if exists companies_insert on public.companies;
create policy companies_insert on public.companies for insert to authenticated
  with check (clerk_user_id = public.clerk_uid() and plan = 'trial');

-- Companies: browsers can no longer change plan, expiry, trial or owner --
create or replace function public.protect_company_billing() returns trigger
language plpgsql as $$
declare
  claims text := nullif(current_setting('request.jwt.claims', true), '');
  col text;
begin
  if claims is null then return new; end if;
  if (claims::json ->> 'role') = 'service_role' then return new; end if;
  foreach col in array array['plan','plan_expires_at','is_active','trial_started_at','trial_ends_at','clerk_user_id'] loop
    if (to_jsonb(new) ->> col) is distinct from (to_jsonb(old) ->> col) then
      raise exception 'Not allowed to change %', col using errcode = '42501';
    end if;
  end loop;
  return new;
end
$$;
drop trigger if exists protect_company_billing on public.companies;
create trigger protect_company_billing before update on public.companies
  for each row execute function public.protect_company_billing();

-- Unused table: close it completely ---------------------------------------
drop policy if exists "Allow all" on public.payroll_analytics;

commit;
