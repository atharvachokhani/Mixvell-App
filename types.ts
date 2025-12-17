export enum Ingredient {
  SODA = 'Soda',
  COLA = 'Cola',
  SUGAR = 'Sugar Syrup',
  LEMON = 'Lemon Mix',
  SPICY_LEMON = 'Spicy Lemon Mix',
  PINEAPPLE = 'Pineapple Juice',
}

export interface DrinkRecipe {
  [Ingredient.SODA]: number;
  [Ingredient.COLA]: number;
  [Ingredient.SUGAR]: number;
  [Ingredient.LEMON]: number;
  [Ingredient.SPICY_LEMON]: number;
  [Ingredient.PINEAPPLE]: number;
}

export interface SpecialtyDrink {
  id: string;
  name: string;
  description: string;
  baseIngredient: Ingredient;
  flavorIngredient: Ingredient;
  fixedIngredients: Partial<Record<Ingredient, number>>; 
  color: string;
  minFlavor: number;
  maxFlavor: number;
}

export interface RecipeConfig {
  id: string;
  minFlavor: number;
  maxFlavor: number;
  fixedIngredients: Partial<Record<Ingredient, number>>;
}

export type BluetoothState = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';