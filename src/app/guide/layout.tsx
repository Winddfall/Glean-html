import type { Metadata } from "next";
import { SiteHeader } from "@/components/sites/shizhi/SiteHeader";
import { GuideSidebar } from "@/components/sites/shizhi/GuideSidebar";

export const metadata: Metadata = {
  title: "指南 - 拾知 Shizhi",
  description: "拾知安装与使用指南：先安装 Tabbit，再安装脚本妙招拾知。",
};

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="guide-page site-shell min-h-screen overflow-x-hidden text-foreground">
      <SiteHeader />
      <div className="cc-wide guide-shell">
        <GuideSidebar />
        <article className="guide-content">{children}</article>
      </div>
    </div>
  );
}
