export enum Ingredient {
  WATER = 'Water',
  COLA = 'Cola',
  SODA = 'Soda',
  SUGAR = 'Sugar Syrup',
  LEMON = 'Lemon Mix',
  ORANGE = 'Orange Juice',
}

export interface DrinkRecipe {
  [Ingredient.WATER]: number;
  [Ingredient.COLA]: number;
  [Ingredient.SODA]: number;
  [Ingredient.SUGAR]: number;
  [Ingredient.LEMON]: number;
  [Ingredient.ORANGE]: number;
}

export interface SpecialtyDrink {
  id: string;
  name: string;
  description: string;
  baseIngredient: Ingredient;
  flavorIngredient: Ingredient;
  // Ingredients that are part of the recipe but cannot be changed by the user
  // e.g., Sugar syrup is required, or a splash of lemon in a Cola drink
  fixedIngredients: Partial<Record<Ingredient, number>>; 
  color: string;
  // Limits for the flavor component to ensure the drink tastes good
  minFlavor: number;
  maxFlavor: number;
}

export type BluetoothState = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';