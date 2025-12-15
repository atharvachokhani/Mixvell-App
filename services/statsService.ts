import { DrinkRecipe, Ingredient } from '../types';

const STATS_KEY = 'mixvell_stats_v1';

export interface AppStats {
  totalDrinks: number;
  totalVolume: number;
  ingredientUsage: Record<Ingredient, number>;
}

const INITIAL_STATS: AppStats = {
  totalDrinks: 0,
  totalVolume: 0,
  ingredientUsage: {
    [Ingredient.SODA]: 0,
    [Ingredient.COLA]: 0,
    [Ingredient.SUGAR]: 0,
    [Ingredient.LEMON]: 0,
    [Ingredient.ORANGE]: 0,
    [Ingredient.PINEAPPLE]: 0,
  },
};

export const statsService = {
  getStats: (): AppStats => {
    try {
      const stored = localStorage.getItem(STATS_KEY);
      return stored ? JSON.parse(stored) : INITIAL_STATS;
    } catch (e) {
      console.error("Failed to load stats", e);
      return INITIAL_STATS;
    }
  },

  recordDispense: (recipe: DrinkRecipe) => {
    try {
      const current = statsService.getStats();
      const newStats = { ...current };

      newStats.totalDrinks += 1;
      
      let recipeTotal = 0;
      Object.entries(recipe).forEach(([key, value]) => {
        const ing = key as Ingredient;
        // Check if ingredient exists in current tracking (handles removal of old ingredients)
        if (newStats.ingredientUsage[ing] !== undefined) {
             newStats.ingredientUsage[ing] = (newStats.ingredientUsage[ing] || 0) + (value || 0);
        }
        recipeTotal += (value || 0);
      });

      newStats.totalVolume += recipeTotal;

      localStorage.setItem(STATS_KEY, JSON.stringify(newStats));
    } catch (e) {
      console.error("Failed to save stats", e);
    }
  },

  resetStats: () => {
    localStorage.setItem(STATS_KEY, JSON.stringify(INITIAL_STATS));
  }
};