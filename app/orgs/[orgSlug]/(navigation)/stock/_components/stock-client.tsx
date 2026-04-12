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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import {
  addPantryItemAction,
  deletePantryItemAction,
} from "@/features/stock/stock.action";
import type { PantryItem } from "@/generated/prisma";
import { useMutation } from "@tanstack/react-query";
import { Package, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "céréales", label: "Céréales" },
  { value: "laitier", label: "Produits laitiers" },
  { value: "fruit", label: "Fruits" },
  { value: "protéine", label: "Protéines" },
  { value: "matière_grasse", label: "Matières grasses" },
  { value: "autre", label: "Autre" },
] as const;

const UNITS = ["g", "ml", "unités", "kg", "L"] as const;

type StockClientProps = {
  initialItems: PantryItem[];
};

export function StockClient({ initialItems }: StockClientProps) {
  const router = useRouter();
  const [items, setItems] = useState<PantryItem[]>(initialItems);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "" as string,
    quantity: "",
    unit: "" as string,
    expiresAt: "",
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      return resolveActionResult(
        addPantryItemAction({
          name: form.name,
          category: form.category as PantryItem["category"],
          quantity: form.quantity ? Number(form.quantity) : undefined,
          unit: form.unit as PantryItem["unit"],
          expiresAt: form.expiresAt || undefined,
        }),
      );
    },
    onSuccess: (data) => {
      setItems((prev) => [...prev, data.item]);
      setForm({ name: "", category: "", quantity: "", unit: "", expiresAt: "" });
      setOpen(false);
      toast.success("Ingrédient ajouté");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return resolveActionResult(deletePantryItemAction({ id }));
    },
    onSuccess: (_, id) => {
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Ingrédient supprimé");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Regrouper par catégorie
  const grouped = items.reduce<Record<string, PantryItem[]>>((acc, item) => {
    const cat = item.category ?? "autre";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {items.length} ingrédient{items.length !== 1 ? "s" : ""} en stock
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Ajouter un ingrédient
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter au stock</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              <div>
                <Label>Nom de l'ingrédient *</Label>
                <Input
                  placeholder="ex: Flocons d'avoine"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Catégorie</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner…" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Quantité</Label>
                  <Input
                    type="number"
                    placeholder="500"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, quantity: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Unité</Label>
                  <Select
                    value={form.unit}
                    onValueChange={(v) => setForm((f) => ({ ...f, unit: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Unité" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Date d'expiration (optionnel)</Label>
                <Input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, expiresAt: e.target.value }))
                  }
                />
              </div>
              <Button
                onClick={() => addMutation.mutate()}
                disabled={!form.name || addMutation.isPending}
              >
                {addMutation.isPending ? "Ajout…" : "Ajouter"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Package size={48} className="text-muted-foreground" />
          <p className="text-muted-foreground">
            Votre stock est vide. Ajoutez les ingrédients que vous avez déjà
            chez vous pour que l'IA les utilise en priorité.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {Object.entries(grouped).map(([category, categoryItems]) => (
            <div key={category}>
              <h3 className="mb-2 text-sm font-semibold capitalize">
                {CATEGORIES.find((c) => c.value === category)?.label ?? category}
              </h3>
              <div className="flex flex-col gap-1">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="border-input flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{item.name}</span>
                      {(item.quantity || item.unit) && (
                        <span className="text-muted-foreground text-xs">
                          {item.quantity} {item.unit}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {item.expiresAt && (
                        <span className="text-muted-foreground text-xs">
                          Exp.{" "}
                          {new Date(item.expiresAt).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive h-7 w-7"
                        onClick={() => deleteMutation.mutate(item.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
