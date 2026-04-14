"use client";

import "./breakfast-page.css";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import { useState } from "react";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-serif",
});

type DayMeal = { day: string; meal: string; sub: string; badge: string; badgeClass: string };
type Ingredient = { name: string; qty: string };
type Recipe = { title: string; meta: string; ingredients: Ingredient[]; prepTitle: string; steps: string[]; tip?: string };
type ShoppingItem = { label: string; qty: string; idx: number };
type ShoppingCategory = { icon: string; title: string; items: ShoppingItem[] };

const week1: DayMeal[] = [
  { day: "Lundi", meal: "Overnight oats fruits rouges", sub: "Préparer dimanche soir", badge: "Veille", badgeClass: "badge-prep" },
  { day: "Mardi", meal: "Yaourt grec · banane · amandes", sub: "0 préparation", badge: "2 min", badgeClass: "badge-quick" },
  { day: "Mercredi", meal: "Overnight oats pomme-cannelle", sub: "Préparer mardi soir", badge: "Veille", badgeClass: "badge-prep" },
  { day: "Jeudi", meal: "Toast fromage · œuf dur · fruit", sub: "Œuf dur cuit la veille", badge: "3 min", badgeClass: "badge-quick" },
  { day: "Vendredi", meal: "Fromage blanc · muesli · fruits", sub: "Préparer jeudi soir", badge: "Veille", badgeClass: "badge-prep" },
  { day: "Samedi", meal: "Smoothie bowl protéiné", sub: "10 min · week-end", badge: "Week-end", badgeClass: "badge-we" },
  { day: "Dimanche", meal: "Brunch omelette · fromage blanc · fruits", sub: "20 min · week-end", badge: "Week-end", badgeClass: "badge-we" },
];

const week2: DayMeal[] = [
  { day: "Lundi", meal: "Overnight oats banane-miel", sub: "Préparer dimanche soir", badge: "Veille", badgeClass: "badge-prep" },
  { day: "Mardi", meal: "Yaourt grec · kiwi · noix", sub: "0 préparation", badge: "2 min", badgeClass: "badge-quick" },
  { day: "Mercredi", meal: "Overnight oats fruits rouges-noix", sub: "Préparer mardi soir", badge: "Veille", badgeClass: "badge-prep" },
  { day: "Jeudi", meal: "Toast fromage · œuf dur · orange", sub: "Œuf dur cuit la veille", badge: "3 min", badgeClass: "badge-quick" },
  { day: "Vendredi", meal: "Fromage blanc · muesli · banane", sub: "Préparer jeudi soir", badge: "Veille", badgeClass: "badge-prep" },
  { day: "Samedi", meal: "Smoothie bowl pomme-cannelle", sub: "10 min · week-end", badge: "Week-end", badgeClass: "badge-we" },
  { day: "Dimanche", meal: "Brunch œufs brouillés · fromage · pain de seigle", sub: "15 min · week-end", badge: "Week-end", badgeClass: "badge-we" },
];

