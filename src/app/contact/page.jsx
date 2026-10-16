import ContactSection from '@/components/contact/ContactSection';
export const metadata = {
  title: 'Contact',
  description: 'Contact Ryan Russell about systems, cloud, and engineering opportunities.',
};
export default function ContactPage() {
  return (
    <main id="main" className="subpage">
      <ContactSection />
    </main>
  );
}
