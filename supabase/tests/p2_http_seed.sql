-- P2 HTTP integration fixtures. Synthetic data in disposable GitHub Actions PG only.
-- Run after the P2 proposed migration. Never against production.
create role authenticator noinherit login password 'p2-local-only';
grant anon to authenticator;
grant authenticated to authenticator;
grant usage on schema public to authenticator;

insert into public.profiles (id,role,email) values
 ('11111111-1111-4111-8111-111111111111','admin','admin-http@example.invalid'),
 ('22222222-2222-4222-8222-222222222222','user','user-http@example.invalid');

insert into public.stores (id,slug,name,is_active) values
 ('33333333-3333-4333-8333-333333333333','p2-http-active','HTTP active store',true),
 ('44444444-4444-4444-8444-444444444444','p2-http-disabled','HTTP disabled store',false);

insert into public.promo_codes
 (id,store_id,code,destination_url,approved,is_active,expires_at,submitted_by)
 values
 ('55555555-5555-4555-8555-555555555555',
  '33333333-3333-4333-8333-333333333333','P2-HTTP-PENDING',
  'https://example.invalid/http-active',false,true,null,
  '22222222-2222-4222-8222-222222222222'),
 ('66666666-6666-4666-8666-666666666666',
  '44444444-4444-4444-8444-444444444444','P2-HTTP-DISABLED',
  'https://example.invalid/http-disabled',true,true,null,null),
 ('77777777-7777-4777-8777-777777777777',
  '33333333-3333-4333-8333-333333333333','P2-HTTP-EXPIRED',
  'https://example.invalid/http-expired',true,true,now()-interval '1 day',null),
 ('88888888-8888-4888-8888-888888888888',
  '33333333-3333-4333-8333-333333333333','P2-HTTP-LIVE',
  'https://example.invalid/live',true,true,null,null);
