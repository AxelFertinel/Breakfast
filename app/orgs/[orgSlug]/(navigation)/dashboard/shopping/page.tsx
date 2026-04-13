import { Button } from "@/components/ui/button";
import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { ShoppingCart } from "lucide-react";
import { Suspense } from "react";
import { ShoppingListClient } from "./_components/shopping-list-client";

type Ingredient = { name: string; quantity?: number; unit?: string };

export default function ShoppingPage() {
  return (
    <Suspense fallback={null}>
      <ShoppingContent />
    </Suspense>
  );
}

async function ShoppingContent() {
  const user = await getRequiredUser();

  // Plan de la semaine en cours
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);

  const mealPlan = await prisma.mealPlan.findFirst({
    where: { userId: user.id, weekStart: { gte: monday, lt: nextMonday } },
    include: {
      slots: { include: { recipe: { select: { ingredients: true } } } },
    },
  });

  // Stock disponible
  const pantryItems = await prisma.pantryItem.findMany({
    where: { userId: user.id },
  });

  if (!mealPlan) {
    return (
      <Layout size="lg">
        <LayoutHeader>
          <LayoutTitle>Liste de courses</LayoutTitle>
        </LayoutHeader>
        <LayoutContent>
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <ShoppingCart size={48} className="text-muted-foreground" />
            <p className="text-muted-foreground">
              Aucun plan pour cette semaine. Générez votre semaine d'abord.
            </p>
          </div>
        </LayoutContent>
      </Layout>
    );
  }

  // Agréger tous les ingrédients du plan
  const needed = new Map<string, { quantity: number; unit: string }>();
  for (const slot of mealPlan.slots) {
    const ingredients = slot.recipe.ingredients as Ingredient[];
    for (const ing of ingredients) {
      const key = ing.name.toLowerCase().trim();
      const existing = needed.get(key);
      const qty = ing.quantity ?? 0;
      if (existing && existing.unit === (ing.unit ?? "")) {
        needed.set(key, { quantity: existing.quantity + qty, unit: existing.unit });
      } else {
        needed.set(ing.name.trim(), { quantity: qty, unit: ing.unit ?? "" });
      }
    }
  }

  // Soustraire le stock
  const shoppingList: Array<{
    name: string;
    neededQty: number;
    unit: string;
    inStock: boolean;
  }> = [];

  for (const [name, { quantity, unit }] of needed.entries()) {
    const stockItem = pantryItems.find(
      (p) => p.name.toLowerCase() === name.toLowerCase() && p.unit === unit,
    );
    const stockQty = stockItem?.quantity ?? 0;

    if (stockQty >= quantity) {
      // Suffisamment en stock — on ne l'ajoute pas à la liste
      continue;
    }

    shoppingList.push({
      name,
      neededQty: quantity - stockQty,
      unit,
      inStock: false,
    });
  }

  return (
    <Layout size="lg">
      <LayoutHeader>
        <LayoutTitle>Liste de courses</LayoutTitle>
      </LayoutHeader>
      <LayoutContent>
        <ShoppingListClient items={shoppingList} />
      </LayoutContent>
    </Layout>
  );
}
