export type GuideEntry = {
  slug: string;
  title: string;
  description: string;
  sourceFile: string;
};

export type GuideGroup = {
  title: string;
  items: GuideEntry[];
};

export const guideNav: GuideGroup[] = [
  {
    title: "启程",
    items: [
      {
        slug: "install",
        title: "安装",
        description: "先安装 Tabbit，再安装脚本妙招拾知。",
        sourceFile: "docs/product/install.md",
      },
      {
        slug: "getting-started",
        title: "快速上手",
        description: "6 步走通\"定目标 → 浏览 → 跟建议 → 沉淀 → 加速 → 追问\"的完整工作流。",
        sourceFile: "docs/product/getting-started.md",
      },
      {
        slug: "storage",
        title: "存储说明",
        description: "存储说明 · 同源共享 · 跨源隔离。",
        sourceFile: "docs/product/storage.md",
      },
    ],
  },
  {
    title: "核心功能",
    items: [
      {
        slug: "requirement-breakdown",
        title: "需求拆解",
        description: "一句话目标，最多 3 级任务，可拖拽排序。",
        sourceFile: "docs/product/requirement-breakdown.md",
      },
      {
        slug: "auto-recording",
        title: "自动记录",
        description: "自动记录 · 工作模式 / 摸鱼模式 / 专注。",
        sourceFile: "docs/product/auto-recording.md",
      },
      {
        slug: "analysis-archiving",
        title: "分析归档",
        description: "分析归档 · Tabbit 内置 AI 并行处理 · 可自定义提示词。",
        sourceFile: "docs/product/analysis-archiving.md",
      },
      {
        slug: "smart-todo-list",
        title: "ToDo list",
        description: "智能 ToDo list · 消息气泡 · 当前关联网址。",
        sourceFile: "docs/product/smart-todo-list.md",
      },
      {
        slug: "record-export",
        title: "记录导出",
        description: "记录导出 · 全部目标或指定目标 · JSON 格式。",
        sourceFile: "docs/product/record-export.md",
      },
      {
        slug: "input-completion",
        title: "Tabbit 输入补全",
        description: "输入补全 · Tabbit 首页输入框 · 结合用户画像。",
        sourceFile: "docs/product/input-completion.md",
      },
      {
        slug: "user-profile",
        title: "用户画像",
        description: "用户画像 · 定时更新的 AI 记忆 · 影响分析 / 建议 / 补全。",
        sourceFile: "docs/product/user-profile.md",
      },
      {
        slug: "local-agent-analysis",
        title: "Glean-archive skill",
        description: "本地 Agent 辅助分析 · 配套 skill · 归档 / 入库 / 报告。",
        sourceFile: "docs/product/local-agent-analysis.md",
      },
    ],
  },
  {
    title: "本地 Web UI",
    items: [
      {
        slug: "ask-deepseek-harness",
        title: "问问 Deepseek Harness",
        description: "问问 Deepseek Harness · 网页文字直达本地对话。",
        sourceFile: "docs/product/ask-deepseek-harness.md",
      },
    ],
  },
];

/** Flatten all entries across groups */
export function allGuideEntries(): GuideEntry[] {
  return guideNav.flatMap((g) => g.items);
}

/** Find entry by slug */
export function findGuideEntry(slug: string): GuideEntry | undefined {
  return allGuideEntries().find((e) => e.slug === slug);
}
