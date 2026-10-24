"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { modules, schemas, type Table } from "@/lib/schema";

import { type Row, toManilaInput } from "@/lib/domain";
import { saveRecord, deleteRecord, refreshMedia } from "@/app/admin/actions";
import { fieldChoices } from "@/lib/editor-options";
type Attachment = { asset_id: string; caption: string; sort_order: number };
export function Editor({
  table,
  record,
  options,
  initialAttachments = [],
}: {
  table: Table;
  record: Row | null;
  options: Record<string, Row[]>;
  initialAttachments?: Attachment[];
}) {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [availableMedia, setAvailableMedia] = useState(
    options.media_assets || [],
  );
  const [refreshing, setRefreshing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [dirty, setDirty] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [files, setFiles] = useState(initialAttachments);
  const config = modules[table];
  useEffect(() => {
    const unload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    const click = (e: MouseEvent) => {
      const link = (e.target as Element).closest("a");
      if (
        dirty &&
        link &&
        !link.target &&
        !confirm("Leave without saving your changes?")
      )
        e.preventDefault();
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", click, true);
    return () => {
      window.removeEventListener("beforeunload", unload);
      document.removeEventListener("click", click, true);
    };
  }, [dirty]);
  const allowAttachments = ["posts", "results", "activities"].includes(table);
  return (
    <>
      <div className="section-title">
        <div>
          <p className="eyebrow">{config.label}</p>
          <h1>{record ? "Edit record" : "Create a record"}</h1>
        </div>
        <Link className="text-link" href={`/admin/${table}`}>
          ← Back to list
        </Link>
      </div>
      {error && (
        <p className="error-box" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="success-box" role="status">
          {success}
        </p>
      )}
      <form
        ref={formRef}
        onChange={() => setDirty(true)}
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          setFieldErrors({});
          setSuccess("");
          const f = new FormData(e.currentTarget);
          const input: Record<string, unknown> = {};
          for (const field of config.fields)
            input[field.key] =
              field.type === "checkbox"
                ? f.get(field.key) === "on"
                : f.get(field.key) || "";
          try {
            const parsed = schemas[table].safeParse(input);
            if (!parsed.success) {
              const errors: Record<string, string[]> = {};
              for (const issue of parsed.error.issues) {
                const key = String(issue.path[0] || "form");
                (errors[key] ??= []).push(issue.message);
              }
              setFieldErrors(errors);
              setError("Please correct the highlighted fields.");
              return;
            }
            const r = await saveRecord(
              table,
              record?.id || null,
              input,
              record?.updated_at || null,
              files.map((x, i) => ({ ...x, sort_order: i })),
            );
            if (!r.ok) setError(r.message);
            else {
              setDirty(false);
              setSuccess("Changes saved.");
              router.replace(`/admin/${table}/${r.data}`);
              router.refresh();
            }
          } catch {
            setError(
              "Connection failed. Your changes are still in this form. Please retry.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="admin-card editor-grid">
          {config.fields.map((field) => {
            const value = record?.[field.key];
            return (
              <label
                key={field.key}
                className={
                  field.type === "textarea"
                    ? "wide"
                    : field.type === "checkbox"
                      ? "checkbox-label"
                      : ""
                }
              >
                {field.type === "checkbox" ? (
                  <>
                    <input
                      name={field.key}
                      aria-invalid={!!fieldErrors[field.key]}
                      aria-describedby={
                        fieldErrors[field.key]
                          ? `${field.key}-error`
                          : undefined
                      }
                      type="checkbox"
                      defaultChecked={!!value}
                    />
                    {field.label}
                  </>
                ) : (
                  <>
                    {field.label}
                    {field.required ? " *" : ""}
                    {field.type === "textarea" ? (
                      <textarea
                        name={field.key}
                        aria-invalid={!!fieldErrors[field.key]}
                        aria-describedby={
                          fieldErrors[field.key]
                            ? `${field.key}-error`
                            : undefined
                        }
                        defaultValue={String(value || "")}
                        rows={field.key === "body" ? 12 : 4}
                      />
                    ) : field.type === "select" || field.type === "media" ? (
                      <select
                        name={field.key}
                        aria-invalid={!!fieldErrors[field.key]}
                        aria-describedby={
                          fieldErrors[field.key]
                            ? `${field.key}-error`
                            : undefined
                        }
                        required={field.required}
                        defaultValue={String(value || field.options?.[0] || "")}
                      >
                        <option value="">Select…</option>
                        {field.options?.map((x) => (
                          <option key={x} value={x}>
                            {x.replace("_", " ")}
                          </option>
                        ))}
                        {fieldChoices(field, {
                          ...options,
                          media_assets: availableMedia,
                        }).map((x) => (
                          <option key={x.id} value={x.id}>
                            {x.name || x.title || x.id}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        name={field.key}
                        aria-invalid={!!fieldErrors[field.key]}
                        aria-describedby={
                          fieldErrors[field.key]
                            ? `${field.key}-error`
                            : undefined
                        }
                        type={field.type || "text"}
                        required={field.required}
                        readOnly={
                          field.key === "slug" && !!record?.published_at
                        }
                        defaultValue={
                          field.type === "datetime-local" && value
                            ? toManilaInput(String(value))
                            : String(value || "")
                        }
                      />
                    )}
                  </>
                )}
                {fieldErrors[field.key] && (
                  <span id={`${field.key}-error`} className="error-text">
                    {fieldErrors[field.key].join(" ")}
                  </span>
                )}
              </label>
            );
          })}
        </div>
        {allowAttachments && (
          <section className="attachment-editor">
            <h2>{table === "activities" ? "Photo gallery" : "Attachments"}</h2>
            <p className="help">
              Upload files in the{" "}
              <Link href="/admin/media" target="_blank">
                media library ↗
              </Link>
              , then use Refresh available files below. Your unsaved edits stay
              in place. Results require a PDF before publication.
            </p>
            {files.map((a, i) => (
              <div className="attachment-editor-row" key={i}>
                <select
                  aria-label={`Attachment ${i + 1}`}
                  required
                  value={a.asset_id}
                  onChange={(e) => {
                    setFiles(
                      files.map((x, j) =>
                        j === i ? { ...x, asset_id: e.target.value } : x,
                      ),
                    );
                    setDirty(true);
                  }}
                >
                  <option value="">Select file…</option>
                  {availableMedia
                    .filter((m) =>
                      table === "results"
                        ? m.mime === "application/pdf"
                        : table === "activities"
                          ? String(m.mime).startsWith("image/")
                          : true,
                    )
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                </select>
                <input
                  aria-label={`Caption ${i + 1}`}
                  placeholder="Caption or download label"
                  value={a.caption}
                  onChange={(e) => {
                    setFiles(
                      files.map((x, j) =>
                        j === i ? { ...x, caption: e.target.value } : x,
                      ),
                    );
                    setDirty(true);
                  }}
                />
                <button
                  type="button"
                  aria-label={`Move attachment ${i + 1} up`}
                  disabled={i === 0}
                  onClick={() => {
                    const copy = [...files];
                    [copy[i - 1], copy[i]] = [copy[i], copy[i - 1]];
                    setFiles(copy);
                    setDirty(true);
                  }}
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label={`Remove attachment ${i + 1}`}
                  onClick={() => {
                    setFiles(files.filter((_, j) => j !== i));
                    setDirty(true);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              className="button secondary-button"
              onClick={() => {
                setFiles([
                  ...files,
                  { asset_id: "", caption: "", sort_order: files.length },
                ]);
                setDirty(true);
              }}
            >
              Add {table === "activities" ? "photo" : "attachment"}
            </button>
          </section>
        )}
        <div className="editor-actions">
          <button
            type="button"
            className="button secondary-button"
            disabled={refreshing}
            onClick={async () => {
              setRefreshing(true);
              try {
                const r = await refreshMedia();
                if (r.ok) {
                  setAvailableMedia(r.data);
                  setSuccess(
                    "Available files refreshed. Your unsaved edits are preserved.",
                  );
                } else setError(r.message);
              } catch {
                setError("Unable to refresh files. Please retry.");
              } finally {
                setRefreshing(false);
              }
            }}
          >
            {refreshing ? "Refreshing…" : "Refresh available files"}
          </button>
          <button className="button" disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </button>
          {record?.slug && (
            <Link
              className="button secondary-button"
              target="_blank"
              href={`/admin/${table}/${record.id}/preview`}
            >
              Preview saved version ↗
            </Link>
          )}
          <span className="help">{dirty ? "Unsaved changes" : ""}</span>
          {record && table !== "site_settings" && (
            <button
              className="button danger-button"
              type="button"
              disabled={busy}
              onClick={async () => {
                if (
                  !confirm(
                    "Permanently delete this record? This cannot be undone.",
                  )
                )
                  return;
                setBusy(true);
                try {
                  const r = await deleteRecord(table, record.id);
                  if (!r.ok) setError(r.message);
                  else {
                    setDirty(false);
                    router.push(`/admin/${table}`);
                    router.refresh();
                  }
                } catch {
                  setError("Unable to delete. Please retry.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Delete
            </button>
          )}
        </div>
      </form>
    </>
  );
}
