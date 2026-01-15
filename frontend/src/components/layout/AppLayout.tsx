import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showNav?: boolean;
}

export function AppLayout({ children, title, showNav = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {title && (
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="px-4 py-4 max-w-lg mx-auto">
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          </div>
        </header>
      )}
      <main className={cn("px-4 pb-24 max-w-lg mx-auto", title ? "pt-4" : "pt-6")}>
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
