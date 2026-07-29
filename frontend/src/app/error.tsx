"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-5">
      <AlertTriangle size={40} className="mx-auto text-hunter" />
      <h1 className="font-display text-3xl text-charcoal">Something went wrong</h1>
      <p className="text-slate text-sm">
        We hit an unexpected error. You can try again, or head back to the homepage.
      </p>
      <div className="flex items-center justify-center gap-3 pt-2">
        <button onClick={reset} className="btn-primary text-sm">
          Try again
        </button>
        <Link href="/" className="btn-secondary text-sm">
          Back to home
        </Link>
      </div>
    </div>
  );
}
