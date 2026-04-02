import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Trash2, Search, Plus, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function MemoriesPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  const { data: memories = [], isLoading } = trpc.memories.list.useQuery({ limit: 100, offset: 0 });
  const deleteMemoryMutation = trpc.memories.delete.useMutation();

  const filteredMemories = memories.filter((memory) => {
    const matchesSearch = memory.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource = !selectedSource || memory.source === selectedSource;
    return matchesSearch && matchesSource;
  });

  const sources = Array.from(new Set(memories.map((m) => m.source)));

  const handleDelete = async (memoryId: number) => {
    if (confirm("Are you sure you want to delete this memory?")) {
      await deleteMemoryMutation.mutateAsync({ id: memoryId });
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
          <h1 className="text-2xl font-bold text-foreground">My Memories</h1>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search memories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedSource || ""}
            onChange={(e) => setSelectedSource(e.target.value || null)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
          >
            <option value="">All Sources</option>
            {sources.map((source) => (
              <option key={source} value={source}>
                {source.charAt(0).toUpperCase() + source.slice(1)}
              </option>
            ))}
          </select>
          <Button onClick={() => navigate("/dashboard")} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Memory
          </Button>
        </div>
      </div>

      {/* Memories List */}
      <div className="p-6">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Loading memories...</div>
        ) : filteredMemories.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <p>No memories found. Start by uploading a file or connecting a service.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredMemories.map((memory) => (
              <div key={memory.id} className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded">
                        {memory.source}
                      </span>
                      {memory.emotionalTheme && (
                        <span className="text-xs font-semibold px-2 py-1 bg-accent/10 text-accent rounded">
                          {memory.emotionalTheme}
                        </span>
                      )}
                    </div>
                    <p className="text-foreground line-clamp-3 mb-2">{memory.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(memory.createdAt).toLocaleDateString()} at{" "}
                      {new Date(memory.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(memory.id)}
                    className="text-destructive hover:text-destructive ml-4"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
