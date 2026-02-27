import { Investor } from "../types/investor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

interface TimelineComparisonProps {
  investors: Investor[];
}

export function TimelineComparison({ investors }: TimelineComparisonProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline Comparison</CardTitle>
        <CardDescription>
          Visual comparison of all investors across EB5 filing stages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Stage headers */}
          <div className="flex gap-1">
            <div className="w-40 shrink-0" /> {/* Spacer for names */}
            <div className="flex-1 grid grid-cols-11 gap-1">
              {investors[0]?.stages.map((stage, idx) => (
                <div
                  key={stage.id}
                  className="text-center"
                  title={stage.name}
                >
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    {idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Investor rows */}
          {investors.map((investor) => (
            <InvestorTimelineRow key={investor.id} investor={investor} />
          ))}

          {/* Legend */}
          <div className="flex items-center gap-6 pt-4 border-t text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary" />
              <span className="text-muted-foreground">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-yellow-500" />
              <span className="text-muted-foreground">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-secondary" />
              <span className="text-muted-foreground">Not Started</span>
            </div>
          </div>
        </div>

        {/* Stage names tooltip section */}
        <div className="mt-8 pt-6 border-t">
          <h4 className="font-medium mb-3 text-sm">Stage Reference</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {investors[0]?.stages.map((stage, idx) => (
              <div key={stage.id} className="flex gap-2">
                <Badge variant="outline" className="w-8 h-6 shrink-0 justify-center">
                  {idx + 1}
                </Badge>
                <span className="text-muted-foreground">{stage.name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InvestorTimelineRow({ investor }: { investor: Investor }) {
  return (
    <div className="flex gap-1 items-center">
      <div className="w-40 shrink-0">
        <p className="font-medium truncate">{investor.name}</p>
        <p className="text-xs text-muted-foreground">{investor.country}</p>
      </div>
      <div className="flex-1 grid grid-cols-11 gap-1">
        {investor.stages.map((stage, idx) => {
          const isCurrent = idx === investor.currentStageIndex;
          const isCompleted = stage.completed;
          
          return (
            <div
              key={stage.id}
              className={`h-8 rounded transition-all ${
                isCompleted 
                  ? 'bg-primary' 
                  : isCurrent 
                  ? 'bg-yellow-500' 
                  : 'bg-secondary'
              }`}
              title={`${stage.name}${isCompleted ? ` - Completed ${stage.completedDate}` : ''}`}
            />
          );
        })}
      </div>
      <div className="w-16 text-right text-sm text-muted-foreground">
        {investor.stages.filter(s => s.completed).length}/{investor.stages.length}
      </div>
    </div>
  );
}
