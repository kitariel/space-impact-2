import Link from 'next/link';
import { ArrowUpLeft } from 'lucide-react';
import { Brand } from '@/components/ui/Brand';
export default function NotFound() {
  return <main className="not-found"><Brand/><span className="eyebrow">ERROR 404 / COORDINATES NOT FOUND</span><h1>SIGNAL<br/><span>LOST.</span></h1><p>Even the best pilots drift off course.</p><Link className="launch-button" href="/"><ArrowUpLeft size={18}/>RETURN TO SYSTEM</Link><span className="lost-coordinate">LAST KNOWN POSITION: UNKNOWN</span></main>;
}
