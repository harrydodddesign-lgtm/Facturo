-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- CLIENTS TABLE
create table clients (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  contact text,
  address text,
  preferred_currency text default 'EUR',
  client_code text not null,
  notes text,
  nif text,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TEMPLATES TABLE
create table templates (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  layout text not null default 'minimal', -- 'minimal' or 'detailed'
  fields jsonb default '{}'::jsonb, -- { showIVA, showIRPF, showFooterNotes, showSecondaryCurrency }
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- INVOICES TABLE
create table invoices (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  client_id uuid references clients(id) not null,
  template_id uuid references templates(id),
  invoice_number text not null,
  date date not null,
  due_date date not null,
  line_items jsonb default '[]'::jsonb, -- Array of { description, quantity, unit_price }
  primary_currency text default 'EUR',
  secondary_currency text,
  exchange_rate_used numeric,
  show_secondary_currency boolean default false,
  totals jsonb default '{}'::jsonb, -- { subtotal, iva, irpf, total } (all in EUR)
  status text default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  sent_at timestamptz,
  paid_at timestamptz,
  submitted_to_accountant boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SETTINGS TABLE
create table settings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  invoice_prefix text default 'INV',
  default_iva numeric default 21,
  default_irpf numeric default 15,
  accountant_mode boolean default false,
  company_name text,
  company_address text,
  tax_id text,
  company_email text,
  company_phone text,
  bank_name text,
  iban text,
  swift_bic text,
  payment_terms integer default 30,
  invoice_footer text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint settings_user_id_key unique (user_id)
);

-- RLS POLICIES

-- Enable RLS
alter table clients enable row level security;
alter table templates enable row level security;
alter table invoices enable row level security;
alter table settings enable row level security;

-- Clients Policies
create policy "Users can view their own clients" on clients
  for select using (auth.uid() = user_id);

create policy "Users can insert their own clients" on clients
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own clients" on clients
  for update using (auth.uid() = user_id);

create policy "Users can delete their own clients" on clients
  for delete using (auth.uid() = user_id);

-- Templates Policies
create policy "Users can view their own templates" on templates
  for select using (auth.uid() = user_id);

create policy "Users can insert their own templates" on templates
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own templates" on templates
  for update using (auth.uid() = user_id);

create policy "Users can delete their own templates" on templates
  for delete using (auth.uid() = user_id);

-- Invoices Policies
create policy "Users can view their own invoices" on invoices
  for select using (auth.uid() = user_id);

create policy "Users can insert their own invoices" on invoices
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own invoices" on invoices
  for update using (auth.uid() = user_id);

create policy "Users can delete their own invoices" on invoices
  for delete using (auth.uid() = user_id);

-- Settings Policies
create policy "Users can view their own settings" on settings
  for select using (auth.uid() = user_id);

create policy "Users can insert their own settings" on settings
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own settings" on settings
  for update using (auth.uid() = user_id);

-- INDEXES
create index clients_user_id_idx on clients(user_id);
create index templates_user_id_idx on templates(user_id);
create index invoices_user_id_idx on invoices(user_id);
create index invoices_client_id_idx on invoices(client_id);
create index settings_user_id_idx on settings(user_id);

-- ============================================================
-- MIGRATION: Run these if updating an existing database
-- ============================================================
-- alter table clients add column if not exists nif text;
-- alter table clients add column if not exists email text;
-- alter table invoices add column if not exists status text default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled'));
-- alter table invoices add column if not exists sent_at timestamptz;
-- alter table invoices add column if not exists paid_at timestamptz;
-- alter table invoices add column if not exists submitted_to_accountant boolean default false;
-- alter table settings add column if not exists company_name text;
-- alter table settings add column if not exists company_address text;
-- alter table settings add column if not exists tax_id text;
-- alter table settings add column if not exists company_email text;
-- alter table settings add column if not exists company_phone text;
-- alter table settings add column if not exists bank_name text;
-- alter table settings add column if not exists iban text;
-- alter table settings add column if not exists swift_bic text;
-- alter table settings add column if not exists payment_terms integer default 30;
-- alter table settings add column if not exists invoice_footer text;
