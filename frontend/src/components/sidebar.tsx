import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col py-md fixed left-0 top-[50px] h-[calc(100vh-50px)] w-[220px] bg-surface-container-low border-r border-border-default z-40">
      <div className="px-md mb-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-md bg-primary-container/20 flex items-center justify-center text-primary border border-primary/30">
            <span className="material-symbols-outlined text-sm">terminal</span>
          </div>
          <div>
            <h2 className="font-label-bold text-label-bold text-primary">Navigation</h2>
            <p className="font-body-md text-body-md text-on-surface-variant text-[11px] opacity-70">Workspace</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 flex flex-col gap-1 px-2">
        <Link className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-bright text-primary border-r-4 border-primary scale-95 transition-all" href="/problems">
          <span className="material-symbols-outlined">menu_book</span>
          <span className="font-label-bold text-label-bold">Library</span>
        </Link>
        <Link className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all" href="/dashboard">
          <span className="material-symbols-outlined">ads_click</span>
          <span className="font-label-bold text-label-bold">Quest</span>
        </Link>
        <Link className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all" href="/explore">
          <span className="material-symbols-outlined">explore</span>
          <span className="font-label-bold text-label-bold">Explore</span>
        </Link>
        <Link className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all" href="/history">
          <span className="material-symbols-outlined">event_note</span>
          <span className="font-label-bold text-label-bold">Study Plan</span>
        </Link>
        
        <div className="h-px bg-border-default my-2 mx-3"></div>
        
        <Link className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all" href="#">
          <span className="material-symbols-outlined">list</span>
          <span className="font-label-bold text-label-bold">My Lists</span>
        </Link>
        <Link className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all" href="#">
          <span className="material-symbols-outlined">bookmark</span>
          <span className="font-label-bold text-label-bold">Saved by me</span>
        </Link>
      </nav>
    </aside>
  );
}
