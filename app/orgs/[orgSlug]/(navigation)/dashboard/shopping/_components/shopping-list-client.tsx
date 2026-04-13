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
import { CheckCircle, Circle, Plus, ShoppingCart, X } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "shopping-custom-items";

type ShoppingItem = {
  name: string;
  neededQty: number;
  unit: string;
  inStock: boolean;
};

type CustomItem = {
  id: string;
  name: string;
  note: string;
};

export function ShoppingListClient({ items }: { items: ShoppingItem[] }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", note: "" });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setCustomItems(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const saveCustomItems = (next: CustomItem[]) => {
    setCustomItems(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const addCustomItem = () => {
    if (!form.name.trim()) return;
    const item: CustomItem = {
      id: `custom-${Date.now()}`,
      name: form.name.trim(),
      note: form.note.trim(),
    };
    saveCustomItems([...customItems, item]);
    setForm({ name: "", note: "" });
    setOpen(false);
  };

  const removeCustomItem = (id: string) => {
    saveCustomItems(customItems.filter((i) => i.id !== id));
    setChecked((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Merge server items and custom items into a unified list
  type ListItem =
    | { kind: "server"; item: ShoppingItem }
    | { kind: "custom"; item: CustomItem };

  const allItems: ListItem[] = [
    ...items.map((item) => ({ kind: "server" as const, item })),
    ...customItems.map((item) => ({ kind: "custom" as const, item })),
  ];

  const keyOf = (entry: ListItem) =>
    entry.kind === "server" ? entry.item.name : entry.item.id;

  const remaining = allItems.filter((e) => !checked.has(keyOf(e)));
  const done = allItems.filter((e) => checked.has(keyOf(e)));

  const totalCount = allItems.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {remaining.length} article{remaining.length !== 1 ? "s" : ""} à acheter
          {done.length > 0 && ` · ${done.length} coché${done.length !== 1 ? "s" : ""}`}
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
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addCustomItem()}
                  autoFocus
                />
              </div>
              <div>
                <Label>Quantité / note (optionnel)</Label>
                <Input
                  placeholder="ex: 1 litre, 2 paquets…"
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addCustomItem()}
                />
              </div>
              <Button onClick={addCustomItem} disabled={!form.name.trim()}>
                Ajouter à la liste
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {totalCount === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <ShoppingCart size={48} className="text-green-500" />
          <p className="font-medium text-green-700">
            Vous avez déjà tout ce qu'il vous faut !
          </p>
          <p className="text-muted-foreground text-sm">
            Tous les ingrédients de votre semaine sont disponibles dans votre stock.
            Utilisez le bouton « Ajouter » pour compléter votre liste.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            {remaining.map((entry) => {
              const key = keyOf(entry);
              return (
                <div
                  key={key}
                  className="border-input hover:bg-accent flex items-center gap-3 rounded-md border px-3 py-2 transition-colors"
                >
                  <button
                    onClick={() => toggle(key)}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    <Circle size={18} className="text-muted-foreground shrink-0" />
                    <span className="flex-1 text-sm">
                      {entry.kind === "server" ? entry.item.name : entry.item.name}
                    </span>
                    {entry.kind === "server" && entry.item.neededQty > 0 && (
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
                      onClick={() => removeCustomItem(entry.item.id)}
                      className="text-muted-foreground hover:text-destructive shrink-0 transition-colors"
                      aria-label="Supprimer"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {done.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Déjà dans le panier
              </p>
              {done.map((entry) => {
                const key = keyOf(entry);
                return (
                  <div
                    key={key}
                    className="border-input hover:bg-accent flex items-center gap-3 rounded-md border px-3 py-2 opacity-50 transition-colors"
                  >
                    <button
                      onClick={() => toggle(key)}
                      className="flex flex-1 items-center gap-3 text-left"
                    >
                      <CheckCircle size={18} className="shrink-0 text-green-600" />
                      <span className="flex-1 text-sm line-through">
                        {entry.item.name}
                      </span>
                      {entry.kind === "server" && entry.item.neededQty > 0 && (
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
                        onClick={() => removeCustomItem(entry.item.id)}
                        className="text-muted-foreground hover:text-destructive shrink-0 transition-colors"
                        aria-label="Supprimer"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
