"use client";

import { Button } from "@/components/ui/button";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { toggleFavoriteAction } from "@/features/meal-plans/meal-plans.action";
import { useMutation } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type FavoriteButtonProps = {
  recipeId: string;
  initialFavorited: boolean;
};

export function FavoriteButton({ recipeId, initialFavorited }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);

  const mutation = useMutation({
    mutationFn: async () => {
      return resolveActionResult(toggleFavoriteAction({ recipeId }));
    },
    onSuccess: (data) => {
      setFavorited(data.favorited);
      toast.success(data.favorited ? "Ajouté aux favoris" : "Retiré des favoris");
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className="gap-2"
    >
      <Heart
        size={16}
        className={favorited ? "fill-red-500 text-red-500" : "text-muted-foreground"}
      />
      {favorited ? "Favori" : "Ajouter aux favoris"}
    </Button>
  );
}
