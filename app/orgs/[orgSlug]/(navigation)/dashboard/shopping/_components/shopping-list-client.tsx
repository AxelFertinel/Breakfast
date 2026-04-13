"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import {
  addShoppingItemAction,
  deleteShoppingItemAction,
} from "@/features/shopping/shopping.action";
import type { ShoppingItem as DbShoppingItem } from "@/generated/prisma";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle, Circle, Plus, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type RecipeItem = {
  name: string;
  neededQty: number;
  unit: string;
};

type ShoppingListClientProps = {
  items: RecipeItem[];
  initialCustomItems: DbShoppingItem[];
};

export function ShoppingListClient({
  items,
  initialCustomItems,
}: ShoppingListClientProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [customItems, setCustomItems] =
    useState<DbShoppingItem[]>(initialCustomItems);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", note: "" });

  const addMutation = useMutation({
    mutationFn: async () =>
      resolveActionResult(
        addShoppingItemAction({ name: form.name, note: form.note || undefined }),
      ),
    onSuccess: (data) => {
      setCustomItems((prev) => [...prev, data.item]);
      setForm({ name: "", note: "" });
      setOpen(false);
      toast.success("Article ajouté");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) =>
      resolveActionResult(deleteShoppingItemAction({ id })),
    onSuccess: (_, id) => {
      setCustomItems((prev) => prev.filter((i) => i.id !== id));
      setChecked((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.success("Article supprimé");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  type ListEntry =
    | { kind: "recipe"; item: RecipeItem }
    | { kind: "custom"; item: DbShoppingItem };

  const allEntries: ListEntry[] = [
    ...items.map((item) => ({ kind: "recipe" as const, item })),
    ...customItems.map((item) => ({ kind: "custom" as const, item })),
  ];

  const keyOf = (e: ListEntry) =>
    e.kind === "recipe" ? e.item.name : e.item.id;

  const remaining = allEntries.filter((e) => !checked.has(keyOf(e)));
  const done = allEntries.filter((e) => checked.has(keyOf(e)));

  const renderEntry = (entry: ListEntry, isDone: boolean) => {
    const key = keyOf(entry);
    return (
      <div
        key={key}
        className={`border-input hover:bg-accent flex items-center gap-3 rounded-md border px-3 py-2 transition-colors${isDone ? " opacity-50" : ""}`}
      >
        <button
          onClick={() => toggle(key)}
          className="flex flex-1 items-center gap-3 text-left"
        >
          {isDone ? (
            <CheckCircle size={18} className="shrink-0 text-green-600" />
          ) : (
            <Circle size={18} className="text-muted-foreground shrink-0" />
          )}
          <span className={`flex-1 text-sm${isDone ? " line-through" : ""}`}>
            {entry.item.name}
          </span>
          {entry.kind === "recipe" && entry.item.neededQty > 0 && (
            <span className="text-muted-foreground text-sm">
              {entry.item.neededQty} {entry.item.unit}
            </span>
          )}
          {entry.kind === "custom" && entry.item.note && (
            <span className="text-muted-foreground text-sm">
              {entry.item.note}
            </span>
          )}
        </button>
        {entry.kind === "custom" && (
          <button
            onClick={() => deleteMutation.mutate(entry.item.id)}
            disabled={deleteMutation.isPending}
            className="text-muted-foreground hover:text-destructive shrink-0 transition-colors"
            aria-label="Supprimer"
          >
            <X size={14} />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {remaining.length} article{remaining.length !== 1 ? "s" : ""} à acheter
          {done.length > 0 &&
            ` · ${done.length} coché${done.length !== 1 ? "s" : ""}`}
        </p>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus size={14} className="mr-1" />
              Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un article</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              <div>
                <Label>Nom de l'article *</Label>
                <Input
                  placeholder="ex: Jus d'orange"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" && !addMutation.isPending && addMutation.mutate()
                  }
                  autoFocus
                />
              </div>
              <div>
                <Label>Quantité / note (optionnel)</Label>
                <Input
                  placeholder="ex: 1 litre, 2 paquets…"
                  value={form.note}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, note: e.target.value }))
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" && !addMutation.isPending && addMutation.mutate()
                  }
                />
              </div>
              <Button
                onClick={() => addMutation.mutate()}
                disabled={!form.name.trim() || addMutation.isPending}
              >
                {addMutation.isPending ? "Ajout…" : "Ajouter à la liste"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {allEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <ShoppingCart size={48} className="text-green-500" />
          <p className="font-medium text-green-700">
            Vous avez déjà tout ce qu'il vous faut !
          </p>
          <p className="text-muted-foreground text-sm">
            Tous les ingrédients de votre semaine sont disponibles dans votre
            stock. Utilisez le bouton « Ajouter » pour compléter votre liste.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            {remaining.map((e) => renderEntry(e, false))}
          </div>

          {done.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Déjà dans le panier
              </p>
              {done.map((e) => renderEntry(e, true))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
