"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight, Download, Menu, X } from "lucide-react";
import { Reveal } from "@/components/sites/shizhi/Reveal";
import { RealShizhiPanel } from "@/components/sites/shizhi/RealShizhiPanel";
import { socialLinks } from "@/components/sites/shizhi/SocialIcons";
import { ThemeToggle } from "@/components/sites/shizhi/ThemeToggle";

const nav = [
  ["首页", "#home"],
  ["能力", "#features"],
  ["工作流", "#workflow"],
  ["使用场景", "#stories"],
  ["常见问题", "#faq"],
] as const;

export function HeaderHero() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <>
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="cc-wide flex h-full items-center justify-between">
          <a href="#home" className="brand-lockup" aria-label="拾知首页">
            <Image src="/sites/shizhi/logo.jpg" alt="" width={38} height={38} priority loading="eager" />
            <span>拾知</span>
          </a>
          <nav className="hidden items-center gap-8 lg:flex" aria-label="主导航">
            {nav.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
          </nav>
          <div className="hidden items-center gap-1.5 lg:flex">
            <ThemeToggle />
            <div className="header-socials">
              {socialLinks.map(({ name, Icon }) => (
                <a key={name} href="#" aria-label={name} title={`${name}（链接待添加）`} onClick={(event) => event.preventDefault()}><Icon className="h-[18px] w-[18px]" /></a>
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
            <div className="mt-3 flex gap-2 border-t border-[var(--line)] pt-4">{socialLinks.map(({ name, Icon }) => <a key={name} href="#" aria-label={name} onClick={(event) => event.preventDefault()}><Icon className="h-5 w-5" /></a>)}</div>
          </div>
        )}
      </header>

      <section id="home" className="hero-section">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />
        <div className="hero-grid" />
        <div className="cc-wide relative grid items-center gap-14 lg:grid-cols-[.82fr_1.18fr]">
          <Reveal className="hero-copy" variant="left">
            <h1><span>拾知</span><br />让浏览，<br />沉淀为知识。</h1>
            <p>在浏览的当下记录、分析与归类，让每一次搜索都服务于目标，让零散信息持续产生价值。</p>
            <div className="hero-actions">
              <a href="#download" className="button-primary"><Download className="h-4 w-4" />免费体验</a>
              <a href="#workflow" className="button-secondary">看看它如何工作 <ArrowRight className="h-4 w-4" /></a>
            </div>
            <div className="hero-proof"><span><i />本地优先</span><span><i />AI 智能拆解</span><span><i />跨网页持续积累</span></div>
          </Reveal>
          <Reveal className="hero-panel-wrap" delay={140} variant="right"><RealShizhiPanel compact /></Reveal>
        </div>
      </section>
    </>
  );
}
