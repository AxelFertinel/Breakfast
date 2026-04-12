# Breakfast — Roadmap Produit & Monétisation

## Contexte

Application SaaS de planification intelligente de petits-déjeuners, alimentée par l'IA.  
Focus unique : **100% petit-déjeuner**, logique "veille vs 2 min le matin", conseil nutritionnel embarqué.  
Stack full-stack, horizon 6+ mois.

---

## Stack technique

| Couche | Outil | Raison |
|---|---|---|
| Frontend | Next.js 14 (App Router, TypeScript) | SSR pour SEO, API routes intégrées |
| Styles | Tailwind CSS + shadcn/ui | Composants accessibles, design system cohérent |
| Auth | better-auth | Magic link + Google OAuth + OTP email |
| Base de données | Prisma + PostgreSQL (Supabase) | Schéma relationnel, typesafe |
| IA (principal) | Gemini 2.5 Flash | $0,30/$2,50 par M tokens — 90% des appels |
| IA (avancé) | Gemini 2.5 Pro | Analyse photo, personnalisation poussée |
| Rate limiting | Table `ai_usage` Prisma | Compteur d'appels IA par user/semaine ou mois |
| Paiements | Stripe | Checkout, Customer Portal, Webhooks |
| Email | Resend | Rappels préparation, récap hebdo |
| PDF | react-pdf | Export plans brandés (tier Pro) |
| Déploiement | Vercel + Supabase cloud | Zéro ops |

---

## Tiers de monétisation

### Gratuit (forever)
- 1 adulte + **1 enfant** inclus
- **1 génération IA par semaine** (couvre tous les membres de la famille)
- Plan 2 semaines pré-défini (7 recettes)
- Mon stock (gestion des ingrédients)
- Liste de courses stock-aware
- Favoris recettes

### Famille — €4,99/mois · €47,90/an
- 1 adulte + **jusqu'à 4 enfants**
- **20 générations IA par mois**
- Profils complets par membre (allergies, régimes, activité)
- Export liste de courses PDF
- Historique des semaines illimité

### Premium — €8,99/mois · €86,90/an
- Membres **illimités**
- **60 générations IA par mois**
- Score nutritionnel de la semaine
- Rappels email (prépa la veille)
- "Inspirer-moi" : régénération partielle de 1–3 jours

### Pro (Coachs / Nutritionnistes) — €19,99/mois · €159,90/an
- Tout Premium
- **IA illimitée**
- Dashboard multi-clients (profils, préférences, plans assignés)
- Export PDF brandé (logo + couleurs du coach)
- Liens partage client (lecture seule, sans compte requis)

---

## Profil & Personnalisation IA

À la première connexion, l'utilisateur complète un wizard 4 étapes :

1. **Profil physique** : poids, taille, année de naissance, genre
2. **Activité sportive** : heures/semaine, types de sport, niveau d'activité, objectif (perte de poids / prise de masse / maintien / endurance)
3. **Famille** : ajout des membres du foyer (adultes supplémentaires + enfants) avec âge
4. **Préférences alimentaires** : allergies (gluten, lactose, arachides, œufs, fruits à coque, soja) et régimes (vegan, végétarien, sans sucre, halal, kasher, paléo) **par membre**

Ces données alimentent le prompt IA à chaque génération :

```
Tu es un expert en nutrition du petit-déjeuner, tu réponds en français.
Profil adulte : {poids}kg, {taille}cm, {age} ans, objectif : {goal}, activité : {activityLevel}.
Membres de la famille : {familyMembers avec leurs préférences}.
Stock disponible : {pantryItems}.
Contraintes alimentaires : {allergies et régimes par membre}.
Génère un plan de 7 petits-déjeuners équilibrés, adapté à ces profils.
Retourne du JSON valide : [{day, meal_name, prep_time, badge_type, recipe_key}]
```

**Tiered routing IA :**
- Appels simples (génération planning, variantes) → Gemini 2.5 Flash
- Appels avancés (analyse photo du bol, personnalisation poussée) → Gemini 2.5 Pro

---

## Schéma base de données

```sql
-- Auth (géré par better-auth, ne pas modifier directement)
user             (id, email, name, image, ...)
session / account / verification

-- Profils
physical_profile (id, userId, weightKg, heightCm, birthYear, gender,
                  sportHoursPerWeek, sportTypes[], activityLevel,
                  breakfastGoal, onboardingCompleted)
family_member    (id, userId, name, type, birthYear, weightKg, heightCm,
                  sportTypes[], activityLevel, dietaryPrefs[])

-- Stock
pantry_item      (id, userId, name, category, quantity, unit, expiresAt)

-- Recettes & Plans
recipe           (id, userId?, title, slug, badgeType, prepTime,
                  ingredients json, steps json, nutritionData json?, isPublic)
meal_plan        (id, userId, weekStart)
meal_slot        (id, mealPlanId, recipeId, dayOfWeek)
favorite_recipe  (id, userId, recipeId)

-- Suivi
breakfast_log    (id, userId, date, recipeId?)   -- streaks

-- Abonnements (Stripe)
subscription     (id, plan, referenceId, stripeCustomerId, ...)
```

---

## Roadmap en 3 phases

### Phase 1 — Foundation (mois 1–2)
> Infrastructure complète, sans IA réelle (recettes statiques puis générées)

