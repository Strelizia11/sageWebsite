import { AuthForm } from "@/components/admin/auth-form";
import { configured } from "@/lib/supabase/server";
export default function Login() {
  return (
    <main id="main" className="auth-page">
      <div className="auth-brand">
        <img src="/udd-sage-logo.png" alt="UDD-SAGE seal" />
        <h1>
          Greater excellence.
          <br />
          Together.
        </h1>
        <p>The official UDD-SAGE publishing workspace.</p>
      </div>
      <AuthForm configured={configured()} />
    </main>
  );
}
