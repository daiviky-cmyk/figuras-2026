import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutGrid, Menu, X, ArrowLeft, 
  Minus, CheckCircle2, Trash2, Database, Copy, Cloud, CloudOff, Loader2
} from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'panini-2026-pro';

const GROUP_CONFIG = {
  'A': { color: '#2e7d32' }, 'B': { color: '#c62828' }, 'C': { color: '#689f38' }, 
  'D': { color: '#1565c0' }, 'E': { color: '#f57c00' }, 'F': { color: '#d84315' }, 
  'G': { color: '#4527a0' }, 'H': { color: '#00897b' }, 'I': { color: '#6a1b9a' }, 
  'J': { color: '#ef6c00' }, 'K': { color: '#b71c1c' }, 'L': { color: '#5d4037' }  
};

const GROUPS_DATA = [
  { id: 'A', name: 'Grupo A', teams: [{ name: 'MÉXICO', code: 'MEX' }, { name: 'SUDAFRICA', code: 'RSA' }, { name: 'COREA', code: 'KOR' }, { name: 'REP. CHECA', code: 'CZE' }]},
  { id: 'B', name: 'Grupo B', teams: [{ name: 'CANADÁ', code: 'CAN' }, { name: 'BOSNIA', code: 'BIH' }, { name: 'QATAR', code: 'QAT' }, { name: 'SUIZA', code: 'SUI' }]},
  { id: 'C', name: 'Grupo C', teams: [{ name: 'BRASIL', code: 'BRA' }, { name: 'MARRUECOS', code: 'MAR' }, { name: 'HAITÍ', code: 'HAI' }, { name: 'ESCOCIA', code: 'SCO' }]},
  { id: 'D', name: 'Grupo D', teams: [{ name: 'USA', code: 'USA' }, { name: 'PARAGUAY', code: 'PAR' }, { name: 'AUSTRALIA', code: 'AUS' }, { name: 'TURQUÍA', code: 'TUR' }]},
  { id: 'E', name: 'Grupo E', teams: [{ name: 'ALEMANIA', code: 'GER' }, { name: 'CURAZAO', code: 'CUW' }, { name: 'COSTA DE MARFIL', code: 'CIV' }, { name: 'ECUADOR', code: 'ECU' }]},
  { id: 'F', name: 'Grupo F', teams: [{ name: 'PAÍSES BAJOS', code: 'NED' }, { name: 'JAPÓN', code: 'JPN' }, { name: 'SUECIA', code: 'SWE' }, { name: 'TÚNEZ', code: 'TUN' }]},
  { id: 'G', name: 'Grupo G', teams: [{ name: 'BÉLGICA', code: 'BEL' }, { name: 'EGIPTO', code: 'EGY' }, { name: 'IRÁN', code: 'IRN' }, { name: 'NUEVA ZELANDA', code: 'NZL' }]},
  { id: 'H', name: 'Grupo H', teams: [{ name: 'ESPAÑA', code: 'ESP' }, { name: 'CABO VERDE', code: 'CPV' }, { name: 'A. SAUDITA', code: 'KSA' }, { name: 'URUGUAY', code: 'URU' }]},
  { id: 'I', name: 'Grupo I', teams: [{ name: 'FRANCIA', code: 'FRA' }, { name: 'SENEGAL', code: 'SEN' }, { name: 'IRAK', code: 'IRQ' }, { name: 'NORUEGA', code: 'NOR' }]},
  { id: 'J', name: 'Grupo J', teams: [{ name: 'ARGENTINA', code: 'ARG' }, { name: 'ARGELIA', code: 'ALG' }, { name: 'AUSTRIA', code: 'AUT' }, { name: 'JORDANIA', code: 'JOR' }]},
  { id: 'K', name: 'Grupo K', teams: [{ name: 'PORTUGAL', code: 'POR' }, { name: 'CONGO DR', code: 'COD' }, { name: 'UZBEKISTÁN', code: 'UZB' }, { name: 'COLOMBIA', code: 'COL' }]},
  { id: 'L', name: 'Grupo L', teams: [{ name: 'INGLATERRA', code: 'ENG' }, { name: 'CROACIA', code: 'CRO' }, { name: 'GHANA', code: 'GHA' }, { name: 'PANAMÁ', code: 'PAN' }]}
];

