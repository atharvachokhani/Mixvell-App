import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { bluetoothService } from './services/bluetoothService';
import { statsService, AppStats } from './services/statsService';
import { BluetoothState, DrinkRecipe, Ingredient } from './types';
import { Button } from './components/Button';
import { IngredientSlider } from './components/IngredientSlider';
import { EMPTY_RECIPE, MAX_VOLUME_ML, SPECIALTY_DRINKS, INGREDIENT_COLORS } from './constants';
import { Cable, Zap, RotateCcw, CupSoda, ChefHat, Sparkles, Smartphone, Laptop, Tablet, AlertTriangle, BarChart3, Trash2, CheckCircle, Martini } from 'lucide-react';

// 1. Connection Screen
const ConnectScreen = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<BluetoothState>('DISCONNECTED');
  const [error, setError] = useState('');

  const handleConnect = async () => {
    setStatus('CONNECTING');
    setError('');
    try {
      await bluetoothService.connect();
      setStatus('CONNECTED');
      setTimeout(() => navigate('/menu'), 800);
    } catch (e: any) {
      console.error(e);
      setStatus('ERROR');
      setError(e.message || 'Connection failed');
    }
  };

  const handleSimulate = async () => {
    setStatus('CONNECTING');
    await bluetoothService.connectSimulation();
    setStatus('CONNECTED');
    setTimeout(() => navigate('/menu'), 800);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[url('https://picsum.photos/1920/1080?blur=10')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm"></div>
      <div className="relative z-10 max-w-md w-full glass-panel p-8 rounded-2xl shadow-2xl border border-neon-blue/30">
        <div className="mb-8 flex justify-center">
          <div className={`p-6 rounded-full ${status === 'CONNECTING' ? 'bg-blue-500/20 animate-pulse' : 'bg-slate-800'} border-2 border-neon-blue shadow-[0_0_20px_rgba(0,243,255,0.2)] transition-all duration-500`}>
            <Martini 
              size={48} 
              className={`transition-colors duration-500 ${status === 'CONNECTED' ? "text-neon-pink drop-shadow-[0_0_10px_rgba(255,0,255,0.8)]" : "text-neon-blue"}`} 
            />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-2 text-white tracking-tight">Mixvell</h1>
        <p className="text-slate-400 mb-6">Smart Mocktail Dispenser</p>
        
        {error && (
          <div className="mb-6 p-3 bg-red-900/50 border border-red-500/50 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="bg-slate-800/50 rounded-lg p-4 mb-6 text-xs text-left text-slate-400 border border-slate-700">
          <p className="font-bold text-slate-300 mb-2 flex items-center gap-2">
            <Smartphone size={14} /> <Tablet size={14} /> Mobile / Tablet (Android)
          </p>
          <p className="mb-3">Connect via <strong>USB OTG Cable</strong>. Open Chrome and click Connect. (iOS not supported).</p>
          
          <p className="font-bold text-slate-300 mb-2 flex items-center gap-2">
            <Laptop size={14} /> Desktop (Mac/PC)
          </p>
          <ul className="list-disc ml-4 space-y-1">
            <li>Pair HC-05 via Bluetooth settings or use USB.</li>
            <li>Click Connect below.</li>
            <li>
              <strong>Mac:</strong> Select <span className="font-mono text-neon-blue">/dev/cu.usbmodem...</span> or <span className="font-mono text-neon-blue">HC-05</span>
            </li>
            <li>
              <strong>Windows:</strong> Select the <span className="font-mono text-neon-blue">COM Port</span>.
            </li>
          </ul>
        </div>

        <Button 
          variant="neon" 
          onClick={handleConnect} 
          isLoading={status === 'CONNECTING'}
          className="w-full text-lg py-4 mb-3"
        >
          {status === 'CONNECTED' ? 'Connected!' : 'Connect to Dispenser'}
        </Button>

        <button 
          onClick={handleSimulate}
          className="text-slate-500 text-sm hover:text-white underline underline-offset-4"
        >
          No hardware? Simulation Mode
        </button>
      </div>
    </div>
  );
};

// 2. Menu Screen
const MenuScreen = () => {
  const navigate = useNavigate();
  const [tapCount, setTapCount] = useState(0);

  // Discrete Admin Trigger: 5 taps on the title
  const handleTitleClick = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (newCount >= 5) {
      navigate('/stats');
    }
  };

  return (
    <div className="min-h-screen p-6 pt-12 max-w-md mx-auto flex flex-col gap-6">
      <h2 
        className="text-3xl font-bold text-center mb-4 select-none"
        onClick={handleTitleClick}
      >
        <span className="text-neon-pink">Select</span> Mode
      </h2>
      
      <div 
        onClick={() => navigate('/custom')}
        className="group relative h-40 glass-panel rounded-2xl p-6 cursor-pointer hover:bg-white/10 transition-all border border-transparent hover:border-neon-blue overflow-hidden"
      >
        <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:opacity-20 transition-opacity">
          <Zap size={150} />
        </div>
        <div className="relative z-10">
          <h3 className="text-2xl font-bold text-neon-blue mb-2">Make Your Own</h3>
          <p className="text-slate-400">Full control. Mix ingredients to your exact taste.</p>
        </div>
      </div>

      <div 
        onClick={() => navigate('/specialty')}
        className="group relative h-40 glass-panel rounded-2xl p-6 cursor-pointer hover:bg-white/10 transition-all border border-transparent hover:border-neon-pink overflow-hidden"
      >
        <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:opacity-20 transition-opacity">
          <CupSoda size={150} />
        </div>
        <div className="relative z-10">
          <h3 className="text-2xl font-bold text-neon-pink mb-2">Specialty Menu</h3>
          <p className="text-slate-400">Curated classics. Adjust strength and enjoy.</p>
        </div>
      </div>
    </div>
  );
};

// 3. Make Your Own Screen
const CustomMixScreen = () => {
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<DrinkRecipe>({...EMPTY_RECIPE});
  
  // Calculate total volume
  const currentTotal = (Object.values(recipe) as number[]).reduce((a, b) => a + b, 0);

  const handleSliderChange = (ingredient: Ingredient, value: number) => {
    // 1. Set the new value for this ingredient directly
    let newRecipe = { ...recipe, [ingredient]: value };
    
    // 2. Calculate the new sum
    let newTotal = (Object.values(newRecipe) as number[]).reduce((a, b) => a + b, 0);

    // 3. If total > 100, we need to subtract from other ingredients (Auto-balance)
    if (newTotal > MAX_VOLUME_ML) {
      let overflow = newTotal - MAX_VOLUME_ML;
      
      // Get other active ingredients sorted by largest volume first
      const otherIngredients = (Object.keys(newRecipe) as Ingredient[])
        .filter(k => k !== ingredient && newRecipe[k] > 0)
        .sort((a, b) => newRecipe[b] - newRecipe[a]);

      for (const other of otherIngredients) {
        if (overflow <= 0) break;
        
        const available = newRecipe[other];
        const toTake = Math.min(available, overflow);
        
        newRecipe[other] -= toTake;
        overflow -= toTake;
      }
    }

    setRecipe(newRecipe);
  };

  const handleDispense = async () => {
    try {
      await bluetoothService.dispenseDrink(recipe);
      statsService.recordDispense(recipe);
      navigate('/success');
    } catch (e) {
      alert('Failed to send command. Is device connected?');
    }
  };

  return (
    <div className="min-h-screen p-6 pb-36 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/menu')} className="p-2 rounded-full hover:bg-slate-800">
          <RotateCcw size={20} />
        </button>
        <h2 className="text-xl font-bold">Custom Mix</h2>
        <div className={`px-3 py-1 rounded-full text-sm font-bold border ${currentTotal >= MAX_VOLUME_ML ? 'bg-green-500/20 border-green-500 text-green-200' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
          {currentTotal} / {MAX_VOLUME_ML} mL
        </div>
      </div>

      <div className="mb-4 text-xs text-slate-500 text-center">
        Drag any slider. Total is capped at 100mL (others adjust automatically).
      </div>

      <div className="space-y-1">
        {Object.values(Ingredient).map((ing) => (
          <IngredientSlider
            key={ing}
            ingredient={ing}
            value={recipe[ing]}
            max={MAX_VOLUME_ML}
            onChange={(val) => handleSliderChange(ing, val)}
            isRelative={false} // Custom mix uses absolute 0-100 scale
          />
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-slate-900/90 backdrop-blur border-t border-slate-800 z-50">
        <div className="max-w-lg mx-auto">
          <Button 
            variant="neon" 
            className="w-full text-lg" 
            onClick={handleDispense}
            disabled={currentTotal === 0}
          >
            Start Dispensing
          </Button>
        </div>
      </div>
    </div>
  );
};

// 4. Specialty List Screen
const SpecialtyListScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/menu')} className="p-2 rounded-full hover:bg-slate-800">
          <RotateCcw size={20} />
        </button>
        <h2 className="text-2xl font-bold">Specialty Menu</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SPECIALTY_DRINKS.map(drink => (
          <div 
            key={drink.id}
            onClick={() => navigate(`/adjust/${drink.id}`)}
            className={`cursor-pointer rounded-xl p-5 bg-gradient-to-br ${drink.color} relative overflow-hidden shadow-lg transform transition hover:scale-105`}
          >
            <div className="absolute inset-0 bg-black/40 hover:bg-black/20 transition-colors"></div>
            <div className="relative z-10 text-white">
              <h3 className="text-xl font-bold mb-1">{drink.name}</h3>
              <p className="text-xs opacity-90 leading-relaxed">{drink.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 5. Specialty Adjustment Screen
const SpecialtyAdjustScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const drinkId = location.pathname.split('/').pop();
  const drink = SPECIALTY_DRINKS.find(d => d.id === drinkId);

  // Initialize state only once with default mid-point if possible
  const [flavorAmount, setFlavorAmount] = useState<number>(0);

  useEffect(() => {
    if (drink) {
      // Default to average of min/max
      setFlavorAmount(Math.round((drink.minFlavor + drink.maxFlavor) / 2));
    }
  }, [drink]);

  if (!drink) return <div>Drink not found</div>;

  // 1. Calculate Fixed Volume (Sugar, additives)
  const fixedVolume = Object.values(drink.fixedIngredients).reduce((a, b) => a + (b || 0), 0);
  
  // 2. Calculate Available Volume for (Flavor + Base)
  const availableVolume = MAX_VOLUME_ML - fixedVolume;

  // 3. Define Constraints for Flavor
  const minFlavor = drink.minFlavor;
  const maxFlavor = drink.maxFlavor;

  // 4. Calculate Current Base Amount (Derived)
  const baseAmount = availableVolume - flavorAmount;

  const handleFlavorChange = (val: number) => {
    // Check range
    let newVal = val;
    if (newVal < minFlavor) newVal = minFlavor;
    if (newVal > maxFlavor) newVal = maxFlavor;
    
    // Safety: ensure base doesn't drop below 0 (though maxFlavor should prevent this)
    if (availableVolume - newVal < 0) {
      newVal = availableVolume;
    }

    setFlavorAmount(newVal);
  };

  const handleDispense = async () => {
    const recipe = { ...EMPTY_RECIPE };
    
    // Add Fixed Ingredients
    Object.entries(drink.fixedIngredients).forEach(([ing, amt]) => {
      recipe[ing as Ingredient] = (recipe[ing as Ingredient] || 0) + (amt || 0);
    });

    // Add Variable Flavor
    recipe[drink.flavorIngredient] = (recipe[drink.flavorIngredient] || 0) + flavorAmount;
    
    // Add Variable Base
    recipe[drink.baseIngredient] = (recipe[drink.baseIngredient] || 0) + baseAmount;

    try {
      await bluetoothService.dispenseDrink(recipe);
      statsService.recordDispense(recipe);
      navigate('/success');
    } catch (e) {
      alert('Failed to send command.');
    }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col max-w-md mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/specialty')} className="p-2 rounded-full hover:bg-slate-800">
          <RotateCcw size={20} />
        </button>
        <h2 className="text-xl font-bold truncate">{drink.name}</h2>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className={`p-8 rounded-2xl bg-gradient-to-br ${drink.color} shadow-2xl mb-10 text-center relative overflow-hidden`}>
           <div className="absolute inset-0 bg-black/20"></div>
           <div className="relative z-10">
             <h1 className="text-5xl font-bold text-white drop-shadow-lg">{flavorAmount}mL</h1>
             <p className="text-white/90 font-medium">{drink.flavorIngredient}</p>
             <div className="flex justify-center gap-2 mt-2">
                <span className="text-xs px-2 py-1 bg-white/20 rounded">Base: {baseAmount}mL</span>
                <span className="text-xs px-2 py-1 bg-white/20 rounded">Fixed: {fixedVolume}mL</span>
             </div>
           </div>
        </div>

        <div className="space-y-6">
          <IngredientSlider 
            ingredient={drink.flavorIngredient}
            label={`Adjust Flavor Intensity`}
            value={flavorAmount}
            max={MAX_VOLUME_ML}
            minConstraint={minFlavor}
            maxConstraint={maxFlavor}
            onChange={handleFlavorChange}
            isRelative={true} // Enable relative scaling (width maps to range)
          />
          
          <IngredientSlider 
             ingredient={drink.baseIngredient}
             label={`Base (${drink.baseIngredient}) - Auto`}
             value={baseAmount}
             max={MAX_VOLUME_ML}
             onChange={() => {}} // No-op
             colorClass="bg-blue-300"
             readOnly={true} // Locked
          />

          {/* Fixed Ingredients Display */}
          {Object.entries(drink.fixedIngredients).map(([ing, amt]) => (
             <div key={ing} className="opacity-60 grayscale">
                <IngredientSlider 
                  ingredient={ing as Ingredient}
                  label={`${ing} (Fixed)`}
                  value={amt || 0}
                  max={MAX_VOLUME_ML}
                  onChange={() => {}}
                  readOnly={true}
                />
             </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <Button variant="neon" className="w-full py-4 text-lg" onClick={handleDispense}>
          Dispense Drink
        </Button>
      </div>
    </div>
  );
};

// 6. Success Screen
const SuccessScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900">
      <div className="animate-[bounce_1s_infinite] mb-6 text-neon-green">
        <CheckCircle size={80} className="text-green-400" />
      </div>
      <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">WOOHOO!</h1>
      <p className="text-slate-400 mb-12 text-lg">Your drink is ready.</p>
      
      <Button 
        variant="primary" 
        className="w-full max-w-xs py-4 text-lg bg-green-600 hover:bg-green-500 shadow-green-900/50"
        onClick={() => navigate('/menu')}
      >
        Next Customer
      </Button>
    </div>
  );
};

// 7. Stats Screen (Discrete)
const StatsScreen = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AppStats>(statsService.getStats());

  const handleReset = () => {
    if (window.confirm("Are you sure you want to clear all history?")) {
      statsService.resetStats();
      setStats(statsService.getStats());
    }
  };

  // Find max value for scaling the bars
  const maxVolume = Math.max(...(Object.values(stats.ingredientUsage) as number[]), 1);

  return (
    <div className="min-h-screen p-6 max-w-md mx-auto bg-slate-950">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/menu')} className="p-2 rounded-full hover:bg-slate-800 text-slate-400">
            <RotateCcw size={20} />
          </button>
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-200">
            <BarChart3 size={20} /> Dashboard
          </h2>
        </div>
        <button onClick={handleReset} className="text-red-400 p-2 hover:bg-red-900/20 rounded-lg">
          <Trash2 size={18} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div className="text-slate-500 text-xs uppercase font-bold mb-1">Total Drinks</div>
          <div className="text-3xl font-bold text-white">{stats.totalDrinks}</div>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div className="text-slate-500 text-xs uppercase font-bold mb-1">Total Volume</div>
          <div className="text-3xl font-bold text-neon-blue">{(stats.totalVolume / 1000).toFixed(1)}L</div>
        </div>
      </div>

      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Consumption by Source</h3>
      
      <div className="space-y-4">
        {Object.values(Ingredient).map((ing) => {
          const usage = stats.ingredientUsage[ing];
          const percentage = (usage / maxVolume) * 100;
          return (
            <div key={ing} className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-300">{ing}</span>
                <span className="font-mono text-slate-400">{usage} mL</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${INGREDIENT_COLORS[ing]} transition-all duration-500`} 
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main App Component with Routes
const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<ConnectScreen />} />
        <Route path="/menu" element={<MenuScreen />} />
        <Route path="/custom" element={<CustomMixScreen />} />
        <Route path="/specialty" element={<SpecialtyListScreen />} />
        <Route path="/adjust/:id" element={<SpecialtyAdjustScreen />} />
        <Route path="/success" element={<SuccessScreen />} />
        <Route path="/stats" element={<StatsScreen />} />
      </Routes>
    </HashRouter>
  );
};

export default App;