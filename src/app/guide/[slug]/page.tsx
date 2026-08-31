import { notFound } from "next/navigation";
import fs from "fs/promises";
import path from "path";
import { findGuideEntry, allGuideEntries } from "@/lib/guide-nav";
import { Markdown } from "@/components/sites/shizhi/Markdown";
import { GuideNextPage } from "@/components/sites/shizhi/GuideNextPage";

export const dynamicParams = false;

export function generateStaticParams() {
  return allGuideEntries().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = findGuideEntry(slug);
  if (!entry) return {};
  return {
    title: `${entry.title} - 指南 - 拾知 Shizhi`,
    description: entry.description,
  };
}

export default async function GuideDocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = findGuideEntry(slug);
  if (!entry) notFound();

  const filePath = path.join(process.cwd(), entry.sourceFile);
  let raw = "";
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch {
    notFound();
  }

  return (
    <>
      <Markdown source={raw} />
      <GuideNextPage currentSlug={slug} />
    </>
  );
}
