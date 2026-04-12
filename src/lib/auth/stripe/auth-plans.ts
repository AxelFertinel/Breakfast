import type { Subscription } from "@/generated/prisma";
import { logger } from "@/lib/logger";
import {
  Clock,
  HeadphonesIcon,
  Shield,
  Star,
  Users,
  Zap,
} from "lucide-react";

const DEFAULT_LIMIT = {
  childrenLimit: 1, // nombre d'enfants inclus (-1 = illimité)
  aiGenerationsPerWeek: 1, // générations IA par semaine (null = désactivé)
  aiGenerationsPerMonth: null as number | null, // générations IA par mois (null = désactivé)
};

export type PlanLimit = {
  childrenLimit: number;
  aiGenerationsPerWeek: number | null;
  aiGenerationsPerMonth: number | null;
};

export type OverrideLimits = Partial<PlanLimit>;

type HookCtx = {
  req: Request;
  organizationId: string;
  stripeCustomerId: string;
  subscriptionId: string;
};

export type AppAuthPlan = {
  priceId?: string | undefined;
  lookupKey?: string | undefined;
  annualDiscountPriceId?: string | undefined;
  annualDiscountLookupKey?: string | undefined;
  name: string;
  limits: PlanLimit;
  group?: string;
  freeTrial?: {
    days: number;
    onTrialStart?: (subscription: Subscription, ctx: HookCtx) => Promise<void>;
    onTrialEnd?: (
      data: {
        subscription: Subscription;
      },
      ctx: HookCtx,
    ) => Promise<void>;
    onTrialExpired?: (
      subscription: Subscription,
      ctx: HookCtx,
    ) => Promise<void>;
  };
  onSubscriptionCanceled?: (
    subscription: Subscription,
    ctx: HookCtx,
  ) => Promise<void>;
} & {
  description: string;
  isPopular?: boolean;
  price: number;
  yearlyPrice?: number;
  currency: string;
  isHidden?: boolean;
};

export const AUTH_PLANS: AppAuthPlan[] = [
  {
    name: "free",
    description:
      "Parfait pour commencer : 1 adulte + 1 enfant, 1 génération IA par semaine",
    limits: {
      childrenLimit: 1,
      aiGenerationsPerWeek: 1,
      aiGenerationsPerMonth: null,
    },
    price: 0,
    currency: "EUR",
    yearlyPrice: 0,
  },
  {
    name: "famille",
    isPopular: true,
    description:
      "Pour les familles jusqu'à 4 enfants, avec 20 générations IA par mois",
    priceId: process.env.STRIPE_FAMILLE_PLAN_ID ?? "",
    annualDiscountPriceId: process.env.STRIPE_FAMILLE_YEARLY_PLAN_ID ?? "",
    limits: {
      childrenLimit: 4,
      aiGenerationsPerWeek: null,
      aiGenerationsPerMonth: 20,
    },
    freeTrial: {
      days: 14,
      onTrialStart: async (subscription) => {
        logger.debug(`Trial famille démarré pour ${subscription.id}`);
      },
      onTrialExpired: async (subscription) => {
        logger.debug(`Trial famille expiré pour ${subscription.id}`);
      },
      onTrialEnd: async (subscription) => {
        logger.debug(`Trial famille terminé pour ${subscription.id}`);
      },
    },
    price: 4.99,
    yearlyPrice: 47.9,
    currency: "EUR",
  },
  {
    name: "premium",
    isPopular: false,
    description:
      "Membres illimités, 60 générations IA/mois, analyse nutritionnelle et rappels email",
    priceId: process.env.STRIPE_PREMIUM_PLAN_ID ?? "",
    annualDiscountPriceId: process.env.STRIPE_PREMIUM_YEARLY_PLAN_ID ?? "",
    limits: {
      childrenLimit: -1, // illimité
      aiGenerationsPerWeek: null,
      aiGenerationsPerMonth: 60,
    },
    freeTrial: {
      days: 14,
    },
    price: 8.99,
    yearlyPrice: 86.9,
    currency: "EUR",
  },
  {
    name: "pro",
    isPopular: false,
    description:
      "Pour les coachs et nutritionnistes : IA illimitée, dashboard multi-clients, export PDF brandé",
    priceId: process.env.STRIPE_PRO_PLAN_ID ?? "",
    annualDiscountPriceId: process.env.STRIPE_PRO_YEARLY_PLAN_ID ?? "",
    limits: {
      childrenLimit: -1,
      aiGenerationsPerWeek: null,
      aiGenerationsPerMonth: -1, // illimité
    },
    freeTrial: {
      days: 14,
    },
    price: 19.99,
    yearlyPrice: 159.9,
    currency: "EUR",
  },
];

