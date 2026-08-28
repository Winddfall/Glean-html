"use client";

import { useState } from "react";
import { ArrowUpRight, Check, MousePointer2, Route, Search, Sparkles } from "lucide-react";
import { Reveal } from "@/components/sites/shizhi/Reveal";
import { RealShizhiPanel } from "@/components/sites/shizhi/RealShizhiPanel";

const steps = [
  ["01", "看到有价值的页面", "按下快捷键，拾知自动读取页面主题、关键信息与来源。"],
  ["02", "关联到正在推进的目标", "AI 给出相关目标与记录建议，你只需要确认，而不是重新整理。"],
  ["03", "在需要时找回并行动", "按语义检索、目标或画像重新组织信息，把记录直接变成下一步。"],
] as const;

const scenes = ["内容增长", "产品调研", "学术研究"];

export function ProductDeveloper() {
  const [scene, setScene] = useState(0);

  return (
    <>
      <section id="workflow" className="workflow-section cc-section">
        <div className="cc-container">
          <Reveal className="section-heading section-heading-light">
            <span>LIVE PRODUCT</span>
            <h2>不是概念图，是可以亲手操作的拾知</h2>
            <p>切换标签、展开目标、调整模式与主题，感受它如何贴着你的浏览习惯工作。</p>
          </Reveal>
          <Reveal className="product-stage" delay={100} variant="scale">
            <div className="stage-orbit orbit-one" /><div className="stage-orbit orbit-two" />
            <RealShizhiPanel expanded />
          </Reveal>
        </div>
      </section>

      <section className="cc-section process-section">
        <div className="cc-container grid gap-16 lg:grid-cols-[.84fr_1.16fr] lg:items-start">
          <Reveal variant="left" className="sticky-copy">
            <span className="eyebrow">A QUIET WORKFLOW</span>
            <h2>不打断思考，<br />恰到好处地<br />出现。</h2>
            <p>拾知不是另一个需要维护的知识库。它嵌在浏览器里，在信息最鲜活的时候帮你完成最少但关键的整理。</p>
            <a href="#download">查看完整工作流 <ArrowUpRight /></a>
          </Reveal>
          <div className="process-list">
            {steps.map(([number, title, description], index) => (
              <Reveal key={number} delay={index * 90} variant="right">
                <article>
                  <span>{number}</span><div><h3>{title}</h3><p>{description}</p></div>
                  <div className="process-visual">
                    {index === 0 && <><MousePointer2 /><div className="capture-chip"><Sparkles />已捕捉页面</div></>}
                    {index === 1 && <><Route /><div className="route-lines"><i /><i /><i /></div></>}
                    {index === 2 && <><Search /><div className="search-result"><Check />找到 8 条高相关记录</div></>}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="stories" className="scene-section cc-section">
        <div className="cc-container">
          <Reveal className="section-heading">
            <span>MADE FOR DEEP WORK</span><h2>一个工具，陪你完成不同类型的探索</h2>
          </Reveal>
          <Reveal className="scene-switcher" delay={80} variant="scale">
            <div className="scene-tabs">{scenes.map((item, index) => <button type="button" key={item} className={scene === index ? "active" : ""} onClick={() => setScene(index)}>{item}</button>)}</div>
            <div className="scene-canvas">
              <div className="scene-copy">
                <span>0{scene + 1} / 03</span>
                <h3>{scene === 0 ? "让每一次阅读，都为下一轮增长实验提供依据。" : scene === 1 ? "把竞品、访谈和行业判断收拢到同一条证据链。" : "从文献发现到论点组织，保留完整而可信的研究路径。"}</h3>
                <p>{scene === 0 ? "自动归纳渠道打法、内容选题和效果信号，减少重复调研。" : scene === 1 ? "按产品目标串联碎片信息，更快看清机会、风险和优先级。" : "围绕课题积累来源、摘要与笔记，随时找回支撑结论的材料。"}</p>
              </div>
              <div className="scene-map">
                <span className="map-center">{scenes[scene]}</span>
                {["关键发现", "证据来源", "下一步", "相关记录"].map((item, index) => <span key={item} className={`map-node node-${index}`}>{item}</span>)}
                <svg viewBox="0 0 500 300" aria-hidden="true"><path d="M250 150C190 145 176 72 100 64M250 150c66-10 85-80 157-76M250 150c-62 8-90 82-155 92M250 150c65 6 86 79 165 91" /></svg>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
