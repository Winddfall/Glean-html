import { CtaFooter } from "@/components/sites/ccswitch-a1fc3ebb/zh-c8763bc2/CtaFooter";
import { HeaderHero } from "@/components/sites/ccswitch-a1fc3ebb/zh-c8763bc2/HeaderHero";
import { ProductDeveloper } from "@/components/sites/ccswitch-a1fc3ebb/zh-c8763bc2/ProductDeveloper";
import { SponsorsFeatures } from "@/components/sites/ccswitch-a1fc3ebb/zh-c8763bc2/SponsorsFeatures";
import { TestimonialsFaq } from "@/components/sites/ccswitch-a1fc3ebb/zh-c8763bc2/TestimonialsFaq";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <HeaderHero />
      <SponsorsFeatures />
      <ProductDeveloper />
      <TestimonialsFaq />
      <CtaFooter />
    </main>
  );
}
