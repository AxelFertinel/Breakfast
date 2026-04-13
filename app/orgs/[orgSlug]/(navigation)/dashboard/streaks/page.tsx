import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { Flame, Trophy } from "lucide-react";
import { Suspense } from "react";

const BADGES = [
  { days: 7, label: "7 jours de suite", icon: "🥉" },
  { days: 30, label: "30 jours de suite", icon: "🥈" },
  { days: 100, label: "100 jours de suite", icon: "🏆" },
];

export default function StreaksPage() {
  return (
    <Suspense fallback={null}>
      <StreaksContent />
    </Suspense>
  );
}

async function StreaksContent() {
  const user = await getRequiredUser();

  const logs = await prisma.breakfastLog.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  // Calcul du streak courant
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let currentStreak = 0;
  const check = new Date(today);
  for (const log of logs) {
    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);
    if (logDate.getTime() === check.getTime()) {
      currentStreak++;
      check.setDate(check.getDate() - 1);
    } else {
      break;
    }
  }

  // Streak maximal (toutes périodes confondues)
  let maxStreak = 0;
  let tempStreak = 0;
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  for (let i = 0; i < sortedLogs.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(sortedLogs[i - 1].date);
      const curr = new Date(sortedLogs[i].date);
      prev.setHours(0, 0, 0, 0);
      curr.setHours(0, 0, 0, 0);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    maxStreak = Math.max(maxStreak, tempStreak);
  }

  const unlockedBadges = BADGES.filter((b) => maxStreak >= b.days);
  const nextBadge = BADGES.find((b) => maxStreak < b.days);

  return (
    <Layout size="lg">
      <LayoutHeader>
        <LayoutTitle>Mes streaks</LayoutTitle>
      </LayoutHeader>
      <LayoutContent className="flex flex-col gap-6">
        {/* Streak courant */}
        <div className="flex flex-col items-center gap-2 rounded-xl bg-orange-50 py-8">
          <Flame size={48} className="text-orange-500" />
          <span className="text-5xl font-bold text-orange-600">
            {currentStreak}
          </span>
          <span className="text-muted-foreground text-sm">
            jour{currentStreak !== 1 ? "s" : ""} consécutif
            {currentStreak !== 1 ? "s" : ""}
          </span>
          <span className="text-muted-foreground text-xs">
            Meilleur streak : {maxStreak} jour{maxStreak !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Badges */}
        <div>
          <h2 className="mb-3 font-semibold">Badges</h2>
          <div className="flex flex-col gap-2">
            {BADGES.map((badge) => {
              const unlocked = maxStreak >= badge.days;
              return (
                <div
                  key={badge.days}
                  className={`flex items-center gap-3 rounded-lg border p-3 ${
                    unlocked
                      ? "border-yellow-200 bg-yellow-50"
                      : "border-input opacity-50"
                  }`}
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{badge.label}</p>
                    {!unlocked && (
                      <p className="text-muted-foreground text-xs">
                        Encore {badge.days - maxStreak} jour
                        {badge.days - maxStreak !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                  {unlocked && <Trophy size={16} className="text-yellow-500" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Total */}
        <p className="text-muted-foreground text-center text-sm">
          {logs.length} petit{logs.length !== 1 ? "s" : ""}-déjeuner
          {logs.length !== 1 ? "s" : ""} enregistré
          {logs.length !== 1 ? "s" : ""} au total
        </p>
      </LayoutContent>
    </Layout>
  );
}
