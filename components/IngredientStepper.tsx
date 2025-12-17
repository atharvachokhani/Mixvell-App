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
    <div className={`mb-4 bg-white p-3 sm:p-4 rounded-xl border ${readOnly ? 'border-slate-200' : 'border-slate-300 shadow-sm'} select-none`}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${bgColor} shadow-sm border border-black/10`}></span>
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            {label || ingredient}
          </label>
        </div>
        <div className="text-xl font-bold text-slate-900 tabular-nums">
          {value} <span className="text-xs text-slate-500 font-normal">mL</span>
        </div>
      </div>
      
      {!readOnly ? (
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={handleDecrease}
            disabled={value <= minConstraint}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 shadow-sm"
          >
            <Minus size={20} />
          </button>

          {/* Visual Indicator Bar */}
          <div className="flex-1 h-4 bg-slate-200 rounded-full overflow-hidden relative border border-slate-300">
            <div 
              className={`h-full ${bgColor} transition-all duration-300 ease-out`}
              style={{ width: `${fillPercentage}%` }} 
            />
            {/* Grid lines for reference */}
            <div className="absolute inset-0 flex justify-between px-1">
               <div className="w-px h-full bg-white/50"></div>
               <div className="w-px h-full bg-white/50"></div>
               <div className="w-px h-full bg-white/50"></div>
               <div className="w-px h-full bg-white/50"></div>
            </div>
          </div>

          <button 
            onClick={handleIncrease}
            disabled={value >= maxConstraint}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 shadow-sm"
          >
            <Plus size={20} />
          </button>
        </div>
      ) : (
        /* Read-only Bar */
        <div className="mt-2 h-3 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-300">
           <div 
             className={`h-full ${bgColor} opacity-80 transition-all duration-500`}
             style={{ width: `${fillPercentage}%` }} 
           />
        </div>
      )}
    </div>
  );
};