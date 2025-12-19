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
    [Ingredient.SPICY_LEMON]: 0,
    [Ingredient.ORANGE_JUICE]: 0,
  },
};

export const statsService = {
  getStats: (): AppStats => {
    try {
      const stored = localStorage.getItem(STATS_KEY);
      if (!stored) return INITIAL_STATS;
      
      const stats = JSON.parse(stored);
      // Migration check: Ensure Orange Juice exists in usage
      if (!stats.ingredientUsage[Ingredient.ORANGE_JUICE]) {
        stats.ingredientUsage[Ingredient.ORANGE_JUICE] = 0;
      }
      return stats;
    } catch (e) {
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
        if (newStats.ingredientUsage[ing] !== undefined) {
             newStats.ingredientUsage[ing] = (newStats.ingredientUsage[ing] || 0) + (value || 0);
        }
        recipeTotal += (value || 0);
      });

      newStats.totalVolume += recipeTotal;
      localStorage.setItem(STATS_KEY, JSON.stringify(newStats));
    } catch (e) {}
  },

  resetStats: () => {
    localStorage.setItem(STATS_KEY, JSON.stringify(INITIAL_STATS));
  }
};