- [x] Boilerplate : auth, DB, routing, Stripe (better-auth + Prisma)
- [x] Schéma Prisma complet (PhysicalProfile, FamilyMember, PantryItem, Recipe, MealPlan, MealSlot, FavoriteRecipe, BreakfastLog)
- [x] Plans Stripe adaptés Breakfast (free / famille / premium / pro)
- [x] Wizard onboarding 4 étapes (profil physique → activité → famille → préférences alimentaires)
- [x] Redirect conditionnel first-connection → onboarding
- [x] Page "Mon stock" avec CRUD ingrédients
- [x] Dashboard "Ma semaine" avec MealPlanGrid
- [x] Page détail recette (navigation depuis la grille)
- [x] Favoris recettes
- [x] Liste de courses stock-aware
- [x] Historique des semaines + réutilisation
- [x] Streaks & badges (7/30/100 jours)
- [ ] `SubscriptionGate` component (bloquer >1 enfant en free)
- [ ] Quota meter IA dans le header (X/1 génération restante cette semaine)
- [ ] Stripe : page pricing, Checkout, Webhooks → mise à jour tier

### Phase 2 — IA (mois 3–4)
> Intégration Gemini avec rate limiting strict

| Feature | Input | Output |
|---|---|---|
| Générateur de plan | Profil + famille + stock + saison | Plan 7 jours (JSON structuré) |
| "Inspirer-moi" | Plan existant + jours sélectionnés | 1–3 jours remplacés |
| Générateur de recette | Ingrédients + contraintes | Recette complète avec étapes |
| Optimiseur de courses | Plan sélectionné + stock | Liste consolidée avec quantités |
| "Que faire avec ce que j'ai ?" | Stock uniquement | 1 recette express |
| Score nutritionnel | Recettes de la semaine | Analyse équilibre (protéines / glucides / fibres) |

**Rate limiting :**
```
Free    : 1 appel / 7 jours glissants (via ai_usage)
Famille : 20 appels / mois
Premium : 60 appels / mois
Pro     : illimité
```

**"Que faire avec ce que j'ai ?"** : hors quota (appel léger distinct), disponible sur la page Mon stock.

### Phase 3 — Pro & Croissance (mois 5–6)
> B2B + rétention + acquisition

- [ ] Dashboard coach : gestion clients, assignation de plans
- [ ] Export PDF brandé (react-pdf) avec logo + couleurs du coach
- [ ] Notifications push PWA (rappel prépa la veille)
- [ ] Pages recettes publiques `/recettes/{slug}` — SSR pour SEO
- [ ] Blog nutrition (MDX) — acquisition organique
- [ ] Programme de parrainage (+1 mois offert par filleul)

---

## Structure de fichiers

```
/app
  /onboarding/                    ← wizard 4 étapes (première connexion)
  /orgs/[orgSlug]/
    /(navigation)/
      /dashboard/                 ← semaine en cours (MealPlanGrid)
        /recipes/[recipeId]/      ← page détail recette
        /favorites/               ← recettes favorites
        /shopping/                ← liste de courses stock-aware
        /history/                 ← semaines passées
        /streaks/                 ← streaks & badges
      /stock/                     ← Mon stock (PantryItem CRUD)
  /api
    /onboarding/family-members/   ← GET membres pour étape 4
    /ai/generate-plan/            ← POST Gemini (Phase 2)
    /stripe/webhook/              ← Stripe webhooks
/src
  /features
    /onboarding/                  ← onboarding.action.ts
    /meal-plans/                  ← meal-plans.action.ts (toggle favori, replace slot, log)
    /stock/                       ← stock.action.ts (CRUD PantryItem)
  /lib
    /auth/stripe/auth-plans.ts    ← plans Breakfast (free/famille/premium/pro)
```

---

## Coût IA estimé (1 000 utilisateurs actifs/mois, 5 appels chacun)

| Stratégie | Coût/mois |
|---|---|
| Gemini 2.5 Flash uniquement | ~2–5 € |
| Gemini Flash + Pro (tiered) | ~5–15 € |
| Claude Sonnet 4.6 uniquement | ~30–50 € |

**Économie avec tiered routing : 80–90% vs un modèle premium.**

---

## Positionnement vs concurrence

Les apps existantes (Jow, Petit Citron, PlannyMeal) couvrent tous les repas de la journée.
Aucune ne fait les 3 choses suivantes ensemble :

1. **Focus 100% petit-déjeuner** — expert, pas généraliste
2. **Logique "veille" vs "2 min le matin"** — badges Préparer la veille / Express / Week-end
3. **Profil physique + famille** — quantités et apports adaptés à chaque membre

---

## Acquisition & rétention

| Levier | Mécanisme |
|---|---|
| SEO | Pages recettes publiques + blog MDX |
| Free tool viral | "Générateur de liste de courses" gratuit (1 use/semaine → paywall) |
| Email | Récap hebdo auto-généré par l'IA (Premium) |
| Rappels | Notif push/email la veille ("Préparez vos overnight oats") |
| Gamification | Streaks + badges (7, 30, 100 jours suivis) |
| Parrainage | +1 mois offert par filleul converti |
| Essai gratuit | 14 jours Pro pour tout nouveau compte |
