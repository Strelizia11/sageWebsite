"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, recover, changePassword } from "@/app/admin/actions";
export function AuthForm({
  recovery = false,
  configured = true,
}: {
  recovery?: boolean;
  configured?: boolean;
}) {
  const [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [busy, setBusy] = useState(false),
    [forgot, setForgot] = useState(false);
  const router = useRouter();
  return (
    <div className="auth-form">
      <p className="eyebrow">UDD-SAGE ADMINISTRATION</p>
      <h2>
        {recovery
          ? "Set a new password"
          : forgot
            ? "Reset your password"
            : "Welcome back."}
      </h2>
      <p className="muted">
        {recovery
          ? "Choose a secure password for your account."
          : "Sign in to care for your organization’s website."}
      </p>
      {!configured && (
        <div className="setup-note">
          Supabase is not connected yet. Follow the deployment guide to enable
          secure admin sign-in.
        </div>
      )}
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
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          const form = new FormData(e.currentTarget);
          try {
            const r = recovery
              ? await changePassword(String(form.get("password")))
              : forgot
                ? await recover(String(form.get("email")))
                : await signIn(
                    String(form.get("email")),
                    String(form.get("password")),
                  );
            if (!r.ok) setError(r.message);
            else if (recovery || forgot) setSuccess(r.data);
            else {
              router.push("/admin");
              router.refresh();
            }
          } catch {
            setError("Unable to connect. Please retry.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {!recovery && (
          <label>
            Email address
            <input type="email" name="email" autoComplete="email" required />
          </label>
        )}
        {!forgot && (
          <label>
            Password
            <input
              type="password"
              name="password"
              autoComplete={recovery ? "new-password" : "current-password"}
              minLength={recovery ? 12 : undefined}
              required
            />
          </label>
        )}
        <button className="button" disabled={busy || !configured}>
          {busy
            ? "Please wait…"
            : recovery
              ? "Update password"
              : forgot
                ? "Send recovery email"
                : "Sign in →"}
        </button>
      </form>
      {!recovery && (
        <button
          className="button secondary-button"
          onClick={() => {
            setForgot(!forgot);
            setError("");
            setSuccess("");
          }}
        >
          {forgot ? "Back to sign in" : "Forgot password?"}
        </button>
      )}
      <Link href={recovery ? "/admin" : "/"}>
        ← {recovery ? "Back to dashboard" : "Back to public website"}
      </Link>
    </div>
  );
}
