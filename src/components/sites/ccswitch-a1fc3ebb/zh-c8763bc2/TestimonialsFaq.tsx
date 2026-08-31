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
  ["Glean 解决了什么原有问题？新增了什么？", "过去查资料常常是打开很多标签页、手动收藏，之后却想不起收藏原因，也很难知道下一步做什么。Glean 新增了目标拆解、网页自动记录、相关目标归档、摸鱼池塘、会更新的 ToDo 建议、输入补全和记录导出，把分散的浏览轨迹整理成可继续推进的研究上下文。"],
  ["适合哪些人使用？", "适合经常进行产品调研、内容研究、学术阅读、竞品分析或长期主题探索的人。只要你的工作依赖大量网页信息，Glean 就能减少重复查找、手动整理和上下文丢失。"],
  ["适用于哪些网页？", "Glean 适合你日常访问的资讯、文档、论文、产品、社区和搜索类网页，尤其适合围绕一个目标持续浏览多个来源。它记录的是网页信息与当前目标之间的关系；具体页面是否能被完整读取，取决于浏览器权限、页面结构以及网站本身的访问限制。"],
  ["Glean 如何使用 AI 和其他技术？", "Tabbit 内置 AI 会根据你的目标和已记录内容完成最多 3 级需求拆解、摘要与关键词提取、相关目标归档、ToDo 更新、下一步建议、用户画像和输入补全。AI 由 Tabbit 统一提供，目前不支持在 Glean 内切换或自定义模型。"],
  ["数据会上传到哪里？安全边界是什么？", "Glean 采用本地优先设计，目标、记录和用户画像保存在你的设备中，按同源规则共享或隔离，跨源不可见，并支持导出 JSON。Glean 不会把整段浏览历史作为默认云端仓库保存。清除浏览器本地数据、卸载扩展或脚本可能影响记录，重要成果请及时导出。"],
  ["没有明确目标的内容还能记录吗？", "可以。它们会进入“摸鱼池塘”，作为低压力的灵感暂存区。之后你可以手动归类，也可以让 Glean 推荐适合的目标。"],
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
