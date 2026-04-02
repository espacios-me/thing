import { useAuth } from "@/_core/hooks/useAuth";
import { getIntegrationConnectUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, Trash2, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";
import { toast } from "sonner";

const AVAILABLE_SERVICES = [
  { id: "google", name: "Google", icon: "🔵", description: "Gmail, Drive, Calendar" },
  { id: "github", name: "GitHub", icon: "⚫", description: "Repositories, Commits" },
  { id: "outlook", name: "Outlook", icon: "🔵", description: "Email, Calendar" },
  { id: "facebook", name: "Facebook", icon: "🔵", description: "Posts, Photos" },
  { id: "instagram", name: "Instagram", icon: "📷", description: "Posts, Stories" },
  { id: "whatsapp", name: "WhatsApp", icon: "💬", description: "Messages, Media" },
  { id: "botspace", name: "Botspace", icon: "🤖", description: "Conversations" },
] as const;

export default function IntegrationsPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const { data: integrations = [], isLoading } = trpc.integrations.list.useQuery();
  const upsertIntegrationMutation = trpc.integrations.upsert.useMutation({
    onSuccess: async () => {
      await utils.integrations.list.invalidate();
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("integration_status");
    const service = params.get("service");

    if (!status || !service) return;

    if (status === "connected") {
      toast.success(`${service} connected successfully.`);
      void utils.integrations.list.invalidate();
    } else {
      const errorMessage = params.get("error") || "OAuth authorization failed";
      toast.error(`${service} connection failed: ${errorMessage}`);
    }

    const url = new URL(window.location.href);
    url.searchParams.delete("integration_status");
    url.searchParams.delete("service");
    url.searchParams.delete("error");
    window.history.replaceState({}, "", url.toString());
  }, [utils.integrations.list]);

  const connectedServices = new Set(
    integrations.filter((integration) => integration.isActive).map((integration) => integration.service)
  );

  const handleConnect = (service: string) => {
    if (!user) {
      toast.error("Please sign in before connecting a service.");
      return;
    }

    const connectUrl = getIntegrationConnectUrl(service);

    if (!connectUrl) {
      toast.error(`Integration for ${service} is not configured yet.`);
      return;
    }

    window.location.href = connectUrl;
  };

  const handleDisconnect = async (service: string) => {
    if (!confirm(`Disconnect from ${service}?`)) {
      return;
    }

    try {
      await upsertIntegrationMutation.mutateAsync({
        service,
        isActive: false,
      });
      toast.success(`${service} disconnected.`);
    } catch (error) {
      console.error("Failed to disconnect integration", error);
      toast.error(`Failed to disconnect ${service}.`);
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
                        <Button variant="outline" size="sm" className="flex-1" disabled>
                          Sync Coming Soon
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDisconnect(service.id)}
                          className="text-destructive hover:text-destructive"
                          disabled={upsertIntegrationMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button className="w-full" onClick={() => handleConnect(service.id)}>
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