const recipes: Recipe[] = [
  {
    title: "Overnight oats (base)",
    meta: "Semaine 1 Lundi & Mercredi · Semaine 2 Lundi & Mercredi",
    ingredients: [
      { name: "Flocons d'avoine", qty: "50 g" },
      { name: "Lait (ou boisson végétale)", qty: "150 ml" },
      { name: "Yaourt nature (optionnel, + crémeux)", qty: "50 g" },
      { name: "Fruits rouges ou pomme râpée", qty: "100 g" },
      { name: "Noix concassées ou amandes", qty: "20 g" },
      { name: "Miel (optionnel)", qty: "1 c. à café" },
    ],
    prepTitle: "Préparation (la veille, 3 min)",
    steps: [
      "Dans un pot ou un bol avec couvercle, verser les flocons d'avoine et le lait.",
      "Ajouter le yaourt si utilisé, mélanger rapidement.",
      "Couvrir et placer au frigo pour toute la nuit.",
      "Le matin : ajouter les fruits et les noix par-dessus. Manger froid.",
    ],
    tip: "Variante S2 Lundi : remplacer les fruits rouges par 1 banane écrasée + 1 c. à café de miel. Variante S2 Mercredi : fruits rouges + noix.",
  },
  {
    title: "Yaourt grec · fruits · oléagineux",
    meta: "Mardi S1 & S2",
    ingredients: [
      { name: "Yaourt grec nature", qty: "150 g" },
      { name: "Banane ou 2 kiwis", qty: "1 pièce" },
      { name: "Amandes ou noix", qty: "30 g" },
      { name: "Miel (optionnel)", qty: "1 c. à café" },
    ],
    prepTitle: "Préparation (2 min)",
    steps: [
      "Verser le yaourt dans un bol.",
      "Couper le fruit en rondelles par-dessus.",
      "Ajouter les oléagineux. Filet de miel si souhaité.",
    ],
    tip: "S1 Mardi : banane + amandes. S2 Mardi : kiwis + noix. Préparer les pots d'oléagineux en avance (portions de 30g) pour gagner encore plus de temps.",
  },
  {
    title: "Toast fromage · œuf dur · fruit",
    meta: "Jeudi S1 & S2",
    ingredients: [
      { name: "Pain complet (tranches)", qty: "2 tranches (~80 g)" },
      { name: "Emmental ou comté", qty: "30 g" },
      { name: "Œuf dur", qty: "1 pièce" },
      { name: "Fruit (poire, pomme, orange…)", qty: "1 pièce" },
    ],
    prepTitle: "Préparation",
    steps: [
      "La veille : faire cuire l'œuf dur 10 min dans l'eau bouillante. Laisser refroidir, conserver au frigo avec la coquille.",
      "Le matin : passer le pain au grille-pain.",
      "Poser le fromage sur les toasts chauds. Écaler et couper l'œuf. Manger avec le fruit.",
    ],
    tip: "Cuire 2-3 œufs en même temps pour avoir de l'avance sur la semaine. Conservation : 1 semaine au frigo avec la coquille.",
  },
  {
    title: "Fromage blanc · muesli · fruits",
    meta: "Vendredi S1 & S2",
    ingredients: [
      { name: "Fromage blanc (0% ou 3.2%)", qty: "150 g" },
      { name: "Muesli nature (sans sucre ajouté)", qty: "40 g" },
      { name: "Fruits rouges ou banane (S2)", qty: "80–100 g" },
      { name: "Noix", qty: "20 g" },
    ],
    prepTitle: "Préparation (la veille, 3 min)",
    steps: [
      "Dans un pot, verser le fromage blanc.",
      "Ajouter les fruits et les noix.",
      "Conserver le muesli à part (pour ne pas qu'il ramollisse). Ajouter le matin.",
    ],
    tip: "Le muesli mis dans le fromage blanc la veille devient mou. Pour garder le croquant, gardez-le dans un petit sachet séparé et ajoutez-le au dernier moment.",
  },
  {
    title: "Smoothie bowl protéiné",
    meta: "Samedi S1 & S2",
    ingredients: [
      { name: "Banane congelée", qty: "1 pièce (~120 g)" },
      { name: "Fruits rouges (frais ou surgelés)", qty: "100 g" },
      { name: "Yaourt grec", qty: "150 g" },
      { name: "Flocons d'avoine (garniture)", qty: "40 g" },
      { name: "Amandes effilées", qty: "15 g" },
      { name: "Miel", qty: "1 c. à café" },
    ],
    prepTitle: "Préparation (10 min)",
    steps: [
      "Mixer la banane congelée + fruits rouges + yaourt grec jusqu'à obtenir une texture épaisse et crémeuse.",
      "Verser dans un bol large.",
      "Disposer les flocons d'avoine, les amandes effilées par-dessus. Filet de miel.",
    ],
    tip: "Astuce : prépeler et congeler les bananes trop mûres. S2 : version pomme-cannelle → remplacer les fruits rouges par 1 pomme + ½ c. à café de cannelle.",
  },
  {
    title: "Brunch omelette (S1 Dimanche)",
    meta: "Dimanche Semaine 1",
    ingredients: [
      { name: "Œufs", qty: "2 pièces" },
      { name: "Légumes (épinards, poivron, oignon)", qty: "80 g" },
      { name: "Fromage blanc", qty: "150 g" },
      { name: "Fruits de saison", qty: "1–2 pièces" },
      { name: "Pain de seigle", qty: "2 tranches (~60 g)" },
      { name: "Huile d'olive", qty: "1 c. à soupe" },
    ],
    prepTitle: "Préparation (20 min)",
    steps: [
      "Faire revenir les légumes coupés en dés dans l'huile d'olive, 5 min à feu moyen.",
      "Battre les œufs, saler, poivrer. Verser sur les légumes. Cuire 3–4 min.",
      "Servir avec le fromage blanc, les fruits et le pain de seigle toasté.",
    ],
  },
  {
    title: "Brunch œufs brouillés (S2 Dimanche)",
    meta: "Dimanche Semaine 2",
    ingredients: [
      { name: "Œufs", qty: "2–3 pièces" },
      { name: "Beurre", qty: "10 g" },
      { name: "Fromage (emmental râpé)", qty: "20 g" },
      { name: "Pain de seigle", qty: "2 tranches (~60 g)" },
      { name: "Fruit (orange, kiwi…)", qty: "1 pièce" },
    ],
    prepTitle: "Préparation (15 min)",
    steps: [
      "Faire fondre le beurre à feu doux dans une casserole.",
      "Ajouter les œufs battus. Remuer constamment avec une spatule en silicone, à feu très doux, pendant 8–10 min.",
      "Retirer du feu avant que ça soit complètement cuit (résidual heat finit la cuisson). Ajouter le fromage râpé.",
      "Servir sur le pain de seigle toasté avec le fruit.",
    ],
    tip: "La clé des œufs brouillés parfaits : feu très doux et remuer sans arrêt. Plus c'est lent, plus c'est crémeux.",
  },
];

