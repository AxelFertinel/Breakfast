# Breakfast — Roadmap Produit & Monétisation

## Contexte

L'app actuelle est un fichier HTML statique (plan 2 semaines, 7 recettes, liste de courses).
Cible : SaaS freemium B2C + B2B (coachs / nutritionnistes), stack full-stack, horizon 6+ mois.

---

## Stack recommandée

| Couche | Outil | Raison |
|---|---|---|
| Frontend | Next.js 14 (App Router, TypeScript) | SSR pour SEO, API routes intégrées |
| Styles | Tailwind CSS + shadcn/ui | Remplacement du CSS inline |
| Auth | Supabase Auth | Magic link + Google OAuth, gratuit |
| Base de données | Supabase (PostgreSQL) | Schéma relationnel, RLS par user |
| IA (principal) | Gemini 2.5 Flash | $0,30/$2,50 par M tokens — 90% des appels |
| IA (avancé) | Gemini 2.5 Pro | Analyse photo, personnalisation poussée |
| Rate limiting | Upstash Redis | Compteur d'appels IA par user/mois |
| Paiements | Stripe | Checkout, Customer Portal, Webhooks |
| Email | Resend | Rappels préparation, récap hebdo |
| PDF | react-pdf | Export plans brandés (tier Pro) |
| Déploiement | Vercel + Supabase cloud | Zéro ops |

---

## Tiers de monétisation

### Gratuit (forever)
- Plan 2 semaines pré-défini (app actuelle)
- 7 recettes incluses
- Liste de courses basique
- **IA : 3 générations/mois**
- Pas de sauvegarde cloud

### Premium — €5,99/mois · €57,50/an
- Plans personnalisés illimités (générer, sauvegarder, modifier)
- Personnalisation : régimes, allergies, nb de personnes, budget, saison
- **IA : 30 générations/mois**
- Export liste de courses PDF
- Données nutritionnelles par repas
- Rappels email (prépa la veille)
- Historique des plans

### Pro (Coachs / Nutritionnistes) — €19,99/mois · €159,90/an
- Tout Premium
- **IA : illimitée**
- Dashboard multi-clients (profils, préférences, plans assignés)
- Export PDF brandé (logo + couleurs du coach)
- Liens partage client (lecture seule, sans compte requis)
- Rapports mensuels par client

### One-time purchases
- Packs recettes thématiques : **€3,99** chacun
  - Pack Vegan, Pack Sport, Pack Budget, Pack Ultra-rapide

---

## Schéma base de données (Supabase)

```sql
-- Utilisateurs & abonnements
users            (id, email, tier, preferences jsonb, created_at)
subscriptions    (id, user_id, stripe_customer_id, stripe_sub_id, tier, status)

-- Contenu
meal_plans       (id, user_id, week_start, meals jsonb, generated_by)
recipes          (id, user_id, title, ingredients jsonb, steps jsonb, is_public, slug)
shopping_lists   (id, user_id, meal_plan_id, items jsonb, checked_ids jsonb)

-- IA
ai_usage         (id, user_id, feature, created_at)  -- rate limiting

-- B2B
client_profiles  (id, coach_id, client_name, preferences jsonb)
```

---

## Roadmap en 3 phases

### Phase 1 — Foundation (mois 1–2)
> Infrastructure réelle, pas encore d'IA

- [ ] Intégration dans le boilerplate (auth, DB, routing)
- [ ] Page onboarding : capture préférences (régime, nb personnes, budget, allergies)
- [ ] Persistence plans & listes de courses en base
- [ ] Stripe : page pricing, Checkout, Webhooks → mise à jour tier en base
- [ ] `SubscriptionGate` component : bloquer les features payantes avec CTA upgrade
- [ ] Quota meter dans le header (X/3 générations restantes ce mois)

### Phase 2 — IA (mois 3–4)
> Features IA avec rate limiting strict

| Feature | Input | Output |
|---|---|---|
| Générateur de plan | Prefs + saison + temps dispo | Plan 7 jours (JSON structuré) |
| Générateur de recette | Ingrédients dispo + contraintes | Recette complète avec étapes |
| Optimiseur de courses | Plan sélectionné + nb personnes | Liste consolidée avec quantités |
| Conseil nutritionnel | Plan de la semaine | Analyse équilibre + suggestions |

