alter table public.dues
  add column if not exists payment_submitted_at timestamptz;

alter table public.dues
  drop constraint if exists dues_status_check;

alter table public.dues
  add constraint dues_status_check
  check (status in ('pending', 'awaiting_verification', 'paid'));

create or replace function public.request_due_payment(
  due_id_param uuid,
  payment_method_param text,
  payment_reference_param text default null
)
returns table (
  due_id uuid,
  status text,
  payment_submitted_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  due_row public.dues%rowtype;
  actor_user_id uuid;
begin
  actor_user_id := auth.uid();

  if actor_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select * into due_row
  from public.dues
  where id = due_id_param
  for update;

  if due_row.id is null then
    raise exception 'Due not found';
  end if;

  if due_row.user_id <> actor_user_id then
    raise exception 'Not authorized to request payment for this due' using errcode = '42501';
  end if;

  if nullif(btrim(payment_method_param), '') is null then
    raise exception 'Payment method is required';
  end if;

  if payment_method_param not in ('cash', 'bank_transfer', 'qris') then
    raise exception 'Unsupported payment method';
  end if;

  if length(payment_reference_param) > 120 then
    raise exception 'Payment reference is too long';
  end if;

  if due_row.status = 'awaiting_verification' then
    return query
    select due_row.id, due_row.status, due_row.payment_submitted_at;
    return;
  end if;

  if due_row.status <> 'pending' then
    raise exception 'Due is not awaiting payment';
  end if;

  update public.dues
  set status = 'awaiting_verification',
      payment_method = btrim(payment_method_param),
      payment_reference = nullif(btrim(payment_reference_param), ''),
      payment_submitted_at = now(),
      updated_at = now()
  where id = due_id_param;

  return query
  select due_id_param, 'awaiting_verification', now();
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

  if actor_user_id is null or not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  if paid_by_user_id is not null and paid_by_user_id <> actor_user_id then
    raise exception 'Payment actor must match authenticated user' using errcode = '42501';
  end if;

  select * into due_row
  from public.dues
  where id = due_id_param
  for update;

  if due_row.id is null then
    raise exception 'Due not found';
  end if;

  if nullif(btrim($2), '') is null then
    raise exception 'Payment method is required';
  end if;

  if $2 not in ('cash', 'bank_transfer', 'qris') then
    raise exception 'Unsupported payment method';
  end if;

  if length($3) > 120 then
    raise exception 'Payment reference is too long';
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

  if due_row.status not in ('pending', 'awaiting_verification') then
    raise exception 'Due cannot be verified';
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
      payment_reference = coalesce(nullif(btrim($3), ''), due_row.payment_reference),
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
    concat(
      'Pembayaran iuran warga - ',
      (select nama from public.profiles where id = due_row.user_id),
      ' - ',
      to_char(due_row.period, 'YYYY-MM')
    ),
    due_row.amount,
    'income',
    'iuran_warga',
    coalesce((select nama from public.profiles where id = actor_user_id), 'Pengurus RT'),
    actor_user_id,
    due_row.id,
    'dues'
  )
  returning id into transaction_id_value;

  update public.dues
  set source_transaction_id = transaction_id_value,
      updated_at = now()
  where id = due_id_param;

  return query
  select due_row.id, 'paid', receipt_number_value, transaction_id_value;
end;
$$;

grant execute on function public.request_due_payment(uuid, text, text) to authenticated;
grant execute on function public.pay_due_invoice(uuid, text, text, text, uuid) to authenticated;
