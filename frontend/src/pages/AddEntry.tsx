import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { Check, Calendar, Users, StickyNote, X, Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import type { EntryType } from '@/types/finance';
import { toast } from 'sonner';

const CATEGORY_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
];

export default function AddEntry() {
  const navigate = useNavigate();
  const { categories, subcategories, sources, people, addExpense, addPerson, addCategory } = useApp();

  const [entryType, setEntryType] = useState<EntryType>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [sourceId, setSourceId] = useState('');
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Add Person Dialog
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonRelation, setNewPersonRelation] = useState<'Self' | 'Friend' | 'Family'>('Friend');

  // Add Category Dialog
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(CATEGORY_COLORS[0]);
  const [newCategoryEmoji, setNewCategoryEmoji] = useState('💰');

  // Add Subcategory Dialog
  const [showAddSubcategory, setShowAddSubcategory] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [newSubcategoryColor, setNewSubcategoryColor] = useState(CATEGORY_COLORS[0]);

  const filteredCategories = categories.filter(c => c.entryType === entryType);
  const filteredSubcategories = subcategories.filter(s => s.parentCategoryId === categoryId);

  const isExpense = entryType === 'EXPENSE';

  const handleSubmit = async () => {
    if (!amount || !categoryId || !sourceId) {
      toast.error('Please fill in all required fields');
      return;
    }

    const promise = addExpense({
      date,
      amount: parseFloat(amount),
      entryType,
      categoryId,
      subcategoryId: subcategoryId || undefined,
      sourceId,
      peopleIds: selectedPeople.sort(),
      notes: notes || undefined,
    });

    toast.promise(promise, {
      loading: 'Saving transaction...',
      success: `${entryType === 'INCOME' ? 'Income' : 'Expense'} added!`,
      error: 'Failed to save to Google Sheets',
    });

    await promise;
    navigate('/dashboard');
  };

  const togglePerson = (personId: string) => {
    setSelectedPeople(prev =>
      prev.includes(personId)
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    );
  };

  const handleAddPerson = async () => {
    if (!newPersonName.trim()) {
      toast.error('Please enter a name');
      return;
    }
    try {
      const newPerson = await addPerson(newPersonName.trim(), newPersonRelation);
      setSelectedPeople(prev => [...prev, newPerson.id]);
      setNewPersonName('');
      setNewPersonRelation('Friend');
      setShowAddPerson(false);
      toast.success('Person added!');
    } catch (err) {
      toast.error('Failed to add person');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }
    try {
      const newCat = await addCategory(newCategoryName.trim(), entryType, newCategoryColor, newCategoryEmoji);
      setCategoryId(newCat.id);
      setNewCategoryName('');
      setNewCategoryColor(CATEGORY_COLORS[0]);
      setNewCategoryEmoji('💰');
      setShowAddCategory(false);
      toast.success('Category added!');
    } catch (err) {
      toast.error('Failed to add category');
    }
  };

  const { addSubcategory } = useApp();
  const handleAddSubcategory = async () => {
    if (!newSubcategoryName.trim()) {
      toast.error('Please enter a subcategory name');
      return;
    }
    if (!categoryId) {
      toast.error('Please select a parent category first');
      return;
    }
    try {
      const newSub = await addSubcategory(newSubcategoryName.trim(), categoryId, newSubcategoryColor);
      setSubcategoryId(newSub.id);
      setNewSubcategoryName('');
      setNewSubcategoryColor(CATEGORY_COLORS[0]);
      setShowAddSubcategory(false);
      toast.success('Subcategory added!');
    } catch (err) {
      toast.error('Failed to add subcategory');
    }
  };

  return (
    <AppLayout title="Add Entry">
      <div className="space-y-6 pb-8">
        {/* Entry Type Toggle */}
        <div className="flex gap-2 p-1 bg-secondary rounded-xl">
          <button
            onClick={() => {
              setEntryType('EXPENSE');
              setCategoryId('');
              setSubcategoryId('');
            }}
            className={cn(
              "flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200",
              isExpense
                ? "bg-expense text-expense-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Expense
          </button>
          <button
            onClick={() => {
              setEntryType('INCOME');
              setCategoryId('');
              setSubcategoryId('');
            }}
            className={cn(
              "flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200",
              !isExpense
                ? "bg-income text-income-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Income
          </button>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <span className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-semibold",
              isExpense ? "text-expense" : "text-income"
            )}>
              ₹
            </span>
            <Input
              id="amount"
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={cn(
                "h-16 pl-10 text-3xl font-semibold border-2 transition-colors",
                isExpense
                  ? "focus:border-expense"
                  : "focus:border-income"
              )}
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Category</Label>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-primary"
              onClick={() => setShowAddCategory(true)}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Category
            </Button>
          </div>
          <Select value={categoryId} onValueChange={(val) => {
            setCategoryId(val);
            setSubcategoryId('');
          }}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {filteredCategories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>
                  <div className="flex items-center gap-2">
                    {cat.emoji ? (
                      <span className="text-lg w-5 h-5 flex items-center justify-center">
                        {cat.emoji}
                      </span>
                    ) : (
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                    )}
                    {cat.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subcategory */}
        <div className="space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <Label>Subcategory (optional)</Label>
            {categoryId && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-primary"
                onClick={() => setShowAddSubcategory(true)}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Sub
              </Button>
            )}
          </div>
          <Select value={subcategoryId} onValueChange={setSubcategoryId}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder={categoryId ? "Select subcategory" : "Select category first"} />
            </SelectTrigger>
            <SelectContent>
              {filteredSubcategories.map(sub => (
                <SelectItem key={sub.id} value={sub.id}>
                  <div className="flex items-center gap-2">
                    {sub.color && (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: sub.color }}
                      />
                    )}
                    {sub.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Source */}
        <div className="space-y-2">
          <Label>Source</Label>
          <Select value={sourceId} onValueChange={setSourceId}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {sources.map(source => (
                <SelectItem key={source.id} value={source.id}>
                  <div className="flex items-center gap-2">
                    <span>{source.type === 'BANK' ? '🏦' : source.type === 'CARD' ? '💳' : '💵'}</span>
                    <span>{source.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover open={showCalendar} onOpenChange={setShowCalendar}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full h-12 justify-start font-normal">
                <Calendar className="w-4 h-4 mr-2" />
                {format(date, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={(d) => {
                  if (d) setDate(d);
                  setShowCalendar(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* People */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              People
            </Label>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-primary"
              onClick={() => setShowAddPerson(true)}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Person
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {people.map(person => (
              <button
                key={person.id}
                onClick={() => togglePerson(person.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                  selectedPeople.includes(person.id)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary text-secondary-foreground border-transparent hover:border-border"
                )}
              >
                {selectedPeople.includes(person.id) && (
                  <Check className="w-3 h-3 inline mr-1" />
                )}
                {person.name}
              </button>
            ))}
          </div>
        </div>

        {/* Notes Toggle */}
        {!showNotes ? (
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={() => setShowNotes(true)}
          >
            <StickyNote className="w-4 h-4 mr-2" />
            Add notes
          </Button>
        ) : (
          <div className="space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <Label>Notes</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowNotes(false);
                  setNotes('');
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <Textarea
              placeholder="Add a note..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        )}

        {/* Submit Button */}
        <Button
          variant={isExpense ? "expense" : "income"}
          size="xl"
          className="w-full"
          onClick={handleSubmit}
        >
          {isExpense ? 'Add Expense' : 'Add Income'}
        </Button>
      </div>

      {/* Add Person Dialog */}
      <Dialog open={showAddPerson} onOpenChange={setShowAddPerson}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Person</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="Enter name"
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Relation</Label>
              <Select value={newPersonRelation} onValueChange={(v) => setNewPersonRelation(v as 'Self' | 'Friend' | 'Family')}>
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
            <Button variant="outline" onClick={() => setShowAddPerson(false)}>Cancel</Button>
            <Button onClick={handleAddPerson}>Add Person</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add {isExpense ? 'Expense' : 'Income'} Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input
                placeholder="Enter category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Emoji</Label>
              <div className="flex flex-wrap gap-2 text-2xl">
                {['💰', '🛒', '🍔', '🚗', '🏠', '🎁', '🏥', '🎮', '💡', '👕', '📱', '✈️'].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setNewCategoryEmoji(emoji)}
                    className={cn(
                      "w-10 h-10 flex items-center justify-center rounded-lg transition-all",
                      newCategoryEmoji === emoji ? "bg-primary/20 ring-2 ring-primary" : "bg-secondary hover:bg-secondary/80"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewCategoryColor(color)}
                    className={cn(
                      "w-8 h-8 rounded-full transition-all",
                      newCategoryColor === color && "ring-2 ring-offset-2 ring-primary"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCategory(false)}>Cancel</Button>
            <Button onClick={handleAddCategory}>Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Subcategory Dialog */}
      <Dialog open={showAddSubcategory} onOpenChange={setShowAddSubcategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Subcategory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Subcategory Name</Label>
              <Input
                placeholder="Enter subcategory name"
                value={newSubcategoryName}
                onChange={(e) => setNewSubcategoryName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewSubcategoryColor(color)}
                    className={cn(
                      "w-8 h-8 rounded-full transition-all",
                      newSubcategoryColor === color && "ring-2 ring-offset-2 ring-primary"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSubcategory(false)}>Cancel</Button>
            <Button onClick={handleAddSubcategory}>Add Subcategory</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