// Pre-compute flat indices for shopping items
const rawCategories = [
  { icon: "🌾", title: "Céréales & féculents", items: [
    { label: "Flocons d'avoine nature", qty: "500 g" },
    { label: "Muesli nature (sans sucre ajouté)", qty: "200 g" },
    { label: "Pain complet (tranches)", qty: "1 paquet" },
    { label: "Pain de seigle (tranches)", qty: "1 paquet" },
  ]},
  { icon: "🥛", title: "Produits laitiers & œufs", items: [
    { label: "Yaourt grec nature", qty: "1 kg" },
    { label: "Fromage blanc nature", qty: "750 g" },
    { label: "Lait (demi-écrémé)", qty: "1 L" },
    { label: "Emmental ou comté (tranches)", qty: "150 g" },
    { label: "Œufs", qty: "12 pièces" },
    { label: "Beurre", qty: "1 plaquette" },
  ]},
  { icon: "🍌", title: "Fruits frais", items: [
    { label: "Bananes", qty: "8 pièces" },
    { label: "Pommes", qty: "4 pièces" },
    { label: "Kiwis", qty: "3 pièces" },
    { label: "Oranges", qty: "2 pièces" },
    { label: "Fruits de saison (poire, nectarine…)", qty: "4 pièces" },
  ]},
  { icon: "🍓", title: "Fruits rouges", items: [
    { label: "Fruits rouges surgelés (ou frais)", qty: "750 g" },
  ]},
  { icon: "🥜", title: "Oléagineux", items: [
    { label: "Amandes nature", qty: "200 g" },
    { label: "Noix (cerneaux)", qty: "150 g" },
    { label: "Amandes effilées (smoothie bowl)", qty: "50 g" },
  ]},
  { icon: "🧴", title: "Épicerie & condiments", items: [
    { label: "Miel", qty: "1 pot" },
    { label: "Cannelle en poudre", qty: "1 boîte" },
    { label: "Huile d'olive", qty: "si besoin" },
  ]},
  { icon: "🥗", title: "Légumes (brunch week-end)", items: [
    { label: "Épinards frais ou surgelés", qty: "100 g" },
    { label: "Poivron ou oignon", qty: "1 pièce" },
  ]},
];

