import { Bot, BrainCircuit, Compass, Download, ListTree, MessageCircleQuestion, SearchCheck, ShieldCheck, Sparkles } from "lucide-react";
import { Reveal } from "@/components/sites/shizhi/Reveal";

const features = [
  [ListTree, "需求拆解", "一句话，就是一棵任务树。把目标交给 AI，生成最多三层任务，让下一步从“不知道从哪开始”变成“先做这一件”。"],
  [Compass, "自动记录", "工作有档案，摸鱼进池塘。开启工作模式，网页自动记录；相关内容归入工作，无关网页沉入摸鱼池。"],
  [BrainCircuit, "分析归档", "分析完，送每条记录回家。记录自动排队、并行分析，再归入相关目标，让资料提前站好队。"],
  [SearchCheck, "语义检索", "不只按标题找记录。结合摘要、关键词和语义关系，把散落的资料重新连成一条线。"],
  [Sparkles, "智能路线", "一个气泡，一张会更新的路线图。AI 根据已有记录更新 ToDo，告诉你下一步值得做什么。"],
  [MessageCircleQuestion, "输入补全", "写到一半，AI 递来下半句。先写下关键词，再用 Tab 接住建议，让表达自然流下去。"],
  [Bot, "用户画像", "用得越久，它越懂你的路数。你的目标与记录沉淀成 AI 记忆，让分析、建议和补全越来越贴近你。"],
  [Download, "成果导出", "成果打包，一个 JSON 带走。选择全部目标或指定目标，把阶段性研究交给其他工具继续处理。"],
  [ShieldCheck, "本地知识库", "记录出了浏览器，住进本地知识库。导出的记录可以归档、入库 SQLite，并在需要时生成深度报告。"],
] as const;


export function SponsorsFeatures() {
  return (
    <>
      <section id="features" className="cc-section">
        <div className="cc-container">
          <Reveal className="section-heading">
            <span>WHY GLEAN</span>
            <h2>把浏览，变成一套会生长的工作流</h2>
            <p>从捕捉、理解到再次使用，拾知把信息流变成真正属于你的知识资产。</p>
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
