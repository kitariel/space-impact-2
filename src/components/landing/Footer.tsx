import { ArrowUp } from 'lucide-react';
import { Brand } from '@/components/ui/Brand';
export function Footer() {
  return <footer className="site-footer section-wrap" id="about"><div className="footer-top"><Brand footer/><p>A small tribute to simpler games.<br/>An original machine for a familiar feeling.</p><a href="#game" className="back-top" aria-label="Back to top"><ArrowUp size={18}/></a></div><div className="footer-bottom"><span>© 2026 IMPACT SYSTEMS</span><span>INDEPENDENTLY BUILT. ENDLESSLY PLAYABLE.</span><span><i className="status-dot"/> ALL SYSTEMS NOMINAL</span></div></footer>;
}
