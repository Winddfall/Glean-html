"use client";

import { Check, MousePointer2, Route, Search, Sparkles } from "lucide-react";
import { Reveal } from "@/components/sites/shizhi/Reveal";

const steps = [
  ["01", "先把需求拆成任务树", "输入一句话目标，AI 自动生成最多三层任务；拖一拖排序，先明确这次要解决什么。"],
  ["02", "浏览时自动记录并归档", "开启工作模式后，网页主题、关键信息与来源会被自动记录，再由 AI 分析并归入相关目标。"],
  ["03", "回来就能检索并继续行动", "按标题、摘要、关键词和语义关系找回资料；打开建议气泡，直接拿到下一步搜索方向。"],
] as const;

export function ProductDeveloper() {
  return (
    <>
      <section className="cc-section process-section">
        <div className="cc-container grid gap-16 lg:grid-cols-[.84fr_1.16fr] lg:items-start">
          <Reveal variant="left" className="sticky-copy">
            <span className="eyebrow">A QUIET WORKFLOW</span>
            <h2>不打断思考，<br />恰到好处地<br />出现。</h2>
            <p>拾知不是另一个需要维护的知识库。它嵌在浏览器里，在信息最鲜活的时候帮你完成最少但关键的整理。</p>
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


    </>
  );
}
