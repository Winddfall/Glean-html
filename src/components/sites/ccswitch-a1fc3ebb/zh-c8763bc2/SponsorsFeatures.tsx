import { ArrowRight, BrainCircuit, Compass, Layers3, SearchCheck, ShieldCheck, Sparkles } from "lucide-react";
import { Reveal } from "@/components/sites/shizhi/Reveal";

const features = [
  [Compass, "围绕目标收集", "不是把网页丢进收藏夹，而是让每条信息从进入拾知起，就知道自己为什么被留下。"],
  [BrainCircuit, "AI 即时拆解", "把模糊目标拆成清晰的搜索方向、下一步行动和待验证问题，减少无效浏览。"],
  [SearchCheck, "语义检索与联想", "按标题、摘要、关键词与语义关系找回记录，自动发现不同资料之间的隐藏连接。"],
  [Layers3, "持续生成知识画像", "随着记录增加，沉淀你的关注主题、判断偏好和研究轨迹，形成个人知识地图。"],
  [Sparkles, "轻量工作 / 摸鱼双模式", "严肃研究与随手游览不再冲突。值得留下的灵感，之后再自然归入目标。"],
  [ShieldCheck, "数据本地优先", "记录与知识资产优先留在你的设备中，可导出、可迁移，也始终由你掌控。"],
] as const;

const stats = [["3 秒", "完成一次记录"], ["4 类", "自动知识归档"], ["100%", "数据可导出"], ["0 打断", "融入浏览流程"]];

export function SponsorsFeatures() {
  return (
    <>
      <section className="signal-strip">
        <div className="cc-container">
          <Reveal className="signal-card" variant="scale">
            <span className="signal-icon"><Sparkles /></span>
            <div><p>信息不该只是被收藏。</p><h2>它应该在需要时回来，帮你完成目标。</h2></div>
            <a href="#features">了解拾知 <ArrowRight /></a>
          </Reveal>
        </div>
      </section>

      <section id="features" className="cc-section">
        <div className="cc-container">
          <Reveal className="section-heading">
            <span>WHY SHIZHI</span>
            <h2>把浏览，变成一套会生长的工作流</h2>
            <p>从捕捉、理解到再次使用，拾知把信息流变成真正属于你的知识资产。</p>
          </Reveal>
          <Reveal className="stats-grid" delay={80} variant="scale">
            {stats.map(([number, label]) => <div key={label}><strong>{number}</strong><span>{label}</span></div>)}
          </Reveal>
          <div className="feature-grid">
            {features.map(([Icon, title, description], index) => (
              <Reveal key={title} delay={(index % 3) * 85}>
                <article className="feature-card">
                  <span className="feature-icon"><Icon /></span>
                  <span className="feature-number">0{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
