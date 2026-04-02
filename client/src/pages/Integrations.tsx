import { useAuth } from "@/_core/hooks/useAuth";
import { getIntegrationConnectUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, CheckCircle2, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

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

  const upsertIntegration = trpc.integrations.upsert.useMutation({
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
      toast.success(`${service} connected successfully`);
      void utils.integrations.list.invalidate();
    } else {
      toast.error(params.get("error") || `${service} connection failed`);
    }

    const url = new URL(window.location.href);
    ["integration_status", "service", "error"].forEach((key) => {
      url.searchParams.delete(key);
    });
    window.history.replaceState({}, "", url.toString());
  }, [utils.integrations.list]);

  const connectedServices = new Set(
    integrations.filter((integration) => integration.isActive).map((integration) => integration.service),
  );

  const handleConnect = (service: string) => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }

    const url = getIntegrationConnectUrl(service);
    if (!url) {
      toast.error(`${service} OAuth is not configured`);
      return;
    }

    window.location.href = url;
  };

  const handleDisconnect = async (service: string) => {
    if (!window.confirm(`Disconnect ${service}?`)) return;

    try {
      await upsertIntegration.mutateAsync({ service, isActive: false });
      toast.success(`${service} disconnected`);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to disconnect ${service}`);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="mt-4 text-3xl font-semibold">Integration Hub</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Connect your social and email accounts with OAuth to sync memories automatically.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8">
        {isLoading ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-400">
            Loading integrations...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {AVAILABLE_SERVICES.map((service) => {
              const isConnected = connectedServices.has(service.id);

              return (
                <article
                  key={service.id}
                  className={`rounded-xl border p-5 ${
                    isConnected ? "border-emerald-500/60 bg-zinc-900" : "border-zinc-800 bg-zinc-900/60"
                  }`}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl" aria-hidden>
                        {service.icon}
                      </span>
                      <div>
                        <h2 className="text-lg font-medium">{service.name}</h2>
                        <p className="text-xs text-zinc-400">{service.description}</p>
                      </div>
                    </div>
                    {isConnected && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                  </div>

                  {isConnected ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled
                        className="flex-1 rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-400"
                      >
                        Sync coming soon
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDisconnect(service.id)}
                        disabled={upsertIntegration.isPending}
                        className="rounded-md border border-red-900/60 px-3 py-2 text-red-300 hover:bg-red-950/40 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleConnect(service.id)}
                      className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                    >
                      Connect with OAuth
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
