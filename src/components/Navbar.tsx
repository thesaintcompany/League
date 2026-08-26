"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { appSignOut } from "@/lib/logout";
import { Trophy, LogOut, User, LayoutDashboard } from "lucide-react";

import { BrandLogo } from "@/components/BrandLogo";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BrandLogo size="md" href="/" />

        <div className="flex items-center gap-2">
          {status === "loading" ? null : session?.user ? (
            <>
              <Link href="/dashboard" className="btn-ghost gap-1">
                <LayoutDashboard className="h-4 w-4" /> Campionate
              </Link>
              <Link href="/profile" className="btn-ghost gap-1">
                <User className="h-4 w-4" /> {session.user.name || session.user.email}
              </Link>
              <button onClick={() => appSignOut("/")} className="btn-secondary gap-1">
                <LogOut className="h-4 w-4" /> Ieșire
              </button>
            </>
          ) : (
            <>
              <Link href="/signin" className="btn-ghost">Sign in</Link>
              <Link href="/signup" className="btn-primary">Creează cont</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
