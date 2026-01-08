
import React, { useState, useEffect } from 'react';
import { AppMode, KnowledgeBase } from './types';
import { INITIAL_KB } from './constants';
import KBEditor from './components/KBEditor';
import VoiceInterface from './components/VoiceInterface';
import Login from './components/Login';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.VOICE_INTERFACE);
  const [kb, setKB] = useState<KnowledgeBase>(INITIAL_KB);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedKB = localStorage.getItem('al_jabr_secretary_kb');
    if (savedKB) {
      try {
        const parsed = JSON.parse(savedKB);
        setKB(parsed);
      } catch (e) {
        console.error("Failed to load KB", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('al_jabr_secretary_kb', JSON.stringify(kb));
    }
  }, [kb, isLoaded]);

  useEffect(() => {
    document.title = "مغسلة الجبر المحدودة";
  }, []);

  const handleSaveKB = () => {
    localStorage.setItem('al_jabr_secretary_kb', JSON.stringify(kb));
    setIsAuthenticated(false);
    setMode(AppMode.VOICE_INTERFACE);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setMode(AppMode.SETUP);
    setIsAuthenticated(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchMode = (newMode: AppMode) => {
    if (newMode === AppMode.SETUP) {
      setIsAuthenticated(false);
    }
    setMode(newMode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center">
      <header className="w-full max-w-7xl px-6 py-8 flex justify-between items-center border-b border-gray-100 bg-white shadow-sm mb-12">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div className="overflow-hidden">
            <h1 className="text-lg md:text-xl font-black text-indigo-900 leading-tight">
              مغسلة الجبر المحدودة الرائدة في السوق السعودي والشرق الاوسط
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-green-500 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                نظام التواصل الرسمي الموحد
              </span>
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 ml-4">
          <button 
            onClick={() => handleSwitchMode(AppMode.SETUP)}
            className={`px-4 md:px-6 py-2 rounded-lg text-sm font-black transition-all ${
              mode === AppMode.SETUP 
              ? 'bg-white text-indigo-600 shadow-sm border border-gray-200' 
              : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            البيانات
          </button>
          <button 
            onClick={() => handleSwitchMode(AppMode.VOICE_INTERFACE)}
            className={`px-4 md:px-6 py-2 rounded-lg text-sm font-black transition-all ${
              mode === AppMode.VOICE_INTERFACE 
              ? 'bg-white text-indigo-600 shadow-sm border border-gray-200' 
              : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            بدء المكالمة
          </button>
        </nav>
      </header>

      <main className="w-full max-w-7xl px-6 pb-20">
        <div className="flex justify-center">
          {mode === AppMode.SETUP ? (
            isAuthenticated ? (
              <div className="w-full flex justify-center animate-in fade-in slide-in-from-top-4 duration-500">
                <KBEditor 
                  kb={kb} 
                  onUpdate={setKB} 
                  onSave={handleSaveKB} 
                />
              </div>
            ) : (
              <Login 
                onSuccess={() => setIsAuthenticated(true)} 
                onCancel={() => handleSwitchMode(AppMode.VOICE_INTERFACE)} 
              />
            )
          ) : (
            <VoiceInterface 
              kb={kb}
              onExit={handleReset}
            />
          )}
        </div>
      </main>

      <footer className="w-full py-12 border-t border-gray-100 text-center opacity-40">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">مغسلة الجبر المحدودة v2.8</p>
        <p className="text-gray-300 text-[10px] font-medium">&copy; {new Date().getFullYear()} جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
};

export default App;
