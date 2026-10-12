create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nama text not null,
  email text not null unique,
  role text not null default 'warga' check (role in ('admin', 'warga')),
  status text not null default 'pending' check (status in ('active', 'pending')),
  no_rumah text,
  no_hp text,
  blok text,
  created_at timestamptz not null default now()
);

create table public.ledger_transactions (
  id uuid primary key default gen_random_uuid(),
  receipt_number text not null unique,
  transaction_date date not null default current_date,
  description text not null,
  amount bigint not null check (amount > 0),
  type text not null check (type in ('income', 'expense')),
  category text not null,
  person_in_charge text not null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.dues (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  period date not null,
  due_date date not null,
  amount bigint not null check (amount >= 0),
  cleaning_fee bigint not null default 0 check (cleaning_fee >= 0),
  security_fee bigint not null default 0 check (security_fee >= 0),
  status text not null default 'pending' check (status in ('pending', 'paid')),
  receipt_number text unique,
  payment_method text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, period),
  check (cleaning_fee + security_fee <= amount)
);

create table public.app_settings (
  id smallint primary key default 1 check (id = 1),
  monthly_dues bigint not null default 50000 check (monthly_dues >= 0),
  cleaning_fee bigint not null default 25000 check (cleaning_fee >= 0),
  security_fee bigint not null default 25000 check (security_fee >= 0),
  due_day smallint not null default 10 check (due_day between 1 and 28),
  updated_at timestamptz not null default now(),
  check (cleaning_fee + security_fee <= monthly_dues)
);

insert into public.app_settings (id)
values (1)
on conflict (id) do nothing;

create view public.ledger_summary
with (security_invoker = true)
as
select
  coalesce(sum(amount) filter (where type = 'income'), 0)::double precision as total_income,
  coalesce(sum(amount) filter (where type = 'expense'), 0)::double precision as total_expense,
  coalesce(sum(case when type = 'income' then amount else -amount end), 0)::double precision as balance,
  coalesce(sum(amount) filter (
    where type = 'income'
      and transaction_date >= date_trunc('month', current_date)::date
      and transaction_date < (date_trunc('month', current_date) + interval '1 month')::date
  ), 0)::double precision as month_income,
  coalesce(sum(amount) filter (
    where type = 'expense'
      and transaction_date >= date_trunc('month', current_date)::date
      and transaction_date < (date_trunc('month', current_date) + interval '1 month')::date
  ), 0)::double precision as month_expense
from public.ledger_transactions;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nama, email, role, status, no_rumah, no_hp, blok)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nama', split_part(new.email, '@', 1)),
    new.email,
    case when new.raw_app_meta_data ->> 'role' = 'admin' then 'admin' else 'warga' end,
    case when new.raw_app_meta_data ->> 'status' = 'active' then 'active' else 'pending' end,
    new.raw_user_meta_data ->> 'noRumah',
    new.raw_user_meta_data ->> 'noHP',
    new.raw_user_meta_data ->> 'blok'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

create or replace function public.handle_auth_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = new.email where id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute procedure public.handle_auth_user_email_change();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin' and status = 'active'
  );
$$;

alter table public.profiles enable row level security;
alter table public.ledger_transactions enable row level security;
alter table public.dues enable row level security;
alter table public.app_settings enable row level security;

create policy "Users can view their own profile and admins can view all profiles"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

create policy "Admins can update profiles"
  on public.profiles for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Active residents can view ledger transactions"
  on public.ledger_transactions for select to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and status = 'active'
    )
  );

create policy "Admins can manage ledger transactions"
  on public.ledger_transactions for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Users can view their own dues and admins can view all dues"
  on public.dues for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "Admins can manage dues"
  on public.dues for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Authenticated users can view app settings"
  on public.app_settings for select to authenticated
  using (true);

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.ledger_transactions to authenticated;
grant select, insert, update, delete on public.dues to authenticated;
grant select on public.app_settings to authenticated;
grant select on public.ledger_summary to authenticated;

grant all privileges on table
  public.profiles,
  public.ledger_transactions,
  public.dues,
  public.app_settings
to service_role;
grant select on public.ledger_summary to service_role;
