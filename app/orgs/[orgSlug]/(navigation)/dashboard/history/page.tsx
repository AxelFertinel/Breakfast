import { Button } from "@/components/ui/button";
import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { Calendar, History } from "lucide-react";
import { Suspense } from "react";
import { ReusePlanButton } from "./_components/reuse-plan-button";

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function HistoryPage() {
  return (
    <Suspense fallback={null}>
      <HistoryContent />
    </Suspense>
  );
}

async function HistoryContent() {
  const user = await getRequiredUser();

  const plans = await prisma.mealPlan.findMany({
    where: { userId: user.id },
    include: {
      slots: {
        include: { recipe: { select: { id: true, title: true, badgeType: true } } },
        orderBy: { dayOfWeek: "asc" },
      },
    },
    orderBy: { weekStart: "desc" },
    take: 20,
  });

  return (
    <Layout size="lg">
      <LayoutHeader>
        <LayoutTitle>Historique des semaines</LayoutTitle>
      </LayoutHeader>
      <LayoutContent>
        {plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <History size={48} className="text-muted-foreground" />
            <p className="text-muted-foreground">
              Aucune semaine enregistrée pour l'instant.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {plans.map((plan) => {
              const weekStart = new Date(plan.weekStart);
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekStart.getDate() + 6);

              return (
                <div
                  key={plan.id}
                  className="border-input rounded-lg border p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-muted-foreground" />
                      <span className="text-sm font-semibold">
                        Semaine du{" "}
                        {weekStart.toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <ReusePlanButton mealPlanId={plan.id} />
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {DAY_LABELS.map((label, i) => {
                      const slot = plan.slots.find((s) => s.dayOfWeek === i);
                      return (
                        <div key={i} className="flex flex-col gap-1">
                          <span className="text-muted-foreground text-center text-xs">
                            {label}
                          </span>
                          <div className="bg-muted min-h-12 rounded p-1 text-center text-xs leading-tight">
                            {slot ? slot.recipe.title : "—"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </LayoutContent>
    </Layout>
  );
}
