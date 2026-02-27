import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Investor } from "../types/investor";
import { Building2, Mail, MapPin, DollarSign, Calendar } from "lucide-react";

interface InvestorCardProps {
  investor: Investor;
  onClick: () => void;
}

export function InvestorCard({ investor, onClick }: InvestorCardProps) {
  const progress = ((investor.currentStageIndex + 1) / investor.stages.length) * 100;
  const currentStage = investor.stages[investor.currentStageIndex];

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl mb-1">{investor.name}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {investor.country}
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            Stage {investor.currentStageIndex + 1}/{investor.stages.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Current Stage</span>
            <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground">{currentStage.name}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="truncate text-xs">{investor.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs">${(investor.investmentAmount / 1000).toFixed(0)}K</span>
          </div>
          <div className="flex items-center gap-2 text-sm col-span-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs">Added: {new Date(investor.dateAdded).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
