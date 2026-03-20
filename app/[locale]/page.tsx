import { Hero } from '@/components/home/Hero';
import { ProofBar } from '@/components/home/ProofBar';
import { FeaturedWork } from '@/components/home/FeaturedWork';
import { HowIThink } from '@/components/home/HowIThink';
import { WritingPreview } from '@/components/home/WritingPreview';
import { HomeCTA } from '@/components/home/HomeCTA';

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProofBar />
      <FeaturedWork />
      <HowIThink />
      <WritingPreview />
      <HomeCTA />
    </>
  );
}
