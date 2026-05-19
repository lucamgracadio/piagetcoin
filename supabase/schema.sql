-- ============================================================
-- PiagetCoin — Schema do Supabase
-- Execute este arquivo no SQL Editor do Supabase
-- ============================================================

-- Habilitar extensões necessárias
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABELA: profiles (estende auth.users do Supabase)
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  email       text not null,
  role        text not null check (role in ('admin', 'professor', 'student')),
  avatar_url  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ============================================================
-- TABELA: classrooms (turmas)
-- ============================================================
create table if not exists public.classrooms (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  professor_id uuid references public.profiles(id) on delete set null,
  created_at  timestamptz default now()
);

-- ============================================================
-- TABELA: student_classrooms (aluno ↔ turma)
-- ============================================================
create table if not exists public.student_classrooms (
  student_id   uuid references public.profiles(id) on delete cascade,
  classroom_id uuid references public.classrooms(id) on delete cascade,
  joined_at    timestamptz default now(),
  primary key (student_id, classroom_id)
);

-- ============================================================
-- TABELA: wallets (carteiras Ethereum dos usuários)
-- ============================================================
create table if not exists public.wallets (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  address        text not null unique,
  -- Saldo off-chain (espelho do on-chain, atualizado após cada envio)
  balance_pgt    numeric(20, 8) default 0,
  connected_at   timestamptz default now(),
  updated_at     timestamptz default now(),
  unique(user_id)
);

-- ============================================================
-- TABELA: transactions (histórico de envios de PGT)
-- ============================================================
create table if not exists public.transactions (
  id              uuid primary key default uuid_generate_v4(),
  from_user_id    uuid references public.profiles(id) on delete set null,
  to_user_id      uuid references public.profiles(id) on delete set null,
  amount          numeric(20, 8) not null,
  reason          text,
  tx_hash         text,          -- hash da transação on-chain (opcional)
  status          text not null default 'pending' check (status in ('pending', 'confirmed', 'failed')),
  classroom_id    uuid references public.classrooms(id) on delete set null,
  created_at      timestamptz default now()
);

-- ============================================================
-- TABELA: activities (atividades escolares)
-- ============================================================
create table if not exists public.activities (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  description  text,
  reward_pgt   numeric(10, 2) not null default 0,
  classroom_id uuid references public.classrooms(id) on delete cascade,
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz default now()
);

-- ============================================================
-- ÍNDICES para performance
-- ============================================================
create index if not exists idx_wallets_user_id       on public.wallets(user_id);
create index if not exists idx_wallets_address        on public.wallets(address);
create index if not exists idx_transactions_to_user   on public.transactions(to_user_id);
create index if not exists idx_transactions_from_user on public.transactions(from_user_id);
create index if not exists idx_profiles_role          on public.profiles(role);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.profiles          enable row level security;
alter table public.classrooms        enable row level security;
alter table public.student_classrooms enable row level security;
alter table public.wallets           enable row level security;
alter table public.transactions      enable row level security;
alter table public.activities        enable row level security;

-- Profiles: cada um vê o próprio, admins veem todos
create policy "Usuários veem próprio perfil" on public.profiles
  for select using (auth.uid() = id);

create policy "Admins veem todos os perfis" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'professor')
    )
  );

create policy "Usuários atualizam próprio perfil" on public.profiles
  for update using (auth.uid() = id);

create policy "Inserir perfil próprio" on public.profiles
  for insert with check (auth.uid() = id);

-- Wallets: dono vê a própria, admins/professores veem todas
create policy "Dono vê própria wallet" on public.wallets
  for select using (auth.uid() = user_id);

create policy "Admins/professores veem todas wallets" on public.wallets
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'professor')
    )
  );

create policy "Dono insere/atualiza própria wallet" on public.wallets
  for all using (auth.uid() = user_id);

-- Transactions: remetente e destinatário veem as próprias
create policy "Ver próprias transações" on public.transactions
  for select using (
    auth.uid() = from_user_id or auth.uid() = to_user_id
  );

create policy "Admins/professores veem todas transações" on public.transactions
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'professor')
    )
  );

create policy "Admins/professores inserem transações" on public.transactions
  for insert with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'professor')
    )
  );

create policy "Admins atualizam transações" on public.transactions
  for update using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Classrooms: todos autenticados veem
create policy "Todos veem turmas" on public.classrooms
  for select using (auth.uid() is not null);

create policy "Admins/professores criam turmas" on public.classrooms
  for insert with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'professor')
    )
  );

-- Activities: todos autenticados veem
create policy "Todos veem atividades" on public.activities
  for select using (auth.uid() is not null);

-- student_classrooms
create policy "Alunos veem próprias turmas" on public.student_classrooms
  for select using (auth.uid() = student_id);

create policy "Admins/professores veem todas matrículas" on public.student_classrooms
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'professor')
    )
  );

-- ============================================================
-- FUNÇÃO: criar profile automaticamente após signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger para criar profile automaticamente
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- DADOS INICIAIS DE EXEMPLO (opcional)
-- ============================================================
-- Descomente para criar uma turma padrão
-- insert into public.classrooms (name, description)
-- values ('Turma 5A - 2025', 'Turma piloto do PiagetCoin');
