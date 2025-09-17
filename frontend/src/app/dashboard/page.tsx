"use client";

import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { Header } from "@/components/Header";
import { NoteModal } from "@/components/NoteModal";
import { UpgradeModal } from "@/components/UpgradeModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, Trash2, ArrowUp } from "lucide-react";

interface Note {
  _id: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Tenant {
  _id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro';
  noteCount: number;
  maxNotes: number;
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Fetch notes
  const { data: notes = [], isLoading: notesLoading } = useQuery({
    queryKey: ['/api/notes'],
    queryFn: () => api.get('/api/notes').then(res => res.data),
  });

  // Fetch tenant info
  const { data: tenant } = useQuery<Tenant>({
    queryKey: ['/api/user/tenant'],
    queryFn: () => api.get('/api/user/tenant').then(res => res.data),
  });

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: (noteData: { title: string; content: string }) =>
      api.post('/api/notes', noteData).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/tenant'] });
      setIsNoteModalOpen(false);
      toast({
        title: "Success",
        description: "Note created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create note",
        variant: "destructive",
      });
    },
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: ({ id, ...noteData }: { id: string; title: string; content: string }) =>
      api.put(`/api/notes/${id}`, noteData).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      setIsNoteModalOpen(false);
      setEditingNote(null);
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update note",
        variant: "destructive",
      });
    },
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/tenant'] });
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete note",
        variant: "destructive",
      });
    },
  });

  // Upgrade tenant mutation
  const upgradeTenantMutation = useMutation({
    mutationFn: () => api.post(`/api/tenants/${tenant?.slug}/upgrade`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/tenant'] });
      setIsUpgradeModalOpen(false);
      toast({
        title: "Success",
        description: "Tenant upgraded to Pro successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to upgrade tenant",
        variant: "destructive",
      });
    },
  });

  const handleCreateNote = () => {
    if (tenant?.plan === 'free' && notes.length >= tenant.maxNotes) {
      toast({
        title: "Upgrade Required",
        description: "You've reached your Free plan limit. Upgrade to Pro for unlimited notes.",
        variant: "destructive",
      });
      return;
    }
    setEditingNote(null);
    setIsNoteModalOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsNoteModalOpen(true);
  };

  const handleDeleteNote = (id: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNoteMutation.mutate(id);
    }
  };

  const handleSaveNote = (noteData: { title: string; content: string }) => {
    if (editingNote) {
      updateNoteMutation.mutate({ id: editingNote._id, ...noteData });
    } else {
      createNoteMutation.mutate(noteData);
    }
  };

  const canUpgrade = user?.role === 'admin' && tenant?.plan === 'free';
  const isAtLimit = tenant?.plan === 'free' && notes.length >= (tenant?.maxNotes || 3);

  if (notesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-foreground" data-testid="text-dashboard-title">My Notes</h2>
            <p className="text-muted-foreground text-sm mt-1">Manage your notes and collaborate with your team</p>
          </div>

          <div className="flex items-center space-x-3">
            {canUpgrade && (
              <Button
                onClick={() => setIsUpgradeModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
                data-testid="button-upgrade-tenant"
              >
                <ArrowUp className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </Button>
            )}

            <Button
              onClick={handleCreateNote}
              disabled={isAtLimit}
              data-testid="button-create-note"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </div>
        </div>

        {/* Plan Status */}
        {tenant && (
          <div className="mb-6 flex items-center justify-between bg-card border border-border rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <Badge variant={tenant.plan === 'pro' ? 'default' : 'secondary'} data-testid="badge-plan-status">
                {tenant.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
              </Badge>
              <span className="text-sm text-muted-foreground" data-testid="text-note-count">
                {notes.length}/{tenant.plan === 'pro' ? '∞' : tenant.maxNotes} notes
              </span>
            </div>
            <div className="text-sm text-muted-foreground" data-testid="text-tenant-name">
              {tenant.name}
            </div>
          </div>
        )}

        {/* Notes Grid */}
        {notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="grid-notes">
            {notes.map((note: Note) => (
              <Card key={note._id} className="shadow-sm hover:shadow-md transition-shadow" data-testid={`card-note-${note._id}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-foreground text-lg truncate" data-testid={`text-note-title-${note._id}`}>
                      {note.title}
                    </h3>
                    <div className="flex items-center space-x-2 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditNote(note)}
                        data-testid={`button-edit-note-${note._id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(note._id)}
                        className="text-destructive hover:text-destructive"
                        data-testid={`button-delete-note-${note._id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3" data-testid={`text-note-content-${note._id}`}>
                    {note.content}
                  </p>

                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span data-testid={`text-note-author-${note._id}`}>{note.createdBy}</span>
                    <span data-testid={`text-note-date-${note._id}`}>
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Empty State for Free Plan Limit */}
            {isAtLimit && (
              <div className="bg-muted/30 border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center min-h-[200px]" data-testid="card-upgrade-prompt">
                <Plus className="h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="font-medium text-foreground mb-2">Upgrade to Pro</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  You've reached your Free plan limit of {tenant?.maxNotes} notes. Upgrade to Pro for unlimited notes.
                </p>
                {canUpgrade && (
                  <Button
                    variant="link"
                    onClick={() => setIsUpgradeModalOpen(true)}
                    className="text-primary"
                    data-testid="button-learn-more-upgrade"
                  >
                    Learn More →
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12" data-testid="container-empty-state">
            <i className="fas fa-sticky-note text-muted-foreground text-6xl mb-4"></i>
            <h3 className="text-xl font-semibold text-foreground mb-2">No notes yet</h3>
            <p className="text-muted-foreground mb-6">Start by creating your first note to organize your thoughts and ideas.</p>
            <Button onClick={handleCreateNote} data-testid="button-create-first-note">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Note
            </Button>
          </div>
        )}
      </main>

      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={handleSaveNote}
        note={editingNote}
        isLoading={createNoteMutation.isPending || updateNoteMutation.isPending}
      />

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onConfirm={() => upgradeTenantMutation.mutate()}
        isLoading={upgradeTenantMutation.isPending}
        tenant={tenant}
      />
    </div>
  );
}
