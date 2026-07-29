"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Mail, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [error, setError] = useState(callbackError === "auth_callback_failed" ? "Sign-in link expired or was already used. Please try again." : "");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
          <p className="text-slate text-sm mt-1">No password needed — we&apos;ll email you a sign-in link.</p>
        </div>

        {error && (
          <div className="px-3 py-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center gap-2">
            <Mail size={16} />
            {loading ? "Sending..." : "Send Magic Link"}
          </button>
        </form>

        <p className="text-center text-xs text-slate">
          Admin?{" "}
          <Link href="/account" className="text-hunter underline hover:no-underline">
            Sign in with password
          </Link>
        </p>
      </div>
    </div>
  );
}
