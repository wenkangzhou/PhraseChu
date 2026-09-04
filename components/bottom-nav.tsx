"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, RotateCcw, UserRound } from "@/components/icons";

const items = [
  { href: "/", label: "Today", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/review", label: "Review", icon: RotateCcw },
  { href: "/me", label: "Me", icon: UserRound },
];

export function BottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/session")) return null;

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={active ? "nav-item active" : "nav-item"} aria-current={active ? "page" : undefined}>
            <Icon size={21} strokeWidth={active ? 2.6 : 2} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
