import HeroSection from '@/components/home/HeroSection';
import ToolkitSection from '@/components/home/ToolkitSection';
import WorkSection from '@/components/home/WorkSection';

export default function HomePage() {
  return (
    <main id="main">
      <HeroSection />
      <ToolkitSection />
      <WorkSection />
    </main>
  );
}
