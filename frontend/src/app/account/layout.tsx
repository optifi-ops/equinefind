"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, LayoutDashboard, CalendarDays, Heart, Settings, ClipboardList, CalendarPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/account", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/account/events", label: "My Events", icon: CalendarDays },
  { href: "/account/horses", label: "My Horses", icon: Heart },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

const ORGANIZER_NAV = [
  { href: "/account/clinics", label: "My Clinics", icon: ClipboardList },
  { href: "/account/clinics/new", label: "+ New Clinic", icon: CalendarPlus },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isOrganizer } = useAuth();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={24} className="animate-spin text-hunter" />
      </div>
    );
  }

  if (!user) return null;

  const isActive = (href: string, exact?: boolean) =>
    exact ? path === href : path.startsWith(href);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-52 flex-shrink-0 bg-charcoal text-white flex-col">
        <div className="px-4 py-5 border-b border-white/10">
          <Link href="/" className="font-display text-lg text-white/90 hover:text-white">
            EquineFind
          </Link>
          <p className="text-xs text-white/40 mt-0.5">Account</p>
        </div>
        <nav className="flex-1 py-4 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-4 py-2 text-sm transition-colors",
                isActive(href, exact)
                  ? "text-white bg-white/10"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
          {isOrganizer && (
            <>
              <div className="mx-4 my-3 border-t border-white/10" />
              <p className="px-4 text-[10px] uppercase tracking-widest text-white/30 mb-1">Organizer</p>
              {ORGANIZER_NAV.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-2 text-sm transition-colors",
                    isActive(href)
                      ? "text-white bg-white/10"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
            </>
          )}
        </nav>
        <div className="px-4 py-3 border-t border-white/10">
          <Link href="/" className="text-xs text-white/40 hover:text-white/70 transition-colors">
            &larr; Back to site
          </Link>
        </div>
      </aside>

      {/* Mobile tab bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border">
        <nav className="flex justify-around py-2">
          {NAV.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px]",
                isActive(href, exact) ? "text-hunter" : "text-slate"
              )}
            >
              <Icon size={18} />
              {label.replace("My ", "")}
            </Link>
          ))}
          {isOrganizer && (
            <Link
              href="/account/clinics"
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px]",
                isActive("/account/clinics") ? "text-hunter" : "text-slate"
              )}
            >
              <ClipboardList size={18} />
              Clinics
            </Link>
          )}
        </nav>
      </div>

      {/* Content area */}
      <div className="flex-1 min-w-0 bg-mist pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">{children}</div>
      </div>
    </div>
  );
}
