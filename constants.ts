import { Ingredient, SpecialtyDrink, DrinkRecipe } from './types';

// Bluetooth Configuration
export const BLE_SERVICE_UUID = 0xFFE0; 
export const BLE_CHARACTERISTIC_UUID = 0xFFE1;

export const MAX_VOLUME_ML = 100;

export const INGREDIENT_COLORS: Record<Ingredient, string> = {
  [Ingredient.SODA]: 'bg-sky-200 shadow-[0_0_10px_#7dd3fc]',
  [Ingredient.COLA]: 'bg-amber-900 shadow-[0_0_5px_#78350f]',
  [Ingredient.SUGAR]: 'bg-slate-100 border border-slate-300',
  [Ingredient.LEMON]: 'bg-yellow-400 shadow-[0_0_10px_#facc15]',
  [Ingredient.ORANGE]: 'bg-orange-500 shadow-[0_0_10px_#f97316]',
  [Ingredient.PINEAPPLE]: 'bg-yellow-300 shadow-[0_0_10px_#fde047]',
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
    id: 'tropical-cola',
    name: 'Tropical Cola',
    description: 'Classic Cola with a sweet Pineapple twist.',
    baseIngredient: Ingredient.SODA,
    flavorIngredient: Ingredient.COLA,
    fixedIngredients: { [Ingredient.PINEAPPLE]: 20, [Ingredient.LEMON]: 5 },
    color: 'from-amber-900 to-yellow-600',
    minFlavor: 20,   
    maxFlavor: 40,
  },
  {
    id: 'pineapple-punch',
    name: 'Pineapple Punch',
    description: 'Sparkling pineapple refresher with a hint of lemon.',
    baseIngredient: Ingredient.SODA,
    flavorIngredient: Ingredient.PINEAPPLE,
    fixedIngredients: { [Ingredient.LEMON]: 5, [Ingredient.SUGAR]: 10 },
    color: 'from-yellow-300 to-orange-300',
    minFlavor: 20, 
    maxFlavor: 40,
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
    id: 'orange-crush',
    name: 'Orange Crush',
    description: 'Sweet and sparkling orange soda.',
    baseIngredient: Ingredient.SODA,
    flavorIngredient: Ingredient.ORANGE,
    fixedIngredients: { [Ingredient.SUGAR]: 10 },
    color: 'from-orange-500 to-amber-500',
    minFlavor: 20,
    maxFlavor: 40,
  },
  {
    id: 'tropical-juice',
    name: 'Tropical Juice',
    description: 'Non-carbonated. A smooth blend of Orange and Pineapple.',
    baseIngredient: Ingredient.ORANGE,
    flavorIngredient: Ingredient.PINEAPPLE,
    fixedIngredients: { [Ingredient.LEMON]: 5 },
    color: 'from-orange-400 to-yellow-400',
    minFlavor: 30,
    maxFlavor: 50,
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