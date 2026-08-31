import { CtaFooter } from "@/components/sites/shizhi/CtaFooter";
import { HeaderHero } from "@/components/sites/shizhi/HeaderHero";
import { ProductDeveloper } from "@/components/sites/shizhi/ProductDeveloper";
import { SponsorsFeatures } from "@/components/sites/shizhi/SponsorsFeatures";
import { TestimonialsFaq } from "@/components/sites/shizhi/TestimonialsFaq";
import { KnowledgeField } from "@/components/sites/shizhi/KnowledgeField";

export default function Home() {
  return (
    <main className="site-shell min-h-screen text-foreground">
      <KnowledgeField />
      <HeaderHero />
      <SponsorsFeatures />
      <ProductDeveloper />
      <TestimonialsFaq />
      <CtaFooter />
    </main>
  );
}
