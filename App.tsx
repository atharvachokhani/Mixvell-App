import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation, Outlet, useParams } from 'react-router-dom';
import { bluetoothService } from './services/bluetoothService';
import { statsService } from './services/statsService';
import { recipeService } from './services/recipeService';
import { BluetoothState, DrinkRecipe, Ingredient } from './types';
import { Button } from './components/Button';
import { IngredientStepper } from './components/IngredientStepper';
import { EMPTY_RECIPE, MAX_VOLUME_ML, SPECIALTY_DRINKS } from './constants';
import { ARDUINO_SKETCH } from './services/firmwareTemplate';
import { Zap, RotateCcw, CupSoda, Home, Droplets, Martini, Code, CheckCircle, BarChart3, Settings, PenTool, AlertTriangle, Cable } from 'lucide-react';

// --- Shared Components ---

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="fixed bottom-0 md:bottom-6 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-96 bg-white/95 md:rounded-2xl border-t md:border border-slate-200 backdrop-blur-xl pb-safe md:pb-0 z-50 shadow-[0_0_30px_rgba(0,0,0,0.1)] transition-all duration-300">
      <div className="flex justify-around items-center h-16 w-full">
        <button 
          onClick={() => navigate('/menu')}
          className={`flex flex-col items-center justify-center w-full h-full rounded-l-2xl hover:bg-slate-50 transition-colors ${isActive('/menu') ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <Home size={24} strokeWidth={isActive('/menu') ? 2.5 : 2} />
          <span className="text-[10px] mt-1 font-bold">Home</span>
        </button>
        <button 
          onClick={() => navigate('/custom')}
          className={`flex flex-col items-center justify-center w-full h-full hover:bg-slate-50 transition-colors ${isActive('/custom') ? 'text-purple-600' : 'text-slate-400'}`}
        >
          <Zap size={24} strokeWidth={isActive('/custom') ? 2.5 : 2} />
          <span className="text-[10px] mt-1 font-bold">Custom</span>
        </button>
        <button 
          onClick={() => navigate('/specialty')}
          className={`flex flex-col items-center justify-center w-full h-full rounded-r-2xl hover:bg-slate-50 transition-colors ${isActive('/specialty') ? 'text-orange-500' : 'text-slate-400'}`}
        >
          <CupSoda size={24} strokeWidth={isActive('/specialty') ? 2.5 : 2} />
          <span className="text-[10px] mt-1 font-bold">Specialty</span>
        </button>
      </div>
    </div>
  );
};

const LayoutWithNav = () => {
  return (
    <div className="pb-24 md:pb-32 bg-slate-50 min-h-screen">
      <Outlet />
      <BottomNav />
    </div>
  );
};

// --- Screens ---

// 1. Connection Screen
const ConnectScreen = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<BluetoothState>('DISCONNECTED');
  const [error, setError] = useState('');

  useEffect(() => {
    if (bluetoothService.isConnected()) {
      setStatus('CONNECTED');
    }
  }, []);

  const handleConnect = async () => {
    if (bluetoothService.isConnected()) {
      navigate('/menu');
      return;
    }

    setStatus('CONNECTING');
    setError('');
    try {
      await bluetoothService.connect();
      setStatus('CONNECTED');
      setTimeout(() => navigate('/menu'), 800);
    } catch (e: any) {
      console.error(e);
      setStatus('ERROR');
      
      let msg = e.message || 'Connection failed';
      if (msg.includes('Failed to open serial port')) {
        msg = '❌ Port Busy.\nClose Arduino IDE and other tabs.';
      } else if (msg.includes('The port is already open')) {
         setStatus('CONNECTED');
         setTimeout(() => navigate('/menu'), 800);
         return;
      }
      setError(msg);
    }
  };

  const handleSimulate = async () => {
    setStatus('CONNECTING');
    await bluetoothService.connectSimulation();
    setStatus('CONNECTED');
    setTimeout(() => navigate('/menu'), 800);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-white">
      <div className="max-w-lg w-full bg-white p-10 rounded-3xl shadow-xl border border-slate-200">
        <div className="mb-8 flex justify-center">
          <div className={`p-6 rounded-full ${status === 'CONNECTING' ? 'bg-blue-100 animate-pulse' : 'bg-slate-100'} border-4 border-white shadow-lg`}>
            <Martini size={64} className="text-blue-600" />
          </div>
        </div>
        <h1 className="text-5xl font-black mb-3 text-slate-900 tracking-tight">Mixvell</h1>
        <p className="text-slate-500 mb-10 text-lg font-medium">Smart Mocktail Dispenser</p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm whitespace-pre-line text-left font-medium">
            {error}
          </div>
        )}

        <Button 
          variant="neon" 
          onClick={handleConnect} 
          isLoading={status === 'CONNECTING'}
          className="w-full text-xl py-5 mb-4 rounded-xl flex items-center justify-center gap-3"
        >
          <Cable size={24} />
          {status === 'CONNECTED' ? 'Enter App' : 'Connect via USB'}
        </Button>

        <button onClick={handleSimulate} className="text-slate-400 text-sm hover:text-slate-600 transition-colors font-medium">
          Simulation Mode
        </button>
      </div>
    </div>
  );
};

// 2. Menu Screen (Home)
const MenuScreen = () => {
  const navigate = useNavigate();
  const [tapCount, setTapCount] = useState(0);

  const handleTitleClick = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (newCount >= 5) {
      navigate('/admin'); // Hidden Admin Route
    }
  };

  return (
    <div className="min-h-screen p-6 pt-12 max-w-5xl mx-auto flex flex-col gap-8 bg-slate-50">
      <h2 className="text-4xl font-black text-center mb-4 select-none cursor-pointer text-slate-900" onClick={handleTitleClick}>
        <span className="text-blue-600">Welcome</span> Back
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div 
          onClick={() => navigate('/custom')}
          className="group relative h-64 bg-white rounded-3xl p-8 cursor-pointer hover:bg-slate-50 transition-all border border-slate-200 hover:border-blue-400 overflow-hidden flex flex-col justify-end shadow-xl hover:shadow-2xl"
        >
          <div className="absolute right-[-20px] top-[-20px] text-blue-100 opacity-50 group-hover:scale-110 transition-transform duration-500">
            <Zap size={180} />
          </div>
          <h3 className="text-3xl font-bold text-slate-900 mb-2 relative z-10">Make Your Own</h3>
          <p className="text-slate-500 text-lg relative z-10 font-medium">Mix Pineapple, Orange, Cola & Soda.</p>
        </div>

        <div 
          onClick={() => navigate('/specialty')}
          className="group relative h-64 bg-white rounded-3xl p-8 cursor-pointer hover:bg-slate-50 transition-all border border-slate-200 hover:border-orange-400 overflow-hidden flex flex-col justify-end shadow-xl hover:shadow-2xl"
        >
          <div className="absolute right-[-20px] top-[-20px] text-orange-100 opacity-50 group-hover:scale-110 transition-transform duration-500">
            <CupSoda size={180} />
          </div>
          <h3 className="text-3xl font-bold text-slate-900 mb-2 relative z-10">Specialty Menu</h3>
          <p className="text-slate-500 text-lg relative z-10 font-medium">Select from our curated list of 6 drinks.</p>
        </div>
      </div>
    </div>
  );
};

// 3. Custom Mix Screen
const CustomMixScreen = () => {
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<DrinkRecipe>({...EMPTY_RECIPE});
  
  const currentTotal = (Object.values(recipe) as number[]).reduce((a, b) => a + b, 0);

  const handleDispense = async () => {
    try {
      await bluetoothService.dispenseDrink(recipe);
      statsService.recordDispense(recipe);
      navigate('/success');
    } catch (e) {
      alert('Failed to send command.');
    }
  };

  const handleIngredientChange = (ingredient: Ingredient, value: number) => {
    let newRecipe = { ...recipe, [ingredient]: value };
    let newTotal = (Object.values(newRecipe) as number[]).reduce((a, b) => a + b, 0);
    
    // Simple cap logic
    if (newTotal > MAX_VOLUME_ML) {
       newRecipe[ingredient] -= (newTotal - MAX_VOLUME_ML);
    }
    setRecipe(newRecipe);
  };

  // Group ingredients
  const baseLiquids = [Ingredient.SODA];
  const flavors = [Ingredient.COLA, Ingredient.ORANGE, Ingredient.PINEAPPLE];
  const enhancers = [Ingredient.LEMON, Ingredient.SUGAR];

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto pb-40 bg-slate-50">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-slate-900">Custom Mix</h2>
        <div className={`px-4 py-2 rounded-full text-base font-bold border transition-colors ${currentTotal >= MAX_VOLUME_ML ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white border-slate-300 text-slate-500 shadow-sm'}`}>
          {currentTotal} / {MAX_VOLUME_ML} mL
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1: Base */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 pl-1 flex items-center gap-2">
             <div className="w-1 h-4 bg-blue-500 rounded-full"></div> Base
          </h3>
          <div className="space-y-3">
            {baseLiquids.map(ing => (
              <IngredientStepper
                key={ing}
                ingredient={ing}
                value={recipe[ing]}
                max={MAX_VOLUME_ML}
                step={20}
                onChange={(val) => handleIngredientChange(ing, val)}
              />
            ))}
          </div>
        </div>

        {/* Column 2: Flavors */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 pl-1 flex items-center gap-2">
             <div className="w-1 h-4 bg-orange-500 rounded-full"></div> Flavors & Juices
          </h3>
          <div className="space-y-3">
            {flavors.map(ing => (
              <IngredientStepper
                key={ing}
                ingredient={ing}
                value={recipe[ing]}
                max={MAX_VOLUME_ML}
                step={10}
                onChange={(val) => handleIngredientChange(ing, val)}
              />
            ))}
          </div>
        </div>

        {/* Column 3: Enhancers */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 pl-1 flex items-center gap-2">
             <div className="w-1 h-4 bg-yellow-400 rounded-full"></div> Enhancers
          </h3>
          <div className="space-y-3">
            {enhancers.map(ing => (
              <IngredientStepper
                key={ing}
                ingredient={ing}
                value={recipe[ing]}
                max={MAX_VOLUME_ML}
                step={5}
                onChange={(val) => handleIngredientChange(ing, val)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-24 md:bottom-28 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-30">
        <Button 
          variant="neon" 
          className="w-full shadow-xl bg-white/95 backdrop-blur-md text-lg py-4 border-2"
          onClick={handleDispense}
          disabled={currentTotal === 0}
        >
          Dispense Mix
        </Button>
      </div>
    </div>
  );
};

// 4. Specialty List Screen
const SpecialtyListScreen = () => {
  const navigate = useNavigate();
  // Load live recipes
  const recipes = SPECIALTY_DRINKS.map(d => {
    const saved = recipeService.getRecipeConfig(d.id);
    return saved ? { ...d, ...saved } : d;
  });

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto pb-40 bg-slate-50">
      <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center md:text-left">Specialty Menu</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map(drink => (
          <div 
            key={drink.id}
            onClick={() => navigate(`/adjust/${drink.id}`)}
            className={`cursor-pointer rounded-3xl p-8 bg-gradient-to-r ${drink.color} relative overflow-hidden shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group h-48 md:h-64 flex flex-col justify-between`}
          >
            {/* Dark overlay for text contrast on all colorful cards */}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors"></div>
            
            <div className="relative z-10 flex justify-end">
               <div className="bg-white/30 p-3 rounded-full backdrop-blur-md shadow-sm border border-white/20">
                 <Martini size={28} className="text-white drop-shadow-md" />
               </div>
            </div>

            <div className="relative z-10">
              <h3 className="text-2xl font-black text-white drop-shadow-md mb-2">{drink.name}</h3>
              <p className="text-sm text-white font-semibold drop-shadow-md">{drink.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 5. Specialty Adjust Screen
const SpecialtyAdjustScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const drinkId = location.pathname.split('/').pop();
  
  const baseDrink = SPECIALTY_DRINKS.find(d => d.id === drinkId);
  const adminConfig = recipeService.getRecipeConfig(drinkId || '');
  const drink = baseDrink ? (adminConfig ? { ...baseDrink, ...adminConfig } : baseDrink) : null;

  const [flavorAmount, setFlavorAmount] = useState<number>(0);

  useEffect(() => {
    if (drink) setFlavorAmount(drink.minFlavor);
  }, [drinkId]);

  if (!drink) return <div>Drink not found</div>;

  const fixedVolume = (Object.values(drink.fixedIngredients) as (number|undefined)[]).reduce((a: number, b) => a + (b || 0), 0);
  const availableVolume = MAX_VOLUME_ML - fixedVolume;
  const baseAmount = Math.max(0, availableVolume - flavorAmount);

  const handleDispense = async () => {
    const recipe = { ...EMPTY_RECIPE };
    Object.entries(drink.fixedIngredients).forEach(([ing, amt]) => recipe[ing as Ingredient] += ((amt as number) || 0));
    recipe[drink.flavorIngredient] += flavorAmount;
    recipe[drink.baseIngredient] += baseAmount;
    
    try {
      await bluetoothService.dispenseDrink(recipe);
      statsService.recordDispense(recipe);
      navigate('/success');
    } catch (e) {
      alert('Failed to send command.');
    }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center max-w-4xl mx-auto pb-32 bg-slate-50">
      <div className="w-full max-w-2xl bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/specialty')} className="p-3 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200">
            <RotateCcw size={20} />
          </button>
          <h2 className="text-2xl font-bold text-slate-900">{drink.name}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-10">
          <div className={`aspect-square rounded-full bg-gradient-to-br ${drink.color} shadow-xl flex flex-col items-center justify-center relative overflow-hidden group`}>
             <div className="absolute inset-0 bg-black/10"></div>
             <div className="relative z-10 text-center p-6">
               <div className="text-6xl font-black text-white drop-shadow-md mb-2">{flavorAmount}<span className="text-3xl">mL</span></div>
               <p className="text-white font-bold uppercase text-sm tracking-widest drop-shadow-md">{drink.flavorIngredient}</p>
             </div>
          </div>

          <div className="space-y-6">
            <IngredientStepper 
              ingredient={drink.flavorIngredient}
              label="Flavor Intensity"
              value={flavorAmount}
              max={MAX_VOLUME_ML}
              step={5} 
              minConstraint={drink.minFlavor}
              maxConstraint={drink.maxFlavor}
              onChange={setFlavorAmount}
              isRelative={true}
            />
            
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center shadow-inner">
                <span className="text-sm text-slate-500 font-bold uppercase tracking-wide">Base ({drink.baseIngredient})</span>
                <span className="text-xl font-bold text-slate-900">{baseAmount} mL</span>
            </div>
          </div>
        </div>

        <Button variant="neon" className="w-full py-5 text-xl rounded-xl" onClick={handleDispense}>
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
      <div className="p-12 bg-white rounded-3xl border border-green-200 shadow-xl">
        <CheckCircle size={120} className="text-green-500 mb-8 animate-pulse mx-auto" />
        <h1 className="text-5xl font-bold text-slate-900 mb-4">Enjoy!</h1>
        <p className="text-slate-500 mb-12 text-lg font-medium">Your drink is ready to serve.</p>
        <Button variant="primary" className="w-full max-w-xs text-lg py-4" onClick={() => navigate('/menu')}>
          Next Order
        </Button>
      </div>
    </div>
  );
};

// 7. Admin Dashboard
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(statsService.getStats());

  const handleCleaning = async () => {
    if (confirm("START 20s CLEANING CYCLE?")) {
      await bluetoothService.cleanSystem();
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto pb-40 bg-slate-50">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/menu')} className="p-3 rounded-full bg-white text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200"><RotateCcw size={20} /></button>
        <h2 className="text-2xl font-bold text-slate-900">Admin Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md">
          <h3 className="font-bold text-slate-500 mb-6 flex items-center gap-2"><BarChart3 size={20}/> Statistics</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 mb-1 font-bold">Total Drinks</div>
                <div className="text-3xl font-bold text-slate-900">{stats.totalDrinks}</div>
             </div>
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 mb-1 font-bold">Volume (L)</div>
                <div className="text-3xl font-bold text-blue-600">{(stats.totalVolume / 1000).toFixed(1)}</div>
             </div>
          </div>
          <button onClick={() => { statsService.resetStats(); setStats(statsService.getStats()); }} className="text-red-500 text-xs flex items-center gap-1 hover:text-red-700 font-medium">
             <AlertTriangle size={14}/> Reset Stats
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md">
          <h3 className="font-bold text-slate-500 mb-6 flex items-center gap-2"><Settings size={20}/> Maintenance</h3>
          <button onClick={handleCleaning} className="w-full py-4 bg-orange-50 text-orange-700 rounded-xl text-sm border border-orange-200 flex justify-center items-center gap-2 hover:bg-orange-100 transition-colors font-bold">
            <Droplets size={18}/> Start Cleaning Cycle
          </button>
          <button onClick={() => navigate('/firmware')} className="w-full py-4 mt-4 bg-slate-100 text-slate-700 rounded-xl text-sm border border-slate-200 flex justify-center items-center gap-2 hover:bg-slate-200 transition-colors font-bold">
            <Code size={18}/> View Firmware
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md md:col-span-2">
           <h3 className="font-bold text-slate-500 mb-6 flex items-center gap-2"><PenTool size={20}/> Recipe Editor</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {SPECIALTY_DRINKS.map(d => (
               <div key={d.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                 <span className="text-base font-bold text-slate-700">{d.name}</span>
                 <button onClick={() => navigate(`/admin/edit/${d.id}`)} className="text-xs bg-white px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 transition-colors font-medium">Edit</button>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

// 8. Recipe Editor Screen
const RecipeEditorScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const defaultRecipe = SPECIALTY_DRINKS.find(d => d.id === id);
  const savedConfig = recipeService.getRecipeConfig(id || '');
  
  const [config, setConfig] = useState(savedConfig || {
    id: id || '',
    minFlavor: defaultRecipe?.minFlavor || 0,
    maxFlavor: defaultRecipe?.maxFlavor || 0,
    fixedIngredients: defaultRecipe?.fixedIngredients || {}
  });

  if (!defaultRecipe) return <div>Recipe not found</div>;

  const handleSave = () => {
    recipeService.saveRecipeConfig(config);
    alert('Recipe Updated!');
    navigate('/admin');
  };

  const handleFixedChange = (ing: string, val: number) => {
    setConfig({
        ...config,
        fixedIngredients: { ...config.fixedIngredients, [ing]: val }
    });
  };

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto bg-slate-50">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate('/admin')} className="text-slate-500 hover:text-slate-900 transition-colors font-medium">Cancel</button>
        <h2 className="text-xl font-bold text-slate-900">Edit: {defaultRecipe.name}</h2>
        <button onClick={handleSave} className="text-blue-600 font-bold hover:text-blue-700 transition-colors">Save</button>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md">
          <h3 className="text-slate-400 text-xs font-bold uppercase mb-4">Flavor Limits ({defaultRecipe.flavorIngredient})</h3>
          <div className="mb-4">
            <label className="text-xs text-slate-500 block mb-2 font-bold">Min (mL)</label>
            <input type="number" className="w-full bg-slate-50 p-4 rounded-xl text-slate-900 border border-slate-200 focus:border-blue-500 outline-none font-medium" 
              value={config.minFlavor} onChange={e => setConfig({...config, minFlavor: parseInt(e.target.value) || 0})} />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-2 font-bold">Max (mL)</label>
            <input type="number" className="w-full bg-slate-50 p-4 rounded-xl text-slate-900 border border-slate-200 focus:border-blue-500 outline-none font-medium" 
              value={config.maxFlavor} onChange={e => setConfig({...config, maxFlavor: parseInt(e.target.value) || 0})} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md">
          <h3 className="text-slate-400 text-xs font-bold uppercase mb-4">Fixed Ingredients</h3>
          {Object.entries(config.fixedIngredients).map(([ing, val]) => (
            <div key={ing} className="mb-4 last:mb-0">
               <label className="text-xs text-slate-500 block mb-2 font-bold">{ing} (mL)</label>
               <input type="number" className="w-full bg-slate-50 p-4 rounded-xl text-slate-900 border border-slate-200 focus:border-blue-500 outline-none font-medium"
                 value={val as number} onChange={e => handleFixedChange(ing, parseInt(e.target.value) || 0)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const FirmwareScreen = () => {
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(ARDUINO_SKETCH);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="min-h-screen p-6 max-w-4xl mx-auto pb-40 bg-slate-50">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/admin')} className="p-3 rounded-full bg-white text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200"><RotateCcw size={20} /></button>
                <h2 className="text-xl font-bold text-slate-900">Firmware</h2>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 font-mono text-xs text-slate-600 h-[60vh] overflow-y-auto mb-6 shadow-inner">
                <pre>{ARDUINO_SKETCH}</pre>
            </div>
            <Button onClick={handleCopy} variant="neon" className="w-full py-4 text-lg">{copied ? "Copied" : "Copy Code"}</Button>
        </div>
    );
};

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<ConnectScreen />} />
        <Route element={<LayoutWithNav />}>
          <Route path="/menu" element={<MenuScreen />} />
          <Route path="/custom" element={<CustomMixScreen />} />
          <Route path="/specialty" element={<SpecialtyListScreen />} />
        </Route>
        <Route path="/adjust/:id" element={<SpecialtyAdjustScreen />} />
        <Route path="/success" element={<SuccessScreen />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/edit/:id" element={<RecipeEditorScreen />} />
        <Route path="/firmware" element={<FirmwareScreen />} />
      </Routes>
    </HashRouter>
  );
};

export default App;