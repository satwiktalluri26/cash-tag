import { Home, Wallet, PlusCircle, BarChart3, Settings } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: Wallet, label: 'Sources', path: '/sources' },
  { icon: PlusCircle, label: 'Add', path: '/add', isMain: true },
  { icon: BarChart3, label: 'Trends', path: '/trends' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border px-2 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map(({ icon: Icon, label, path, isMain }) => {
          const isActive = location.pathname === path;

          return (
            <NavLink
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200",
                isMain && "relative -top-3",
                isActive && !isMain && "text-primary",
                !isActive && !isMain && "text-muted-foreground hover:text-foreground"
              )}
            >
              {isMain ? (
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
              ) : (
                <>
                  <Icon className={cn("w-5 h-5", isActive && "scale-110")} />
                  <span className="text-xs font-medium">{label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