const SPECIAL_SECTIONS = [
  { id: 'FWC', name: 'FIFA WORLD CUP', code: 'FWC', count: 20, startAt: 0 },
  { id: 'CC', name: 'COCA-COLA', code: 'CC', count: 14, startAt: 1 }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [stickers, setStickers] = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('groups'); 
  const [selectedItem, setSelectedItem] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Auth error:", error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'stickers', 'main');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setStickers(docSnap.data().collection || {});
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const toggleSticker = async (category, number, delta) => {
    if (!user) return;
    const key = `${category}-${number}`;
    const current = stickers[key] || 0;
    const newValue = Math.max(0, current + delta);
    const newCollection = { ...stickers, [key]: newValue };
    if (newValue === 0) delete newCollection[key];
    setStickers(newCollection);
    try {
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'stickers', 'main');
      await setDoc(docRef, { collection: newCollection });
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const stats = useMemo(() => {
    const totalPossible = 994;
    const owned = Object.values(stickers).filter(c => c >= 1).length;
    return {
      percent: Math.round((owned / totalPossible) * 100),
      owned, totalPossible, remaining: totalPossible - owned
    };
  }, [stickers]);

  const duplicates = useMemo(() => {
    return Object.entries(stickers)
      .filter(([_, count]) => count > 1)
      .map(([key, count]) => {
        const [category, num] = key.split('-');
        let codeLabel = category;
        GROUPS_DATA.forEach(g => {
            const team = g.teams.find(t => t.name === category);
            if(team) codeLabel = team.code;
        });
        if (category === 'FWC') codeLabel = 'FWC';
        if (category === 'CC') codeLabel = 'CC';
        return { id: key, display: `${codeLabel} ${num}`, extra: count - 1 };
      });
  }, [stickers]);

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-12 h-12 text-[#fedd00] animate-spin mb-4" />
        <h1 className="font-black text-xl italic uppercase">Iniciando Álbum...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 font-sans pb-32">
      <header className="sticky top-0 z-40 bg-[#fedd00] shadow-md border-b-2 border-black">
        <div className="p-3 flex items-center justify-between max-w-xl mx-auto">
          <div className="flex items-center gap-2">
            {view !== 'groups' && (
              <button onClick={() => setView('groups')} className="p-1.5 bg-black/5 rounded-full mr-1">
                <ArrowLeft className="w-5 h-5 text-black" />
              </button>
            )}
            <div className="bg-white p-1 rounded border border-black shadow-sm">
               <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/FIFA_World_Cup_2026_Logo.svg/1200px-FIFA_World_Cup_2026_Logo.svg.png" className="h-7" alt="FIFA 26"/>
            </div>
            <div>
              <h1 className="font-black text-black leading-none text-base uppercase italic tracking-tighter">REGISTRO DE FIGURAS</h1>
              <p className="text-[9px] font-bold text-black/60 uppercase">MUNDIAL 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user ? <Cloud className="w-4 h-4 text-green-700" /> : <CloudOff className="w-4 h-4 text-red-500" />}
            <div className="bg-black text-[#fedd00] px-2.5 py-1 rounded-lg font-black text-lg italic shadow-md">
                {stats.percent}%
            </div>
          </div>
        </div>

        <div className="bg-white border-y border-black/10 px-4 py-2 grid grid-cols-4 divide-x divide-gray-100 max-w-xl mx-auto">
            <div className="flex flex-col items-center">
                <span className="text-[8px] font-black text-gray-400 uppercase">Total</span>
                <span className="font-black text-sm text-gray-700">{stats.totalPossible}</span>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-[8px] font-black text-green-600 uppercase">Obtenidas</span>
                <span className="font-black text-sm text-green-700">{stats.owned}</span>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-[8px] font-black text-red-600 uppercase">Faltantes</span>
                <span className="font-black text-sm text-red-700">{stats.remaining}</span>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-[8px] font-black text-blue-600 uppercase">Repetidas</span>
                <span className="font-black text-sm text-blue-700">{duplicates.reduce((a,b) => a+b.extra, 0)}</span>
            </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto">
        {view === 'groups' && (
          <div className="animate-in">
            <div className="bg-[#4caf50] text-white py-1.5 px-6 font-black italic text-xs tracking-widest uppercase mb-1 shadow-sm">
                Especiales
            </div>
            <div className="px-4 mb-6 space-y-1.5">
                {SPECIAL_SECTIONS.map(section => {
                    const sectionOwned = Object.keys(stickers).filter(k => k.startsWith(`${section.id}-`)).length;
                    return (
                        <button 
                            key={section.id}
                            onClick={() => { setSelectedItem({...section, type: 'special'}); setView('detail'); }}
                            className="w-full bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between hover:bg-gray-50 active:scale-[0.98] transition-all"
                        >
                            <h3 className="font-black text-gray-800 text-xs uppercase italic leading-none">{section.name}</h3>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-gray-600">{sectionOwned}/{section.count}</span>
                                <div className="w-16 h-1 bg-gray-100 rounded-full mt-1">
                                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${(sectionOwned/section.count)*100}%` }}></div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="bg-[#b71c1c] text-white py-1.5 px-6 font-black italic text-xs tracking-widest uppercase mb-3 shadow-sm">
                Selecciones Nacionales
            </div>
            
            <div className="px-4 space-y-4">
                {GROUPS_DATA.map(group => (
                    <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-4 py-1.5 flex justify-between items-center text-white" style={{ backgroundColor: GROUP_CONFIG[group.id].color }}>
                            <h3 className="font-black italic uppercase text-[10px] tracking-widest">Grupo {group.id}</h3>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {group.teams.map(team => {
                                const teamOwned = Object.keys(stickers).filter(k => k.startsWith(`${team.name}-`)).length;
                                return (
                                    <button 
                                        key={team.name}
                                        onClick={() => { setSelectedItem({...team, type: 'team', count: 20}); setView('detail'); }}
                                        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors active:bg-gray-100 text-left"
                                    >
                                        <span className="font-black text-gray-800 uppercase italic text-sm">{team.name}</span>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <span className="font-black text-[10px] text-gray-400 block">{teamOwned}/20</span>
                                                <div className="w-16 h-1 bg-gray-100 rounded-full mt-0.5 overflow-hidden">
                                                    <div className="h-full" style={{ width: `${(teamOwned/20)*100}%`, backgroundColor: GROUP_CONFIG[group.id].color }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}

        {view === 'detail' && selectedItem && (
          <div className="animate-in p-4">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-5 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: selectedItem.type === 'team' ? GROUP_CONFIG[GROUPS_DATA.find(g => g.teams.some(t => t.name === selectedItem.name))?.id || 'A'].color : '#4caf50' }}></div>
                <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">{selectedItem.name}</h2>
                <div className="h-1 w-12 bg-green-500 mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {Array.from({ length: selectedItem.count }, (_, i) => i + (selectedItem.startAt !== undefined ? selectedItem.startAt : 1)).map(num => {
                const category = selectedItem.id === 'FWC' ? 'FWC' : (selectedItem.id === 'CC' ? 'CC' : selectedItem.name);
                const key = `${category}-${num}`;
                const count = stickers[key] || 0;
                const displayLabel = `${selectedItem.code} ${num}`;
                
                let extraLabel = "";
                if (selectedItem.type === 'team') {
                    if (num === 1) extraLabel = "ESC";
                    if (num === 13) extraLabel = "EQU";
                }

                return (
                  <div key={num} className="relative">
                    <button 
                        onClick={() => toggleSticker(category, num, 1)}
                        className={`w-full aspect-[4/5] rounded-xl border-2 flex flex-col items-center justify-center transition-all active:scale-90 overflow-hidden ${
                            count > 0 
                                ? 'bg-green-500/10 border-green-500 shadow-inner ring-1 ring-green-500/20' 
                                : 'bg-white border-gray-100 text-gray-300'
                        }`}
                    >
                        {count > 0 && <div className="absolute top-1 right-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-600 fill-white" /></div>}
                        <span className={`text-[9px] font-black leading-none ${count > 0 ? 'text-green-800' : 'text-gray-300'}`}>{displayLabel}</span>
                        {extraLabel && <span className={`text-[7px] font-black px-1.5 py-0.5 rounded mt-1.5 tracking-tighter ${count > 0 ? 'bg-green-600 text-white' : 'bg-gray-50 text-gray-300 border border-gray-100'}`}>{extraLabel}</span>}
                        {count > 1 && <div className="absolute bottom-1 right-1"><span className="bg-blue-600 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-white shadow-sm">{count - 1}</span></div>}
                    </button>
                    {count > 0 && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); toggleSticker(category, num, -1); }}
                            className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white z-10 active:scale-75 transition-transform"
                        >
                            <Minus className="w-3.5 h-3.5 stroke-[4px]" />
                        </button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-8 p-4 bg-white rounded-2xl border border-gray-100 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Toca para sumar • Botón rojo para eliminar
            </div>
          </div>
        )}

        {view === 'duplicates' && (
            <div className="p-4 animate-in">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
                    <h2 className="text-2xl font-black text-gray-900 uppercase italic flex items-center gap-3"><Copy className="text-blue-500" /> Mis Repetidas</h2>
                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">Total de láminas extras: {duplicates.reduce((a,b) => a+b.extra, 0)}</p>
                </div>
                {duplicates.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-gray-100 text-center">
                        <Database className="w-10 h-10 text-gray-100 mx-auto mb-4" /><p className="text-gray-300 font-black uppercase text-[10px] tracking-widest">No tienes repetidas</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {duplicates.map(dup => (
                            <div key={dup.id} className="bg-white p-3 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm">
                                <span className="font-black text-gray-700 text-[11px] uppercase">{dup.display}</span>
                                <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-1.5 py-0.5 rounded-md border border-blue-100">+{dup.extra}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-2.5 flex justify-around items-center z-40 pb-safe shadow-[0_-8px_25px_rgba(0,0,0,0.04)]">
        <button onClick={() => setView('groups')} className={`flex flex-col items-center gap-1 px-5 py-2 rounded-xl transition-all ${view === 'groups' ? 'text-black bg-[#fedd00] shadow-sm' : 'text-gray-400'}`}>
            <LayoutGrid className="w-5 h-5" /><span className="text-[8px] font-black uppercase tracking-tighter">Álbum</span>
        </button>
        <button onClick={() => setView('duplicates')} className={`flex flex-col items-center gap-1 px-5 py-2 rounded-xl transition-all ${view === 'duplicates' ? 'text-blue-600 bg-blue-50 shadow-sm' : 'text-gray-400'}`}>
            <Copy className="w-5 h-5" /><span className="text-[8px] font-black uppercase tracking-tighter">Cambios</span>
        </button>
        <button onClick={() => setIsMenuOpen(true)} className="flex flex-col items-center gap-1 px-5 py-2 text-gray-400">
            <Menu className="w-5 h-5" /><span className="text-[8px] font-black uppercase tracking-tighter">Opciones</span>
        </button>
      </nav>

      <div className={`fixed inset-0 z-50 transition-all ${isMenuOpen ? 'visible' : 'invisible pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsMenuOpen(false)}></div>
        <div className={`absolute right-0 top-0 bottom-0 w-72 bg-white shadow-2xl transition-transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col p-6`}>
            <div className="flex justify-between items-center mb-10">
                <h2 className="font-black text-xl italic uppercase tracking-tighter">Opciones</h2>
                <button onClick={() => setIsMenuOpen(false)} className="p-1.5 bg-gray-50 rounded-full text-gray-400"><X className="w-5 h-5"/></button>
            </div>
            <div className="space-y-3">
                <div className="bg-[#fcfcfd] p-5 rounded-2xl border border-gray-100 text-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Mi ID de usuario</p>
                    <p className="text-[8px] text-gray-300 font-mono break-all">{user?.uid}</p>
                </div>
                <button 
                    onClick={() => {
                        if(window.confirm("¿Borrar todo el progreso de la nube?")) {
                            setStickers({});
                            const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'stickers', 'main');
                            setDoc(docRef, { collection: {} });
                            setIsMenuOpen(false);
                        }
                    }}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-red-50 text-red-600 font-black uppercase text-[10px] tracking-widest border border-red-100"
                >
                    Reiniciar Nube
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        body { font-family: 'Inter', sans-serif; -webkit-tap-highlight-color: transparent; }
        .animate-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
      `}</style>
    </div>
  );
}