let _i = 0;
const shoppingCategories: ShoppingCategory[] = rawCategories.map((cat) => ({
  ...cat,
  items: cat.items.map((item) => ({ ...item, idx: _i++ })),
}));
const TOTAL_ITEMS = _i;

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"prog" | "recettes" | "courses">("prog");
  const [openRecipes, setOpenRecipes] = useState<Set<number>>(new Set());
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const pct = TOTAL_ITEMS ? Math.round((checkedItems.size / TOTAL_ITEMS) * 100) : 0;

  const toggleRecipe = (i: number) => {
    setOpenRecipes((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const toggleItem = (i: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className={`bf-app ${dmSans.variable} ${dmSerifDisplay.variable}`}>
      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab${activeTab === "prog" ? " active" : ""}`}
          onClick={() => setActiveTab("prog")}
        >
          📅 Programme
        </button>
        <button
          className={`tab${activeTab === "recettes" ? " active" : ""}`}
          onClick={() => setActiveTab("recettes")}
        >
          🥣 Recettes
        </button>
        <button
          className={`tab${activeTab === "courses" ? " active" : ""}`}
          onClick={() => setActiveTab("courses")}
        >
          🛒 Courses
        </button>
      </div>

      {/* Programme */}
      <div className={`panel${activeTab === "prog" ? " active" : ""}`}>
        <div className="week-label">Semaine 1</div>
        <div className="days">
          {week1.map((d, i) => (
            <div key={i} className="day-row">
              <span className="day-name">{d.day}</span>
              <div className="day-card">
                <div>
                  <div className="meal-name">{d.meal}</div>
                  <div className="meal-sub">{d.sub}</div>
                </div>
                <span className={`badge-v ${d.badgeClass}`}>{d.badge}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="week-label">Semaine 2</div>
        <div className="days">
          {week2.map((d, i) => (
            <div key={i} className="day-row">
              <span className="day-name">{d.day}</span>
              <div className="day-card">
                <div>
                  <div className="meal-name">{d.meal}</div>
                  <div className="meal-sub">{d.sub}</div>
                </div>
                <span className={`badge-v ${d.badgeClass}`}>{d.badge}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recettes */}
      <div className={`panel${activeTab === "recettes" ? " active" : ""}`}>
        <div className="recipes-grid">
          {recipes.map((r, i) => (
            <div key={i} className="recipe-card">
              <div className="recipe-header" onClick={() => toggleRecipe(i)}>
                <div>
                  <div className="recipe-title">{r.title}</div>
                  <div className="recipe-meta">{r.meta}</div>
                </div>
                <span className={`recipe-arrow${openRecipes.has(i) ? " open" : ""}`}>▼</span>
              </div>
              <div className={`recipe-body${openRecipes.has(i) ? " open" : ""}`}>
                <div className="ingr-title">Ingrédients — 1 portion</div>
                <table className="ingr-table">
                  <tbody>
                    {r.ingredients.map((ing, j) => (
                      <tr key={j}>
                        <td>{ing.name}</td>
                        <td>{ing.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="ingr-title">{r.prepTitle}</div>
                <div className="step-list">
                  {r.steps.map((step, j) => (
                    <div key={j} className="step">
                      <span className="step-num">{j + 1}</span>
                      {step}
                    </div>
                  ))}
                </div>
                {r.tip && <div className="tip-box">{r.tip}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Courses */}
      <div className={`panel${activeTab === "courses" ? " active" : ""}`}>
        <div className="progress-text">
          {checkedItems.size} / {TOTAL_ITEMS} articles cochés
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="check-all" onClick={() => setCheckedItems(new Set())}>
          Tout décocher
        </div>
        {shoppingCategories.map((cat, ci) => (
          <div key={ci}>
            <div className="section-title">
              {cat.icon} {cat.title}
            </div>
            <div className="check-list">
              {cat.items.map((item) => (
                <div
                  key={item.idx}
                  className={`check-item${checkedItems.has(item.idx) ? " checked" : ""}`}
                  onClick={() => toggleItem(item.idx)}
                >
                  <div className="check-box">
                    <span className="check-tick">✓</span>
                  </div>
                  <span className="check-label">{item.label}</span>
                  <span className="check-qty">{item.qty}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
