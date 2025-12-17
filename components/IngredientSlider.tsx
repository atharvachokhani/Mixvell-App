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
  isRelative?: boolean; // If true, slider maps full width to minConstraint-maxConstraint
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
  label,
  isRelative = false
}) => {
  const bgColor = colorClass || INGREDIENT_COLORS[ingredient];
  const isInteractive = !disabled && !readOnly;

  // Calculate percentage for visual fill
  let fillPercentage = 0;
  if (isRelative) {
    // Map relative range (minConstraint -> maxConstraint) to 0-100%
    const range = maxConstraint - minConstraint;
    if (range > 0) {
      fillPercentage = ((value - minConstraint) / range) * 100;
    }
    // Clamp visual
    fillPercentage = Math.max(0, Math.min(100, fillPercentage));
  } else {
    // Standard 0 -> max mapping
    fillPercentage = (value / max) * 100;
  }

  return (
    <div className={`mb-5 bg-white p-4 rounded-xl border ${readOnly ? 'border-slate-200 opacity-80' : 'border-slate-300 shadow-sm'} select-none transition-opacity`}>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          {label || ingredient}
          {readOnly && <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">AUTO</span>}
        </label>
        <div className="flex flex-col items-end">
          <span className={`text-lg font-bold ${value > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
            {value} mL
          </span>
          {/* Show range hints if heavily constrained and interactive */}
          {isRelative && isInteractive && (
             <span className="text-[10px] text-slate-500">
              Range: {minConstraint}-{maxConstraint}mL
            </span>
          )}
        </div>
      </div>
      
      {/* Increased height to h-12 (48px) for standard mobile touch target size */}
      <div className={`relative h-12 flex items-center ${isInteractive ? 'touch-none' : ''}`}>
        {/* Track Background */}
        <div className="absolute w-full h-3 bg-slate-200 rounded-full overflow-hidden top-1/2 -translate-y-1/2 pointer-events-none border border-slate-300/50">
          {/* Fill */}
          <div 
            className={`h-full ${bgColor} transition-all duration-75 ease-out`}
            style={{ width: `${fillPercentage}%` }} 
          />
        </div>
        
        {/* Actual Range Input */}
        <input
          type="range"
          min={isRelative ? minConstraint : 0}
          max={isRelative ? maxConstraint : max}
          step={1} 
          value={value}
          onChange={(e) => {
            if (!isInteractive) return;
            const newVal = Math.round(Number(e.target.value));
            
            // Internal validation just in case, though input attributes handle mostly
            if (isRelative) {
              if (newVal < minConstraint) onChange(minConstraint);
              else if (newVal > maxConstraint) onChange(maxConstraint);
              else onChange(newVal);
            } else {
              // For custom mix, we rely on parent logic but clamp locally to constraints if present
              if (newVal < minConstraint) onChange(minConstraint);
              else if (newVal > maxConstraint) onChange(maxConstraint);
              else onChange(newVal);
            }
          }}
          disabled={disabled || readOnly}
          // z-50 ensures it is absolutely on top of everything
          className={`absolute w-full h-full opacity-0 z-50 ${isInteractive ? 'cursor-pointer' : 'cursor-default'}`}
          style={{ touchAction: 'none' }} // Critical for preventing scroll while dragging
        />
        
        {/* Thumb visual - purely decorative, follows the calculation */}
        <div 
          className={`pointer-events-none absolute w-7 h-7 rounded-full shadow-lg border-2 transition-all duration-75 ease-out z-40 top-1/2 -translate-y-1/2 ${readOnly ? 'bg-slate-300 border-slate-400 hidden' : 'bg-white border-slate-300'}`}
          style={{ left: `calc(${fillPercentage}% - 14px)` }}
        />
      </div>
    </div>
  );
};