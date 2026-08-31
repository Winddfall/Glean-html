"use client";

import { useState } from "react";
import { ChevronDown, Quote } from "lucide-react";
import { Reveal } from "@/components/sites/shizhi/Reveal";

const testimonials = [
  ["以前收藏夹里有几十个链接，现在我能记得为什么收藏，也知道下一步要做什么。", "白鼠鼠", "独立产品经理", "鼠"],
  ["最喜欢的是目标视角。做竞品研究时，资料不会再散落在十几个标签页里。", "Windfall", "增长负责人", "W"],
  ["摸鱼池塘很妙，降低了记录压力，真正有价值的内容之后又能被拾起来。", "HH", "内容创作者", "H"],
  ["它不是逼我整理，而是在我浏览的时候顺手完成整理，这一点很重要。", "魚梶", "本科生", "魚"],
] as const;

const faqs = [
  ["Glean 和普通网页收藏夹有什么不同？", "收藏夹保存的是链接，拾知保存的是链接与你当前目标之间的关系。它会提取摘要、发现和关键词，并在之后的检索与行动中重新组织这些内容。"],
  ["数据会上传到哪里？", "拾知采用本地优先的设计思路，核心记录保存在你的设备中，并支持标准格式导出。具体同步能力会在后续版本中提供清晰、可控的选择。"],
  ["没有明确目标的内容还能记录吗？", "可以。它们会进入“摸鱼池塘”，作为低压力的灵感暂存区。之后你可以手动归类，也可以让拾知推荐适合的目标。"],
  ["适合哪些人使用？", "适合经常进行产品调研、内容研究、学术阅读、竞品分析或长期主题探索的人。只要你的工作依赖大量网页信息，拾知就能减少重复查找与整理。"],
  ["Glean 支持哪些 AI 模型？", "目前 Glean 使用 Tabbit 内置的 AI 模型，开箱即可完成分析、建议与输入补全。模型由 Tabbit 统一提供，暂不支持在应用内切换或自定义。"],
] as const;

export function TestimonialsFaq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <>
      <section className="testimonial-section cc-section">
        <div className="cc-container">
          <Reveal className="section-heading section-heading-light"><span>FIELD NOTES</span><h2>来自持续探索者的真实感受</h2></Reveal>
          <div className="testimonial-grid">{testimonials.map(([quote, name, role, initial], index) => <Reveal key={name} delay={(index % 2) * 90}><article><Quote /><p>“{quote}”</p><div><span>{initial}</span><p><strong>{name}</strong><small>{role}</small></p></div></article></Reveal>)}</div>
        </div>
      </section>
      <section id="faq" className="faq-section cc-section">
        <div className="cc-container grid gap-14 lg:grid-cols-[.72fr_1.28fr]">
          <Reveal variant="left" className="faq-title"><span className="eyebrow">FAQ</span><h2>关于 Glean，<br />你可能还想知道</h2><p>如果还有别的问题，欢迎通过右上角的社区入口找到我们。</p></Reveal>
          <Reveal variant="right" className="faq-list" delay={80}>{faqs.map(([question, answer], index) => <div key={question}><button type="button" onClick={() => setOpen(open === index ? null : index)} aria-expanded={open === index}><span>{question}</span><ChevronDown className={open === index ? "rotate-180" : ""} /></button><div className={`faq-answer ${open === index ? "open" : ""}`}><p>{answer}</p></div></div>)}</Reveal>
        </div>
      </section>
    </>
  );
}
