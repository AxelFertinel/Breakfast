"use cache";

import { cacheLife } from "next/dist/server/use-cache/cache-life";
import { getMrrHistory, getUserGrowth } from "./admin-charts-data";
import { MrrChart } from "./mrr-chart";
import { UserGrowthChart } from "./user-growth-chart";

export async function AdminChartsSection() {
  cacheLife("hours");

  const [mrrData, userGrowthData] = await Promise.all([
    getMrrHistory(),
    getUserGrowth(),
  ]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <MrrChart data={mrrData} />
      <UserGrowthChart data={userGrowthData} />
    </div>
  );
}
