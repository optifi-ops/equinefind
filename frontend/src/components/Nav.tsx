"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/search", label: "Browse Events" },
  { href: "/venues", label: "Venues" },
];

export function Nav() {
  const path = usePathname();
  const { user, loading } = useAuth();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-semibold text-charcoal hover:text-hunter transition-colors">
          EquineFind
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "text-sm font-medium transition-colors",
                path.startsWith(href) ? "text-hunter" : "text-slate hover:text-charcoal"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="w-20 h-5 bg-mist rounded animate-pulse" />
          ) : user ? (
            <>
              <Link
                href="/account"
                className={cn(
                  "text-sm font-medium transition-colors",
                  path.startsWith("/account") ? "text-hunter" : "text-slate hover:text-charcoal"
                )}
              >
                Account
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm text-slate hover:text-charcoal transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-slate hover:text-charcoal transition-colors">
                Sign In
              </Link>
              <Link href="/login" className="btn-primary text-sm py-1.5">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
