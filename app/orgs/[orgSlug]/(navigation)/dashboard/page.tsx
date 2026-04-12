import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import { MealPlanGrid } from "./_components/meal-plan-grid";

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const user = await getRequiredUser();

  // Calcul du lundi de la semaine en cours
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);

  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);

  const mealPlan = await prisma.mealPlan.findFirst({
    where: {
      userId: user.id,
      weekStart: { gte: monday, lt: nextMonday },
    },
    include: {
      slots: {
        include: { recipe: true },
        orderBy: { dayOfWeek: "asc" },
      },
    },
  });

  // Streak courant
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const logs = await prisma.breakfastLog.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    take: 100,
  });

  let streak = 0;
  const check = new Date(todayDate);
  for (const log of logs) {
    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);
    if (logDate.getTime() === check.getTime()) {
      streak++;
      check.setDate(check.getDate() - 1);
    } else {
      break;
    }
  }

  return (
    <Layout size="lg">
      <LayoutHeader>
        <LayoutTitle>Ma semaine</LayoutTitle>
      </LayoutHeader>
      <LayoutContent>
        <MealPlanGrid
          mealPlan={mealPlan}
          weekStart={monday.toISOString()}
          streak={streak}
        />
      </LayoutContent>
    </Layout>
  );
}
