import fs from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
const db = new PGlite();
await db.exec(`create role anon; create role authenticated; create schema auth; create schema storage;
create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
grant usage on schema auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text,owner_id text);
alter table storage.objects enable row level security; grant usage on schema storage to anon,authenticated; grant all on storage.objects to anon,authenticated;`);
for (const file of (await fs.readdir("supabase/migrations")).sort())
  await db.exec(await fs.readFile("supabase/migrations/" + file, "utf8"));
for (const file of (await fs.readdir("supabase/tests")).sort()) {
  try {
    await db.exec(await fs.readFile("supabase/tests/" + file, "utf8"));
    console.log("PASS", file);
  } catch (e) {
    console.error("FAIL", file, e.message, e.where);
    process.exit(1);
  }
}
await db.close();
console.log(
  "Embedded PostgreSQL checks passed. Live Supabase integration remains a separate check.",
);
