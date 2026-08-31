"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { guideNav } from "@/lib/guide-nav";

export function GuideSidebar() {
  const pathname = usePathname();

  return (
    <aside className="guide-sidebar" aria-label="指南目录">
      {guideNav.map((group, index) => (
        <div className={`guide-group${index === 0 ? " is-first" : ""}`} key={group.title}>
          <h3>{group.title}</h3>
          <nav className="guide-nav">
            {group.items.map((item) => {
              const href = `/guide/${item.slug}`;
              const isActive = pathname === href || (item.slug === "install" && pathname === "/guide/");
              return (
                <Link key={item.slug} href={href} className={isActive ? "is-active" : ""}>
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </aside>
  );
}
