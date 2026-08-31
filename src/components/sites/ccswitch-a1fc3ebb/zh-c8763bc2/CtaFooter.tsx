import Image from "next/image";
import { withBasePath } from "@/lib/base-path";
import { ArrowRight, Download } from "lucide-react";
import { Reveal } from "@/components/sites/shizhi/Reveal";
import { socialLinks } from "@/components/sites/shizhi/SocialIcons";

const groups = [{ title: "产品", links: ["核心能力", "工作流", "下载"] }, { title: "资源", links: ["使用指南", "更新日志", "常见问题"] }, { title: "社区", links: ["GitHub", "哔哩哔哩", "小红书"] }];

export function CtaFooter() {
  return (
    <>
      <section id="download" className="cta-section">
        <div className="cta-noise" />
        <div className="cc-container relative">
          <Reveal className="cta-card" variant="scale">
            <span>START COLLECTING WITH PURPOSE</span>
            <h2>下一次看到好内容时，<br />别再让它消失。</h2>
            <p>让拾知陪你把每一次浏览，积累成真正可复用的认知。</p>
            <div><a href="#" className="button-light"><Download />免费体验拾知</a><a href="#features" className="button-ghost">先了解更多 <ArrowRight /></a></div>
          </Reveal>
        </div>
      </section>
      <footer>
        <div className="cc-container footer-grid">
          <div className="footer-brand"><a href="#home"><Image src={withBasePath("/sites/shizhi/logo.jpg")} alt="" width={40} height={40} /><strong>拾知</strong></a><p>拾起碎片，沉淀认知。<br />一个为长期思考而生的浏览知识助手。</p><div>{socialLinks.map(({ name, Icon }) => <a key={name} href="#" aria-label={name} title={`${name}（链接待添加）`}><Icon /></a>)}</div></div>
          <div className="footer-links">{groups.map((group) => <div key={group.title}><h3>{group.title}</h3>{group.links.map((link) => <a key={link} href="#">{link}</a>)}</div>)}</div>
        </div>
        <div className="cc-container footer-bottom"><span>© 2026 拾知 Shizhi</span><span>为有目标的探索而设计</span></div>
      </footer>
    </>
  );
}
