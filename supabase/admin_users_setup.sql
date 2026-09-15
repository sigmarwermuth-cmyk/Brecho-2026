-- 1. Permite que Admins atualizem QUALQUER perfil (para promover/demover outros admins)
drop policy if exists "Usuário Edita Próprio Perfil" on public.profiles;

create policy "Perfis Editaveis por Admin ou Dono" on public.profiles
for update using (
  auth.uid() = id or
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- 2. Permite que Admins vejam a lista completa de perfis (caso a política de leitura pública não baste)
drop policy if exists "Perfis Visíveis" on public.profiles;
create policy "Perfis Visíveis" on public.profiles
for select using (true);

-- Atualiza cache
notify pgrst, 'reload schema';
