import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ChevronRight, Edit2, Check, X, Trash2 } from 'lucide-react';
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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Category, Subcategory } from '@/types/finance';

export default function Categories() {
    const { categories, subcategories, addCategory, addSubcategory, updateCategory, updateSubcategory } = useApp();

    // Create/Edit Category State
    const [showCategoryDialog, setShowCategoryDialog] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryName, setCategoryName] = useState('');
    const [categoryEmoji, setCategoryEmoji] = useState('💰');

    // Subcategory State
    const [showSubcategoryDialog, setShowSubcategoryDialog] = useState(false);
    const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
    const [subcategoryName, setSubcategoryName] = useState('');
    const [targetCategoryId, setTargetCategoryId] = useState('');

    const handleOpenCategoryDialog = (cat?: Category) => {
        if (cat) {
            setEditingCategory(cat);
            setCategoryName(cat.name);
            setCategoryEmoji(cat.emoji || '💰');
        } else {
            setEditingCategory(null);
            setCategoryName('');
            setCategoryEmoji('💰');
        }
        setShowCategoryDialog(true);
    };

    const handleSaveCategory = async () => {
        if (!categoryName.trim()) {
            toast.error('Please enter a name');
            return;
        }

        try {
            if (editingCategory) {
                await updateCategory({
                    ...editingCategory,
                    name: categoryName.trim(),
                    emoji: categoryEmoji,
                });
                toast.success('Category updated!');
            } else {
                await addCategory(categoryName.trim(), categoryEmoji);
                toast.success('Category added!');
            }
            setShowCategoryDialog(false);
        } catch (err) {
            toast.error('Operation failed');
        }
    };

    const handleOpenSubcategoryDialog = (catId: string, sub?: Subcategory) => {
        setTargetCategoryId(catId);
        if (sub) {
            setEditingSubcategory(sub);
            setSubcategoryName(sub.name);
        } else {
            setEditingSubcategory(null);
            setSubcategoryName('');
        }
        setShowSubcategoryDialog(true);
    };

    const handleSaveSubcategory = async () => {
        if (!subcategoryName.trim()) {
            toast.error('Please enter a name');
            return;
        }

        try {
            if (editingSubcategory) {
                await updateSubcategory({
                    ...editingSubcategory,
                    name: subcategoryName.trim(),
                });
                toast.success('Subcategory updated!');
            } else {
                await addSubcategory(subcategoryName.trim(), targetCategoryId);
                toast.success('Subcategory added!');
            }
            setShowSubcategoryDialog(false);
        } catch (err) {
            toast.error('Operation failed');
        }
    };

    return (
        <AppLayout title="Categories">
            <div className="space-y-6 pb-20">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Manage Categories</h2>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-primary"
                        onClick={() => handleOpenCategoryDialog()}
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Category
                    </Button>
                </div>

                <div className="space-y-6">
                    {categories.map((category, index) => {
                        const catSubcategories = subcategories.filter(s => s.parentCategoryId === category.id);
                        return (
                            <div
                                key={category.id}
                                className="space-y-2 animate-slide-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <Card className="overflow-hidden border-l-4 border-l-primary">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                                                {category.emoji || '📁'}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg text-foreground">{category.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {catSubcategories.length} subcategories
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenCategoryDialog(category)}
                                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="pl-6 space-y-2">
                                    {catSubcategories.map(sub => (
                                        <div
                                            key={sub.id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 group"
                                        >
                                            <span className="text-sm font-medium">{sub.name}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenSubcategoryDialog(category.id, sub)}
                                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full h-9 border-dashed border bg-transparent text-muted-foreground hover:text-primary hover:border-primary text-xs"
                                        onClick={() => handleOpenSubcategoryDialog(category.id)}
                                    >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add Subcategory
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Category Dialog */}
            <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Category Name</Label>
                            <Input
                                placeholder="Enter category name"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Emoji</Label>
                            <div className="flex flex-wrap gap-2 text-2xl">
                                {['💰', '🛒', '🍔', '🚗', '🏠', '🎁', '🏥', '🎮', '💡', '👕', '📱', '✈️', '🍽️', '🍿', '💊', '🔋'].map(emoji => (
                                    <button
                                        key={emoji}
                                        onClick={() => setCategoryEmoji(emoji)}
                                        className={cn(
                                            "w-10 h-10 flex items-center justify-center rounded-lg transition-all",
                                            categoryEmoji === emoji ? "bg-primary/20 ring-2 ring-primary" : "bg-secondary hover:bg-secondary/80"
                                        )}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>Cancel</Button>
                        <Button onClick={handleSaveCategory}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Subcategory Dialog */}
            <Dialog open={showSubcategoryDialog} onOpenChange={setShowSubcategoryDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Subcategory Name</Label>
                            <Input
                                placeholder="Enter subcategory name"
                                value={subcategoryName}
                                onChange={(e) => setSubcategoryName(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSubcategoryDialog(false)}>Cancel</Button>
                        <Button onClick={handleSaveSubcategory}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
