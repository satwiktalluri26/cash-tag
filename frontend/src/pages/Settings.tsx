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
  const { user, logout, sourcesWithBalances, categories, people } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const settingsGroups = [
    {
      title: 'Configuration',
      items: [
        { icon: Layers, label: 'Categories', value: `${categories.length} categories`, action: () => navigate('/categories') },
        { icon: Users, label: 'People', value: `${people.length} people`, action: () => navigate('/people') },
      ],
    },
  ];

  return (
    <AppLayout title="Settings">
      <div className="space-y-6">
        {/* Profile Card */}
        <Card
          className="animate-slide-up cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => navigate('/profile')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full border-2 border-primary/10 p-0.5">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-7 h-7 text-primary" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-foreground">{user?.name || 'Demo User'}</h2>
                <p className="text-sm text-muted-foreground">{user?.email || 'demo@cashtag.app'}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
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
            <span className="font-medium">CashTag</span>
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
