import MonitorDemo from '@/features/monitoring/MonitorDemo';
import AccountingDemo from '@/features/accounting/AccountingDemo';
import ScraperDemo from '@/features/articles/ScraperDemo';
import SnakeDemo from '@/features/snake/SnakeDemo';
import TrendsDemo from '@/features/trends/TrendsDemo';

const demoComponents = {
  monitor: MonitorDemo,
  accounting: AccountingDemo,
  scraper: ScraperDemo,
  snake: SnakeDemo,
  trends: TrendsDemo,
};

export default function ProjectDemo({ type }) {
  const Component = demoComponents[type];
  return Component ? <Component /> : null;
}
