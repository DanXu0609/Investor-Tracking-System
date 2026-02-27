import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { EB5Stage } from "../types/investor";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

type StageItem = Omit<EB5Stage, "completed" | "completedDate">;

interface StageSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stages: StageItem[];
  onSave: (stages: StageItem[]) => void;
}

interface DraggableStageCardProps {
  stage: StageItem;
  index: number;
  moveStage: (from: number, to: number) => void;
  onUpdate: (index: number, field: 'name' | 'description', value: string) => void;
  onRemove: (index: number) => void;
}

const DRAG_TYPE = "STAGE";

function DraggableStageCard({ stage, index, moveStage, onUpdate, onRemove }: DraggableStageCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: DRAG_TYPE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: DRAG_TYPE,
    hover(item: { index: number }) {
      if (item.index === index) return;
      moveStage(item.index, index);
      item.index = index;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  preview(drop(ref));

  return (
    <div
      ref={ref}
      className="p-4 border rounded-lg space-y-3 bg-background transition-opacity"
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div ref={(node) => { drag(node); }} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            Step {index + 1}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
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
          onChange={(e) => onUpdate(index, 'name', e.target.value)}
          placeholder="Enter stage name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`stage-desc-${index}`}>Description</Label>
        <Textarea
          id={`stage-desc-${index}`}
          value={stage.description}
          onChange={(e) => onUpdate(index, 'description', e.target.value)}
          placeholder="Enter stage description"
          rows={2}
        />
      </div>
    </div>
  );
}

export function StageSettingsDialog({ open, onOpenChange, stages, onSave }: StageSettingsDialogProps) {
  const [localStages, setLocalStages] = useState(stages);

  useEffect(() => {
    if (open) {
      setLocalStages(stages);
    }
  }, [open, stages]);

  const moveStage = useCallback((from: number, to: number) => {
    setLocalStages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
  }, []);

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
    const newStage: StageItem = {
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
            Customize the filing steps for your EB5 process. Drag steps to reorder. Changes will apply to new investors.
          </DialogDescription>
        </DialogHeader>

        <DndProvider backend={HTML5Backend}>
          <div className="space-y-4 py-4">
            {localStages.map((stage, index) => (
              <DraggableStageCard
                key={stage.id}
                stage={stage}
                index={index}
                moveStage={moveStage}
                onUpdate={handleUpdateStage}
                onRemove={handleRemoveStage}
              />
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
        </DndProvider>

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
