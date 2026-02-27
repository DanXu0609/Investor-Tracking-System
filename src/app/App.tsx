import { useState, useEffect } from "react";
import { AuthForm } from "./components/AuthForm";
import { Header } from "./components/Header";
import { InvestorCard } from "./components/InvestorCard";
import { InvestorDetail } from "./components/InvestorDetail";
import { TimelineComparison } from "./components/TimelineComparison";
import { AddInvestorDialog } from "./components/AddInvestorDialog";
import { StageSettingsDialog } from "./components/StageSettingsDialog";
import { UserManagement } from "./components/UserManagement";
import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Investor, EB5_STAGES_TEMPLATE, EB5Stage } from "./types/investor";
import { investorStorage } from "./utils/storage";
import { supabase } from "./utils/supabase";
import { Plus, LayoutGrid, TrendingUp, Settings, Users } from "lucide-react";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("user");
  const [userId, setUserId] = useState<string>("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stagesTemplate, setStagesTemplate] = useState<Omit<EB5Stage, "completed" | "completedDate">[]>(EB5_STAGES_TEMPLATE);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.access_token && session.user?.user_metadata?.name) {
          setAccessToken(session.access_token);
          setUserName(session.user.user_metadata.name);
          setUserRole(session.user.user_metadata.role || "user");
          setUserId(session.user.id);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Error checking session:', err);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkSession();
  }, []);

  // Load investors when authenticated
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      loadInvestors();
    }
    
    // Load custom stages template from localStorage
    const savedTemplate = localStorage.getItem("stages_template");
    if (savedTemplate) {
      setStagesTemplate(JSON.parse(savedTemplate));
    }
  }, [isAuthenticated, accessToken]);

  const loadInvestors = async () => {
    const loadedInvestors = await investorStorage.getAll();
    setInvestors(loadedInvestors);
  };

  const handleAuthSuccess = (token: string, name: string, role: string, id: string) => {
    setAccessToken(token);
    setUserName(name);
    setUserRole(role);
    setUserId(id);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAccessToken(null);
    setUserName("");
    setIsAuthenticated(false);
    setInvestors([]);
    setSelectedInvestor(null);
    toast.success("Logged out successfully");
  };

  const handleAddInvestor = async (investor: Investor) => {
    try {
      await investorStorage.add(investor);
      setInvestors(prev => [...prev, investor]);
      toast.success(`${investor.name} has been added successfully`);
    } catch (err: any) {
      console.error('Error adding investor:', err);
      toast.error(`Failed to add ${investor.name}: ${err.message || 'Unknown error'}`);
    }
  };

  const handleUpdateInvestor = async (id: string, updates: Partial<Investor>) => {
    try {
      await investorStorage.update(id, updates);
      setInvestors(prev => prev.map(inv => inv.id === id ? { ...inv, ...updates } : inv));

      // Update selected investor if it's the one being updated
      if (selectedInvestor?.id === id) {
        setSelectedInvestor(prev => prev ? { ...prev, ...updates } : prev);
      }
    } catch (err: any) {
      console.error('Error updating investor:', err);
      toast.error(`Failed to update investor: ${err.message || 'Unknown error'}`);
    }
  };

  const handleDeleteInvestor = async (id: string) => {
    try {
      await investorStorage.delete(id);
      setInvestors(prev => prev.filter(inv => inv.id !== id));

      // If the deleted investor was selected, go back to dashboard
      if (selectedInvestor?.id === id) {
        setSelectedInvestor(null);
        setActiveTab("dashboard");
      }
    } catch (err: any) {
      console.error('Error deleting investor:', err);
      toast.error(`Failed to delete investor: ${err.message || 'Unknown error'}`);
    }
  };

  const handleSelectInvestor = (investor: Investor) => {
    setSelectedInvestor(investor);
    setActiveTab("detail");
  };

  const handleBack = () => {
    setSelectedInvestor(null);
    setActiveTab("dashboard");
  };

  const handleSaveStagesTemplate = (newTemplate: Omit<EB5Stage, "completed" | "completedDate">[]) => {
    setStagesTemplate(newTemplate);
    localStorage.setItem("stages_template", JSON.stringify(newTemplate));
    toast.success("Filing steps updated successfully");
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth form if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <AuthForm onAuthSuccess={handleAuthSuccess} />
        <Toaster />
      </>
    );
  }

  // Show main app if authenticated
  return (
    <div className="min-h-screen bg-background">
      <Header userName={userName} userRole={userRole} onLogout={handleLogout} />
      
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="dashboard" className="gap-2">
                <LayoutGrid className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="timeline" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Timeline Comparison
              </TabsTrigger>
              {userRole === 'admin' && (
                <TabsTrigger value="users" className="gap-2">
                  <Users className="w-4 h-4" />
                  User Management
                </TabsTrigger>
              )}
              {selectedInvestor && (
                <TabsTrigger value="detail" className="gap-2">
                  Investor Detail
                </TabsTrigger>
              )}
            </TabsList>

            <div className="flex gap-2">
              {userRole === 'admin' && (
                <>
                  <Button variant="outline" onClick={() => setShowSettingsDialog(true)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Steps
                  </Button>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Investor
                  </Button>
                </>
              )}
            </div>
          </div>

          <TabsContent value="dashboard" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">EB5 Investors</h2>
              <p className="text-muted-foreground">
                Track and manage your EB5 immigration cases
              </p>
            </div>

            {investors.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground mb-4">No investors added yet</p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Investor
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {investors.map((investor) => (
                  <InvestorCard
                    key={investor.id}
                    investor={investor}
                    onClick={() => handleSelectInvestor(investor)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Timeline Comparison</h2>
              <p className="text-muted-foreground">
                Compare progress across all investors
              </p>
            </div>

            {investors.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground mb-4">No investors to compare</p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Investor
                </Button>
              </div>
            ) : (
              <TimelineComparison investors={investors} />
            )}
          </TabsContent>

          {selectedInvestor && (
            <TabsContent value="detail">
              <InvestorDetail
                investor={selectedInvestor}
                onBack={handleBack}
                onUpdate={handleUpdateInvestor}
                onDelete={handleDeleteInvestor}
                isAdmin={userRole === 'admin'}
              />
            </TabsContent>
          )}

          {userRole === 'admin' && (
            <TabsContent value="users">
              <UserManagement
                currentUserId={userId}
              />
            </TabsContent>
          )}
        </Tabs>
      </main>

      <AddInvestorDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddInvestor}
      />

      <StageSettingsDialog
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
        stages={stagesTemplate}
        onSave={handleSaveStagesTemplate}
      />

      <Toaster />
    </div>
  );
}