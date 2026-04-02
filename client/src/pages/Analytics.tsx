import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: analytics = [], isLoading } = trpc.analytics.list.useQuery();
  const { data: memories = [] } = trpc.memories.list.useQuery({ limit: 1000, offset: 0 });

  // Calculate statistics
  const totalMemories = memories.length;
  const sourceDistribution = memories.reduce(
    (acc, memory) => {
      acc[memory.source] = (acc[memory.source] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const emotionalThemes = memories.reduce(
    (acc, memory) => {
      if (memory.emotionalTheme) {
        acc[memory.emotionalTheme] = (acc[memory.emotionalTheme] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  const recentMemories = memories.slice(0, 7);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Memory Analytics</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Loading analytics...</div>
        ) : (
          <div className="grid gap-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Total Memories</h3>
                <p className="text-3xl font-bold text-foreground">{totalMemories}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Memory Sources</h3>
                <p className="text-3xl font-bold text-foreground">{Object.keys(sourceDistribution).length}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Emotional Themes</h3>
                <p className="text-3xl font-bold text-foreground">{Object.keys(emotionalThemes).length}</p>
              </div>
            </div>

            {/* Source Distribution */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Memory Sources
              </h2>
              <div className="space-y-3">
                {Object.entries(sourceDistribution).map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground capitalize">{source}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${(count / totalMemories) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emotional Themes */}
            {Object.keys(emotionalThemes).length > 0 && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Emotional Themes</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(emotionalThemes).map(([theme, count]) => (
                    <div key={theme} className="bg-muted/50 rounded-lg p-4 text-center">
                      <p className="text-sm font-medium text-foreground capitalize mb-1">{theme}</p>
                      <p className="text-2xl font-bold text-primary">{count}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Memories Timeline */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Recent Memories</h2>
              <div className="space-y-3">
                {recentMemories.map((memory) => (
                  <div key={memory.id} className="flex items-start gap-4 pb-3 border-b border-border last:border-b-0">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground line-clamp-2">{memory.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(memory.createdAt).toLocaleDateString()} •{" "}
                        <span className="capitalize">{memory.source}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
