"use client";

import { useState } from "react";
import { CheckCircle, Circle, ShoppingCart } from "lucide-react";

type ShoppingItem = {
  name: string;
  neededQty: number;
  unit: string;
  inStock: boolean;
};

export function ShoppingListClient({ items }: { items: ShoppingItem[] }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (name: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const remaining = items.filter((i) => !checked.has(i.name));
  const done = items.filter((i) => checked.has(i.name));

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <ShoppingCart size={48} className="text-green-500" />
        <p className="font-medium text-green-700">
          Vous avez déjà tout ce qu'il vous faut !
        </p>
        <p className="text-muted-foreground text-sm">
          Tous les ingrédients de votre semaine sont disponibles dans votre stock.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        {remaining.length} article{remaining.length !== 1 ? "s" : ""} à acheter
        {done.length > 0 && ` · ${done.length} coché${done.length !== 1 ? "s" : ""}`}
      </p>

      <div className="flex flex-col gap-1">
        {remaining.map((item) => (
          <button
            key={item.name}
            onClick={() => toggle(item.name)}
            className="border-input hover:bg-accent flex items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors"
          >
            <Circle size={18} className="text-muted-foreground shrink-0" />
            <span className="flex-1 text-sm">{item.name}</span>
            {item.neededQty > 0 && (
              <span className="text-muted-foreground text-sm">
                {item.neededQty} {item.unit}
              </span>
            )}
          </button>
        ))}
      </div>

      {done.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            Déjà dans le panier
          </p>
          {done.map((item) => (
            <button
              key={item.name}
              onClick={() => toggle(item.name)}
              className="border-input hover:bg-accent flex items-center gap-3 rounded-md border px-3 py-2 text-left opacity-50 transition-colors"
            >
              <CheckCircle size={18} className="shrink-0 text-green-600" />
              <span className="flex-1 text-sm line-through">{item.name}</span>
              {item.neededQty > 0 && (
                <span className="text-muted-foreground text-sm">
                  {item.neededQty} {item.unit}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
