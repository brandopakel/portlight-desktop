export function LogoMark({className='size-7'}:{className?:string}) {return <svg viewBox="0 0 32 32" className={className} aria-hidden><path d="M9 26V6h16v14H9" fill="none" stroke="currentColor" strokeWidth="3"/></svg>}
export function Logo(){return <span className="flex items-center gap-2"><LogoMark/><span className="text-[1.1875rem] font-semibold tracking-tight">portlight</span></span>}
