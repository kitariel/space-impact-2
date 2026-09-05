import Link from 'next/link';
export function Brand({ footer = false }: { footer?: boolean }) {
  return <Link href="/" className={`brand ${footer ? 'brand-footer' : ''}`} aria-label="IMPACT 01 home"><svg width="22" height="24" viewBox="0 0 22 24" fill="none" aria-hidden="true"><path d="M0 20 8 4h5L5 20H0ZM10 20 18 4h4l-8 16h-4Z" fill="currentColor"/></svg><span>IMPACT<span className="brand-cursor">_</span>01</span></Link>;
}
