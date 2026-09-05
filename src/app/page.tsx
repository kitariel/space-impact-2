import { Navigation } from '@/components/landing/Navigation';
import { Hero } from '@/components/landing/Hero';
import { SystemSection } from '@/components/landing/SystemSection';
import { ExplodedSection } from '@/components/landing/ExplodedSection';
import { MissionSection } from '@/components/landing/MissionSection';
import { LiveStrip } from '@/components/landing/LiveStrip';
import { ScoreSection } from '@/components/landing/ScoreSection';
import { Footer } from '@/components/landing/Footer';
export default function Home() {
  return <><Navigation/><main id="main"><Hero/><SystemSection/><ExplodedSection/><MissionSection/><LiveStrip/><ScoreSection/></main><Footer/></>;
}
