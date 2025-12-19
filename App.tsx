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
import { Zap, RotateCcw, CupSoda, Home, Droplets, Martini, Code, CheckCircle, BarChart3, Settings, PenTool, AlertTriangle, Cable, Usb, MonitorPlay, Power } from 'lucide-react';

// --- Shared Components ---

const TopBar = () => {
  const [status, setStatus] = useState<BluetoothState>('DISCONNECTED');
  const [isSim, setIsSim] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = () => {
      setStatus(bluetoothService.isConnected() ? 'CONNECTED' : 'DISCONNECTED');
      setIsSim(bluetoothService.isSimulatedMode());
    };
    checkStatus();
    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleManualDisconnect = () => {
    bluetoothService.disconnect();
    // Watchdog in LayoutWithNav will handle redirect
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 z-50 flex items-center justify-between px-4 sm:px-6 shadow-sm">
       <div onClick={() => navigate('/menu')} className="font-black text-lg tracking-tight flex items-center gap-2 text-slate-900 cursor-pointer">
         <span className="text-2xl">🍹</span> 
         <span className="hidden sm:inline">Mixvell</span>
       </div>
       
       <div className="flex items-center gap-3">
         <div className={`text-xs font-bold px-3 py-1.5 rounded-full border flex items-center gap-2 transition-colors ${status === 'CONNECTED' ? (isSim ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-green-50 text-green-700 border-green-200') : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
            {isSim ? <MonitorPlay size={14} /> : <Usb size={14} />}
            {status === 'CONNECTED' ? (isSim ? 'Simulation' : 'USB Connected') : 'USB Offline'}
            <div className={`w-2 h-2 rounded-full ${status === 'CONNECTED' ? (isSim ? 'bg-purple-500 animate-pulse' : 'bg-green-500 animate-pulse') : 'bg-slate-300'}`}></div>
         </div>
         {status === 'CONNECTED' && (
           <button 
             onClick={handleManualDisconnect}
             className="p-2 text-slate-400 hover:text-red-500 transition-colors"
             title="Disconnect"
           >
             <Power size={18} />
           </button>
         )}
       </div>
    </div>
  );
};

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  return (
    <div className="fixed bottom-0 md:bottom-6 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-96 bg-white/95 md:rounded-2xl border-t md:border border-slate-200 backdrop-blur-xl pb-safe md:pb-0 z-50 shadow-[0_0_30px_rgba(0,0,0,0.1)] transition-all duration-300">
      <div className="flex justify-around items-center h-16 w-full">
        <button onClick={() => navigate('/menu')} className={`flex flex-col items-center justify-center w-full h-full rounded-l-2xl hover:bg-slate-50 transition-colors ${isActive('/menu') ? 'text-blue-600' : 'text-slate-400'}`}>
          <Home size={24} strokeWidth={isActive('/menu') ? 2.5 : 2} />
          <span className="text-[10px] mt-1 font-bold">Home</span>
        </button>
        <button onClick={() => navigate('/custom')} className={`flex flex-col items-center justify-center w-full h-full hover:bg-slate-50 transition-colors ${isActive('/custom') ? 'text-purple-600' : 'text-slate-400'}`}>
          <Zap size={24} strokeWidth={isActive('/custom') ? 2.5 : 2} />
          <span className="text-[10px] mt-1 font-bold">Custom</span>
        </button>
        <button onClick={() => navigate('/specialty')} className={`flex flex-col items-center justify-center w-full h-full rounded-r-2xl hover:bg-slate-50 transition-colors ${isActive('/specialty') ? 'text-orange-500' : 'text-slate-400'}`}>
          <CupSoda size={24} strokeWidth={isActive('/specialty') ? 2.5 : 2} />
          <span className="text-[10px] mt-1 font-bold">Specialty</span>
        </button>
      </div>
    </div>
  );
};

const LayoutWithNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Watchdog: Redirect to root if connection is lost
  useEffect(() => {
    const checkConnection = setInterval(() => {
      if (!bluetoothService.isConnected() && location.pathname !== '/') {
        console.log('Connection lost, redirecting to connect screen...');
        navigate('/');
      }
    }, 1500);
    return () => clearInterval(checkConnection);
  }, [navigate, location]);

  return (
    <div className="pb-24 md:pb-32 pt-20 bg-slate-50 min-h-screen">
      <TopBar />
      <Outlet />
      <BottomNav />
    </div>
  );
};

const ConnectScreen = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<BluetoothState>('DISCONNECTED');
  const [error, setError] = useState('');

  const handleConnect = async () => {
    setStatus('CONNECTING');
    try {
      await bluetoothService.connect();
      setStatus('CONNECTED');
      setTimeout(() => navigate('/menu'), 800);
    } catch (e: any) {
      setStatus('ERROR');
      setError(e.message || 'Connection failed');
    }
  };

  const handleSimulation = async () => {
    setStatus('CONNECTING');
    await bluetoothService.connectSimulation();
    setStatus('CONNECTED');
    setTimeout(() => navigate('/menu'), 800);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-white">
      <div className="max-w-lg w-full bg-white p-10 rounded-3xl shadow-xl border border-slate-200">
        <div className="mb-8 flex justify-center">
          <div className="p-6 rounded-full bg-slate-100 border-4 border-white shadow-lg">
            <Martini size={64} className="text-blue-600" />
          </div>
        </div>
        <h1 className="text-5xl font-black mb-3 text-slate-900 tracking-tight">Mixvell</h1>
        <p className="text-slate-500 mb-10 text-lg font-medium">Smart Mocktail Dispenser</p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm border border-red-100 rounded-xl">
            {error}
          </div>
        )}

        <Button variant="neon" onClick={handleConnect} isLoading={status === 'CONNECTING'} className="w-full text-xl py-5 rounded-xl flex items-center justify-center gap-3">
          <Usb size={24} />
          Connect via USB
        </Button>

        <div className="mt-8 pt-8 border-t border-slate-100">
          <p className="text-slate-400 text-sm mb-4">No Arduino nearby?</p>
          <button 
            onClick={handleSimulation}
            className="flex items-center gap-2 mx-auto text-blue-600 font-bold hover:bg-blue-50 px-6 py-3 rounded-full transition-colors"
          >
            <MonitorPlay size={20} />
            Run Simulation Mode
          </button>
        </div>
      </div>
    </div>
  );
};

const MenuScreen = () => {
  const navigate = useNavigate();
  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col gap-8">
      <h2 className="text-4xl font-black text-center mb-4 text-slate-900">
        <span className="text-blue-600">Welcome</span> Back
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div onClick={() => navigate('/custom')} className="group relative h-64 bg-white rounded-3xl p-8 cursor-pointer hover:bg-slate-50 transition-all border border-slate-200 hover:border-blue-400 overflow-hidden flex flex-col justify-end shadow-xl hover:shadow-2xl">
          <div className="absolute right-[-20px] top-[-20px] text-blue-100 opacity-50 group-hover:scale-110 transition-transform">
            <Zap size={180} />
          </div>
          <h3 className="text-3xl font-bold text-slate-900 mb-2 relative z-10">Make Your Own</h3>
          <p className="text-slate-500 text-lg relative z-10 font-medium">Mix Cola, Orange, Soda & Spicy Lemon.</p>
        </div>
        <div onClick={() => navigate('/specialty')} className="group relative h-64 bg-white rounded-3xl p-8 cursor-pointer hover:bg-slate-50 transition-all border border-slate-200 hover:border-orange-400 overflow-hidden flex flex-col justify-end shadow-xl hover:shadow-2xl">
          <div className="absolute right-[-20px] top-[-20px] text-orange-100 opacity-50 group-hover:scale-110 transition-transform">
            <CupSoda size={180} />
          </div>
          <h3 className="text-3xl font-bold text-slate-900 mb-2 relative z-10">Specialty Menu</h3>
          <p className="text-slate-500 text-lg relative z-10 font-medium">6 sweet and spicy signature drinks.</p>
        </div>
      </div>
    </div>
  );
};

const CustomMixScreen = () => {
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<DrinkRecipe>({...EMPTY_RECIPE});
  const currentTotal = Object.values(recipe).reduce((a, b) => a + b, 0);

  const handleIngredientChange = (ingredient: Ingredient, value: number) => {
    let newRecipe = { ...recipe, [ingredient]: value };
    let newTotal = Object.values(newRecipe).reduce((a, b) => a + b, 0);
    if (newTotal > MAX_VOLUME_ML) newRecipe[ingredient] -= (newTotal - MAX_VOLUME_ML);
    setRecipe(newRecipe);
  };

  const groups = [
    { label: 'Base', color: 'bg-blue-500', items: [Ingredient.SODA, Ingredient.COLA] },
    { label: 'Flavors', color: 'bg-orange-500', items: [Ingredient.ORANGE_JUICE, Ingredient.SPICY_LEMON] },
    { label: 'Enhancers', color: 'bg-yellow-400', items: [Ingredient.LEMON, Ingredient.SUGAR] }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto pb-40">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Custom Mix</h2>
        <div className={`px-4 py-2 rounded-full font-bold border ${currentTotal >= MAX_VOLUME_ML ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white border-slate-300 text-slate-500 shadow-sm'}`}>
          {currentTotal} / {MAX_VOLUME_ML} mL
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {groups.map(g => (
          <div key={g.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
               <div className={`w-1 h-4 ${g.color} rounded-full`}></div> {g.label}
            </h3>
            <div className="space-y-3">
              {g.items.map(ing => (
                <IngredientStepper key={ing} ingredient={ing} value={recipe[ing]} max={MAX_VOLUME_ML} step={10} onChange={(val) => handleIngredientChange(ing, val)} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-30">
        <Button variant="neon" className="w-full shadow-xl bg-white/95 backdrop-blur-md py-4" onClick={async () => { await bluetoothService.dispenseDrink(recipe); navigate('/success'); }} disabled={currentTotal === 0}>
          Dispense Sweet Mix
        </Button>
      </div>
    </div>
  );
};

const SpecialtyListScreen = () => {
  const navigate = useNavigate();
  return (
    <div className="p-6 max-w-7xl mx-auto pb-40">
      <h2 className="text-3xl font-bold text-slate-900 mb-8">Specialty Menu</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SPECIALTY_DRINKS.map(drink => (
          <div key={drink.id} onClick={() => navigate(`/adjust/${drink.id}`)} className={`cursor-pointer rounded-3xl p-8 bg-gradient-to-r ${drink.color} relative overflow-hidden shadow-lg hover:scale-[1.02] transition-all h-64 flex flex-col justify-between group`}>
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5"></div>
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

const SpecialtyAdjustScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const drink = SPECIALTY_DRINKS.find(d => d.id === id);
  const [flavorAmount, setFlavorAmount] = useState(0);

  useEffect(() => { if (drink) setFlavorAmount(drink.minFlavor); }, [id]);
  if (!drink) return null;

  const fixedVolume = Object.values(drink.fixedIngredients).reduce((a: number, b) => a + (b || 0), 0);
  const baseAmount = Math.max(0, MAX_VOLUME_ML - fixedVolume - flavorAmount);

  return (
    <div className="p-6 flex flex-col items-center justify-center max-w-4xl mx-auto pb-32">
      <div className="w-full max-w-2xl bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/specialty')} className="p-3 rounded-full bg-slate-100 border border-slate-200"><RotateCcw size={20} /></button>
          <h2 className="text-2xl font-bold text-slate-900">{drink.name}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-10">
          <div className={`aspect-square rounded-full bg-gradient-to-br ${drink.color} shadow-xl flex flex-col items-center justify-center relative overflow-hidden`}>
             <div className="absolute inset-0 bg-black/10"></div>
             <div className="relative z-10 text-center p-6">
               <div className="text-6xl font-black text-white drop-shadow-md mb-2">{flavorAmount}<span className="text-3xl">mL</span></div>
               <p className="text-white font-bold uppercase text-sm drop-shadow-md">{drink.flavorIngredient}</p>
             </div>
          </div>
          <div className="space-y-6">
            <IngredientStepper ingredient={drink.flavorIngredient} label="Flavor Intensity" value={flavorAmount} max={MAX_VOLUME_ML} step={5} minConstraint={drink.minFlavor} maxConstraint={drink.maxFlavor} onChange={setFlavorAmount} isRelative={true} />
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                <span className="text-sm text-slate-500 font-bold uppercase tracking-wide">Base ({drink.baseIngredient})</span>
                <span className="text-xl font-bold text-slate-900">{baseAmount} mL</span>
            </div>
          </div>
        </div>
        <Button variant="neon" className="w-full py-5 text-xl rounded-xl" onClick={async () => {
            const recipe = { ...EMPTY_RECIPE };
            Object.entries(drink.fixedIngredients).forEach(([ing, amt]) => recipe[ing as Ingredient] += (amt || 0));
            recipe[drink.flavorIngredient] += flavorAmount;
            recipe[drink.baseIngredient] += baseAmount;
            await bluetoothService.dispenseDrink(recipe);
            navigate('/success');
        }}>Dispense Sweet Drink</Button>
      </div>
    </div>
  );
};

const SuccessScreen = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
      <div className="p-12 bg-white rounded-3xl border border-green-200 shadow-xl">
        <CheckCircle size={120} className="text-green-500 mb-8 animate-pulse mx-auto" />
        <h1 className="text-5xl font-bold text-slate-900 mb-4">Sweet!</h1>
        <p className="text-slate-500 mb-12 text-lg font-medium">Your sugary treat is ready.</p>
        <Button variant="primary" className="w-full max-w-xs text-lg py-4" onClick={() => navigate('/menu')}>Next Order</Button>
      </div>
    </div>
  );
};

const App = () => (
  <HashRouter>
    <Routes>
      <Route path="/" element={<ConnectScreen />} />
      <Route element={<LayoutWithNav />}>
        <Route path="/menu" element={<MenuScreen />} />
        <Route path="/custom" element={<CustomMixScreen />} />
        <Route path="/specialty" element={<SpecialtyListScreen />} />
        <Route path="/adjust/:id" element={<SpecialtyAdjustScreen />} />
        <Route path="/success" element={<SuccessScreen />} />
        <Route path="/admin" element={<div>Admin Dashboard</div>} />
        <Route path="/firmware" element={<div>Firmware</div>} />
      </Route>
    </Routes>
  </HashRouter>
);

export default App;