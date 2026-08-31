"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { Reveal } from "@/components/sites/shizhi/Reveal";
import { RealShizhiPanel } from "@/components/sites/shizhi/RealShizhiPanel";
import { SiteHeader } from "@/components/sites/shizhi/SiteHeader";
import { withBasePath } from "@/lib/base-path";

export function HeaderHero() {
  return (
    <>
      <SiteHeader />

      <section id="home" className="hero-section">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />
        <div className="cc-wide relative hero-layout">
          <Reveal className="hero-copy" variant="left">
            <h1><span>Glean</span><br />让浏览，沉淀为知识。</h1>
            <p className="hero-slogan">思维有迹，万物归档。</p>
            <div className="hero-actions">
              <a href="https://web.tabbit.com/share/skill/EcrPZgXkFP" target="_blank" rel="noopener noreferrer" className="button-primary"><Download className="h-4 w-4" />下载安装</a>
              <Link href="/guide/" className="button-secondary">玩转拾知 <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="hero-proof">
              <span>基于 <a href="https://www.tabbit.com" target="_blank" rel="noopener noreferrer">Tabbit</a> 脚本妙招强力驱动</span>
            </div>
          </Reveal>
          <div className="hero-panel-wrap"><Reveal delay={140} variant="right"><RealShizhiPanel compact /></Reveal></div>
        </div>
        <section className="slogan-space" aria-labelledby="brand-slogan-title">
          <div className="slogan-content">
            <h2 id="brand-slogan-title">重塑浏览体验。</h2>
            <p>我们不造妙招，我们记录足迹。<br />让工具顺应你的思考——你负责专注，剩下的交给越来越懂你的 Glean。</p>
          </div>
        </section>
        <figure className="hero-dsh-visual">
          <Image
            src={withBasePath("/images/product/dsh.png")}
            alt="Glean 知识管理工作台预览"
            width={4267}
            height={2282}
            sizes="(max-width: 767px) calc(100vw - 32px), min(1120px, calc(100vw - 48px))"
          />
        </figure>
        <section className="hero-feature-strip" aria-label="Glean 核心能力">
          {[
            ["自动记录", "看见注意力的走向。", "你打开的每一个页面，都是一次选择。Glean 替你照单全收，连那些走神的瞬间也不放过。"],
            ["自动分析", "让信息自己找到归处。", "你只管翻阅，它负责判断。回来时，碎片已经拼成了全貌。"],
            ["输入补全", "让思路不断流。", "光标落下的地方，就是 Glean 接管的地方。从一词一句到成段成篇，思考不再卡壳。"],
            ["用户画像", "让 AI 认识你。", "沉默是最深的了解。它不问你，但每次开口都恰中你心。"],
          ].map(([title, heading, description]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p className="hero-feature-heading">{heading}</p>
              <p>{description}</p>
            </article>
          ))}
        </section>
      </section>
    </>
  );
}
