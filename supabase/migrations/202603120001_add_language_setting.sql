alter table public.restaurant_settings
add column if not exists language text not null default 'en'
check (language in ('en', 'es'));
