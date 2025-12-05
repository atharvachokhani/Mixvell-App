import React from 'react';
import { Ingredient } from '../types';
import { INGREDIENT_COLORS } from '../constants';

interface Props {
  ingredient: Ingredient;
  value: number;
  max: number; // The global max scale (usually 100)
  minConstraint?: number; // Optional hard limit for logic
  maxConstraint?: number; // Optional hard limit for logic
  onChange: (val: number) => void;
  disabled?: boolean;
  readOnly?: boolean; // New prop for unchangeable but visible sliders
  colorClass?: string;
  label?: string; // Optional override for label
}

export const IngredientSlider: React.FC<Props> = ({ 
  ingredient, 
  value, 
  max,
  minConstraint = 0,
  maxConstraint = 100,
  onChange, 
  disabled,
  readOnly = false,
  colorClass,
  label
}) => {
  const bgColor = colorClass || INGREDIENT_COLORS[ingredient];
  const isInteractive = !disabled && !readOnly;

  return (
    <div className={`mb-5 bg-slate-800/50 p-4 rounded-xl border ${readOnly ? 'border-slate-700/50 opacity-80' : 'border-slate-700'} select-none transition-opacity`}>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          {label || ingredient}
          {readOnly && <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-400">AUTO</span>}
        </label>
        <div className="flex flex-col items-end">
          <span className={`text-lg font-bold ${value > 0 ? 'text-white' : 'text-slate-500'}`}>
            {value} mL
          </span>
          {/* Show range hints if heavily constrained and interactive */}
          {(minConstraint > 5 || maxConstraint < max - 5) && isInteractive && (
             <span className="text-[10px] text-slate-500">
              Limit: {minConstraint}-{maxConstraint}mL
            </span>
          )}
        </div>
      </div>
      
      {/* Increased height to h-10 for better touch targets */}
      <div className={`relative h-10 flex items-center ${isInteractive ? 'touch-none' : ''}`}>
        {/* Track Background */}
        <div className="absolute w-full h-3 bg-slate-700 rounded-full overflow-hidden top-1/2 -translate-y-1/2">
          {/* Min Constraint Marker (Grey out area below min) */}
          {minConstraint > 0 && isInteractive && (
            <div 
              className="absolute h-full bg-slate-800 border-r border-slate-600 z-10" 
              style={{ width: `${(minConstraint / max) * 100}%` }}
            />
          )}
          {/* Max Constraint Marker (Grey out area above max) */}
          {maxConstraint < max && isInteractive && (
            <div 
              className="absolute h-full bg-slate-800 border-l border-slate-600 z-10 right-0" 
              style={{ width: `${((max - maxConstraint) / max) * 100}%` }}
            />
          )}

          {/* Fill */}
          <div 
            className={`h-full ${bgColor} transition-all duration-75 ease-out`}
            style={{ width: `${(value / max) * 100}%` }} 
          />
        </div>
        
        {/* Actual Range Input - High Z-Index and Full Height for Touch */}
        <input
          type="range"
          min={0}
          max={max}
          step={1} // Explicit fluid step
          value={value}
          onChange={(e) => {
            if (!isInteractive) return;
            const newVal = parseInt(e.target.value);
            // We pass the raw value. The parent component decides if it violates logic.
            // But we respect visual bounds if needed.
            if (newVal < minConstraint) {
               onChange(minConstraint);
            } else if (newVal > maxConstraint) {
               onChange(maxConstraint);
            } else {
               onChange(newVal);
            }
          }}
          disabled={disabled || readOnly}
          className={`absolute w-full h-full opacity-0 z-30 ${isInteractive ? 'cursor-pointer touch-none' : 'cursor-default'}`}
        />
        
        {/* Thumb visual */}
        <div 
          className={`pointer-events-none absolute w-6 h-6 rounded-full shadow-lg border-2 transition-all duration-75 ease-out z-20 top-1/2 -translate-y-1/2 ${readOnly ? 'bg-slate-500 border-slate-600 hidden' : 'bg-white border-slate-200'}`}
          style={{ left: `calc(${(value / max) * 100}% - 12px)` }}
        />
      </div>
    </div>
  );
};