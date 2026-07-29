import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-5">
      <Compass size={40} className="mx-auto text-hunter" />
      <h1 className="font-display text-3xl text-charcoal">Page not found</h1>
      <p className="text-slate text-sm">
        We couldn&apos;t find the page you were looking for. It may have moved or no longer exist.
      </p>
      <div className="flex items-center justify-center gap-3 pt-2">
        <Link href="/" className="btn-primary text-sm">
          Back to home
        </Link>
        <Link href="/search" className="btn-secondary text-sm">
          Browse events
        </Link>
      </div>
    </div>
  );
}
