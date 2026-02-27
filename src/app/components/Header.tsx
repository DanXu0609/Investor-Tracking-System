import { LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface HeaderProps {
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

export function Header({ userName, userRole, onLogout }: HeaderProps) {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={`${import.meta.env.BASE_URL}logo-dark.png`}
              alt="Beyond International"
              className="h-12 w-auto object-contain"
            />
          </div>

          <div className="flex items-center gap-3">
            {userName && (
              <div className="text-sm text-muted-foreground">
                Welcome, <span className="font-medium text-foreground">{userName}</span>
                {userRole && <Badge className="ml-2">{userRole}</Badge>}
              </div>
            )}
            {onLogout && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}