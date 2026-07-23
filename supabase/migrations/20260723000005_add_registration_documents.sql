-- Phase 4: let a signed-in driver upload the remaining (non-core) documents
-- from their dashboard after registering.
--
-- SECURITY DEFINER function so we can allow document appends WITHOUT opening a
-- broad UPDATE policy on driver_registrations (which would also expose status,
-- staff assignment, etc.). It only ever touches the `documents` column, and
-- only for a registration the caller owns.

create or replace function public.add_registration_documents(
  p_reg_id uuid,
  p_docs jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.driver_registrations
     set documents = coalesce(documents, '[]'::jsonb) || p_docs,
         updated_at = now()
   where id = p_reg_id
     and user_id = auth.uid();
end;
$$;

grant execute on function public.add_registration_documents(uuid, jsonb) to authenticated;
