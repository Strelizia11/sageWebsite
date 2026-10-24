begin;
insert into auth.users(id) values ('00000000-0000-0000-0000-000000000001') on conflict do nothing;
insert into public.admin_users(user_id) values ('00000000-0000-0000-0000-000000000001');
insert into public.posts(title,slug,status) values ('Visible','visible','published'),('Private','private','draft'),('Archive','archive','archived');
set local role anon;
do $$ begin
 if (select count(*) from public.posts)<>2 then raise exception 'Anonymous content visibility failed'; end if;
 begin insert into public.posts(title,slug) values ('Attack','attack'); raise exception 'Unauthorized write succeeded'; exception when insufficient_privilege then null; end;
end $$;
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
set local role authenticated;
do $$ begin
 begin insert into public.admin_users(user_id) values ('00000000-0000-0000-0000-000000000002'); raise exception 'Self promotion succeeded'; exception when insufficient_privilege then null; end;
 begin insert into public.posts(title,slug) values ('Attack','attack'); raise exception 'Non-admin write succeeded'; exception when insufficient_privilege then null; end;
end $$;
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
set local role authenticated;
insert into public.posts(title,slug,status) values ('Admin draft','admin-draft','draft');
do $$ begin if (select count(*) from public.posts)<>4 then raise exception 'Admin read failed'; end if; end $$;
rollback;
