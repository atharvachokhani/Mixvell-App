import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { bluetoothService } from './services/bluetoothService';
import { statsService, AppStats } from './services/statsService';
import { BluetoothState, DrinkRecipe, Ingredient } from './types';
import { Button } from './components/Button';
import { IngredientStepper } from './components/IngredientStepper';
import { EMPTY_RECIPE, MAX_VOLUME_ML, SPECIALTY_DRINKS, INGREDIENT_COLORS } from './constants';
import { ARDUINO_SKETCH } from './services/firmwareTemplate';
import { Zap, RotateCcw, CupSoda, Laptop, Smartphone, AlertTriangle, BarChart3, Trash2, CheckCircle, Martini, Code, Copy, Check, Droplets } from 'lucide-react';

// 1. Connection Screen
const ConnectScreen = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<BluetoothState>('DISCONNECTED');
  const [error, setError] = useState('');
  const [showMaintenance, setShowMaintenance] = useState(false);

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
      
      if (msg.includes('Failed to open serial port') || msg.includes('Access denied')) {
        msg = '❌ Port Busy or Blocked.\n\n1. Close Arduino IDE or Serial Monitor.\n2. Ensure no other browser tabs are connected.\n3. Try un-pairing and re-pairing the Bluetooth device.';
      } else if (msg.includes('No port selected')) {
        msg = '';
        setStatus('DISCONNECTED');
        return;
      } else if (msg.includes('The port is already open')) {
         console.log("Port was already open, proceeding.");
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
  
  const handleTestConnection = async () => {
    if (!bluetoothService.isConnected()) {
      setError("Please connect first.");
      return;
    }
    try {
      await bluetoothService.testConnection();
      alert("Sent ping! Check if Arduino LED blinks.");
    } catch (e) {
      setError("Failed to send test ping.");
    }
  };

  const handleCleaning = async () => {
    if (!bluetoothService.isConnected()) {
      setError("Connect to device first to run cleaning.");
      return;
    }
    if (confirm("START CLEANING CYCLE?\n\nPlace a large bowl under the nozzle.\nThis will run ALL pumps for 20 seconds each.\n\nContinue?")) {
      try {
        await bluetoothService.cleanSystem();
        alert("Cleaning cycle started.\nPlease wait ~2 minutes.");
      } catch (e) {
        setError("Failed to start cleaning.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[url('https://picsum.photos/1920/1080?blur=10')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm"></div>
      <div className="relative z-10 max-w-md w-full glass-panel p-8 rounded-2xl shadow-2xl border border-neon-blue/30 overflow-y-auto max-h-[90vh]">
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
          <div className="mb-6 p-3 bg-red-900/50 border border-red-500/50 rounded text-red-200 text-sm whitespace-pre-line text-left leading-relaxed">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button 
            variant="neon" 
            onClick={handleConnect} 
            isLoading={status === 'CONNECTING'}
            className="w-full text-lg py-4"
          >
            {status === 'CONNECTED' ? 'Connected!' : 'Connect to Dispenser'}
          </Button>

          {status === 'CONNECTED' && (
             <div className="flex gap-2 justify-center text-xs">
                 <button onClick={handleTestConnection} className="text-neon-blue underline">
                   Test Connection
                 </button>
             </div>
          )}

          <div className="mt-4 border-t border-slate-700/50 pt-4">
            <button
                onClick={() => setShowMaintenance(!showMaintenance)}
                className="text-xs text-slate-500 hover:text-white flex items-center justify-center gap-1 w-full"
            >
                {showMaintenance ? 'Hide Maintenance' : 'Show Maintenance / Firmware'}
            </button>
            
            {showMaintenance && (
                <div className="mt-3 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                    <button
                        onClick={() => navigate('/firmware')}
                        className="flex items-center justify-center gap-2 py-2 w-full rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300 text-sm"
                    >
                        <Code size={14} /> Get Firmware
                    </button>
                    
                    <button
                        onClick={handleCleaning}
                        className="flex items-center justify-center gap-2 py-2 w-full rounded-lg bg-orange-900/30 border border-orange-500/30 hover:bg-orange-900/50 text-orange-200 text-sm transition-colors"
                    >
                        <Droplets size={14} /> Start Cleaning Cycle (20s)
                    </button>
                </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <button 
            onClick={handleSimulate}
            className="text-slate-600 text-xs hover:text-slate-400"
          >
            Debug: Enter Simulation Mode
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. Menu Screen
const MenuScreen = () => {
  const navigate = useNavigate();
  const [tapCount, setTapCount] = useState(0);

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

// 3. Custom Mix Screen
const CustomMixScreen = () => {
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<DrinkRecipe>({...EMPTY_RECIPE});
  
  const currentTotal = (Object.values(recipe) as number[]).reduce((a, b) => a + b, 0);

  const getStepSize = (ing: Ingredient) => {
    if ([Ingredient.WATER, Ingredient.COLA, Ingredient.SODA].includes(ing)) {
      return 20;
    }
    // Updated step sizes: 10mL for juices, 5mL for syrups/cola-concentrate
    if (ing === Ingredient.COLA) return 5; 
    return 5;
  };

  const handleIngredientChange = (ingredient: Ingredient, value: number) => {
    let newRecipe = { ...recipe, [ingredient]: value };
    let newTotal = (Object.values(newRecipe) as number[]).reduce((a, b) => a + b, 0);

    if (newTotal > MAX_VOLUME_ML) {
      let overflow = newTotal - MAX_VOLUME_ML;
      const otherIngredients = (Object.keys(newRecipe) as Ingredient[])
        .filter(k => k !== ingredient && newRecipe[k] > 0)
        .sort((a, b) => newRecipe[b] - newRecipe[a]);

      let canBalance = false;
      for (const other of otherIngredients) {
        if (overflow <= 0) break;
        const available = newRecipe[other];
        const toTake = Math.min(available, overflow);
        if (toTake > 0) canBalance = true;
        newRecipe[other] -= toTake;
        overflow -= toTake;
      }
      
      if (overflow > 0) {
        newRecipe[ingredient] -= overflow;
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
        Use buttons to adjust. Max 100mL total.
      </div>

      <div className="space-y-1">
        {Object.values(Ingredient).map((ing) => (
          <IngredientStepper
            key={ing}
            ingredient={ing}
            value={recipe[ing]}
            max={MAX_VOLUME_ML}
            step={getStepSize(ing)}
            onChange={(val) => handleIngredientChange(ing, val)}
            isRelative={false}
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
  const [flavorAmount, setFlavorAmount] = useState<number>(0);

  useEffect(() => {
    if (drink) {
      setFlavorAmount(drink.minFlavor);
    }
  }, [drink]);

  if (!drink) return <div>Drink not found</div>;

  const fixedVolume = Object.values(drink.fixedIngredients).reduce((a, b) => a + (b || 0), 0);
  const availableVolume = MAX_VOLUME_ML - fixedVolume;
  const minFlavor = drink.minFlavor;
  const maxFlavor = drink.maxFlavor;
  const baseAmount = Math.max(0, availableVolume - flavorAmount);
  const currentTotal = baseAmount + flavorAmount + fixedVolume;

  const handleFlavorChange = (val: number) => {
    let newVal = val;
    if (newVal < minFlavor) newVal = minFlavor;
    if (newVal > maxFlavor) newVal = maxFlavor;
    setFlavorAmount(newVal);
  };

  const handleDispense = async () => {
    const recipe = { ...EMPTY_RECIPE };
    
    Object.entries(drink.fixedIngredients).forEach(([ing, amt]) => {
      recipe[ing as Ingredient] = (recipe[ing as Ingredient] || 0) + (amt || 0);
    });

    recipe[drink.flavorIngredient] = (recipe[drink.flavorIngredient] || 0) + flavorAmount;
    recipe[drink.baseIngredient] = (recipe[drink.baseIngredient] || 0) + baseAmount;
    
    Object.keys(recipe).forEach(key => {
        // @ts-ignore
        recipe[key] = Math.round(recipe[key]);
    });
    
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
             {currentTotal > MAX_VOLUME_ML && (
                 <div className="mt-2 text-xs bg-red-500 text-white px-2 py-1 rounded">Error: &gt;100mL</div>
             )}
           </div>
        </div>

        <div className="space-y-6">
          <IngredientStepper 
            ingredient={drink.flavorIngredient}
            label={`Adjust Flavor Intensity`}
            value={flavorAmount}
            max={MAX_VOLUME_ML}
            step={5} 
            minConstraint={minFlavor}
            maxConstraint={maxFlavor}
            onChange={handleFlavorChange}
            isRelative={true}
          />
          
          <IngredientStepper 
             ingredient={drink.baseIngredient}
             label={`${drink.baseIngredient} (Auto-Adjusts)`}
             value={baseAmount}
             max={MAX_VOLUME_ML}
             onChange={() => {}} 
             colorClass="bg-blue-300"
             readOnly={true} 
          />

          {Object.entries(drink.fixedIngredients).map(([ing, amt]) => (
             <div key={ing} className="opacity-60 grayscale">
                <IngredientStepper 
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

// 7. Stats Screen
const StatsScreen = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AppStats>(statsService.getStats());

  const handleReset = () => {
    if (window.confirm("Are you sure you want to clear all history?")) {
      statsService.resetStats();
      setStats(statsService.getStats());
    }
  };

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

// 8. Firmware Code Screen
const FirmwareScreen = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(ARDUINO_SKETCH);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-slate-400 hover:text-white bg-slate-800/50 px-4 py-2 rounded-full"
        >
          <RotateCcw size={16} /> Back
        </button>
        <h2 className="text-xl font-bold text-white">Arduino Firmware</h2>
        <button 
          onClick={handleCopy}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
            copied ? 'bg-green-500 text-white' : 'bg-neon-blue text-black hover:bg-cyan-300'
          }`}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy Code'}
        </button>
      </div>

      <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 p-4 overflow-hidden relative font-mono text-sm shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-8 bg-slate-800 flex items-center px-4 border-b border-slate-700">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="ml-4 text-xs text-slate-400">mixvell_firmware.ino</span>
        </div>
        <textarea 
          className="w-full h-full bg-transparent text-slate-300 p-4 pt-8 focus:outline-none resize-none"
          readOnly
          value={ARDUINO_SKETCH}
          spellCheck={false}
        />
      </div>

      <div className="mt-6 p-4 bg-slate-800/50 rounded-lg text-sm text-slate-400 border border-slate-700">
        <h3 className="font-bold text-white mb-2 flex items-center gap-2"><AlertTriangle size={16} className="text-yellow-400"/> Wiring Guide</h3>
        <ul className="grid grid-cols-2 gap-2">
          <li>Pin 2: Water</li>
          <li>Pin 3: Cola</li>
          <li>Pin 4: Soda</li>
          <li>Pin 5: Sugar</li>
          <li>Pin 6: Lemon</li>
          <li>Pin 7: Orange</li>
        </ul>
        <p className="mt-3 text-xs opacity-70 border-t border-slate-700 pt-2">
          <strong>Tip:</strong> Disconnect Bluetooth RX/TX pins while uploading this code to Arduino, then reconnect them.
        </p>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<ConnectScreen />} />
        <Route path="/firmware" element={<FirmwareScreen />} />
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