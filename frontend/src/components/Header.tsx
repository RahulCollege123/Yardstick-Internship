"use client";

import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut } from "lucide-react";

interface Tenant {
  _id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro';
  noteCount: number;
  maxNotes: number;
}

export function Header() {
  const { user, logoutMutation } = useAuth();

  const { data: tenant } = useQuery<Tenant>({
    queryKey: ['/api/user/tenant'],
    queryFn: () => api.get('/api/user/tenant').then(res => res.data),
  });

  const { data: notes = [] } = useQuery({
    queryKey: ['/api/notes'],
    queryFn: () => api.get('/api/notes').then(res => res.data),
  });

  return (
    <header className="bg-card border-b border-border shadow-sm" data-testid="header-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <i className="fas fa-sticky-note text-primary text-xl"></i>
              <h1 className="text-xl font-bold text-foreground" data-testid="text-app-title">NotesHub</h1>
            </div>
            {tenant && (
              <div className="hidden sm:block text-sm text-muted-foreground" data-testid="text-tenant-name">
                <span>{tenant.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Plan Badge */}
            <div className="flex items-center space-x-2">
              <Badge
                variant={tenant?.plan === 'pro' ? 'default' : 'secondary'}
                data-testid="badge-tenant-plan"
              >
                {tenant?.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
              </Badge>
              <span className="text-xs text-muted-foreground" data-testid="text-notes-count">
                {notes.length}/{tenant?.plan === 'pro' ? '∞' : tenant?.maxNotes || 3} notes
              </span>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-2">
              <Badge
                variant="outline"
                className={user?.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary-foreground'}
                data-testid="badge-user-role"
              >
                {user?.role === 'admin' ? 'Admin' : 'Member'}
              </Badge>
              <span className="text-sm text-foreground hidden sm:inline" data-testid="text-user-email">
                {user?.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
