import React from 'react';
import { Ingredient } from '../types';
import { INGREDIENT_COLORS } from '../constants';
import { Minus, Plus } from 'lucide-react';

interface Props {
  ingredient: Ingredient;
  value: number;
  max: number; // Global max (usually 100)
  step?: number;
  minConstraint?: number;
  maxConstraint?: number;
  onChange?: (val: number) => void;
  readOnly?: boolean;
  colorClass?: string;
  label?: string;
  isRelative?: boolean; 
}

export const IngredientStepper: React.FC<Props> = ({ 
  ingredient, 
  value, 
  max,
  step = 10,
  minConstraint = 0,
  maxConstraint = 100,
  onChange, 
  readOnly = false,
  colorClass,
  label,
  isRelative = false
}) => {
  const bgColor = colorClass || INGREDIENT_COLORS[ingredient];

  const handleDecrease = () => {
    if (readOnly || !onChange) return;
    let next = value - step;
    
    // Safety check for clean steps: if we land slightly below min, just snap to min
    if (next < minConstraint) next = minConstraint;
    
    onChange(next);
  };

  const handleIncrease = () => {
    if (readOnly || !onChange) return;
    let next = value + step;
    
    // Safety check: snap to max
    if (next > maxConstraint) next = maxConstraint;
    
    onChange(next);
  };

  // Calculate visual bar percentage
  let fillPercentage = 0;
  if (isRelative && (maxConstraint - minConstraint) > 0) {
     // Relative mapping for specialty ranges
     fillPercentage = ((value - minConstraint) / (maxConstraint - minConstraint)) * 100;
  } else {
     // Absolute mapping for custom mix (0-100mL)
     fillPercentage = (value / max) * 100;
  }
  fillPercentage = Math.min(100, Math.max(0, fillPercentage));

  return (
    <div className={`mb-4 bg-slate-800/50 p-3 sm:p-4 rounded-xl border ${readOnly ? 'border-slate-700/30' : 'border-slate-700'} select-none`}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${bgColor} shadow-[0_0_8px_currentColor]`}></span>
          <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            {label || ingredient}
          </label>
        </div>
        <div className="text-xl font-bold text-white tabular-nums">
          {value} <span className="text-xs text-slate-500 font-normal">mL</span>
        </div>
      </div>
      
      {!readOnly ? (
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={handleDecrease}
            disabled={value <= minConstraint}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-700 text-white hover:bg-slate-600 active:scale-95 transition-all disabled:opacity-30 disabled:active:scale-100 shadow-lg"
          >
            <Minus size={20} />
          </button>

          {/* Visual Indicator Bar */}
          <div className="flex-1 h-4 bg-slate-900 rounded-full overflow-hidden relative border border-slate-700/50">
            <div 
              className={`h-full ${bgColor} transition-all duration-300 ease-out`}
              style={{ width: `${fillPercentage}%` }} 
            />
            {/* Grid lines for reference */}
            <div className="absolute inset-0 flex justify-between px-1">
               <div className="w-px h-full bg-black/20"></div>
               <div className="w-px h-full bg-black/20"></div>
               <div className="w-px h-full bg-black/20"></div>
               <div className="w-px h-full bg-black/20"></div>
            </div>
          </div>

          <button 
            onClick={handleIncrease}
            disabled={value >= maxConstraint}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-700 text-white hover:bg-slate-600 active:scale-95 transition-all disabled:opacity-30 disabled:active:scale-100 shadow-lg"
          >
            <Plus size={20} />
          </button>
        </div>
      ) : (
        /* Read-only Bar - Styled to look purposeful, not like a disabled control */
        <div className="mt-2 h-3 w-full bg-slate-900/40 rounded-full overflow-hidden border border-white/5">
           <div 
             className={`h-full ${bgColor} opacity-70 transition-all duration-500`}
             style={{ width: `${fillPercentage}%` }} 
           />
        </div>
      )}
    </div>
  );
};