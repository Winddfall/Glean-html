"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { socialLinks } from "@/components/sites/shizhi/SocialIcons";
import { ThemeToggle } from "@/components/sites/shizhi/ThemeToggle";
import { withBasePath } from "@/lib/base-path";

const partnerLinks = [
  { name: "Watcha 拾知产品页", href: "https://watcha.cn/products/shi-zhi", image: "/sites/shizhi/partners/watcha.svg", compact: true },
  { name: "AI工具集拾知介绍", href: "https://www.ai345.info/post/post-1788144318375", image: "/sites/shizhi/partners/ai345.png", compact: false },
] as const;

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
        <Link href="/#home" className="brand-lockup" aria-label="Glean 首页">
          <Image src={withBasePath("/sites/shizhi/logo.jpg")} alt="" width={38} height={38} priority loading="eager" />
          <span>Glean</span>
        </Link>
        <nav className="hidden items-center gap-8 lg:ml-auto lg:mr-8 lg:flex" aria-label="主导航">
          {nav.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}
        </nav>
        <div className="hidden items-center gap-1.5 lg:flex">
          <ThemeToggle />
          <div className="header-socials">
            {socialLinks.map(({ name, Icon, href }) => (
              <a key={name} href={href} aria-label={name} title={name} target="_blank" rel="noopener noreferrer"><Icon className="h-[18px] w-[18px]" /></a>
            ))}
            {partnerLinks.map(({ name, href, image, compact }) => (
              <a key={name} href={href} aria-label={name} title={name} target="_blank" rel="noopener noreferrer">
                <Image className={`partner-icon ${compact ? "is-compact" : ""}`} src={withBasePath(image)} alt="" width={30} height={30} unoptimized />
              </a>
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
          {nav.map(([label, href]) => <Link key={label} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
          <div className="mobile-external-links mt-3 border-t border-[var(--line)] pt-4">
            {partnerLinks.map(({ name, href, image, compact }) => (
              <a key={name} href={href} aria-label={name} title={name} target="_blank" rel="noopener noreferrer">
                <Image className={compact ? "is-compact" : ""} src={withBasePath(image)} alt="" width={30} height={30} unoptimized />
              </a>
            ))}
            {socialLinks.map(({ name, Icon, href }) => <a key={name} href={href} aria-label={name} title={name} target="_blank" rel="noopener noreferrer"><Icon className="h-5 w-5" /></a>)}
          </div>
        </div>
      )}
    </header>
  );
}
