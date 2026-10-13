grant update on public.app_settings to authenticated;

drop policy if exists "Admins can update app settings" on public.app_settings;

create policy "Admins can update app settings"
  on public.app_settings for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
