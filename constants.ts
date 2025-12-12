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
  [Ingredient.PINEAPPLE]: 'bg-yellow-300 shadow-[0_0_10px_#fde047]',
};

// Default recipes - Can be overridden by recipeService
export const SPECIALTY_DRINKS: SpecialtyDrink[] = [
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
    id: 'classic-lemonade',
    name: 'Classic Lemonade',
    description: 'The all-time favorite refresher. Perfectly balanced.',
    baseIngredient: Ingredient.SODA,
    flavorIngredient: Ingredient.LEMON,
    fixedIngredients: { [Ingredient.SUGAR]: 20 },
    color: 'from-yellow-200 to-green-200',
    minFlavor: 10, 
    maxFlavor: 20, 
  },
  {
    id: 'plain-cola',
    name: 'Plain Cola',
    description: 'Classic chilled cola with an optional lemon twist.',
    baseIngredient: Ingredient.COLA,
    flavorIngredient: Ingredient.LEMON, 
    fixedIngredients: {},
    color: 'from-red-900 to-black',
    minFlavor: 0, 
    maxFlavor: 10,
  },
  {
    id: 'pineapple-lemonade',
    name: 'Pineapple Lemonade',
    description: 'Tropical pineapple juice with a sparkling lemon kick.',
    baseIngredient: Ingredient.SODA,
    flavorIngredient: Ingredient.PINEAPPLE,
    fixedIngredients: { [Ingredient.LEMON]: 10, [Ingredient.SUGAR]: 5 },
    color: 'from-yellow-400 to-amber-300',
    minFlavor: 15,
    maxFlavor: 30, 
  },
  {
    id: 'tropical-cola',
    name: 'Tropical Cola',
    description: 'An exotic fusion of Cola and sweet Pineapple.',
    baseIngredient: Ingredient.COLA,
    flavorIngredient: Ingredient.PINEAPPLE,
    fixedIngredients: { [Ingredient.LEMON]: 5 },
    color: 'from-amber-700 to-yellow-600',
    minFlavor: 10,
    maxFlavor: 25,
  },
  {
    id: 'guwahati-punch',
    name: 'Guwahati Fruit Punch',
    description: 'A winter special blend of Orange and Pineapple.',
    baseIngredient: Ingredient.SODA,
    flavorIngredient: Ingredient.ORANGE,
    fixedIngredients: { [Ingredient.PINEAPPLE]: 20, [Ingredient.SUGAR]: 5 },
    color: 'from-orange-500 to-red-400',
    minFlavor: 15,
    maxFlavor: 30,
  }
];

export const EMPTY_RECIPE: DrinkRecipe = {
  [Ingredient.SODA]: 0,
  [Ingredient.COLA]: 0,
  [Ingredient.SUGAR]: 0,
  [Ingredient.LEMON]: 0,
  [Ingredient.ORANGE]: 0,
  [Ingredient.PINEAPPLE]: 0,
};