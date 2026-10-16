import AboutSection from '@/components/home/AboutSection';
import ExperienceSection from '@/components/home/ExperienceSection';

export const metadata = { title: 'About & Experience', description: 'My background in systems administration, cloud engineering, programming, and technical problem solving.' };
export default function AboutPage() {
  return (
    <main id="main" className="subpage">
      <AboutSection />
      <ExperienceSection />
    </main>
  );
}
