import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { Clock, Heart } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default function FavoritesPage(
  props: PageProps<"/orgs/[orgSlug]/dashboard/favorites">,
) {
  return (
    <Suspense fallback={null}>
      <FavoritesContent {...props} />
    </Suspense>
  );
}

async function FavoritesContent(
  props: PageProps<"/orgs/[orgSlug]/dashboard/favorites">,
) {
  const params = await props.params;
  const user = await getRequiredUser();

  const favorites = await prisma.favoriteRecipe.findMany({
    where: { userId: user.id },
    include: {
      recipe: {
        select: {
          id: true,
          title: true,
          badgeType: true,
          prepTime: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Layout size="lg">
      <LayoutHeader>
        <LayoutTitle>Mes favoris</LayoutTitle>
      </LayoutHeader>
      <LayoutContent>
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Heart size={48} className="text-muted-foreground" />
            <p className="text-muted-foreground">
              Vous n'avez pas encore de recettes favorites. Cliquez sur le cœur
              sur une recette pour l'enregistrer ici.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map(({ recipe }) => (
              <Link
                key={recipe.id}
                href={`/orgs/${params.orgSlug}/dashboard/recipes/${recipe.id}`}
                className="border-input hover:bg-accent flex flex-col gap-2 rounded-lg border p-4 transition-colors"
              >
                <p className="font-medium">{recipe.title}</p>
                <div className="flex items-center gap-3">
                  {recipe.badgeType && (
                    <span className="bg-muted rounded-full px-2 py-0.5 text-xs">
                      {recipe.badgeType}
                    </span>
                  )}
                  {recipe.prepTime && (
                    <span className="text-muted-foreground flex items-center gap-1 text-xs">
                      <Clock size={12} />
                      {recipe.prepTime} min
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </LayoutContent>
    </Layout>
  );
}
