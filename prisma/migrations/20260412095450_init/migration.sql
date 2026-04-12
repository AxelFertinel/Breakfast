-- CreateTable
CREATE TABLE "physical_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weightKg" DOUBLE PRECISION,
    "heightCm" DOUBLE PRECISION,
    "birthYear" INTEGER,
    "gender" TEXT,
    "sportHoursPerWeek" DOUBLE PRECISION,
    "sportTypes" TEXT[],
    "activityLevel" TEXT,
    "breakfastGoal" TEXT,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "physical_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_member" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "birthYear" INTEGER,
    "weightKg" DOUBLE PRECISION,
    "heightCm" DOUBLE PRECISION,
    "sportTypes" TEXT[],
    "activityLevel" TEXT,
    "dietaryPrefs" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "family_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pantry_item" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "quantity" DOUBLE PRECISION,
    "unit" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pantry_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "badgeType" TEXT,
    "prepTime" INTEGER,
    "ingredients" JSONB NOT NULL,
    "steps" JSONB NOT NULL,
    "nutritionData" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_plan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meal_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_slot" (
    "id" TEXT NOT NULL,
    "mealPlanId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meal_slot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_recipe" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breakfast_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "recipeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "breakfast_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "physical_profile_userId_key" ON "physical_profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_slug_key" ON "recipe"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "meal_slot_mealPlanId_dayOfWeek_key" ON "meal_slot"("mealPlanId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_recipe_userId_recipeId_key" ON "favorite_recipe"("userId", "recipeId");

-- CreateIndex
CREATE UNIQUE INDEX "breakfast_log_userId_date_key" ON "breakfast_log"("userId", "date");

-- AddForeignKey
ALTER TABLE "meal_slot" ADD CONSTRAINT "meal_slot_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "meal_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_slot" ADD CONSTRAINT "meal_slot_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_recipe" ADD CONSTRAINT "favorite_recipe_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
