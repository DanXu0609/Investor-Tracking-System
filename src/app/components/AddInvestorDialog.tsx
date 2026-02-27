import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Investor, EB5Stage, EB5_STAGES_TEMPLATE } from "../types/investor";

interface AddInvestorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (investor: Investor) => void;
  investor?: Investor;
  onUpdate?: (id: string, updates: Partial<Investor>) => void;
  stagesTemplate?: Omit<EB5Stage, "completed" | "completedDate">[];
}

export function AddInvestorDialog({ open, onOpenChange, onAdd, investor, onUpdate, stagesTemplate }: AddInvestorDialogProps) {
  const isEditMode = !!investor;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    country: "",
    investmentAmount: "",
  });

  useEffect(() => {
    if (investor && open) {
      setFormData({
        name: investor.name,
        email: investor.email,
        country: investor.country,
        investmentAmount: investor.investmentAmount.toString(),
      });
    } else if (!open) {
      setFormData({ name: "", email: "", country: "", investmentAmount: "" });
    }
  }, [investor, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditMode && onUpdate && investor) {
      onUpdate(investor.id, {
        name: formData.name,
        email: formData.email,
        country: formData.country,
        investmentAmount: parseFloat(formData.investmentAmount),
      });
      onOpenChange(false);
      return;
    }

    const newInvestor: Investor = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      country: formData.country,
      investmentAmount: parseFloat(formData.investmentAmount),
      dateAdded: new Date().toISOString().split('T')[0],
      currentStageIndex: 0,
      stages: (stagesTemplate || EB5_STAGES_TEMPLATE).map(stage => ({
        ...stage,
        completed: false,
      })),
      notes: "",
    };

    onAdd?.(newInvestor);
    setFormData({ name: "", email: "", country: "", investmentAmount: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Investor" : "Add New Investor"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the investor's information" : "Enter the details of the new EB5 investor"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="China"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="investment">Investment Amount (USD)</Label>
              <Input
                id="investment"
                type="number"
                value={formData.investmentAmount}
                onChange={(e) => setFormData({ ...formData, investmentAmount: e.target.value })}
                placeholder="800000"
                required
                min="0"
                step="1000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditMode ? "Save Changes" : "Add Investor"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
