"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, CheckCircle, Lock } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackError = searchParams.get("error");

  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(callbackError === "auth_callback_failed" ? "Sign-in link expired or was already used. Please try again." : "");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (authError) throw authError;
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;
      router.push("/account");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="card p-8 text-center space-y-4">
          <CheckCircle size={48} className="mx-auto text-hunter" />
          <h1 className="font-display text-2xl text-charcoal">Check your email</h1>
          <p className="text-slate text-sm">
            We sent a sign-in link to <strong className="text-charcoal">{email}</strong>.
            Click the link in the email to sign in.
          </p>
          <p className="text-xs text-slate">
            Didn&apos;t get it? Check your spam folder or{" "}
            <button
              onClick={() => { setSent(false); setError(""); }}
              className="text-hunter underline hover:no-underline"
            >
              try again
            </button>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8 space-y-6">
        <div className="text-center">
          <h1 className="font-display text-3xl text-charcoal">Sign In</h1>
          <p className="text-slate text-sm mt-1">
            {mode === "magic" ? "No password needed — we'll email you a sign-in link." : "Sign in with your email and password."}
          </p>
        </div>

        {error && (
          <div className="px-3 py-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={mode === "magic" ? handleMagicLink : handlePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="input"
            />
          </div>
          {mode === "password" && (
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
              />
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center gap-2">
            {mode === "magic" ? <Mail size={16} /> : <Lock size={16} />}
            {loading ? "Signing in..." : mode === "magic" ? "Send Magic Link" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-slate">
          <button
            onClick={() => { setMode(mode === "magic" ? "password" : "magic"); setError(""); }}
            className="text-hunter underline hover:no-underline"
          >
            {mode === "magic" ? "Sign in with password instead" : "Sign in with magic link instead"}
          </button>
        </p>
      </div>
    </div>
  );
}
