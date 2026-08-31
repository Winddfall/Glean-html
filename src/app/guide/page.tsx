import fs from "fs/promises";
import path from "path";
import { Markdown } from "@/components/sites/shizhi/Markdown";
import { GuideNextPage } from "@/components/sites/shizhi/GuideNextPage";

export default async function GuideIndexPage() {
  const filePath = path.join(process.cwd(), "docs/product/install.md");
  const raw = await fs.readFile(filePath, "utf8");
  return (
    <>
      <Markdown source={raw} />
      <GuideNextPage currentSlug="install" />
    </>
  );
}
