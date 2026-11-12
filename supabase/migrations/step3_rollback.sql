-- Pavroll rollback for step 3: puts the previous (open) rules back.
begin;

drop policy if exists leave_all on public.leave_requests;
drop policy if exists loans_all on public.loans;
drop policy if exists payroll_runs_all on public.payroll_runs;
drop policy if exists payroll_items_all on public.payroll_items;
drop policy if exists audit_select on public.audit_logs;
drop policy if exists audit_insert on public.audit_logs;
drop policy if exists members_select on public.company_members;
drop policy if exists members_insert on public.company_members;
drop policy if exists members_update on public.company_members;
drop policy if exists companies_insert on public.companies;
drop trigger if exists protect_company_billing on public.companies;
drop function if exists public.protect_company_billing();

create policy "Leave deletable" on public.leave_requests for delete to public using (true);
create policy "Leave readable" on public.leave_requests for select to public using (true);
create policy "Leave updatable" on public.leave_requests for update to public using (true);
create policy "Leave writable" on public.leave_requests for insert to public with check (true);

create policy "Loans readable" on public.loans for select to public using (true);
create policy "Loans updatable" on public.loans for update to public using (true);
create policy "Loans writable" on public.loans for insert to public with check (true);

create policy "Payroll runs deletable" on public.payroll_runs for delete to public using (true);
create policy "Payroll runs readable" on public.payroll_runs for select to public using (true);
create policy "Payroll runs updatable" on public.payroll_runs for update to public using (true);
create policy "Payroll runs writable" on public.payroll_runs for insert to public with check (true);

create policy "Payroll items deletable" on public.payroll_items for delete to public using (true);
create policy "Payroll items readable" on public.payroll_items for select to public using (true);
create policy "Payroll items updatable" on public.payroll_items for update to public using (true);
create policy "Payroll items writable" on public.payroll_items for insert to public with check (true);

create policy "Audit readable" on public.audit_logs for select to public using (true);
create policy "Audit writable" on public.audit_logs for insert to public with check (true);

create policy "Members readable" on public.company_members for select to public using (true);
create policy "Members updatable" on public.company_members for update to public using (true);
create policy "Members writable" on public.company_members for insert to public with check (true);

create policy companies_delete on public.companies for delete to public using (true);
create policy companies_insert on public.companies for insert to public with check (true);

create policy "Allow all" on public.payroll_analytics for all to public using (true);

drop function if exists public.is_company_admin(uuid);
drop function if exists public.my_company_ids();
drop function if exists public.clerk_uid();

commit;
