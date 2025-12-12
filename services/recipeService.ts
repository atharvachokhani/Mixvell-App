import { SpecialtyDrink, RecipeConfig } from '../types';

const STORAGE_KEY = 'mixvell_recipes_v1';

export const recipeService = {
  getRecipeConfig: (id: string): RecipeConfig | null => {
    try {
      const stored = localStorage.getItem(STATS_KEY_RECIPE);
      if (!stored) return null;
      const allConfigs = JSON.parse(stored);
      return allConfigs[id] || null;
    } catch (e) {
      // Quiet fail or log
      return null;
    }
  },

  saveRecipeConfig: (config: RecipeConfig) => {
    try {
      const stored = localStorage.getItem(STATS_KEY_RECIPE);
      const allConfigs = stored ? JSON.parse(stored) : {};
      allConfigs[config.id] = config;
      localStorage.setItem(STATS_KEY_RECIPE, JSON.stringify(allConfigs));
    } catch (e) {
      console.error("Failed to save recipe config", e);
    }
  }
};

const STATS_KEY_RECIPE = 'mixvell_recipes_v1';
