"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

interface Tenant {
  _id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro';
  noteCount: number;
  maxNotes: number;
}

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  tenant?: Tenant;
}

export function UpgradeModal({ isOpen, onClose, onConfirm, isLoading = false, tenant }: UpgradeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="dialog-upgrade-modal">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <ArrowUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <DialogTitle data-testid="text-upgrade-title">Upgrade to Pro</DialogTitle>
              <p className="text-muted-foreground text-sm">Unlock unlimited notes for your team</p>
            </div>
          </div>
        </DialogHeader>

        <div className="bg-muted rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Current Plan</span>
            <span className="text-sm font-medium text-foreground" data-testid="text-current-plan">
              Free ({tenant?.maxNotes || 3} notes max)
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Upgrade to</span>
            <span className="text-sm font-medium text-green-600" data-testid="text-target-plan">
              Pro (Unlimited notes)
            </span>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
            data-testid="button-cancel-upgrade"
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            onClick={onConfirm}
            disabled={isLoading}
            data-testid="button-confirm-upgrade"
          >
            {isLoading ? "Upgrading..." : "Upgrade Now"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
