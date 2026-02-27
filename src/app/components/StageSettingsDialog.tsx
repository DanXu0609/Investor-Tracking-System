import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { EB5Stage } from "../types/investor";
import { Trash2, Plus, GripVertical } from "lucide-react";

interface StageSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stages: Omit<EB5Stage, "completed" | "completedDate">[];
  onSave: (stages: Omit<EB5Stage, "completed" | "completedDate">[]) => void;
}

export function StageSettingsDialog({ open, onOpenChange, stages, onSave }: StageSettingsDialogProps) {
  const [localStages, setLocalStages] = useState(stages);

  const handleUpdateStage = (index: number, field: 'name' | 'description', value: string) => {
    const newStages = [...localStages];
    newStages[index] = { ...newStages[index], [field]: value };
    setLocalStages(newStages);
  };

  const handleRemoveStage = (index: number) => {
    const newStages = localStages.filter((_, i) => i !== index);
    setLocalStages(newStages);
  };

  const handleAddStage = () => {
    const newStage = {
      id: `stage-${Date.now()}`,
      name: "New Stage",
      description: "Description of the new stage",
    };
    setLocalStages([...localStages, newStage]);
  };

  const handleSave = () => {
    onSave(localStages);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Filing Steps</DialogTitle>
          <DialogDescription>
            Customize the filing steps for your EB5 process. Changes will apply to new investors.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {localStages.map((stage, index) => (
            <div key={stage.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Step {index + 1}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveStage(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`stage-name-${index}`}>Stage Name</Label>
                <Input
                  id={`stage-name-${index}`}
                  value={stage.name}
                  onChange={(e) => handleUpdateStage(index, 'name', e.target.value)}
                  placeholder="Enter stage name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`stage-desc-${index}`}>Description</Label>
                <Textarea
                  id={`stage-desc-${index}`}
                  value={stage.description}
                  onChange={(e) => handleUpdateStage(index, 'description', e.target.value)}
                  placeholder="Enter stage description"
                  rows={2}
                />
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={handleAddStage}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Step
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
