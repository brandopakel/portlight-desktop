import {useEffect,useState} from 'react'
import type {Game} from '../../lib/catalog'
export function DownloadButton({game}:{game:Game}) {
 const [status,setStatus]=useState<LocalStatus|null>(null),[error,setError]=useState(''),[waiting,setWaiting]=useState(false)
 const api=window.overdriveLocal
 useEffect(()=>{let active=true;const refresh=()=>api?.status(game.id).then(s=>{if(active)setStatus(s)}).catch(e=>{if(active)setError(String(e))});refresh();const timer=setInterval(refresh,1500);return()=>{active=false;clearInterval(timer)}},[api,game.id])
 async function action(kind:'attach'|'prepare'|'launch'){if(!api)return;setWaiting(true);setError('');try{setStatus(await api[kind](game.id))}catch(e){setError(String(e).slice(0,500))}finally{setWaiting(false)}}
 const busy=waiting||status?.busy||status?.running
 const btn='w-full rounded-md border border-line px-3 py-2 text-sm hover:bg-surface-2 disabled:opacity-50'
 return <div className="space-y-2" aria-live="polite">
  {status?.homebrew&&<div className="rounded-md border border-line p-3 text-xs"><strong>{status.homebrew.downloaded?'Downloaded homebrew':'Local test report · 2026-10-12'} · {status.homebrew.status}</strong><p className="mt-2 whitespace-pre-wrap break-words">{status.homebrew.message.slice(0,600)}</p><button data-nav className="mt-2 ml-3 underline" onClick={()=>api?.source(game.id).catch(e=>setError(String(e)))}>Project source</button></div>}
  <button data-nav disabled={!api||!!busy} className={btn+' bg-accent text-accent-fg'} onClick={()=>action('launch')}>{status?.running?'Running…':'Launch local game'}</button>
  <button data-nav disabled={!api||!!busy} className={btn} onClick={()=>action('attach')}>{status?.attached?'Change Windows executable':'Attach Windows executable'}</button>
  <button data-nav disabled={!api||!!busy} className={btn} onClick={()=>action('prepare')}>Prepare ELF with AnyPS5</button>
  <p className="text-xs text-muted">Choose a local clean ELF. Launch prepares first if needed. Configure AnyPS5 using the button above.</p>
  <p className="text-xs text-subtle">Preparation copies the game folder’s resources. Conversion and gameplay depend on AnyPS5 support.</p>
  <p className="break-words text-xs text-muted">{status?.message||'Open the Windows app to attach local games.'}</p>
  {status?.exe&&<p className="break-all text-xs text-subtle" title={status.exe}>{status.source} · {status.exe}</p>}
  {status?.log&&<button data-nav className="text-xs underline" onClick={()=>api?.log(game.id).catch(e=>setError(String(e)))}>Open latest log</button>}
  {error&&<p role="alert" className="text-xs text-red-300">{error}</p>}
 </div>
}
