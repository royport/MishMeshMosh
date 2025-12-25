-- Read your own membership rows
drop policy if exists "gm_select_own" on public.group_members;
create policy "gm_select_own"
on public.group_members
for select
using (user_id = auth.uid());

-- Insert: allow user to add themselves (or restrict further)
drop policy if exists "gm_insert_self" on public.group_members;
create policy "gm_insert_self"
on public.group_members
for insert
with check (user_id = auth.uid());

-- Update/Delete: only admins/owners (example: only self for now)
drop policy if exists "gm_update_own" on public.group_members;
create policy "gm_update_own"
on public.group_members
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "gm_delete_own" on public.group_members;
create policy "gm_delete_own"
on public.group_members
for delete
using (user_id = auth.uid());



-- other solution that i tested :
create or replace function public.is_group_member(p_group_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.group_members
    where group_id = p_group_id
      and user_id = p_user_id
  );
$$;
