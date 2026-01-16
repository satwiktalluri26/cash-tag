import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { User, Mail, Shield } from 'lucide-react';

export default function Profile() {
    const { user } = useApp();

    return (
        <AppLayout title="Profile">
            <div className="space-y-6">
                <div className="flex flex-col items-center pt-4 pb-2">
                    <div className="w-24 h-24 rounded-full border-4 border-primary/20 p-1 mb-4">
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="w-12 h-12 text-primary" />
                            </div>
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">{user?.name}</h2>
                    <p className="text-muted-foreground">{user?.email}</p>
                </div>

                <Card>
                    <CardContent className="p-0 divide-y divide-border">
                        <div className="flex items-center gap-4 p-4">
                            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                                <User className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">Display Name</p>
                                <p className="font-medium text-foreground">{user?.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4">
                            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                                <Mail className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">Email Address</p>
                                <p className="font-medium text-foreground">{user?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4">
                            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                                <Shield className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">Account Status</p>
                                <p className="font-medium text-green-600">Active</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-sm text-muted-foreground px-6 pt-4">
                    Your profile information is fetched from your Google account.
                </p>
            </div>
        </AppLayout>
    );
}
