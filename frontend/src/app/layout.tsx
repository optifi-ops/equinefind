import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "EquineFind — Find Horse Shows Near You",
  description:
    "The most complete calendar of equestrian events. Search recognized and schooling shows for eventing, dressage, show jumping, and hunters.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Nav />
          <main>{children}</main>
          <footer className="mt-16 py-8 border-t border-border">
            <div className="max-w-6xl mx-auto px-4 text-sm text-slate text-center">
              © {new Date().getFullYear()} EquineFind
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
