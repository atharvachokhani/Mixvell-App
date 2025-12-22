import { Ingredient, SpecialtyDrink, DrinkRecipe } from './types';

export const MAX_VOLUME_ML = 100;

export const INGREDIENT_COLORS: Record<Ingredient, string> = {
  [Ingredient.SODA]: 'bg-sky-200 shadow-[0_0_10px_#7dd3fc]',
  [Ingredient.COLA]: 'bg-stone-800 shadow-[0_0_8px_#1c1917]', // Darker, syrup-like brown/black
  [Ingredient.SUGAR]: 'bg-slate-100 border border-slate-300',
  [Ingredient.SPICY_LEMON]: 'bg-yellow-600 shadow-[0_0_10px_#ca8a04]',
  [Ingredient.ORANGE_JUICE]: 'bg-orange-500 shadow-[0_0_10px_#f97316]',
};

export const SPECIALTY_DRINKS: SpecialtyDrink[] = [
  {
    id: 'masala-cola',
    name: 'Masala Cola',
    description: 'The street classic. Cola syrup, spices, and fizzy soda.',
    baseIngredient: Ingredient.SODA,
    flavorIngredient: Ingredient.COLA,
    fixedIngredients: { [Ingredient.SPICY_LEMON]: 15, [Ingredient.SUGAR]: 10 },
    color: 'from-stone-900 to-amber-900',
    minFlavor: 20,
    maxFlavor: 45,
  },
  {
    id: 'orange-fizz',
    name: 'Orange Sweet Fizz',
    description: 'Bubbly orange juice with a massive sugar kick.',
    baseIngredient: Ingredient.SODA,
    flavorIngredient: Ingredient.ORANGE_JUICE,
    fixedIngredients: { [Ingredient.SUGAR]: 30 },
    color: 'from-orange-400 to-yellow-300',
    minFlavor: 25, 
    maxFlavor: 50, 
  },
  {
    id: 'spicy-sunrise',
    name: 'Spicy Sunrise',
    description: 'Zesty orange juice with a fiery spicy lemon finish.',
    baseIngredient: Ingredient.ORANGE_JUICE,
    flavorIngredient: Ingredient.SPICY_LEMON,
    fixedIngredients: { [Ingredient.SUGAR]: 20, [Ingredient.SODA]: 15 },
    color: 'from-orange-600 to-red-500',
    minFlavor: 10,   
    maxFlavor: 30,
  },
  {
    id: 'cola-orange-punch',
    name: 'Cola Orange Punch',
    description: 'A dark and citrusy blend of cola syrup and orange.',
    baseIngredient: Ingredient.SODA,
    flavorIngredient: Ingredient.COLA,
    fixedIngredients: { [Ingredient.ORANGE_JUICE]: 30, [Ingredient.SUGAR]: 15 },
    color: 'from-stone-800 to-orange-600',
    minFlavor: 20,
    maxFlavor: 40,
  },
  {
    id: 'citrus-sparkler',
    name: 'Citrus Sparkler',
    description: 'Orange juice with spicy notes and high sugar.',
    baseIngredient: Ingredient.SODA,
    flavorIngredient: Ingredient.ORANGE_JUICE,
    fixedIngredients: { [Ingredient.SPICY_LEMON]: 10, [Ingredient.SUGAR]: 40 },
    color: 'from-yellow-300 to-orange-400',
    minFlavor: 15, 
    maxFlavor: 35,
  },
  {
    id: 'sugar-bomb',
    name: 'Cola Sugar Bomb',
    description: 'The ultimate sweet fix. Cola syrup with double sugar.',
    baseIngredient: Ingredient.SODA,
    flavorIngredient: Ingredient.COLA,
    fixedIngredients: { [Ingredient.SUGAR]: 45, [Ingredient.SPICY_LEMON]: 5 },
    color: 'from-stone-700 to-amber-800',
    minFlavor: 20,
    maxFlavor: 40,
  }
];

export const EMPTY_RECIPE: DrinkRecipe = {
  [Ingredient.SODA]: 0,
  [Ingredient.COLA]: 0,
  [Ingredient.SUGAR]: 0,
  [Ingredient.SPICY_LEMON]: 0,
  [Ingredient.ORANGE_JUICE]: 0,
};