-- SQL Editor do projeto: cole e execute uma vez.
-- Depois recarregue o app (Vite precisa das env reais em client/.env).

create table if not exists public.products (
  id bigint generated always as identity primary key,
  title text not null,
  description text not null default '',
  price numeric(10, 2) not null,
  size text,
  condition text not null,
  image_url text not null,
  category text not null,
  status text not null default 'disponivel',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  bio text,
  website text,
  updated_at timestamptz not null default now()
);

create index if not exists products_created_at_idx
  on public.products (created_at desc);

alter table public.products enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
  on public.products
  for select
  to anon, authenticated
  using (true);

drop policy if exists "profiles_public_read" on public.profiles;
create policy "profiles_public_read"
  on public.profiles
  for select
  to anon, authenticated
  using (true);

create policy "profiles_user_update"
  on public.profiles
  for all
  to authenticated
  using (auth.uid() = id);

grant usage on schema public to anon, authenticated;
grant select on table public.products to anon, authenticated;
grant select on table public.profiles to anon, authenticated;

insert into public.products (title, description, price, size, condition, image_url, category)
select *
from (
  values
    (
      'Jaqueta Jeans Vintage',
      'Jaqueta jeans clássica em ótimo estado.',
      89.90,
      'M',
      'Seminovo',
      'https://images.unsplash.com/photo-1576995792276-77f75893744a?w=400&q=80',
      'Casacos'
    ),
    (
      'Vestido Floral Anos 70',
      'Vestido floral leve, peça única.',
      120.00,
      'P',
      'Novo',
      'https://images.unsplash.com/photo-1572804013309-59a88b7eae7a?w=400&q=80',
      'Vestidos'
    ),
    (
      'Tênis Casual Retrô',
      'Tênis casual confortável para o dia a dia.',
      150.00,
      '40',
      'Usado',
      'https://images.unsplash.com/photo-1542291026-7a9dcaaa873b?w=400&q=80',
      'Calçados'
    ),
    (
      'Camisa de Linho Bege',
      'Camisa de linho em tom bege.',
      45.00,
      'G',
      'Seminovo',
      'https://images.unsplash.com/photo-1596755094514-f870346a95a3?w=400&q=80',
      'Camisas'
    )
) as seed(title, description, price, size, condition, image_url, category)
where not exists (select 1 from public.products);

notify pgrst, 'reload schema';
