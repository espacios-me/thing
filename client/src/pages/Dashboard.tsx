import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { LogOut, Menu, X, Brain, FileText, BarChart3, Settings } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import FileUpload from "@/components/FileUpload";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [, navigate] = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navigationItems = [
    { label: "Memories", icon: FileText, href: "/memories" },
    { label: "Analytics", icon: BarChart3, href: "/analytics" },
    { label: "Integrations", icon: Settings, href: "/integrations" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-card border-r border-border transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className={`flex items-center gap-2 ${!sidebarOpen && "hidden"}`}>
            <Brain className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">Entity</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate(item.href)}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span className="ml-3">{item.label}</span>}
            </Button>
          ))}
        </nav>

        {/* Profile Section in Sidebar */}
        <div className="p-4 border-t border-border">
          <div className="relative">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              {sidebarOpen && <span className="ml-2 text-sm truncate">{user?.name}</span>}
            </Button>

            {/* Profile Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute bottom-12 left-0 right-0 bg-popover border border-border rounded-lg shadow-lg p-2 z-50">
                <div className="px-3 py-2 text-sm font-semibold text-foreground border-b border-border mb-2">
                  {user?.email}
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={() => navigate("/memories")}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  My Memories
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={() => navigate("/integrations")}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Connected Services
                </Button>
                <div className="border-t border-border my-2" />
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm text-destructive hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Conscious Entity Platform</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">Welcome, {user?.name}</div>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold cursor-pointer hover:bg-primary/30 transition-colors" onClick={() => setProfileMenuOpen(!profileMenuOpen)}>
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Quick Stats */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Total Memories</h3>
              <p className="text-3xl font-bold text-foreground">0</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Connected Services</h3>
              <p className="text-3xl font-bold text-foreground">0</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Last Sync</h3>
              <p className="text-sm text-foreground">Never</p>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="mt-8 bg-card border border-border rounded-lg p-8 text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Welcome to Your Memory Hub</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Connect your favorite services, upload files, and let the entity learn from your memories.
              Start by connecting your first service or uploading a file.
            </p>
            <div className="flex gap-4 justify-center mt-6">
              <Button onClick={() => navigate("/integrations")}>Connect Services</Button>
              <Button variant="outline" onClick={() => navigate("/memories")}>
                View Memories
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
