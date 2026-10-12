-- Disposable authenticated-user fixture required by real promo_codes.submitted_by FK.
-- This file is for the isolated CI database and must never run on Supabase production.
insert into auth.users (id,email) values
 ('11111111-1111-4111-8111-111111111111','admin-ci@example.invalid'),
 ('22222222-2222-4222-8222-222222222222','user-ci@example.invalid');
