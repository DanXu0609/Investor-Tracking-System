import { useState } from "react";
import { Investor, EB5Stage } from "../types/investor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { ArrowLeft, CheckCircle2, Circle, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

interface InvestorDetailProps {
  investor: Investor;
  onBack: () => void;
  onUpdate: (id: string, updates: Partial<Investor>) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
}

export function InvestorDetail({ investor, onBack, onUpdate, onDelete, isAdmin }: InvestorDetailProps) {
  const [localStages, setLocalStages] = useState(investor.stages);
  const [notes, setNotes] = useState(investor.notes || "");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleStageToggle = (stageIndex: number) => {
    const newStages = [...localStages];
    const stage = newStages[stageIndex];
    
    stage.completed = !stage.completed;
    stage.completedDate = stage.completed 
      ? new Date().toISOString().split('T')[0] 
      : undefined;

    // Update current stage index
    let newCurrentStageIndex = 0;
    for (let i = newStages.length - 1; i >= 0; i--) {
      if (newStages[i].completed) {
        newCurrentStageIndex = i;
        break;
      }
    }

    setLocalStages(newStages);
    onUpdate(investor.id, { 
      stages: newStages, 
      currentStageIndex: newCurrentStageIndex 
    });
  };

  const handleSaveNotes = () => {
    onUpdate(investor.id, { notes });
    toast.success("Notes saved successfully");
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(investor.id);
      toast.success(`${investor.name} has been deleted`);
    }
  };

  const completedCount = localStages.filter(s => s.completed).length;
  const progress = (completedCount / localStages.length) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        {isAdmin && onDelete && (
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Investor
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete <strong>{investor.name}</strong> and all associated data.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{investor.name}</CardTitle>
                <CardDescription className="mt-2">
                  {investor.country} • {investor.email}
                </CardDescription>
              </div>
              <Badge className="text-sm">
                {completedCount}/{localStages.length} Completed
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium">Overall Progress</span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="space-y-3 mt-6">
              {localStages.map((stage, index) => (
                <StageItem
                  key={stage.id}
                  stage={stage}
                  index={index}
                  onToggle={() => handleStageToggle(index)}
                  disabled={!isAdmin}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Investor Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Investment Amount</p>
                <p className="font-semibold text-lg">
                  ${investor.investmentAmount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Date Added</p>
                <p className="font-medium">
                  {new Date(investor.dateAdded).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Current Stage</p>
                <p className="font-medium">{localStages[investor.currentStageIndex].name}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isAdmin ? "Add notes about this investor..." : "View notes about this investor"}
                className="min-h-32"
                disabled={!isAdmin}
              />
              {isAdmin && (
                <Button onClick={handleSaveNotes} size="sm" className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Save Notes
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface StageItemProps {
  stage: EB5Stage;
  index: number;
  onToggle: () => void;
  disabled?: boolean;
}

function StageItem({ stage, index, onToggle, disabled = false }: StageItemProps) {
  return (
    <div 
      className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
        stage.completed 
          ? 'bg-primary/5 border-primary/20' 
          : 'bg-background hover:bg-accent/50'
      }`}
    >
      <div className="flex items-center gap-3 flex-1">
        <Checkbox
          checked={stage.completed}
          onCheckedChange={onToggle}
          id={`stage-${stage.id}`}
          className="mt-0.5"
          disabled={disabled}
        />
        <label
          htmlFor={`stage-${stage.id}`}
          className={`flex-1 ${disabled ? '' : 'cursor-pointer'}`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted-foreground">
              Step {index + 1}
            </span>
            {stage.completed && (
              <CheckCircle2 className="w-4 h-4 text-primary" />
            )}
          </div>
          <p className={`font-medium ${stage.completed ? 'text-foreground' : 'text-foreground'}`}>
            {stage.name}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {stage.description}
          </p>
          {stage.completedDate && (
            <p className="text-xs text-primary mt-2">
              Completed: {new Date(stage.completedDate).toLocaleDateString()}
            </p>
          )}
        </label>
      </div>
    </div>
  );
}