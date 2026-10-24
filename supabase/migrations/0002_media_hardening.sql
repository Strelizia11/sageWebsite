-- Anonymous callers can read public metadata, but cannot mint arbitrary-duration
-- Storage tokens. Only the narrowly scoped server download route signs public URLs.
drop policy sage_read on storage.objects;
create policy sage_admin_read on storage.objects for select to authenticated using(bucket_id='sage-media' and public.is_admin());

create function public.check_asset_ready() returns trigger language plpgsql set search_path=public as $$declare asset uuid; image_only boolean;begin
 if TG_TABLE_NAME in ('post_attachments','result_attachments','activity_media') then asset=new.asset_id;image_only=TG_TABLE_NAME='activity_media';
 elsif TG_TABLE_NAME='people' then asset=new.photo_id;image_only=true;
 elsif TG_TABLE_NAME='site_settings' then asset=new.logo_id;image_only=true;
 else asset=new.cover_id;image_only=true;end if;
 if asset is not null and not exists(select 1 from media_assets where id=asset and state='ready' and (not image_only or mime like 'image/%')) then raise exception 'Choose a ready image or attachment';end if;
 return new;end$$;
do $$declare t text;begin foreach t in array array['post_attachments','result_attachments','activity_media','people','site_settings','posts','results','activities','examinations'] loop
 execute format('create trigger ready_asset before insert or update on public.%I for each row execute function public.check_asset_ready()',t);
end loop;end$$;
alter table media_assets add constraint image_size_limit check(mime='application/pdf' or size<=5242880);

create function public.prevent_exam_withdrawal() returns trigger language plpgsql set search_path=public as $$begin
 if new.status='draft' and exists(select 1 from results where examination_id=new.id and status<>'draft') then raise exception 'Return linked results to draft before withdrawing the examination';end if;
 return new;end$$;
create trigger exam_withdrawal before update on public.examinations for each row execute function public.prevent_exam_withdrawal();
