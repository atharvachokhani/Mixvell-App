import { RecipeConfig } from '../types';

const RECIPES_KEY = 'mixvell_recipes_v1';

export const recipeService = {
  getRecipeConfig: (id: string): RecipeConfig | null => {
    try {
      const stored = localStorage.getItem(RECIPES_KEY);
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
      const stored = localStorage.getItem(RECIPES_KEY);
      const allConfigs = stored ? JSON.parse(stored) : {};
      allConfigs[config.id] = config;
      localStorage.setItem(RECIPES_KEY, JSON.stringify(allConfigs));
    } catch (e) {
      console.error("Failed to save recipe config", e);
    }
  }
};