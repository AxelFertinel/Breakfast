import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FavoriteButton } from "./_components/favorite-button";

const BADGE_CONFIG = {
  express: { label: "Express", variant: "secondary" as const },
  veille: { label: "Préparer la veille", variant: "outline" as const },
  weekend: { label: "Week-end", variant: "default" as const },
};

export default function RecipePage(
  props: PageProps<"/orgs/[orgSlug]/dashboard/recipes/[recipeId]">,
) {
  return (
    <Suspense fallback={null}>
      <RecipePageContent {...props} />
    </Suspense>
  );
}

async function RecipePageContent(
  props: PageProps<"/orgs/[orgSlug]/dashboard/recipes/[recipeId]">,
) {
  const params = await props.params;
  const user = await getRequiredUser();

  const recipe = await prisma.recipe.findUnique({
    where: { id: params.recipeId },
  });

  if (!recipe) notFound();

  const isFavorited = !!(await prisma.favoriteRecipe.findUnique({
    where: {
      userId_recipeId: { userId: user.id, recipeId: recipe.id },
    },
  }));

  const ingredients = recipe.ingredients as Array<{
    name: string;
    quantity?: number;
    unit?: string;
  }>;
  const steps = recipe.steps as string[];

  const badgeConf = recipe.badgeType
    ? BADGE_CONFIG[recipe.badgeType as keyof typeof BADGE_CONFIG]
    : null;

  return (
    <Layout size="md">
      <LayoutHeader>
        <div className="flex items-center gap-3">
          <Link href={`/orgs/${params.orgSlug}/dashboard`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <LayoutTitle>{recipe.title}</LayoutTitle>
        </div>
      </LayoutHeader>
      <LayoutContent className="flex flex-col gap-6">
        {/* Méta */}
        <div className="flex items-center gap-3">
          {badgeConf && <Badge variant={badgeConf.variant}>{badgeConf.label}</Badge>}
          {recipe.prepTime && (
            <span className="text-muted-foreground flex items-center gap-1 text-sm">
              <Clock size={14} />
              {recipe.prepTime} min
            </span>
          )}
          <div className="flex-1" />
          <FavoriteButton recipeId={recipe.id} initialFavorited={isFavorited} />
        </div>

        {/* Ingrédients */}
        <Card>
          <CardContent className="pt-4">
            <h2 className="mb-3 font-semibold">Ingrédients</h2>
            <ul className="flex flex-col gap-1.5">
              {ingredients.map((ing, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between border-b pb-1.5 last:border-0"
                >
                  <span className="text-sm">{ing.name}</span>
                  {(ing.quantity || ing.unit) && (
                    <span className="text-muted-foreground text-sm">
                      {ing.quantity} {ing.unit}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Étapes */}
        <Card>
          <CardContent className="pt-4">
            <h2 className="mb-3 font-semibold">Préparation</h2>
            <ol className="flex flex-col gap-4">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="bg-primary text-primary-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </LayoutContent>
    </Layout>
  );
}
