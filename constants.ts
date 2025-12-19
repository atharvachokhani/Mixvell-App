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
  [Ingredient.SPICY_LEMON]: 'bg-yellow-600 shadow-[0_0_10px_#ca8a04]',
  [Ingredient.ORANGE_JUICE]: 'bg-orange-500 shadow-[0_0_10px_#f97316]',
};

// Permanent Specialty Menu with Increased Sugar
export const SPECIALTY_DRINKS: SpecialtyDrink[] = [
  {
    id: 'plain-cola',
    name: 'Plain Cola',
    description: 'The timeless classic. Pure cola flavor with a heavy sweet finish.',
    baseIngredient: Ingredient.COLA,
    flavorIngredient: Ingredient.SUGAR,
    fixedIngredients: { [Ingredient.SODA]: 10 },
    color: 'from-amber-950 to-slate-900',
    minFlavor: 40,
    maxFlavor: 60,
  },
  {
    id: 'masala-cola',
    name: 'Masala Cola',
    description: 'The street classic. Spicy, fizzy, and extra sweet.',
    baseIngredient: Ingredient.COLA,
    flavorIngredient: Ingredient.SPICY_LEMON,
    fixedIngredients: { [Ingredient.SUGAR]: 45, [Ingredient.SODA]: 15 },
    color: 'from-amber-900 to-red-800',
    minFlavor: 15,
    maxFlavor: 30,
  },
  {
    id: 'orange-fizz',
    name: 'Orange Sweet Fizz',
    description: 'Bubbly orange juice with a massive sugar kick.',
    baseIngredient: Ingredient.SODA,
    flavorIngredient: Ingredient.ORANGE_JUICE,
    fixedIngredients: { [Ingredient.SUGAR]: 40, [Ingredient.LEMON]: 5 },
    color: 'from-orange-400 to-yellow-300',
    minFlavor: 20, 
    maxFlavor: 45, 
  },
  {
    id: 'spicy-sunrise',
    name: 'Spicy Sunrise',
    description: 'Zesty orange juice with a fiery spicy lemon finish.',
    baseIngredient: Ingredient.ORANGE_JUICE,
    flavorIngredient: Ingredient.SPICY_LEMON,
    fixedIngredients: { [Ingredient.SUGAR]: 35, [Ingredient.SODA]: 10 },
    color: 'from-orange-600 to-red-500',
    minFlavor: 10,   
    maxFlavor: 25,
  },
  {
    id: 'shikanji-sparkler',
    name: 'Sweet Shikanji',
    description: 'Traditional lemon mix with spicy notes and high sugar.',
    baseIngredient: Ingredient.SODA,
    flavorIngredient: Ingredient.LEMON,
    fixedIngredients: { [Ingredient.SPICY_LEMON]: 10, [Ingredient.SUGAR]: 45 },
    color: 'from-yellow-300 to-green-400',
    minFlavor: 15, 
    maxFlavor: 30,
  },
  {
    id: 'cola-orange-punch',
    name: 'Cola Orange Punch',
    description: 'Unique blend of orange and cola for the adventurous.',
    baseIngredient: Ingredient.COLA,
    flavorIngredient: Ingredient.ORANGE_JUICE,
    fixedIngredients: { [Ingredient.SUGAR]: 40 },
    color: 'from-amber-800 to-orange-500',
    minFlavor: 20,
    maxFlavor: 40,
  },
  {
    id: 'citrus-sugar-bomb',
    name: 'Citrus Sugar Bomb',
    description: 'Triple citrus threat with maximum syrup content.',
    baseIngredient: Ingredient.ORANGE_JUICE,
    flavorIngredient: Ingredient.LEMON,
    fixedIngredients: { [Ingredient.SUGAR]: 50, [Ingredient.SPICY_LEMON]: 5 },
    color: 'from-orange-500 to-yellow-400',
    minFlavor: 15,
    maxFlavor: 30,
  }
];

export const EMPTY_RECIPE: DrinkRecipe = {
  [Ingredient.SODA]: 0,
  [Ingredient.COLA]: 0,
  [Ingredient.SUGAR]: 0,
  [Ingredient.LEMON]: 0,
  [Ingredient.SPICY_LEMON]: 0,
  [Ingredient.ORANGE_JUICE]: 0,
};