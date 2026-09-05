import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './globals.css';
import { LaunchProvider } from '@/components/ui/LaunchProvider';
export const metadata: Metadata = {
  title: 'IMPACT_01 — Survive the void.',
  description: 'An old-school heartbeat. A whole new machine. Pilot an original monochrome space shooter inside a premium retro-futuristic flight terminal.',
  applicationName: 'IMPACT_01',
  openGraph: { title: 'IMPACT_01 — Survive the void.', description: 'No map. No backup. Just you. A playable monochrome space shooter.', type: 'website' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#080A09' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><LaunchProvider>{children}</LaunchProvider></body></html>;
}
