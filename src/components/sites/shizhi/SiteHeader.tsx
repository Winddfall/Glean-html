"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { socialLinks } from "@/components/sites/shizhi/SocialIcons";
import { ThemeToggle } from "@/components/sites/shizhi/ThemeToggle";

const nav = [
  ["首页", "/#home"],
  ["指南", "/guide/"],
  ["常见问题", "/#faq"],
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="site-header-glass" />
      <div className="site-header-inner cc-wide flex h-full items-center justify-between">
        <a href="/#home" className="brand-lockup" aria-label="Glean 首页">
          <Image src="/sites/shizhi/logo.jpg" alt="" width={38} height={38} priority loading="eager" />
          <span>Glean</span>
        </a>
        <nav className="hidden items-center gap-8 lg:ml-auto lg:mr-8 lg:flex" aria-label="主导航">
          {nav.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
        </nav>
        <div className="hidden items-center gap-1.5 lg:flex">
          <ThemeToggle />
          <div className="header-socials">
            {socialLinks.map(({ name, Icon, href }) => (
              <a key={name} href={href} aria-label={name} title={name} target={href !== "#" ? "_blank" : undefined} rel={href !== "#" ? "noopener noreferrer" : undefined} onClick={href === "#" ? (event) => event.preventDefault() : undefined}><Icon className="h-[18px] w-[18px]" /></a>
            ))}
          </div>
        </div>
        <div className="mobile-actions lg:hidden">
          <ThemeToggle />
          <button type="button" className="mobile-menu-button" aria-label="打开导航菜单" onClick={() => setOpen((value) => !value)}>{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {open && (
        <div className="mobile-menu lg:hidden">
          {nav.map(([label, href]) => <a key={label} href={href} onClick={() => setOpen(false)}>{label}</a>)}
          <div className="mt-3 flex gap-2 border-t border-[var(--line)] pt-4">{socialLinks.map(({ name, Icon, href }) => <a key={name} href={href} aria-label={name} target={href !== "#" ? "_blank" : undefined} rel={href !== "#" ? "noopener noreferrer" : undefined} onClick={href === "#" ? (event) => event.preventDefault() : undefined}><Icon className="h-5 w-5" /></a>)}</div>
        </div>
      )}
    </header>
  );
}
