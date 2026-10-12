import { Link } from 'react-router-dom'
import {games} from '../lib/catalog'
import {DownloadButton} from '../features/game/DownloadButton'
export function HomebrewPage(){
 const library=games.filter(g=>g.genres.includes('Homebrew'))
 return <section className="mx-auto max-w-7xl px-8 py-8"><h1 className="text-3xl font-bold">Homebrew library</h1><p className="mt-3 text-muted">{library.length} catalog games · Upstream project links and historical AnyPS5 test results. Game files are supplied separately.</p><div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{library.map(g=><article key={g.id} className="rounded-xl border border-line bg-surface p-5"><Link data-nav to={'/game/'+g.slug} className="text-xl font-bold underline">{g.title}</Link><p className="my-3 text-sm text-muted">{g.shortDescription}</p><DownloadButton game={g}/></article>)}</div></section>
}
