create table public.admin_users(user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.admin_users enable row level security;
create function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$select exists(select 1 from public.admin_users where user_id=auth.uid())$$;
create policy admin_self on public.admin_users for select to authenticated using(user_id=auth.uid());
grant select on public.admin_users to authenticated;

create table public.media_assets(id uuid primary key default gen_random_uuid(),path text unique not null,name text not null,mime text not null check(mime in ('image/png','image/jpeg','image/webp','application/pdf')),size bigint not null check(size>0 and size<=20971520),alt text not null default '',state text not null default 'pending' check(state in ('pending','ready')),created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.site_settings(id uuid primary key default gen_random_uuid(),singleton boolean not null default true unique check(singleton),name text not null default 'Universidad de Dagupan – Scholars’ Association for Greater Excellence',introduction text not null default '',background text not null default '',description text not null default '',mission text not null default '',vision text not null default '',objectives text not null default '',email text not null default '',phone text not null default '',location text not null default '',social_url text not null default '',social_links text not null default '',quick_links text not null default '',logo_id uuid references public.media_assets,updated_at timestamptz not null default now());
insert into public.site_settings(singleton) values(true);
create table public.academic_terms(id uuid primary key default gen_random_uuid(),name text not null,starts_on date not null,ends_on date not null check(ends_on>=starts_on),is_current boolean not null default false,updated_at timestamptz not null default now());
create unique index one_current_term on public.academic_terms(is_current) where is_current;
create table public.people(id uuid primary key default gen_random_uuid(),name text not null check(length(trim(name))>0),bio text not null default '',department text not null default '',batch text not null default '',photo_id uuid references public.media_assets,status text not null default 'draft' check(status in ('draft','published','archived')),created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.positions(id integer primary key,name text not null unique);
insert into public.positions values(1,'President'),(2,'Vice President'),(3,'Secretary'),(4,'Sub-Secretary'),(5,'VP for Projects and Development'),(6,'VP for Finance'),(7,'VP for Graphics and Media Information'),(8,'VP for Internal and External Affairs');
create table public.committees(id integer primary key,name text not null unique,position_id integer not null unique references public.positions);
insert into public.committees values(1,'Projects and Development',5),(2,'Finance',6),(3,'Graphics and Media Information',7),(4,'Internal and External Affairs',8);
create table public.officer_assignments(id uuid primary key default gen_random_uuid(),person_id uuid not null references public.people,term_id uuid not null references public.academic_terms,position_id integer not null references public.positions,updated_at timestamptz not null default now(),unique(term_id,position_id));
create table public.committee_memberships(id uuid primary key default gen_random_uuid(),person_id uuid not null references public.people,term_id uuid not null references public.academic_terms,committee_id integer not null references public.committees,role text not null check(role in ('member','co_head')),updated_at timestamptz not null default now(),unique(person_id,term_id,committee_id));
create unique index one_cohead on public.committee_memberships(term_id,committee_id) where role='co_head';

do $$declare t text; begin foreach t in array array['posts','examinations','results','activities'] loop
 execute format('create table public.%I(id uuid primary key default gen_random_uuid(),title text not null check(length(trim(title))>0),slug text not null unique check(slug ~ ''^[a-z0-9]+(-[a-z0-9]+)*$''),excerpt text not null default '''',body text not null default '''',status text not null default ''draft'' check(status in (''draft'',''published'',''archived'')),cover_id uuid references public.media_assets,published_at timestamptz,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),created_by uuid references auth.users,updated_by uuid references auth.users)',t);
 execute format('create index on public.%I(status,published_at desc,id)',t);
end loop; end $$;
alter table public.posts add type text not null default 'news' check(type in ('news','announcement')), add featured boolean not null default false,add important boolean not null default false;
alter table public.examinations add starts_at timestamptz,add venue text not null default '',add instructions text not null default '',add reminders text not null default '',add cancelled boolean not null default false,add check(status='draft' or starts_at is not null);
alter table public.results add examination_id uuid not null references public.examinations;
alter table public.activities add starts_at timestamptz,add ends_at timestamptz,add venue text not null default '',add highlights text not null default '',add check(ends_at is null or ends_at>=starts_at),add check(status='draft' or starts_at is not null);
create table public.post_attachments(id uuid primary key default gen_random_uuid(),parent_id uuid not null references public.posts on delete cascade,asset_id uuid not null references public.media_assets,caption text not null default '',sort_order integer not null default 0);
create table public.result_attachments(id uuid primary key default gen_random_uuid(),parent_id uuid not null references public.results on delete cascade,asset_id uuid not null references public.media_assets,caption text not null default '',sort_order integer not null default 0);
create table public.activity_media(id uuid primary key default gen_random_uuid(),parent_id uuid not null references public.activities on delete cascade,asset_id uuid not null references public.media_assets,caption text not null default '',sort_order integer not null default 0);

create function public.touch_record() returns trigger language plpgsql set search_path=public as $$begin new.updated_at=clock_timestamp();return new;end$$;
create function public.publish_record() returns trigger language plpgsql set search_path=public as $$begin
 if TG_OP='UPDATE' and old.published_at is not null and new.slug<>old.slug then raise exception 'Published slugs cannot be changed';end if;
 if TG_OP='INSERT' then new.created_by=auth.uid(); end if; new.updated_by=auth.uid();
 if new.status in ('published','archived') and new.published_at is null then new.published_at=now();end if;
 return new;end$$;
do $$declare t text; begin foreach t in array array['posts','examinations','results','activities','people','site_settings','academic_terms','officer_assignments','committee_memberships','media_assets'] loop
 execute format('create trigger touch before update on public.%I for each row execute function public.touch_record()',t);
end loop;
foreach t in array array['posts','examinations','results','activities'] loop execute format('create trigger publishing before insert or update on public.%I for each row execute function public.publish_record()',t);end loop;end$$;

create function public.check_leadership() returns trigger language plpgsql security definer set search_path=public as $$begin
 perform 1 from public.academic_terms where id=new.term_id for update;
 if TG_TABLE_NAME='officer_assignments' then
  if exists(select 1 from committee_memberships m join committees c on c.id=m.committee_id where c.position_id=new.position_id and m.term_id=new.term_id and m.person_id=new.person_id and m.role='co_head') then raise exception 'Head and co-head must be different people';end if;
 elsif new.role='co_head' then
  if exists(select 1 from officer_assignments o join committees c on c.position_id=o.position_id where c.id=new.committee_id and o.term_id=new.term_id and o.person_id=new.person_id) then raise exception 'Head and co-head must be different people';end if;
 end if;return new;end$$;
create trigger leadership before insert or update on public.officer_assignments for each row execute function public.check_leadership();
create trigger leadership before insert or update on public.committee_memberships for each row execute function public.check_leadership();

do $$declare t text;begin foreach t in array array['posts','examinations','results','activities','people','site_settings','academic_terms','officer_assignments','committee_memberships','media_assets','post_attachments','result_attachments','activity_media','positions','committees'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('grant select on public.%I to anon,authenticated',t);
 if t not in ('positions','committees') then
 execute format('grant insert,update,delete on public.%I to authenticated',t);
 execute format('create policy admin_all on public.%I for all to authenticated using(public.is_admin()) with check(public.is_admin())',t);
 end if;
end loop;
foreach t in array array['posts','examinations','results','activities','people'] loop execute format('create policy public_read on public.%I for select to anon,authenticated using(status in (''published'',''archived''))',t);end loop;
foreach t in array array['site_settings','academic_terms','positions','committees'] loop execute format('create policy public_read on public.%I for select to anon,authenticated using(true)',t);end loop;
end$$;
create policy public_read on public.officer_assignments for select to anon,authenticated using(exists(select 1 from public.people where id=person_id and status in ('published','archived')));
create policy public_read on public.committee_memberships for select to anon,authenticated using(exists(select 1 from public.people where id=person_id and status in ('published','archived')));
create policy public_read on public.post_attachments for select to anon,authenticated using(exists(select 1 from public.posts where id=parent_id and status in ('published','archived')));
create policy public_read on public.result_attachments for select to anon,authenticated using(exists(select 1 from public.results where id=parent_id and status in ('published','archived')));
create policy public_read on public.activity_media for select to anon,authenticated using(exists(select 1 from public.activities where id=parent_id and status in ('published','archived')));

create function public.media_public(asset uuid) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from media_assets where id=asset and state='ready') and (
 exists(select 1 from site_settings where logo_id=asset) or exists(select 1 from people where photo_id=asset and status in ('published','archived')) or
 exists(select 1 from posts where cover_id=asset and status in ('published','archived')) or exists(select 1 from examinations where cover_id=asset and status in ('published','archived')) or exists(select 1 from results where cover_id=asset and status in ('published','archived')) or exists(select 1 from activities where cover_id=asset and status in ('published','archived')) or
 exists(select 1 from post_attachments a join posts p on p.id=a.parent_id where a.asset_id=asset and p.status in ('published','archived')) or
 exists(select 1 from result_attachments a join results p on p.id=a.parent_id where a.asset_id=asset and p.status in ('published','archived')) or
 exists(select 1 from activity_media a join activities p on p.id=a.parent_id where a.asset_id=asset and p.status in ('published','archived')))
$$;
create policy public_read on public.media_assets for select to anon,authenticated using(public.media_public(id));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('sage-media','sage-media',false,20971520,array['image/png','image/jpeg','image/webp','application/pdf']) on conflict(id) do nothing;
create policy sage_admin_insert on storage.objects for insert to authenticated with check(bucket_id='sage-media' and public.is_admin());
create policy sage_admin_delete on storage.objects for delete to authenticated using(bucket_id='sage-media' and public.is_admin());
create policy sage_read on storage.objects for select to anon,authenticated using(bucket_id='sage-media' and (public.is_admin() or exists(select 1 from public.media_assets a where a.path=storage.objects.name and public.media_public(a.id))));

-- All content and its attachments save together. Caller remains subject to RLS.
create function public.save_content(target text,record_id uuid,payload jsonb,expected_updated timestamptz default null,attachments jsonb default null) returns uuid language plpgsql set search_path=public as $$
declare result_id uuid; cols text; vals text; assigns text; attachment_table text; item jsonb; current_updated timestamptz;
begin
 if not public.is_admin() then raise exception 'Administrator access required' using errcode='42501';end if;
 if target not in ('posts','examinations','results','activities','people','site_settings','academic_terms','officer_assignments','committee_memberships') then raise exception 'Invalid module';end if;
 payload=payload-'id'-'created_at'-'updated_at'-'created_by'-'updated_by'-'published_at'-'singleton';
 if record_id is not null then
 execute format('select updated_at from public.%I where id=$1 for update',target) into current_updated using record_id;
 if current_updated is null or expected_updated is null or current_updated<>expected_updated then raise exception 'This record changed. Reload it before saving.';end if;
 end if;
 if target='academic_terms' and (payload->>'is_current')::boolean then perform pg_advisory_xact_lock(73148);update public.academic_terms set is_current=false where is_current and id is distinct from record_id;end if;
 select string_agg(format('%I',key),','),string_agg(format('r.%I',key),','),string_agg(format('%I=r.%I',key,key),',') into cols,vals,assigns from jsonb_object_keys(payload) key;
 if cols is null then raise exception 'Empty record';end if;
 if record_id is null then
 execute format('insert into public.%I(%s) select %s from jsonb_populate_record(null::public.%I,$1) r returning id',target,cols,vals,target) into result_id using payload;
 else
 execute format('update public.%I t set %s from jsonb_populate_record(null::public.%I,$1) r where t.id=$2 returning t.id',target,assigns,target) into result_id using payload,record_id;
 end if;
 attachment_table=case target when 'posts' then 'post_attachments' when 'results' then 'result_attachments' when 'activities' then 'activity_media' else null end;
 if attachments is not null and attachment_table is not null then
 execute format('delete from public.%I where parent_id=$1',attachment_table) using result_id;
 for item in select * from jsonb_array_elements(attachments) loop
 if not exists(select 1 from media_assets where id=(item->>'asset_id')::uuid and state='ready') then raise exception 'Attachment is not ready';end if;
 if target='results' and not exists(select 1 from media_assets where id=(item->>'asset_id')::uuid and mime='application/pdf') then raise exception 'Results require PDF files';end if;
 execute format('insert into public.%I(parent_id,asset_id,caption,sort_order) values($1,$2,$3,$4)',attachment_table) using result_id,(item->>'asset_id')::uuid,coalesce(item->>'caption',''),coalesce((item->>'sort_order')::int,0);
 end loop;end if;
 return result_id;
end$$;
revoke all on function public.save_content(text,uuid,jsonb,timestamptz,jsonb) from public;
grant execute on function public.save_content(text,uuid,jsonb,timestamptz,jsonb) to authenticated;

-- Deferred publication checks also protect direct database writes.
create function public.check_result_ready() returns trigger language plpgsql set search_path=public as $$declare rid uuid;begin
 if TG_TABLE_NAME='results' then rid=coalesce(new.id,old.id);else rid=coalesce(new.parent_id,old.parent_id);end if;
 if exists(select 1 from results where id=rid and status<>'draft') then
 if not exists(select 1 from result_attachments a join media_assets m on m.id=a.asset_id where a.parent_id=rid and m.state='ready' and m.mime='application/pdf') then raise exception 'Published results require a ready PDF attachment';end if;
 if not exists(select 1 from results r join examinations e on e.id=r.examination_id where r.id=rid and e.status<>'draft') then raise exception 'Publish the examination before its results';end if;
 end if;return null;end$$;
create constraint trigger result_ready after insert or update on public.results deferrable initially deferred for each row execute function public.check_result_ready();
create constraint trigger result_ready after insert or update or delete on public.result_attachments deferrable initially deferred for each row execute function public.check_result_ready();
grant usage on schema public to anon,authenticated;

