create extension if not exists pgcrypto;

create type public.app_role as enum ('super_admin', 'manager', 'waiter', 'kitchen', 'cashier');
create type public.table_shape as enum ('circle', 'square', 'rectangle');
create type public.table_status as enum (
  'available',
  'occupied',
  'ordering',
  'sent_to_kitchen',
  'in_preparation',
  'ready',
  'needs_payment',
  'closed'
);
create type public.order_status as enum (
  'draft',
  'submitted',
  'in_preparation',
  'ready',
  'served',
  'closed',
  'cancelled'
);
create type public.order_item_status as enum (
  'draft',
  'submitted',
  'preparing',
  'ready',
  'served',
  'voided'
);
create type public.payment_method as enum ('cash', 'card', 'transfer', 'other');

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  active boolean not null default true,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.restaurant_settings (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null unique references public.restaurants(id) on delete cascade,
  currency_code text not null default 'USD',
  language text not null default 'en' check (language in ('en', 'es')),
  tax_percent numeric(6,2) not null default 15,
  service_charge_percent numeric(6,2) not null default 10,
  allow_waiter_close_table boolean not null default true,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.restaurant_users (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references public.restaurants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  full_name text not null,
  active boolean not null default true,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id, user_id, role)
);
create index restaurant_users_user_idx on public.restaurant_users(user_id);
create index restaurant_users_restaurant_idx on public.restaurant_users(restaurant_id);

create table public.floors (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  width int not null default 1200,
  height int not null default 800,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index floors_restaurant_idx on public.floors(restaurant_id);

create table public.sections (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  floor_id uuid not null references public.floors(id) on delete cascade,
  name text not null,
  color text,
  sort_order int not null default 0,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.floor_tables (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  floor_id uuid not null references public.floors(id) on delete cascade,
  section_id uuid references public.sections(id) on delete set null,
  table_code text not null,
  display_name text not null,
  shape public.table_shape not null default 'square',
  pos_x numeric(8,2) not null default 0,
  pos_y numeric(8,2) not null default 0,
  width numeric(8,2) not null default 100,
  height numeric(8,2) not null default 100,
  seats int not null default 4,
  is_active boolean not null default true,
  status public.table_status not null default 'available',
  assigned_waiter_id uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id, table_code)
);
create index floor_tables_restaurant_floor_idx on public.floor_tables(restaurant_id, floor_id);
create index floor_tables_waiter_idx on public.floor_tables(assigned_waiter_id);

create table public.waiter_table_assignments (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  floor_table_id uuid not null references public.floor_tables(id) on delete cascade,
  waiter_user_id uuid not null references auth.users(id) on delete cascade,
  assigned_by uuid references auth.users(id),
  assigned_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index waiter_table_assignments_active_idx on public.waiter_table_assignments(restaurant_id, floor_table_id, ended_at);

create table public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  slug text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id, slug)
);

