import type { Metadata } from "next";
import "./globals.css";
import { withBasePath } from "@/lib/base-path";

export const metadata: Metadata = {
  title: "拾知 Shizhi - 让浏览沉淀为知识",
  description: "拾知是一款本地优先的浏览知识助手，帮你围绕目标记录、分析、检索并重新使用网页信息。",
  icons: { icon: withBasePath("/sites/shizhi/logo.jpg") },
};

// 首帧前同步执行：读取本地主题偏好（缺省跟随系统），避免暗色用户看到浅色闪屏
const themeInitScript = `(function(){try{var t=localStorage.getItem("shizhi-theme");if(t!=="dark"&&t!=="light"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}var d=document.documentElement;d.classList.toggle("dark",t==="dark");d.style.colorScheme=t}catch(e){}})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
