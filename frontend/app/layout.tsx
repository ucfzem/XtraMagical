"use client";

import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, FolderOpen, Image, LogOut, Menu, X } from "lucide-react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === "/login") {
    return (
      <html lang="fr">
        <body>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </body>
      </html>
    );
  }

  const links = [
    { href: "/", label: "Accueil", icon: Sparkles },
    { href: "/projects", label: "Projets", icon: FolderOpen },
    { href: "/generator", label: "Générateur", icon: Image },
  ];

  return (
    <html lang="fr">
      <body>
        <QueryClientProvider client={queryClient}>
          <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary-600">
                  <Sparkles className="w-6 h-6" />
                  XtraMagical
                </Link>
                <div className="hidden md:flex items-center gap-6">
                  {links.map((l) => {
                    const Icon = l.icon;
                    return (
                      <Link
                        key={l.href}
                        href={l.href}
                        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                          pathname === l.href
                            ? "text-primary-600"
                            : "text-gray-600 hover:text-primary-600"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {l.label}
                      </Link>
                    );
                  })}
                  <button
                    onClick={() => {
                      localStorage.removeItem("access_token");
                      window.location.href = "/login";
                    }}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </div>
                <button
                  className="md:hidden"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  {menuOpen ? <X /> : <Menu />}
                </button>
              </div>
            </div>
            {menuOpen && (
              <div className="md:hidden border-t border-gray-100 px-4 py-3 space-y-2">
                {links.map((l) => {
                  const Icon = l.icon;
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 py-2 text-sm font-medium text-gray-700"
                    >
                      <Icon className="w-4 h-4" />
                      {l.label}
                    </Link>
                  );
                })}
                <button
                  onClick={() => {
                    localStorage.removeItem("access_token");
                    window.location.href = "/login";
                  }}
                  className="flex items-center gap-2 py-2 text-sm text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            )}
          </nav>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </QueryClientProvider>
      </body>
    </html>
  );
}
