// SPDX-License-Identifier: GPL-3.0-or-later
import {useEffect,useRef,useState} from 'react'
import {Link} from 'react-router-dom'
import {games} from '../lib/catalog'
import {CATALOG_KEY,validateCatalog} from '../lib/desktopCatalog'
export function DesktopBar(){
 const input=useRef<HTMLInputElement>(null)
 const [error,setError]=useState(''),[tool,setTool]=useState<ToolStatus|null>(null),[busy,setBusy]=useState(false)
 const api=window.overdriveLocal,imported=Boolean(localStorage.getItem(CATALOG_KEY))
 useEffect(()=>{api?.toolchain().then(setTool).catch(e=>setError(String(e)))},[api])
 return <section className="mx-8 mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface px-5 py-3 text-sm">
  <div><strong>Portlight Desktop <span className="text-muted">· experimental</span></strong><p className="text-muted">{games.length} entries · {imported?'Imported catalog':'Homebrew projects'} · {tool?.configured?'AnyPS5 configured':'Select AnyPS5 to prepare local games'}</p><Link data-nav to="/homebrew" className="underline">Homebrew projects &amp; test results</Link></div>
  <div className="flex flex-wrap gap-3"><button data-nav disabled={!api||busy} className="rounded border border-line px-3 py-2 disabled:opacity-50" onClick={async()=>{setBusy(true);setError('');try{setTool(await api!.configure())}catch(e){setError(String(e))}finally{setBusy(false)}}}>Configure AnyPS5</button><button data-nav className="rounded border border-line px-3 py-2" onClick={()=>input.current?.click()}>Import catalog</button>{imported&&<button data-nav onClick={()=>{localStorage.removeItem(CATALOG_KEY);location.hash='/';location.reload()}}>Use bundled catalog</button>}</div>
  <input ref={input} type="file" accept=".json,application/json" className="hidden" aria-label="Catalog JSON" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>20_000_000)throw Error('Catalog must be smaller than 20 MB.');localStorage.setItem(CATALOG_KEY,JSON.stringify(validateCatalog(JSON.parse(await file.text()))));location.hash='/';location.reload()}catch(err){setError(String(err));e.target.value=''}}}/>
  {error&&<p role="alert" className="w-full text-red-300">{error}</p>}
 </section>
}
