import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, User } from 'lucide-react';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Person } from '@/types/finance';

export default function People() {
    const { people, addPerson, updatePerson } = useApp();

    const [showDialog, setShowDialog] = useState(false);
    const [editingPerson, setEditingPerson] = useState<Person | null>(null);
    const [name, setName] = useState('');
    const [relation, setRelation] = useState<'Self' | 'Friend' | 'Family'>('Friend');

    const handleOpenDialog = (person?: Person) => {
        if (person) {
            setEditingPerson(person);
            setName(person.name);
            setRelation(person.relation);
        } else {
            setEditingPerson(null);
            setName('');
            setRelation('Friend');
        }
        setShowDialog(true);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error('Please enter a name');
            return;
        }

        try {
            if (editingPerson) {
                await updatePerson({
                    ...editingPerson,
                    name: name.trim(),
                    relation,
                });
                toast.success('Person updated!');
            } else {
                await addPerson(name.trim(), relation);
                toast.success('Person added!');
            }
            setShowDialog(false);
        } catch (err) {
            toast.error('Operation failed');
        }
    };

    return (
        <AppLayout title="People">
            <div className="space-y-4 pb-20">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Manage People</h2>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-primary"
                        onClick={() => handleOpenDialog()}
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Person
                    </Button>
                </div>

                <div className="space-y-3">
                    {people.map((person, index) => (
                        <Card
                            key={person.id}
                            className="animate-slide-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <User className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-foreground">{person.name}</h3>
                                        <p className="text-sm text-muted-foreground capitalize">
                                            {person.relation}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleOpenDialog(person)}
                                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingPerson ? 'Edit Person' : 'Add Person'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                placeholder="Enter name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Relation</Label>
                            <Select value={relation} onValueChange={(v) => setRelation(v as any)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Self">Self</SelectItem>
                                    <SelectItem value="Friend">Friend</SelectItem>
                                    <SelectItem value="Family">Family</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
