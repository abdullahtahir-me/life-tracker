"use client";

import { useState, useTransition } from "react";
import { createDomain, deleteDomain } from "@/lib/actions/domain-actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette, Trash2, AlertTriangle } from "lucide-react";
import { Domain } from "@/lib/types/database";

// A curated palette of modern Tailwind colors
const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e", "#10b981", 
  "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef", "#ec4cc9"
];

export function DomainManager({ domains }: { domains: Domain[] }) {
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[7]); // Default blue
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [domainToDelete, setDomainToDelete] = useState<Domain | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleCreate = (formData: FormData) => {
    startTransition(async () => {
      // Add the color from our React state into the form data
      formData.append("color", selectedColor);
      await createDomain(formData);
    });
  };

  const handleDelete = async () => {
    if (domainToDelete && deleteConfirmText === domainToDelete.name) {
      startTransition(async () => {
        await deleteDomain(domainToDelete.id);
        setDomainToDelete(null);
        setDeleteConfirmText("");
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* LEFT: Sleek Add Domain Form */}
      <Card className="p-6 h-fit border-border/50 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          Create New Domain
        </h2>

        <form action={handleCreate} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs text-muted-foreground uppercase tracking-wider">Domain Name</Label>
            <Input id="name" name="name" placeholder="E.g., Freelance" required className="bg-secondary/30" />
          </div>

          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Theme Color</Label>
            {/* The Custom Color Swatches */}
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`size-6 rounded-full transition-all duration-200 ${
                    selectedColor === color ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Saving..." : "Add Domain"}
          </Button>
        </form>
      </Card>

      {/* RIGHT: Tighter, Sleeker Domain List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold px-1">Active Domains</h2>
        
        {domains.length === 0 ? (
          <div className="p-6 border border-dashed rounded-xl text-center text-muted-foreground">
            <p className="text-sm">No domains created yet.</p>
          </div>
        ) : (
          <div className="flex flex-col border border-border/50 rounded-xl overflow-hidden bg-card shadow-sm">
            {domains.map((domain) => (
              <div key={domain.id} className="flex items-center justify-between p-3 border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: domain.color || '#ccc' }} />
                  <span className="font-medium text-sm">{domain.name}</span>
                </div>

                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setDomainToDelete(domain)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GITHUB-STYLE DELETE MODAL OVERLAY */}
      {domainToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 shadow-2xl border-destructive/20 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-destructive mb-4">
              <div className="p-2 bg-destructive/10 rounded-full">
                <AlertTriangle className="size-5" />
              </div>
              <h3 className="text-lg font-bold">Delete Domain?</h3>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              This will permanently delete the <strong>{domainToDelete.name}</strong> domain. 
              All projects and tasks associated with this domain will be destroyed. This action cannot be undone.
            </p>

            <div className="space-y-2 mb-6">
              <Label className="text-xs">
                Please type <strong>{domainToDelete.name}</strong> to confirm.
              </Label>
              <Input 
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="bg-secondary/30"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => {
                setDomainToDelete(null);
                setDeleteConfirmText("");
              }}>
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="destructive" 
                disabled={deleteConfirmText !== domainToDelete.name || isPending}
                onClick={handleDelete}
              >
                {isPending ? "Deleting..." : "I understand, delete this domain"}
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}