'use client';

import { Navbar } from './navbar';
import { Sidebar } from './sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
  hideLeftSidebar?: boolean;
}

export function AppLayout({ children, rightSidebar, hideLeftSidebar }: AppLayoutProps) {
  return (
    <>
      <Navbar />
      <div className="flex h-[calc(100vh-var(--nav-h))]">
        {!hideLeftSidebar && <Sidebar />}
        <main className="flex-1 overflow-y-auto">{children}</main>
        {rightSidebar && (
          <aside className="w-[300px] shrink-0 border-l border-[var(--border)] overflow-y-auto p-4 max-lg:hidden">
            {rightSidebar}
          </aside>
        )}
      </div>
    </>
  );
}
