begin;
insert into examinations(id,title,slug,status,starts_at) values('50000000-0000-0000-0000-000000000001','Exam','exam','published','2026-10-22T00:30:00+08:00');
do $$begin
 begin
 insert into results(title,slug,status,examination_id) values('No PDF','no-pdf','published','50000000-0000-0000-0000-000000000001');
 set constraints all immediate;
 raise exception 'Result without PDF published';
 exception when raise_exception then if SQLERRM<>'Published results require a ready PDF attachment' then raise;end if;end;
end$$;
insert into media_assets(id,path,name,mime,size,state) values('30000000-0000-0000-0000-000000000002','results.pdf','Results','application/pdf',20,'ready');
insert into results(id,title,slug,status,examination_id) values('60000000-0000-0000-0000-000000000001','Result','result','published','50000000-0000-0000-0000-000000000001');
insert into result_attachments(parent_id,asset_id) values('60000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002');
set constraints all immediate;
do $$begin
 begin delete from result_attachments;raise exception 'Last result PDF removed';exception when raise_exception then if SQLERRM<>'Published results require a ready PDF attachment' then raise;end if;end;
end$$;
rollback;
