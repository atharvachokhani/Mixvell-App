import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation, Outlet, useParams } from 'react-router-dom';
import { serialService, isSerialSupported } from './services/bluetoothService';
import { statsService } from './services/statsService';
import { ConnectionState, DrinkRecipe, Ingredient } from './types';
import { Button } from './components/Button';
import { IngredientStepper } from './components/IngredientStepper';
import { EMPTY_RECIPE, MAX_VOLUME_ML, SPECIALTY_DRINKS } from './constants';
import { Zap, RotateCcw, CupSoda, Home, Martini, CheckCircle, Usb, MonitorPlay, Power, Cable, AlertCircle } from 'lucide-react';

// --- Shared Components ---

const TopBar = () => {
  const [status, setStatus] = useState<ConnectionState>('DISCONNECTED');
  const [isSim, setIsSim] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = () => {
      setStatus(serialService.isConnected() ? 'CONNECTED' : 'DISCONNECTED');
      setIsSim(serialService.isSimulatedMode());
    };
    checkStatus();
    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleManualDisconnect = () => {
    serialService.disconnect();
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 z-50 flex items-center justify-between px-4 sm:px-6 shadow-sm">
       <div onClick={() => navigate('/menu')} className="font-black text-lg tracking-tight flex items-center gap-2 text-slate-900 cursor-pointer">
         <span className="text-2xl">🍹</span> 
         <span className="hidden sm:inline text-xl">Mixvell</span>
       </div>
       
       <div className="flex items-center gap-2">
         <div className={`text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full border flex items-center gap-2 transition-colors ${status === 'CONNECTED' ? (isSim ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200') : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
            {isSim ? <MonitorPlay size={14} /> : <Cable size={14} />}
            {status === 'CONNECTED' ? (isSim ? 'Simulation' : 'Cable Active') : 'Disconnected'}
            <div className={`w-2 h-2 rounded-full ${status === 'CONNECTED' ? (isSim ? 'bg-purple-500 animate-pulse' : 'bg-blue-500 animate-pulse') : 'bg-slate-300'}`}></div>
         </div>
         {status === 'CONNECTED' && (
           <button 
             onClick={handleManualDisconnect}
             className="p-2 text-slate-400 hover:text-red-500 transition-colors"
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
          <Home size={22} strokeWidth={isActive('/menu') ? 2.5 : 2} />
          <span className="text-[10px] mt-1 font-bold uppercase tracking-tight">Home</span>
        </button>
        <button onClick={() => navigate('/custom')} className={`flex flex-col items-center justify-center w-full h-full hover:bg-slate-50 transition-colors ${isActive('/custom') ? 'text-purple-600' : 'text-slate-400'}`}>
          <Zap size={22} strokeWidth={isActive('/custom') ? 2.5 : 2} />
          <span className="text-[10px] mt-1 font-bold uppercase tracking-tight">Custom</span>
        </button>
        <button onClick={() => navigate('/specialty')} className={`flex flex-col items-center justify-center w-full h-full rounded-r-2xl hover:bg-slate-50 transition-colors ${isActive('/specialty') ? 'text-orange-500' : 'text-slate-400'}`}>
          <CupSoda size={22} strokeWidth={isActive('/specialty') ? 2.5 : 2} />
          <span className="text-[10px] mt-1 font-bold uppercase tracking-tight">Drinks</span>
        </button>
      </div>
    </div>
  );
};

const LayoutWithNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const watchdog = setInterval(() => {
      if (!serialService.isConnected() && location.pathname !== '/') {
        console.log('Hardware disconnected. Returning to setup.');
        navigate('/');
      }
    }, 1000);
    return () => clearInterval(watchdog);
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
  const [status, setStatus] = useState<ConnectionState>('DISCONNECTED');
  const [error, setError] = useState('');

  const handleConnect = async () => {
    setStatus('CONNECTING');
    setError('');
    try {
      await serialService.connect();
      setStatus('CONNECTED');
      setTimeout(() => navigate('/menu'), 600);
    } catch (e: any) {
      setStatus('ERROR');
      setError(e.message || 'Check cable connection');
    }
  };

  const handleSimulation = async () => {
    await serialService.connectSimulation();
    navigate('/menu');
  };

  if (!isSerialSupported()) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-red-100">
           <AlertCircle size={64} className="text-red-500 mx-auto mb-6" />
           <h1 className="text-2xl font-bold mb-4">Browser Not Supported</h1>
           <p className="text-slate-500 mb-8">Web Serial (USB connectivity) requires <b>Chrome, Edge, or Opera</b>.</p>
           <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50">
      <div className="max-w-lg w-full bg-white p-10 rounded-3xl shadow-xl border border-slate-200">
        <div className="mb-8 flex justify-center">
          <div className="p-6 rounded-full bg-blue-50 border-4 border-white shadow-md">
            <Cable size={64} className="text-blue-600" />
          </div>
        </div>
        <h1 className="text-5xl font-black mb-2 text-slate-900 tracking-tight">Mixvell</h1>
        <p className="text-slate-500 mb-10 text-lg">Hardware Controller</p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm border border-red-100 rounded-xl font-medium">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Button variant="primary" onClick={handleConnect} isLoading={status === 'CONNECTING'} className="w-full text-xl py-6 rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:shadow-blue-200/50">
            <Usb size={24} />
            Pair USB Cable
          </Button>
          
          <div className="pt-6 border-t border-slate-100">
            <button 
              onClick={handleSimulation}
              className="flex items-center gap-2 mx-auto text-slate-400 font-bold hover:text-purple-600 transition-colors py-2"
            >
              <MonitorPlay size={18} />
              Try Simulation Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MenuScreen = () => {
  const navigate = useNavigate();
  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6">
      <h2 className="text-3xl font-black text-slate-900 mt-4 px-2">
        Pick your <span className="text-blue-600">vibe</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div onClick={() => navigate('/custom')} className="group relative h-60 bg-white rounded-3xl p-8 cursor-pointer hover:bg-slate-50 transition-all border border-slate-200 hover:border-blue-400 overflow-hidden flex flex-col justify-end shadow-md hover:shadow-xl">
          <div className="absolute right-[-20px] top-[-20px] text-blue-100 opacity-30 group-hover:scale-110 transition-transform">
            <Zap size={180} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 relative z-10">Custom Lab</h3>
          <p className="text-slate-500 text-sm relative z-10 font-medium">Design a unique mixture.</p>
        </div>
        <div onClick={() => navigate('/specialty')} className="group relative h-60 bg-white rounded-3xl p-8 cursor-pointer hover:bg-slate-50 transition-all border border-slate-200 hover:border-orange-400 overflow-hidden flex flex-col justify-end shadow-md hover:shadow-xl">
          <div className="absolute right-[-20px] top-[-20px] text-orange-100 opacity-30 group-hover:scale-110 transition-transform">
            <CupSoda size={180} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 relative z-10">Signature Menu</h3>
          <p className="text-slate-500 text-sm relative z-10 font-medium">Tried and tested classics.</p>
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
    { label: 'Bases', color: 'bg-blue-500', items: [Ingredient.SODA] },
    { label: 'Flavors', color: 'bg-orange-500', items: [Ingredient.ORANGE_JUICE, Ingredient.SPICY_LEMON] },
    { label: 'Syrups', color: 'bg-stone-800', items: [Ingredient.COLA, Ingredient.SUGAR] }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto pb-40">
      <div className="flex justify-between items-center mb-6 px-2">
        <h2 className="text-2xl font-bold text-slate-900">Custom Lab</h2>
        <div className={`px-4 py-1.5 rounded-full text-sm font-black border ${currentTotal >= MAX_VOLUME_ML ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white border-slate-300 text-slate-500 shadow-sm'}`}>
          {currentTotal} / {MAX_VOLUME_ML} mL
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {groups.map(g => (
          <div key={g.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
               <div className={`w-1.5 h-1.5 ${g.color} rounded-full`}></div> {g.label}
            </h3>
            <div className="space-y-2">
              {g.items.map(ing => (
                <IngredientStepper key={ing} ingredient={ing} value={recipe[ing]} max={MAX_VOLUME_ML} step={5} onChange={(val) => handleIngredientChange(ing, val)} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-30">
        <Button variant="primary" className="w-full shadow-2xl py-5 text-xl rounded-2xl" onClick={async () => { await serialService.dispenseDrink(recipe); navigate('/success'); }} disabled={currentTotal === 0}>
          Dispense Mix
        </Button>
      </div>
    </div>
  );
};

const SpecialtyListScreen = () => {
  const navigate = useNavigate();
  return (
    <div className="p-6 max-w-7xl mx-auto pb-40">
      <h2 className="text-2xl font-bold text-slate-900 mb-8 px-2">Signature Drinks</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SPECIALTY_DRINKS.map(drink => (
          <div key={drink.id} onClick={() => navigate(`/adjust/${drink.id}`)} className={`cursor-pointer rounded-3xl p-8 bg-gradient-to-br ${drink.color} relative overflow-hidden shadow-md hover:scale-[1.02] transition-all h-64 flex flex-col justify-between group`}>
            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
            <div className="relative z-10 flex justify-end">
               <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/20 shadow-sm">
                 <Martini size={24} className="text-white" />
               </div>
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-white drop-shadow-md mb-2">{drink.name}</h3>
              <p className="text-xs text-white/90 font-bold tracking-tight uppercase drop-shadow-sm">{drink.description}</p>
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
          <button onClick={() => navigate('/specialty')} className="p-3 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100"><RotateCcw size={20} /></button>
          <h2 className="text-xl font-bold text-slate-900">{drink.name}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-10">
          <div className={`aspect-square rounded-3xl bg-gradient-to-br ${drink.color} shadow-xl flex flex-col items-center justify-center relative overflow-hidden`}>
             <div className="absolute inset-0 bg-black/5"></div>
             <div className="relative z-10 text-center p-6">
               <div className="text-6xl font-black text-white drop-shadow-md mb-2">{flavorAmount}</div>
               <p className="text-white font-black uppercase text-[10px] tracking-widest drop-shadow-md opacity-80">{drink.flavorIngredient}</p>
             </div>
          </div>
          <div className="space-y-4">
            <IngredientStepper ingredient={drink.flavorIngredient} label="Flavor Depth" value={flavorAmount} max={MAX_VOLUME_ML} step={5} minConstraint={drink.minFlavor} maxConstraint={drink.maxFlavor} onChange={setFlavorAmount} isRelative={true} />
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{drink.baseIngredient}</span>
                <span className="text-lg font-bold text-slate-700">{baseAmount} mL</span>
            </div>
          </div>
        </div>
        <Button variant="primary" className="w-full py-5 text-xl rounded-2xl shadow-lg" onClick={async () => {
            const recipe = { ...EMPTY_RECIPE };
            Object.entries(drink.fixedIngredients).forEach(([ing, amt]) => {
              if (ing in recipe) recipe[ing as Ingredient] += (amt || 0);
            });
            recipe[drink.flavorIngredient] += flavorAmount;
            if (drink.baseIngredient in recipe) recipe[drink.baseIngredient] += baseAmount;
            await serialService.dispenseDrink(recipe);
            navigate('/success');
        }}>Dispense Drink</Button>
      </div>
    </div>
  );
};

const SuccessScreen = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
      <div className="p-12 bg-white rounded-3xl border border-green-200 shadow-xl max-w-sm w-full">
        <div className="mb-8 p-6 bg-green-50 rounded-full inline-block">
          <CheckCircle size={80} className="text-green-500 animate-bounce" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-2">Poured!</h1>
        <p className="text-slate-500 mb-10 font-medium">Enjoy your cold drink.</p>
        <Button variant="primary" className="w-full text-lg py-4 rounded-xl" onClick={() => navigate('/menu')}>Done</Button>
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
      </Route>
    </Routes>
  </HashRouter>
);

export default App;