create table public.menu_subcategories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  category_id uuid not null references public.menu_categories(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  category_id uuid not null references public.menu_categories(id) on delete cascade,
  subcategory_id uuid references public.menu_subcategories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null,
  image_url text,
  prep_station text,
  tax_rate numeric(6,4) not null default 0.15,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index menu_items_restaurant_idx on public.menu_items(restaurant_id, category_id, subcategory_id);

create table public.modifier_groups (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  description text,
  is_required boolean not null default false,
  min_select int not null default 0,
  max_select int not null default 1,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.modifier_options (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  modifier_group_id uuid not null references public.modifier_groups(id) on delete cascade,
  name text not null,
  price_delta numeric(10,2) not null default 0,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.menu_item_modifier_groups (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  modifier_group_id uuid not null references public.modifier_groups(id) on delete cascade,
  sort_order int not null default 0,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (menu_item_id, modifier_group_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  floor_table_id uuid not null references public.floor_tables(id) on delete restrict,
  waiter_id uuid not null references auth.users(id) on delete restrict,
  order_number int not null,
  status public.order_status not null default 'draft',
  opened_at timestamptz not null default now(),
  submitted_at timestamptz,
  closed_at timestamptz,
  subtotal numeric(12,2) not null default 0,
  tax_total numeric(12,2) not null default 0,
  service_charge_total numeric(12,2) not null default 0,
  discount_total numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id, order_number)
);
create index orders_restaurant_status_idx on public.orders(restaurant_id, status, opened_at desc);
create index orders_table_idx on public.orders(floor_table_id, status);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid not null references public.menu_items(id) on delete restrict,
  quantity int not null default 1,
  unit_price numeric(10,2) not null,
  item_total numeric(12,2) not null,
  status public.order_item_status not null default 'draft',
  note text,
  modifier_summary text,
  sent_to_kitchen_at timestamptz,
  kitchen_started_at timestamptz,
  ready_at timestamptz,
  served_at timestamptz,
  voided_at timestamptz,
  void_reason text,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index order_items_order_idx on public.order_items(order_id, status, created_at);

create table public.order_item_modifiers (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  modifier_option_id uuid references public.modifier_options(id) on delete set null,
  name_snapshot text not null,
  price_delta_snapshot numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);
create index order_item_modifiers_item_idx on public.order_item_modifiers(order_item_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  payment_method public.payment_method not null,
  amount numeric(12,2) not null,
  tip_amount numeric(12,2) not null default 0,
  paid_at timestamptz not null default now(),
  note text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (order_id)
);
create index payments_restaurant_paid_idx on public.payments(restaurant_id, paid_at desc);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status public.order_status,
  to_status public.order_status not null,
  changed_by uuid references auth.users(id),
  changed_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  actor_user_id uuid references auth.users(id),
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_restaurant_idx on public.audit_logs(restaurant_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.restaurant_users ru
    where ru.user_id = auth.uid()
      and ru.role = 'super_admin'
      and ru.active = true
  );
$$;

create or replace function public.is_restaurant_member(_restaurant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_super_admin()
    or exists (
      select 1
      from public.restaurant_users ru
      where ru.user_id = auth.uid()
        and ru.restaurant_id = _restaurant_id
        and ru.active = true
    );
$$;

create or replace function public.has_restaurant_role(_restaurant_id uuid, _roles public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_super_admin()
    or exists (
      select 1
      from public.restaurant_users ru
      where ru.user_id = auth.uid()
        and ru.restaurant_id = _restaurant_id
        and ru.active = true
        and ru.role = any(_roles)
    );
$$;

grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.is_restaurant_member(uuid) to authenticated;
grant execute on function public.has_restaurant_role(uuid, public.app_role[]) to authenticated;

create or replace function public.recalculate_order_totals(_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_restaurant_id uuid;
  v_subtotal numeric(12,2);
  v_tax_percent numeric(6,2);
  v_service_percent numeric(6,2);
  v_tax_total numeric(12,2);
  v_service_total numeric(12,2);
  v_discount_total numeric(12,2);
  v_total numeric(12,2);
begin
  select o.restaurant_id into v_restaurant_id
  from public.orders o
  where o.id = _order_id;

  if v_restaurant_id is null then
    return;
  end if;

  select coalesce(sum(oi.item_total), 0)
    into v_subtotal
  from public.order_items oi
  where oi.order_id = _order_id
    and oi.status <> 'voided';

  select coalesce(rs.tax_percent, 15), coalesce(rs.service_charge_percent, 10)
    into v_tax_percent, v_service_percent
  from public.restaurant_settings rs
  where rs.restaurant_id = v_restaurant_id;

  v_tax_total := round(v_subtotal * (v_tax_percent / 100), 2);
  v_service_total := round(v_subtotal * (v_service_percent / 100), 2);
  v_discount_total := 0;
  v_total := v_subtotal + v_tax_total + v_service_total - v_discount_total;

  update public.orders
  set subtotal = v_subtotal,
      tax_total = v_tax_total,
      service_charge_total = v_service_total,
      discount_total = v_discount_total,
      total = v_total,
      updated_at = now()
  where id = _order_id;
end;
$$;

create or replace function public.on_order_item_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recalculate_order_totals(old.order_id);
    return old;
  else
    perform public.recalculate_order_totals(new.order_id);
    return new;
  end if;
end;
$$;

create or replace function public.on_order_item_modifier_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
begin
  if tg_op = 'DELETE' then
    select oi.order_id into v_order_id from public.order_items oi where oi.id = old.order_item_id;
  else
    select oi.order_id into v_order_id from public.order_items oi where oi.id = new.order_item_id;
  end if;

  if v_order_id is not null then
    perform public.recalculate_order_totals(v_order_id);
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create or replace function public.on_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.order_status_history (
      restaurant_id,
      order_id,
      from_status,
      to_status,
      changed_by,
      changed_at
    ) values (
      new.restaurant_id,
      new.id,
      old.status,
      new.status,
      auth.uid(),
      now()
    );
  end if;

  return new;
end;
$$;

create trigger set_updated_at_restaurants before update on public.restaurants
for each row execute function public.set_updated_at();
create trigger set_updated_at_restaurant_settings before update on public.restaurant_settings
for each row execute function public.set_updated_at();
create trigger set_updated_at_restaurant_users before update on public.restaurant_users
for each row execute function public.set_updated_at();
create trigger set_updated_at_floors before update on public.floors
for each row execute function public.set_updated_at();
create trigger set_updated_at_sections before update on public.sections
for each row execute function public.set_updated_at();
create trigger set_updated_at_floor_tables before update on public.floor_tables
for each row execute function public.set_updated_at();
create trigger set_updated_at_waiter_assignments before update on public.waiter_table_assignments
for each row execute function public.set_updated_at();
create trigger set_updated_at_menu_categories before update on public.menu_categories
for each row execute function public.set_updated_at();
create trigger set_updated_at_menu_subcategories before update on public.menu_subcategories
for each row execute function public.set_updated_at();
create trigger set_updated_at_menu_items before update on public.menu_items
for each row execute function public.set_updated_at();
create trigger set_updated_at_modifier_groups before update on public.modifier_groups
for each row execute function public.set_updated_at();
create trigger set_updated_at_modifier_options before update on public.modifier_options
for each row execute function public.set_updated_at();
create trigger set_updated_at_menu_item_modifier_groups before update on public.menu_item_modifier_groups
for each row execute function public.set_updated_at();
create trigger set_updated_at_orders before update on public.orders
for each row execute function public.set_updated_at();
create trigger set_updated_at_order_items before update on public.order_items
for each row execute function public.set_updated_at();

create trigger order_items_recalculate_after_change
after insert or update or delete on public.order_items
for each row execute function public.on_order_item_change();

create trigger order_item_modifiers_recalculate_after_change
after insert or update or delete on public.order_item_modifiers
for each row execute function public.on_order_item_modifier_change();

create trigger orders_status_history_after_update
after update on public.orders
for each row execute function public.on_order_status_change();

alter table public.restaurants enable row level security;
alter table public.restaurant_settings enable row level security;
alter table public.restaurant_users enable row level security;
alter table public.floors enable row level security;
alter table public.sections enable row level security;
alter table public.floor_tables enable row level security;
alter table public.waiter_table_assignments enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_subcategories enable row level security;
alter table public.menu_items enable row level security;
alter table public.modifier_groups enable row level security;
alter table public.modifier_options enable row level security;
alter table public.menu_item_modifier_groups enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_item_modifiers enable row level security;
alter table public.payments enable row level security;
alter table public.order_status_history enable row level security;
alter table public.audit_logs enable row level security;

create policy restaurants_select on public.restaurants
for select using (public.is_restaurant_member(id));
create policy restaurants_modify on public.restaurants
for all using (public.has_restaurant_role(id, array['manager','super_admin']::public.app_role[]))
with check (public.has_restaurant_role(id, array['manager','super_admin']::public.app_role[]));

create policy restaurant_settings_select on public.restaurant_settings
for select using (public.is_restaurant_member(restaurant_id));
create policy restaurant_settings_modify on public.restaurant_settings
for all using (public.has_restaurant_role(restaurant_id, array['manager','super_admin']::public.app_role[]))
with check (public.has_restaurant_role(restaurant_id, array['manager','super_admin']::public.app_role[]));

create policy restaurant_users_select on public.restaurant_users
for select using (
  auth.uid() = user_id
  or public.is_super_admin()
  or (
    restaurant_id is not null
    and public.has_restaurant_role(restaurant_id, array['manager','super_admin']::public.app_role[])
  )
);
create policy restaurant_users_modify on public.restaurant_users
for all using (
  public.is_super_admin()
  or (
    restaurant_id is not null
    and public.has_restaurant_role(restaurant_id, array['manager','super_admin']::public.app_role[])
  )
)
with check (
  public.is_super_admin()
  or (
    restaurant_id is not null
    and public.has_restaurant_role(restaurant_id, array['manager','super_admin']::public.app_role[])
  )
);

create policy floors_select on public.floors
for select using (public.is_restaurant_member(restaurant_id));
create policy floors_modify on public.floors
for all using (public.has_restaurant_role(restaurant_id, array['manager','super_admin']::public.app_role[]))
with check (public.has_restaurant_role(restaurant_id, array['manager','super_admin']::public.app_role[]));

create policy sections_select on public.sections
for select using (public.is_restaurant_member(restaurant_id));
create policy sections_modify on public.sections
for all using (public.has_restaurant_role(restaurant_id, array['manager','super_admin']::public.app_role[]))
with check (public.has_restaurant_role(restaurant_id, array['manager','super_admin']::public.app_role[]));

create policy floor_tables_select on public.floor_tables
for select using (public.is_restaurant_member(restaurant_id));
create policy floor_tables_modify on public.floor_tables
for all using (public.has_restaurant_role(restaurant_id, array['manager','super_admin','waiter','cashier']::public.app_role[]))
with check (public.has_restaurant_role(restaurant_id, array['manager','super_admin','waiter','cashier']::public.app_role[]));

create policy waiter_table_assignments_select on public.waiter_table_assignments
for select using (public.is_restaurant_member(restaurant_id));
create policy waiter_table_assignments_modify on public.waiter_table_assignments
for all using (public.has_restaurant_role(restaurant_id, array['manager','super_admin']::public.app_role[]))
with check (public.has_restaurant_role(restaurant_id, array['manager','super_admin']::public.app_role[]));

create policy menu_categories_select on public.menu_categories
for select using (public.is_restaurant_member(restaurant_id));
create policy menu_categories_modify on public.menu_categories
for all using (public.has_restaurant_role(restaurant_id, array['manager','super_admin']::public.app_role[]))
with check (public.has_restaurant_role(restaurant_id, array['manager','super_admin']::public.app_role[]));

create policy menu_subcategories_select on public.menu_subcategories
for select using (public.is_restaurant_member(restaurant_id));
create policy menu_subcategories_modify on public.menu_subcategories
for all using (public.has_restaurant_role(restaurant_id, array['manager','super_admin']::public.app_role[]))
with check (public.has_restaurant_role(restaurant_id, array['manager','super_admin']::public.app_role[]));

create policy menu_items_select on public.menu_items
for select using (public.is_restaurant_member(restaurant_id));
create policy menu_items_modify on public.menu_items
for all using (public.has_restaurant_role(restaurant_id, array['manager','super_admin']::public.app_role[]))
with check (public.has_restaurant_role(restaurant_id, array['manager','super_admin']::public.app_role[]));

create policy modifier_groups_select on public.modifier_groups
for select using (public.is_restaurant_member(restaurant_id));
create policy modifier_groups_modify on public.modifier_groups
for all using (public.has_restaurant_role(restaurant_id, array['manager','super_admin']::public.app_role[]))
with check (public.has_restaurant_role(restaurant_id, array['manager','super_admin']::public.app_role[]));

create policy modifier_options_select on public.modifier_options
for select using (public.is_restaurant_member(restaurant_id));
create policy modifier_options_modify on public.modifier_options
for all using (public.has_restaurant_role(restaurant_id, array['manager','super_admin']::public.app_role[]))
with check (public.has_restaurant_role(restaurant_id, array['manager','super_admin']::public.app_role[]));

create policy menu_item_modifier_groups_select on public.menu_item_modifier_groups
for select using (public.is_restaurant_member(restaurant_id));
create policy menu_item_modifier_groups_modify on public.menu_item_modifier_groups
for all using (public.has_restaurant_role(restaurant_id, array['manager','super_admin']::public.app_role[]))
with check (public.has_restaurant_role(restaurant_id, array['manager','super_admin']::public.app_role[]));

create policy orders_select on public.orders
for select using (public.is_restaurant_member(restaurant_id));
create policy orders_insert on public.orders
for insert with check (
  public.has_restaurant_role(restaurant_id, array['manager','waiter','cashier','super_admin']::public.app_role[])
);
create policy orders_update on public.orders
for update using (
  public.has_restaurant_role(restaurant_id, array['manager','waiter','cashier','kitchen','super_admin']::public.app_role[])
)
with check (
  public.has_restaurant_role(restaurant_id, array['manager','waiter','cashier','kitchen','super_admin']::public.app_role[])
);
create policy orders_delete on public.orders
for delete using (public.has_restaurant_role(restaurant_id, array['manager','super_admin']::public.app_role[]));

create policy order_items_select on public.order_items
for select using (public.is_restaurant_member(restaurant_id));
create policy order_items_insert on public.order_items
for insert with check (
  public.has_restaurant_role(restaurant_id, array['manager','waiter','cashier','super_admin']::public.app_role[])
);
create policy order_items_update on public.order_items
for update using (
  public.has_restaurant_role(restaurant_id, array['manager','waiter','cashier','kitchen','super_admin']::public.app_role[])
)
with check (
  public.has_restaurant_role(restaurant_id, array['manager','waiter','cashier','kitchen','super_admin']::public.app_role[])
);
create policy order_items_delete on public.order_items
for delete using (
  public.has_restaurant_role(restaurant_id, array['manager','waiter','super_admin']::public.app_role[])
);

create policy order_item_modifiers_select on public.order_item_modifiers
for select using (public.is_restaurant_member(restaurant_id));
create policy order_item_modifiers_modify on public.order_item_modifiers
for all using (
  public.has_restaurant_role(restaurant_id, array['manager','waiter','cashier','super_admin']::public.app_role[])
)
with check (
  public.has_restaurant_role(restaurant_id, array['manager','waiter','cashier','super_admin']::public.app_role[])
);

create policy payments_select on public.payments
for select using (public.is_restaurant_member(restaurant_id));
create policy payments_insert on public.payments
for insert with check (
  public.has_restaurant_role(restaurant_id, array['manager','waiter','cashier','super_admin']::public.app_role[])
);
create policy payments_update on public.payments
for update using (public.has_restaurant_role(restaurant_id, array['manager','cashier','super_admin']::public.app_role[]));

create policy order_status_history_select on public.order_status_history
for select using (public.is_restaurant_member(restaurant_id));
create policy order_status_history_insert on public.order_status_history
for insert with check (public.is_restaurant_member(restaurant_id));

create policy audit_logs_select on public.audit_logs
for select using (public.has_restaurant_role(restaurant_id, array['manager','super_admin']::public.app_role[]));
create policy audit_logs_insert on public.audit_logs
for insert with check (public.is_restaurant_member(restaurant_id));