// Configuration d'affichage des limites
export const LIMITS_CONFIG: Record<
  keyof PlanLimit,
  {
    icon: React.ElementType;
    getLabel: (value: number | null) => string;
    description: string;
  }
> = {
  childrenLimit: {
    icon: Users,
    getLabel: (value) =>
      value === -1
        ? "Enfants illimités"
        : value === 1
          ? "1 enfant inclus"
          : `${value} enfants inclus`,
    description: "Nombre d'enfants dans le plan familial",
  },
  aiGenerationsPerWeek: {
    icon: Zap,
    getLabel: (value) =>
      value === null
        ? ""
        : value === 1
          ? "1 génération IA / semaine"
          : `${value} générations IA / semaine`,
    description: "Générations IA hebdomadaires",
  },
  aiGenerationsPerMonth: {
    icon: Star,
    getLabel: (value) =>
      value === null
        ? ""
        : value === -1
          ? "IA illimitée"
          : `${value} générations IA / mois`,
    description: "Générations IA mensuelles",
  },
};

// Fonctionnalités supplémentaires par plan
export const ADDITIONAL_FEATURES = {
  free: [
    {
      icon: Shield,
      label: "Plan 2 semaines pré-défini",
      description: "7 recettes incluses dès le départ",
    },
  ],
  famille: [
    {
      icon: Users,
      label: "Profils par membre",
      description: "Préférences et allergies par personne",
    },
    {
      icon: Zap,
      label: "Export liste de courses PDF",
      description: "Liste optimisée selon votre stock",
    },
  ],
  premium: [
    {
      icon: Zap,
      label: "Analyse nutritionnelle",
      description: "Score équilibre de chaque semaine",
    },
    {
      icon: HeadphonesIcon,
      label: "Rappels email",
      description: "Rappel de préparation la veille",
    },
    {
      icon: Clock,
      label: "Historique illimité",
      description: "Toutes vos semaines passées",
    },
  ],
  pro: [
    {
      icon: Zap,
      label: "Dashboard multi-clients",
      description: "Gérez vos clients comme un coach",
    },
    {
      icon: Star,
      label: "Export PDF brandé",
      description: "Votre logo + couleurs sur les PDF",
    },
    {
      icon: HeadphonesIcon,
      label: "Support prioritaire",
      description: "Réponse sous 24h",
    },
  ],
};

export const getPlanLimits = (
  plan = "free",
  overrideLimits?: OverrideLimits | null,
): PlanLimit => {
  const planLimits = AUTH_PLANS.find((p) => p.name === plan)?.limits;
  const baseLimits = planLimits ?? DEFAULT_LIMIT;

  if (!overrideLimits) {
    return baseLimits;
  }

  return {
    ...baseLimits,
    ...overrideLimits,
  };
};

export const getPlanFeatures = (plan: AppAuthPlan): string[] => {
  const features: string[] = [];

  // Limite enfants
  features.push(LIMITS_CONFIG.childrenLimit.getLabel(plan.limits.childrenLimit));

  // IA
  if (plan.limits.aiGenerationsPerWeek !== null) {
    features.push(
      LIMITS_CONFIG.aiGenerationsPerWeek.getLabel(plan.limits.aiGenerationsPerWeek),
    );
  }
  if (plan.limits.aiGenerationsPerMonth !== null) {
    features.push(
      LIMITS_CONFIG.aiGenerationsPerMonth.getLabel(plan.limits.aiGenerationsPerMonth),
    );
  }

  // Fonctionnalités additionnelles
  const additionalKey = plan.name as keyof typeof ADDITIONAL_FEATURES;
  if (ADDITIONAL_FEATURES[additionalKey]) {
    features.push(...ADDITIONAL_FEATURES[additionalKey].map((f) => f.label));
  }

  return features;
};
