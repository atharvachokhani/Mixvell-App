import { Ingredient, SpecialtyDrink, DrinkRecipe } from './types';

// Bluetooth Configuration
export const BLE_SERVICE_UUID = 0xFFE0; 
export const BLE_CHARACTERISTIC_UUID = 0xFFE1;

export const MAX_VOLUME_ML = 100;

export const INGREDIENT_COLORS: Record<Ingredient, string> = {
  [Ingredient.WATER]: 'bg-blue-400',
  [Ingredient.COLA]: 'bg-amber-900',
  [Ingredient.SODA]: 'bg-sky-200',
  [Ingredient.SUGAR]: 'bg-white',
  [Ingredient.LEMON]: 'bg-yellow-400',
  [Ingredient.ORANGE]: 'bg-orange-500',
};

export const SPECIALTY_DRINKS: SpecialtyDrink[] = [
  {
    id: 'lemonade',
    name: 'Classic Lemonade',
    description: 'Refreshing water with a zesty lemon kick.',
    baseIngredient: Ingredient.WATER,
    flavorIngredient: Ingredient.LEMON,
    fixedIngredients: { [Ingredient.SUGAR]: 5 }, // Reduced from 15
    color: 'from-yellow-200 to-yellow-400',
    minFlavor: 5,   
    maxFlavor: 15,  // Reduced from 30. Syrups are potent.
  },
  {
    id: 'lemon-soda',
    name: 'Electric Lemon Soda',
    description: 'Sparkling soda with a twist of lemon.',
    baseIngredient: Ingredient.SODA,
    flavorIngredient: Ingredient.LEMON,
    fixedIngredients: { [Ingredient.SUGAR]: 20 }, // UPDATED: 20mL Sugar
    color: 'from-green-200 to-yellow-300',
    minFlavor: 15, // UPDATED: Min 15mL
    maxFlavor: 25, // UPDATED: Max 25mL
  },
  {
    id: 'plain-cola',
    name: 'Plain Cola',
    description: 'The classic fizzy favorite.',
    baseIngredient: Ingredient.SODA,
    flavorIngredient: Ingredient.COLA,
    fixedIngredients: {}, 
    color: 'from-red-900 to-amber-900',
    minFlavor: 5, // Cola Concentrate Range
    maxFlavor: 10, 
  },
  {
    id: 'masala-cola',
    name: 'Masala Cola',
    description: 'Spiced cola with a soda kick.',
    baseIngredient: Ingredient.SODA,
    flavorIngredient: Ingredient.COLA,
    fixedIngredients: { [Ingredient.LEMON]: 5 }, // Reduced kick
    color: 'from-amber-700 to-red-900',
    minFlavor: 5, // Cola Concentrate Range
    maxFlavor: 10, 
  },
  {
    id: 'citrus-cola',
    name: 'Citrus Cola',
    description: 'Cola infused with zesty orange notes.',
    baseIngredient: Ingredient.SODA,
    flavorIngredient: Ingredient.ORANGE, 
    fixedIngredients: { [Ingredient.COLA]: 10 }, // Reduced fixed Cola amount
    color: 'from-orange-500 to-amber-900',
    minFlavor: 5,
    maxFlavor: 15, // Orange syrup is thick/potent
  },
  {
    id: 'orange-cooler',
    name: 'Orange Cooler',
    description: 'Bubbly soda with fresh orange juice.',
    baseIngredient: Ingredient.SODA,
    flavorIngredient: Ingredient.ORANGE,
    fixedIngredients: { [Ingredient.SUGAR]: 5 },
    color: 'from-orange-400 to-red-400',
    minFlavor: 5,
    maxFlavor: 20, 
  },
];

export const EMPTY_RECIPE: DrinkRecipe = {
  [Ingredient.WATER]: 0,
  [Ingredient.COLA]: 0,
  [Ingredient.SODA]: 0,
  [Ingredient.SUGAR]: 0,
  [Ingredient.LEMON]: 0,
  [Ingredient.ORANGE]: 0,
};