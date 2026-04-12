type OnboardingProgressProps = {
  currentStep: number;
  totalSteps: number;
};

const STEP_LABELS = ["Profil physique", "Activité sportive", "Famille", "Préférences"];

export function OnboardingProgress({
  currentStep,
  totalSteps,
}: OnboardingProgressProps) {
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-muted-foreground text-sm">
          Étape {currentStep} sur {totalSteps}
        </span>
        <span className="text-muted-foreground text-sm">
          {STEP_LABELS[currentStep - 1]}
        </span>
      </div>
      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}