**Rate limiting avec Upstash Redis :**
```
Avant chaque appel IA → compter les rows de ai_usage
WHERE user_id = X AND created_at > début_du_mois

Free : 3 | Premium : 30 | Pro : ∞
Si dépassé → 429 + message d'upgrade
```

**Streaming Gemini API** pour les recettes (feedback visuel immédiat).

**Stratégie tiered routing :**
```
Appels simples (génération planning, variantes recettes) → Gemini 2.5 Flash
Appels avancés (analyse photo du bol, personnalisation poussée) → Gemini 2.5 Pro
```

**Prompt système de base :**
```
Tu es un expert en nutrition du petit-déjeuner, tu réponds en français.
Tu génères des plans équilibrés adaptés aux préférences utilisateur : {profil}.
Retourne toujours du JSON valide avec la structure demandée.
```

### Phase 3 — Pro & Croissance (mois 5–6)
> B2B + rétention + acquisition

- [ ] Dashboard coach : gestion clients, assignation de plans
- [ ] Export PDF brandé (react-pdf) avec logo + couleurs du coach
- [ ] Notifications push PWA (rappel prépa la veille)
- [ ] Gamification : streaks (jours consécutifs suivis)
- [ ] Pages recettes publiques `/recettes/{slug}` — SSR pour SEO
- [ ] Blog nutrition (MDX) — acquisition organique
- [ ] Programme de parrainage (+1 mois offert par filleul)

---

## Structure de fichiers recommandée

```
/app
  /page.tsx                        ← landing page (SEO)
  /pricing/page.tsx
  /onboarding/page.tsx
  /dashboard/page.tsx              ← plan de la semaine
  /dashboard/recipes/page.tsx
  /dashboard/shopping/page.tsx
  /dashboard/ai/page.tsx           ← générateurs IA
  /recettes/[slug]/page.tsx        ← pages publiques SEO
  /api
    /ai/generate-plan/route.ts
    /ai/generate-recipe/route.ts
    /ai/shopping-list/route.ts
    /stripe/webhook/route.ts
    /stripe/checkout/route.ts
/lib
  /supabase.ts
  /stripe.ts
  /gemini.ts                       ← wrapper Gemini API + streaming
  /rate-limit.ts                   ← vérification quota Upstash
/components
  /MealPlanGrid.tsx
  /RecipeCard.tsx
  /ShoppingList.tsx
  /AIQuotaMeter.tsx
  /SubscriptionGate.tsx            ← HOC pour bloquer features payantes
```

---

## Intégration Gemini API (exemple)

```typescript
// lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Appels simples → Flash
const flashModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
// Appels avancés (analyse photo) → Pro
const proModel   = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })

export async function generateMealPlan(userProfile: UserProfile) {
  const result = await flashModel.generateContentStream({
    contents: [{
      role: 'user',
      parts: [{ text:
        `Tu es un expert en nutrition du petit-déjeuner, tu réponds en français.
         Génère un plan de 7 petits-déjeuners pour ce profil : ${JSON.stringify(userProfile)}.
         Retourne un JSON valide : [{day, meal_name, prep_time, badge_type, recipe_key}]`
      }]
    }]
  })
  return result.stream  // streamer vers le client avec ReadableStream
}
```

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
3. **Conseil nutritionnel embarqué** — index glycémique, protéines, satiété expliqués

---

## Acquisition & rétention

| Levier | Mécanisme |
|---|---|
| SEO | Pages recettes publiques + blog MDX |
| Free tool viral | "Générateur de liste de courses" gratuit (3 uses → paywall) |
| Email | Récap hebdo auto-généré par l'IA (Premium) |
| Rappels | Notif push/email la veille ("Préparez vos overnight oats") |
| Gamification | Streaks + badges (7 jours suivis, 30 jours…) |
| Parrainage | +1 mois offert par filleul converti |
| Essai gratuit | 14 jours Pro pour tout nouveau compte |
