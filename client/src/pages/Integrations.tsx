import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, Trash2, CheckCircle, Circle } from "lucide-react";
import { trpc } from "@/lib/trpc";

const AVAILABLE_SERVICES = [
  { id: "google", name: "Google", icon: "🔵", description: "Gmail, Drive, Calendar" },
  { id: "github", name: "GitHub", icon: "⚫", description: "Repositories, Commits" },
  { id: "outlook", name: "Outlook", icon: "🔵", description: "Email, Calendar" },
  { id: "facebook", name: "Facebook", icon: "🔵", description: "Posts, Photos" },
  { id: "instagram", name: "Instagram", icon: "📷", description: "Posts, Stories" },
  { id: "whatsapp", name: "WhatsApp", icon: "💬", description: "Messages, Media" },
  { id: "botspace", name: "Botspace", icon: "🤖", description: "Conversations" },
];

export default function IntegrationsPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: integrations = [], isLoading } = trpc.integrations.list.useQuery();

  const connectedServices = new Set(integrations.map((i) => i.service));

  const handleConnect = (service: string) => {
    // TODO: Implement OAuth flow for each service
    alert(`Connecting to ${service}... (Feature coming soon)`);
  };

  const handleDisconnect = (service: string) => {
    if (confirm(`Disconnect from ${service}?`)) {
      // TODO: Implement disconnection logic
      alert(`Disconnected from ${service}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Connected Services</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Connect your favorite services to sync data and create memories automatically.
        </p>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Loading integrations...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVAILABLE_SERVICES.map((service) => {
              const isConnected = connectedServices.has(service.id);
              return (
                <div
                  key={service.id}
                  className={`bg-card border rounded-lg p-6 transition-all ${
                    isConnected ? "border-primary" : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{service.icon}</span>
                      <div>
                        <h3 className="font-semibold text-foreground">{service.name}</h3>
                        <p className="text-xs text-muted-foreground">{service.description}</p>
                      </div>
                    </div>
                    {isConnected && <CheckCircle className="w-5 h-5 text-primary" />}
                  </div>

                  <div className="flex gap-2">
                    {isConnected ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => alert("Sync feature coming soon")}
                        >
                          Sync Now
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDisconnect(service.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => handleConnect(service.id)}
                      >
                        Connect
                      </Button>
                    )}
                  </div>

                  {isConnected && (
                    <p className="text-xs text-muted-foreground mt-3">
                      Last synced: {new Date().toLocaleDateString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
