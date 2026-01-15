import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileSpreadsheet, 
  LogOut, 
  User, 
  ChevronRight,
  Tag,
  Wallet,
  Users,
  Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const settingsGroups = [
    {
      title: 'Data',
      items: [
        { icon: FileSpreadsheet, label: 'Connected Sheet', value: 'docs.google.com/...', action: () => {} },
      ],
    },
    {
      title: 'Configuration',
      items: [
        { icon: Layers, label: 'Categories', value: '6 categories', action: () => {} },
        { icon: Wallet, label: 'Caches', value: '3 accounts', action: () => {} },
        { icon: Users, label: 'People', value: '3 people', action: () => {} },
      ],
    },
  ];

  return (
    <AppLayout title="Settings">
      <div className="space-y-6">
        {/* Profile Card */}
        <Card className="animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-foreground">{user?.name || 'Demo User'}</h2>
                <p className="text-sm text-muted-foreground">{user?.email || 'demo@cachetag.app'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <div 
            key={group.title} 
            className="space-y-2 animate-slide-up"
            style={{ animationDelay: `${50 + groupIndex * 50}ms` }}
          >
            <h3 className="text-sm font-medium text-muted-foreground px-1">{group.title}</h3>
            <Card>
              <CardContent className="p-0 divide-y divide-border">
                {group.items.map(({ icon: Icon, label, value, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    className="w-full flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-foreground">{label}</p>
                      <p className="text-sm text-muted-foreground truncate">{value}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        ))}

        {/* App Info */}
        <div className="text-center py-4 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <div className="inline-flex items-center gap-2 text-muted-foreground mb-2">
            <Tag className="w-4 h-4" />
            <span className="font-medium">CacheTag</span>
          </div>
          <p className="text-sm text-muted-foreground">Version 1.0.0</p>
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 animate-slide-up"
          style={{ animationDelay: '200ms' }}
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </AppLayout>
  );
}
