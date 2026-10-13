alter table public.profiles
  add column if not exists updated_at timestamptz default now();

alter table public.ledger_transactions
  add column if not exists due_id uuid references public.dues(id) on delete set null,
  add column if not exists source_type text not null default 'manual' check (source_type in ('manual', 'dues')),
  add column if not exists updated_at timestamptz default now();

alter table public.dues
  add column if not exists updated_at timestamptz default now(),
  add column if not exists source_transaction_id uuid references public.ledger_transactions(id) on delete set null,
  add column if not exists idempotency_key text,
  add column if not exists payment_reference text;

create unique index if not exists dues_idempotency_key_unique
  on public.dues (idempotency_key)
  where idempotency_key is not null;

create index if not exists dues_period_idx
  on public.dues (period);

create index if not exists dues_user_period_idx
  on public.dues (user_id, period);

create index if not exists ledger_transactions_due_idx
  on public.ledger_transactions (due_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists dues_set_updated_at on public.dues;
create trigger dues_set_updated_at
  before update on public.dues
  for each row execute procedure public.set_updated_at();

drop trigger if exists ledger_transactions_set_updated_at on public.ledger_transactions;
create trigger ledger_transactions_set_updated_at
  before update on public.ledger_transactions
  for each row execute procedure public.set_updated_at();

create or replace function public.generate_due_invoices(
  target_period date default null,
  target_user_id uuid default null,
  force_refresh boolean default false
)
returns table (
  generated_count integer,
  updated_count integer,
  skipped_count integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  invoice_period date;
  monthly_amount bigint;
  cleaning_amount bigint;
  security_amount bigint;
  invoice_due_day smallint;
  generated integer := 0;
  updated integer := 0;
  skipped integer := 0;
  rec record;
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  invoice_period := date_trunc(
    'month',
    coalesce(target_period, current_date)
  )::date;

  select monthly_dues, cleaning_fee, security_fee, due_day
  into monthly_amount, cleaning_amount, security_amount, invoice_due_day
  from public.app_settings
  where id = 1;

  if not found then
    raise exception 'App settings not found';
  end if;

  for rec in
    select p.id as user_id, p.status, p.role
    from public.profiles p
    where p.role = 'warga'
      and p.status = 'active'
      and (target_user_id is null or p.id = target_user_id)
  loop
    if exists (
      select 1 from public.dues d
      where d.user_id = rec.user_id
        and d.period = invoice_period
    ) then
      if force_refresh then
        update public.dues
        set amount = monthly_amount,
            cleaning_fee = cleaning_amount,
            security_fee = security_amount,
            due_date = invoice_period + (invoice_due_day - 1),
            updated_at = now()
        where user_id = rec.user_id and period = invoice_period and status = 'pending';

        if found then
          updated := updated + 1;
        else
          skipped := skipped + 1;
        end if;
      else
        skipped := skipped + 1;
      end if;
    else
      insert into public.dues (
        user_id,
        period,
        due_date,
        amount,
        cleaning_fee,
        security_fee,
        status,
        payment_method,
        idempotency_key
      )
      values (
        rec.user_id,
        invoice_period,
        invoice_period + (invoice_due_day - 1),
        monthly_amount,
        cleaning_amount,
        security_amount,
        'pending',
        null,
        concat('due-', rec.user_id::text, '-', to_char(invoice_period, 'YYYY-MM-DD'))
      );

      generated := generated + 1;
    end if;
  end loop;

  return query select generated, updated, skipped;
end;
$$;

create or replace function public.pay_due_invoice(
  due_id_param uuid,
  payment_method text,
  payment_reference text default null,
  idempotency_key text default null,
  paid_by_user_id uuid default null
)
returns table (
  due_id uuid,
  status text,
  receipt_number text,
  transaction_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  due_row public.dues%rowtype;
  transaction_id_value uuid;
  receipt_number_value text;
  effective_idempotency_key text;
  actor_user_id uuid;
begin
  actor_user_id := auth.uid();

  if actor_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select * into due_row from public.dues where id = due_id_param for update;

  if due_row.id is null then
    raise exception 'Due not found';
  end if;

  if not public.is_admin() and due_row.user_id <> actor_user_id then
    raise exception 'Not authorized to pay this due' using errcode = '42501';
  end if;

  if paid_by_user_id is not null and paid_by_user_id <> actor_user_id then
    raise exception 'Payment actor must match authenticated user' using errcode = '42501';
  end if;

  if nullif(btrim($2), '') is null then
    raise exception 'Payment method is required';
  end if;

  effective_idempotency_key := coalesce(
    $4,
    concat('due-', due_row.user_id::text, '-', to_char(due_row.period, 'YYYY-MM-DD'))
  );

  if due_row.status = 'paid' then
    if due_row.idempotency_key = effective_idempotency_key then
      return query
      select due_row.id, due_row.status, due_row.receipt_number, due_row.source_transaction_id;
      return;
    end if;

    raise exception 'Due already paid';
  end if;

  if exists (
    select 1
    from public.dues as other_due
    where other_due.idempotency_key = effective_idempotency_key
      and other_due.id <> due_id_param
  ) then
    raise exception 'Duplicate payment request';
  end if;

  receipt_number_value := coalesce(
    due_row.receipt_number,
    concat('INV-', to_char(now(), 'YYYYMMDD'), '-', substr(md5(random()::text), 1, 8))
  );

  update public.dues
  set idempotency_key = effective_idempotency_key,
      payment_method = $2,
      payment_reference = nullif(btrim($3), ''),
      receipt_number = receipt_number_value,
      paid_at = now(),
      status = 'paid',
      source_transaction_id = null,
      updated_at = now()
  where id = due_id_param;

  insert into public.ledger_transactions (
    receipt_number,
    transaction_date,
    description,
    amount,
    type,
    category,
    person_in_charge,
    created_by,
    due_id,
    source_type
  )
  values (
    receipt_number_value,
    current_date,
    concat('Pembayaran iuran warga - ', (select nama from public.profiles where id = due_row.user_id), ' - ', to_char(due_row.period, 'YYYY-MM')),
    due_row.amount,
    'income',
    'iuran_warga',
    coalesce((select nama from public.profiles where id = paid_by_user_id), 'Pengurus RT'),
    actor_user_id,
    due_row.id,
    'dues'
  )
  returning id into transaction_id_value;

  update public.dues
  set source_transaction_id = transaction_id_value,
      updated_at = now()
  where id = due_id_param;

  return query select due_row.id, 'paid', receipt_number_value, transaction_id_value;
end;
$$;

grant execute on function public.generate_due_invoices(date, uuid, boolean) to authenticated;
grant execute on function public.pay_due_invoice(uuid, text, text, text, uuid) to authenticated;
