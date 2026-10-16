import '@/styles/globals.css';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
export const metadata = {
  icons: { icon: '/icon.svg' },
  title: { default: 'Ryan Russell | Systems, Cloud & Code', template: '%s | Ryan Russell' },
  description:
    'Systems administrator and developer in Salt Lake City. Explore security monitoring, cloud applications, automation, and hands-on technical case studies.',
  openGraph: {
    title: 'Ryan Russell — Systems, Cloud & Code',
    description: 'Practical systems. Thoughtful software. Explore my work.',
    type: 'website',
  },
  robots: { index: true, follow: true },
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
