"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Use the vanilla createClient here — it auto-detects hash fragments
    // from implicit flow magic links (detectSessionFromURL: true by default).
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.replace("/");
      }
    });

    // Also handle PKCE flow (?code= param)
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          router.replace("/login?error=auth_callback_failed");
        }
      });
    }

    // Fallback: if neither hash nor code triggers auth within 5s, redirect to error
    const timeout = setTimeout(() => {
      router.replace("/login?error=auth_callback_failed");
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <Loader2 size={32} className="animate-spin text-hunter mx-auto mb-4" />
      <p className="text-slate text-sm">Signing you in...</p>
    </div>
  );
}
