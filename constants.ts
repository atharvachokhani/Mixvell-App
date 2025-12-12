import { Ingredient, SpecialtyDrink, DrinkRecipe } from './types';

// Bluetooth Configuration
export const BLE_SERVICE_UUID = 0xFFE0; 
export const BLE_CHARACTERISTIC_UUID = 0xFFE1;

export const MAX_VOLUME_ML = 100;

export const INGREDIENT_COLORS: Record<Ingredient, string> = {
  [Ingredient.SODA]: 'bg-sky-200 shadow-[0_0_10px_#bae6fd]',
  [Ingredient.COLA]: 'bg-amber-900',
  [Ingredient.SUGAR]: 'bg-white',
  [Ingredient.LEMON]: 'bg-yellow-400',
  [Ingredient.ORANGE]: 'bg-orange-500',
};

// Default recipes - Can be overridden by recipeService
export const SPECIALTY_DRINKS: SpecialtyDrink[] = [
  {
    id: 'classic-lemonade',
    name: 'Classic Lemonade',
    description: 'The all-time favorite refresher. Perfectly balanced.',
    baseIngredient: Ingredient.SODA,
    flavorIngredient: Ingredient.LEMON,
    fixedIngredients: { [Ingredient.SUGAR]: 20 },
    color: 'from-yellow-200 to-green-200',
    minFlavor: 10, 
    maxFlavor: 25, 
  },
  {
    id: 'orange-lemonade',
    name: 'Orange Lemonade',
    description: 'Zesty orange juice blended with fresh lemon soda.',
    baseIngredient: Ingredient.SODA,
    flavorIngredient: Ingredient.ORANGE,
    fixedIngredients: { [Ingredient.LEMON]: 10, [Ingredient.SUGAR]: 5 },
    color: 'from-orange-400 to-yellow-400',
    minFlavor: 15,   
    maxFlavor: 30,
  },
  {
    id: 'classic-cola',
    name: 'Classic Cola',
    description: 'Traditional cola taste served ice cold.',
    baseIngredient: Ingredient.SODA,
    flavorIngredient: Ingredient.COLA,
    fixedIngredients: {},
    color: 'from-red-900 to-black',
    minFlavor: 20, 
    maxFlavor: 40,
  },
  {
    id: 'lemon-cola',
    name: 'Lemon Cola',
    description: 'Cola with a refreshing twist of lemon.',
    baseIngredient: Ingredient.SODA,
    flavorIngredient: Ingredient.COLA,
    fixedIngredients: { [Ingredient.LEMON]: 10 },
    color: 'from-amber-900 to-yellow-900',
    minFlavor: 20,
    maxFlavor: 40,
  },
  {
    id: 'orange-cola',
    name: 'Orange Cola',
    description: 'The perfect mix of Cola and Orange juice (Mezzo Mix style).',
    baseIngredient: Ingredient.SODA,
    flavorIngredient: Ingredient.COLA,
    fixedIngredients: { [Ingredient.ORANGE]: 20 },
    color: 'from-orange-700 to-amber-900',
    minFlavor: 20,
    maxFlavor: 40,
  },
  {
    id: 'sweet-orange',
    name: 'Sweet Orange Soda',
    description: 'Simple and sweet sparkling orange drink.',
    baseIngredient: Ingredient.SODA,
    flavorIngredient: Ingredient.ORANGE,
    fixedIngredients: { [Ingredient.SUGAR]: 10 },
    color: 'from-orange-500 to-red-400',
    minFlavor: 20,
    maxFlavor: 40,
  }
];

export const EMPTY_RECIPE: DrinkRecipe = {
  [Ingredient.SODA]: 0,
  [Ingredient.COLA]: 0,
  [Ingredient.SUGAR]: 0,
  [Ingredient.LEMON]: 0,
  [Ingredient.ORANGE]: 0,
};