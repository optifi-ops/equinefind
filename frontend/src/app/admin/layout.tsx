import Link from "next/link";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/events/new", label: "+ New Event" },
  { href: "/admin/venues", label: "Venues" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-52 flex-shrink-0 bg-charcoal text-white flex flex-col">
        <div className="px-4 py-5 border-b border-white/10">
          <Link href="/" className="font-display text-lg text-white/90 hover:text-white">
            EquineFind
          </Link>
          <p className="text-xs text-white/40 mt-0.5">Admin</p>
        </div>
        <nav className="flex-1 py-4 space-y-0.5">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-3 border-t border-white/10">
          <Link href="/" className="text-xs text-white/40 hover:text-white/70 transition-colors">
            ← Back to site
          </Link>
        </div>
      </aside>
      <div className="flex-1 min-w-0 bg-mist">
        <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
      </div>
    </div>
  );
}
