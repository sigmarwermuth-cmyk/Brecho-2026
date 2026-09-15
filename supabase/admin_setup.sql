-- 1. Adiciona a coluna is_admin à tabela de perfis
alter table public.profiles
add column is_admin boolean default false;

-- 2. Política de Segurança: Admins podem deletar QUALQUER produto
-- Primeiro removemos a política restritiva de delete anterior
drop policy if exists "products_user_delete" on public.products;

-- Criamos a nova política: o usuário pode deletar se for o dono OU se for admin
create policy "products_delete_policy" on public.products
for delete using (
  auth.uid() = user_id or
  exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  )
);

-- 3. Política de Segurança: Admins podem atualizar QUALQUER produto
drop policy if exists "products_user_update" on public.products;
create policy "products_update_policy" on public.products
for update using (
  auth.uid() = user_id or
  exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  )
);

-- 4. Atualiza cache do esquema
notify pgrst, 'reload schema';
