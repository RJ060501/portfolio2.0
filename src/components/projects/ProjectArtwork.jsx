import MonitorArtwork from './artwork/MonitorArtwork';
import AccountingArtwork from './artwork/AccountingArtwork';
import ScraperArtwork from './artwork/ScraperArtwork';
import SnakeArtwork from './artwork/SnakeArtwork';
import VideoArtwork from './artwork/VideoArtwork';
import TerminalArtwork from './artwork/TerminalArtwork';
import TrendsArtwork from './artwork/TrendsArtwork';
import TerraformArtwork from './artwork/TerraformArtwork';

const artworkComponents = {
  monitor: MonitorArtwork,
  accounting: AccountingArtwork,
  scraper: ScraperArtwork,
  snake: SnakeArtwork,
  video: VideoArtwork,
  terminal: TerminalArtwork,
  trends: TrendsArtwork,
  terraform: TerraformArtwork,
};

export default function ProjectArtwork({ type }) {
  const Artwork = artworkComponents[type] ?? TerminalArtwork;
  return <Artwork />;
}
