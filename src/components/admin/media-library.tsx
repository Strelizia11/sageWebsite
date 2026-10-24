"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { browserDB } from "@/lib/supabase/client";
import { type Row, validateUpload } from "@/lib/domain";
import { removeMedia } from "@/app/admin/media-actions";
export function MediaLibrary({ assets }: { assets: Row[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  return (
    <>
      <h1>Media library</h1>
      <p className="muted">
        JPEG, PNG or WebP up to 5 MB. PDF documents up to 20 MB.
      </p>
      {error && (
        <p className="error-box" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="success-box" role="status">
          {message}
        </p>
      )}
      <form
        className="admin-card filters"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const values = new FormData(form);
          const file = values.get("file") as File;
          if (!file?.size) return;
          setError("");
          setMessage("");
          const invalid = validateUpload(file.type, file.size);
          if (invalid) {
            setError(invalid);
            return;
          }
          setBusy(true);
          try {
            const preparation = await fetch("/api/media/prepare", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: file.name,
                type: file.type,
                size: file.size,
              }),
            });
            const p = await preparation.json();
            if (!preparation.ok) throw new Error(p.error);
            setMessage("Uploading file…");
            const { error } = await browserDB()
              .storage.from("sage-media")
              .uploadToSignedUrl(p.path, p.token, file, {
                contentType: file.type,
              });
            if (error) throw error;
            const finalized = await fetch("/api/media/finalize", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: p.id, alt: values.get("alt") }),
            });
            const result = await finalized.json();
            if (!finalized.ok) throw new Error(result.error);
            form.reset();
            setMessage(
              "Upload complete. The file is ready to attach to content.",
            );
            router.refresh();
          } catch (e) {
            setMessage("");
            setError(
              e instanceof Error
                ? e.message
                : "Upload failed. Retry the upload.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="search-label">
          Choose file
          <input
            type="file"
            name="file"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            required
          />
        </label>
        <label className="search-label">
          Image description / alt text
          <input name="alt" maxLength={500} />
        </label>
        <button disabled={busy} className="button">
          {busy ? "Uploading…" : "Upload file"}
        </button>
      </form>
      <p className="help">
        Pending files are not public. Delete failed or abandoned uploads below
        before retrying.
      </p>
      <div className="media-grid">
        {assets.map((a) => (
          <div className="media-card" key={a.id}>
            {String(a.mime).startsWith("image/") && a.state === "ready" ? (
              <img src={`/api/media/${a.id}`} alt={String(a.alt || a.name)} />
            ) : (
              <div className="card-art">
                {a.state === "ready" ? "PDF DOCUMENT" : "PENDING UPLOAD"}
              </div>
            )}
            <p>
              <strong>{a.name}</strong>
              <br />
              {Math.ceil(Number(a.size) / 1024)} KB · {String(a.state)}
            </p>
            <button
              type="button"
              className="button secondary-button"
              onClick={async () => {
                if (
                  !confirm(
                    "Delete this file permanently? Attached files cannot be deleted.",
                  )
                )
                  return;
                const r = await removeMedia(a.id);
                if (r.error) setError(r.error);
                else router.refresh();
              }}
            >
              Delete file
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
