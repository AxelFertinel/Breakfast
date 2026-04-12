import { Header } from "@/features/layout/header";
import type { ReactNode } from "react";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-start justify-center p-6">
        <div className="w-full max-w-xl">{children}</div>
      </main>
    </div>
  );
}
