"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const noteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z.string().min(1, "Content is required").max(10000, "Content too long"),
});

type NoteFormData = z.infer<typeof noteSchema>;

interface Note {
  _id: string;
  title: string;
  content: string;
}

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteData: { title: string; content: string }) => void;
  note?: Note | null;
  isLoading?: boolean;
}

export function NoteModal({ isOpen, onClose, onSave, note, isLoading = false }: NoteModalProps) {
  const form = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  useEffect(() => {
    if (note) {
      form.reset({
        title: note.title,
        content: note.content,
      });
    } else {
      form.reset({
        title: "",
        content: "",
      });
    }
  }, [note, form, isOpen]);

  const onSubmit = (data: NoteFormData) => {
    onSave(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden" data-testid="dialog-note-modal">
        <DialogHeader>
          <DialogTitle data-testid="text-modal-title">
            {note ? "Edit Note" : "Create New Note"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-note">
          <div className="space-y-2">
            <Label htmlFor="note-title">Title</Label>
            <Input
              id="note-title"
              placeholder="Enter note title..."
              {...form.register("title")}
              data-testid="input-note-title"
            />
            {form.formState.errors.title && (
              <p className="text-destructive text-sm" data-testid="error-note-title">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note-content">Content</Label>
            <Textarea
              id="note-content"
              rows={8}
              placeholder="Write your note content here..."
              className="resize-none"
              {...form.register("content")}
              data-testid="textarea-note-content"
            />
            {form.formState.errors.content && (
              <p className="text-destructive text-sm" data-testid="error-note-content">
                {form.formState.errors.content.message}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              data-testid="button-cancel-note"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              data-testid="button-save-note"
            >
              {isLoading ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
