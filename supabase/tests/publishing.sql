begin;
insert into auth.users(id) values ('00000000-0000-0000-0000-000000000001') on conflict do nothing;
insert into admin_users values ('00000000-0000-0000-0000-000000000001');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
set local role authenticated;
do $$declare record_uuid uuid;stamp timestamptz;begin
 record_uuid=save_content('posts',null,'{"title":"Test","slug":"test","status":"published"}'::jsonb);
 select updated_at into stamp from posts where posts.id=record_uuid;
 perform save_content('posts',record_uuid,'{"title":"Edited"}',stamp);
 begin perform save_content('posts',record_uuid,'{"title":"Stale"}',stamp);raise exception 'Stale edit accepted';exception when raise_exception then if SQLERRM<>'This record changed. Reload it before saving.' then raise;end if;end;
 begin update posts set slug='changed' where posts.id=record_uuid;raise exception 'Published slug changed';exception when raise_exception then if SQLERRM<>'Published slugs cannot be changed' then raise;end if;end;
end$$;
rollback;

