begin;
insert into academic_terms(id,name,starts_on,ends_on,is_current) values ('10000000-0000-0000-0000-000000000001','2026–2027','2026-06-01','2027-05-31',true);
insert into people(id,name,status) values('20000000-0000-0000-0000-000000000001','First scholar','published'),('20000000-0000-0000-0000-000000000002','Second scholar','published');
insert into officer_assignments(person_id,term_id,position_id) values('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',5);
do $$begin
 begin insert into committee_memberships(person_id,term_id,committee_id,role) values('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',1,'co_head'); raise exception 'Conflicting co-head accepted';exception when raise_exception then if SQLERRM<>'Head and co-head must be different people' then raise;end if;end;
end$$;
insert into committee_memberships(person_id,term_id,committee_id,role) values('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001',1,'co_head');
do $$begin
 begin update officer_assignments set person_id='20000000-0000-0000-0000-000000000002' where position_id=5;raise exception 'Conflicting VP accepted';exception when raise_exception then if SQLERRM<>'Head and co-head must be different people' then raise;end if;end;
 begin insert into officer_assignments(person_id,term_id,position_id) values('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',5);raise exception 'Duplicate office accepted';exception when unique_violation then null;end;
 begin delete from people where id='20000000-0000-0000-0000-000000000001';raise exception 'Historical reference deleted';exception when foreign_key_violation then null;end;
 if (select count(*) from positions)<>8 or (select count(*) from committees)<>4 then raise exception 'Incorrect organization structure';end if;
end$$;
rollback;

