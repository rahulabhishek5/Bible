import React, { useState, useEffect, useLayoutEffect } from 'react';
import { BookOpen, Search, Menu, ChevronRight, BookOpenCheck, Globe, HelpCircle, Settings, X, Type, ChevronDown } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api/bible';

const TELUGU_BOOK_NAMES = {
  1: 'ఆదికాండము', 2: 'నిర్గమకాండము', 3: 'లేవీయకాండము', 4: 'సంఖ్యాకాండము', 5: 'ద్వితీయోపదేశకాండము',
  6: 'యెహోషువ', 7: 'న్యాయాధిపతులు', 8: 'రూతు', 9: '1 సమూయేలు', 10: '2 సమూయేలు',
  11: '1 రాజులు', 12: '2 రాజులు', 13: '1 దినవృత్తాంతములు', 14: '2 దినవృత్తాంతములు', 15: 'ఎజ్రా',
  16: 'నెహెమ్యా', 17: 'ఎస్తేరు', 18: 'యోబు', 19: 'కీర్తనల గ్రంథము', 20: 'సామెతలు',
  21: 'ప్రసంగి', 22: 'పరమగీతము', 23: 'యెషయా', 24: 'యిర్మీయా', 25: 'విలాపవాక్యములు',
  26: 'యెహెజ్కేలు', 27: 'దానియేలు', 28: 'హోషేయ', 29: 'యోవేలు', 30: 'ఆమోసు',
  31: 'ఓబద్యా', 32: 'యోనా', 33: 'మీకా', 34: 'నహూము', 35: 'హబక్కూకు',
  36: 'జెఫన్యా', 37: 'హగ్గయి', 38: 'జెకర్యా', 39: 'మలాకీ', 40: 'మత్తయి సువార్త',
  41: 'మార్కు సువార్త', 42: 'లూకా సువార్త', 43: 'యోహాను సువార్త', 44: 'అపొస్తలుల కార్యములు', 45: 'రోమీయులకు',
  46: '1 కొరింథీయులకు', 47: '2 కొరింథీయులకు', 48: 'గలతీయులకు', 49: 'ఎఫెసీయులకు', 50: 'ఫిలిప్పీయులకు',
  51: 'కొలొస్సయులకు', 52: '1 థెస్సలొనీకయులకు', 53: '2 థెస్సలొనీకయులకు', 54: '1 తిమోతికి', 55: '2 తిమోతికి',
  56: 'తీతుకు', 57: 'ఫిలేమోనుకు', 58: 'హెబ్రీయులకు', 59: 'యాకోబు', 60: '1 పేతురు',
  61: '2 పేతురు', 62: '1 యోహాను', 63: '2 యోహాను', 64: '3 యోహాను', 65: 'యూదా', 66: 'ప్రకటన గ్రంథము'
};

// ============================================================================
// DYNAMIC THEMING DEFINITIONS
// ============================================================================
const THEMES = {
  geometry: { primary: '#1A1A1A', cream: '#F5F5DC', surface: '#FFFFFF', name: 'Sacred Geometry' },
  obsidian: { primary: '#FFFFFF', cream: '#121212', surface: '#1A1A1A', name: 'Obsidian Dark' },
  parchment: { primary: '#3E2723', cream: '#F5E6D3', surface: '#FFF8E7', name: 'Warm Parchment' }
};
const ACCENTS = ['#FF3B30', '#007AFF', '#34C759', '#FFCC00', '#FF2D55'];

const getInitialSettings = () => {
  const saved = localStorage.getItem('bible_settings');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { console.error(e); }
  }
  return { theme: 'geometry', accent: '#FF3B30', fontScale: 1.0 };
};

export default function App() {
  // Navigation & UI Layout State
  const [menuData, setMenuData] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState('parallel'); // single_kjv, single_telugu, parallel
  const [testamentFilter, setTestamentFilter] = useState('OT'); // OT, NT
  
  // Ergonomics & Thematic Settings State
  const [settings, setSettings] = useState(getInitialSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Content Display States
  const [chapterVerses, setChapterVerses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Advanced Search Engine States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTranslation, setSearchTranslation] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('reader'); // reader, search
  const [isViewModeDropdownOpen, setIsViewModeDropdownOpen] = useState(false);

  const highlightText = (text, query) => {
    if (!query || !text) return text;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? 
        <span key={i} className="bg-primary text-surface-white px-1 mx-0.5 font-black">{part}</span> : part
    );
  };

  // ============================================================================
  // SYNCHRONOUS THEMATIC BINDING (PREVENTS FLASHING)
  // ============================================================================
  useLayoutEffect(() => {
    const root = document.documentElement;
    const currentTheme = THEMES[settings.theme] || THEMES.geometry;
    
    root.style.setProperty('--app-primary', currentTheme.primary);
    root.style.setProperty('--app-cream', currentTheme.cream);
    root.style.setProperty('--app-surface', currentTheme.surface);
    root.style.setProperty('--app-accent', settings.accent);
    
    localStorage.setItem('bible_settings', JSON.stringify(settings));
  }, [settings]);

  // Phase 1: Load Cached Navigation Structure on Mount
  useEffect(() => {
    fetch(`${API_BASE}/navigation-menu`)
      .then(res => res.json())
      .then(payload => {
        if (payload.status === 'success' && payload.data.length > 0) {
          setMenuData(payload.data);
          setSelectedBook(payload.data[0]); // Default to first book (Genesis)
        }
      })
      .catch(err => console.error("Failed to load navigation cache:", err));
  }, []);

  // Phase 2: Fetch Chapter Contents Natively When Selection Changes
  useEffect(() => {
    if (!selectedBook) return;
    
    setLoading(true);
    fetch(`${API_BASE}/chapter/${selectedBook.bookNumber}/${selectedChapter}`)
      .then(res => res.json())
      .then(payload => {
        if (payload.status === 'success') {
          setChapterVerses(payload.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load chapter verses:", err);
        setLoading(false);
      });
  }, [selectedBook, selectedChapter]);

  // Phase 3: Execute Target Search Form Logic
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    let url = `${API_BASE}/search?q=${encodeURIComponent(searchQuery)}`;
    if (searchTranslation) url += `&translation=${searchTranslation}`;

    fetch(url)
      .then(res => res.json())
      .then(payload => {
        if (payload.status === 'success') {
          setSearchResults(payload.data);
        }
        setSearching(false);
      })
      .catch(err => {
        console.error("Search execution error:", err);
        setSearching(false);
      });
  };

  const jumpToChapter = (bookNum, chapNum) => {
    const targetBook = menuData.find(b => b.bookNumber === bookNum);
    if (targetBook) {
      setSelectedBook(targetBook);
      setSelectedChapter(chapNum);
      
      // Auto-switch testament tab if jumping across boundaries
      if (bookNum <= 39) setTestamentFilter('OT');
      else setTestamentFilter('NT');
      
      setActiveTab('reader');
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col md:flex-row bg-cream font-space-grotesk text-primary">
      {/* ERGONOMICS SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-primary/80 z-[100] flex items-center justify-center p-4">
          <div className="w-[92vw] md:w-[450px] max-h-[90vh] overflow-y-auto bg-surface-white border-4 border-primary shadow-[8px_8px_0px_0px_#1A1A1A] flex flex-col transition-all">
            <div className="p-5 border-b-4 border-primary flex justify-between items-center bg-cream shrink-0">
               <h2 className="font-extrabold text-2xl uppercase tracking-widest text-primary flex items-center gap-2"><Settings className="w-6 h-6"/> Ergonomics</h2>
               <button onClick={() => setIsSettingsOpen(false)} className="p-2 border-2 border-primary hover:bg-surface-white transition-all active:scale-95 active:translate-y-[1px]"><X className="w-5 h-5 text-primary"/></button>
            </div>
            <div className="p-6 space-y-8 flex-1 overflow-y-auto">
               {/* THEMES */}
               <div>
                 <h3 className="font-bold text-lg uppercase tracking-wider text-primary mb-3">Structural Theme</h3>
                 <div className="space-y-3">
                   {Object.entries(THEMES).map(([key, t]) => (
                     <button 
                       key={key} 
                       onClick={() => setSettings({...settings, theme: key})}
                       className={`w-full p-4 border-2 flex items-center justify-between transition-all active:scale-[0.98] ${settings.theme === key ? 'border-primary bg-primary text-surface-white shadow-[4px_4px_0px_0px_#1A1A1A] -translate-x-1 -translate-y-1' : 'border-primary bg-cream text-primary hover:bg-surface-white'}`}
                     >
                       <span className="font-extrabold uppercase tracking-widest">{t.name}</span>
                       <div className="flex border-2 border-primary">
                          <div className="w-4 h-4" style={{backgroundColor: t.cream}}></div>
                          <div className="w-4 h-4" style={{backgroundColor: t.surface}}></div>
                          <div className="w-4 h-4" style={{backgroundColor: t.primary}}></div>
                       </div>
                     </button>
                   ))}
                 </div>
               </div>

               {/* ACCENTS */}
               <div>
                 <h3 className="font-bold text-lg uppercase tracking-wider text-primary mb-3">Active Accent</h3>
                 <div className="flex gap-3 flex-wrap">
                   {ACCENTS.map(acc => (
                     <button 
                       key={acc}
                       onClick={() => setSettings({...settings, accent: acc})}
                       className={`w-12 h-12 border-2 border-primary transition-all active:scale-90 ${settings.accent === acc ? 'shadow-[4px_4px_0px_0px_#1A1A1A] -translate-y-1 -translate-x-1' : 'opacity-70 hover:opacity-100'}`}
                       style={{backgroundColor: acc}}
                     />
                   ))}
                 </div>
               </div>

               {/* TYPOGRAPHY SCALE */}
               <div>
                 <h3 className="font-bold text-lg uppercase tracking-wider text-primary mb-3">Global Typography</h3>
                 <div className="flex border-2 border-primary bg-cream">
                   <button onClick={() => setSettings({...settings, fontScale: Math.max(0.85, settings.fontScale - 0.15)})} className="p-4 border-r-2 border-primary hover:bg-surface-white active:bg-primary active:text-surface-white transition-colors text-primary min-w-[64px] flex justify-center items-center"><Type className="w-4 h-4"/></button>
                   <div className="flex-1 flex items-center justify-center font-extrabold text-primary tracking-widest">{Math.round(settings.fontScale * 100)}%</div>
                   <button onClick={() => setSettings({...settings, fontScale: Math.min(1.45, settings.fontScale + 0.15)})} className="p-4 border-l-2 border-primary hover:bg-surface-white active:bg-primary active:text-surface-white transition-colors text-primary min-w-[64px] flex justify-center items-center"><Type className="w-6 h-6"/></button>
                 </div>
                 <p className="mt-3 text-xs font-bold text-primary/60 uppercase tracking-wider">Multi-script proportions are automatically protected during scaling.</p>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BACKDROP OVERLAY */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-primary/80 z-40 md:hidden transition-opacity" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 w-80 h-full bg-cream border-r-4 border-primary flex flex-col overflow-hidden`}>
        <div className="p-5 border-b-4 border-primary flex items-center gap-3 bg-primary text-surface-white shrink-0">
          <BookOpenCheck className="h-7 w-7 shrink-0" />
          <h1 className="font-bold text-xl tracking-wide whitespace-nowrap uppercase">Bilingual Scripture</h1>
        </div>

        {/* Binary Segmentation Toggle */}
        <div className="p-3 border-b-4 border-primary shrink-0 bg-surface-white">
          <div className="flex border-2 border-primary bg-cream">
            <button
              onClick={() => setTestamentFilter('OT')}
              className={`flex-1 min-h-[44px] py-2 text-sm font-bold uppercase tracking-widest transition-none border-r-2 border-primary ${testamentFilter === 'OT' ? 'bg-primary text-surface-white' : 'text-primary md:hover:bg-surface-white'}`}
            >
              Old Test.
            </button>
            <button
              onClick={() => setTestamentFilter('NT')}
              className={`flex-1 min-h-[44px] py-2 text-sm font-bold uppercase tracking-widest transition-none ${testamentFilter === 'NT' ? 'bg-primary text-surface-white' : 'text-primary md:hover:bg-surface-white'}`}
            >
              New Test.
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {menuData.filter(b => testamentFilter === 'OT' ? b.bookNumber <= 39 : b.bookNumber > 39).map((book) => {
            const isSelected = selectedBook?.bookNumber === book.bookNumber;
            return (
              <div key={book.bookNumber} className="overflow-hidden">
                <button
                  onClick={() => { setSelectedBook(book); setSelectedChapter(1); }}
                  className={`w-full min-h-[44px] min-w-[44px] px-4 py-3 flex items-center justify-between text-left transition-all duration-100 ease-out active:scale-[0.98] active:translate-y-[0.5px] border-2 ${isSelected ? 'bg-primary text-surface-white border-primary shadow-[4px_4px_0px_0px_#1A1A1A] translate-x-[-2px] translate-y-[-2px]' : 'bg-surface-white text-primary border-primary md:hover:bg-cream md:hover:shadow-[4px_4px_0px_0px_#1A1A1A] md:hover:-translate-x-1 md:hover:-translate-y-1'}`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className={`text-xs font-bold px-2 py-1.5 border-2 shrink-0 ${isSelected ? 'border-surface-white bg-primary text-surface-white' : 'border-primary bg-cream text-primary'}`}>{book.abbreviation}</span>
                    <div className="flex flex-col items-start truncate overflow-hidden">
                      <span className="truncate font-extrabold uppercase tracking-widest">{book.name}</span>
                      <span className={`truncate font-semibold text-[13px] tracking-wide mt-0.5 ${isSelected ? 'text-surface-white/80' : 'text-primary/70'}`}>
                        {TELUGU_BOOK_NAMES[book.bookNumber]}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`h-5 w-5 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                </button>
                
                {/* Expandable Chapter Selection Sub-Grid */}
                {isSelected && (
                  <div className="bg-cream p-4 grid grid-cols-5 gap-2.5 border-l-2 border-r-2 border-b-2 border-primary mb-3 max-h-56 overflow-y-auto ml-2 mr-2">
                    {Array.from({ length: book.totalChapters }, (_, i) => i + 1).map((chap) => (
                      <button
                        key={chap}
                        onClick={() => {
                          setSelectedChapter(chap);
                          if (window.innerWidth < 768) setSidebarOpen(false);
                        }}
                        className={`min-h-[44px] min-w-[44px] py-2.5 text-center text-sm font-bold border-2 transition-all duration-100 ease-out active:scale-[0.98] active:translate-y-[0.5px] ${selectedChapter === chap ? 'bg-accent-red text-surface-white border-primary shadow-[2px_2px_0px_0px_#1A1A1A] translate-x-[-1px] translate-y-[-1px]' : 'bg-surface-white text-primary border-primary md:hover:bg-cream md:hover:shadow-[2px_2px_0px_0px_#1A1A1A] md:hover:-translate-x-[1px] md:hover:-translate-y-[1px]'}`}
                      >
                        {chap}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* MAIN VIEWPORT INTERFACE AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-cream">
        {/* UPPER CONSOLE BAR */}
        <header className="flex flex-row flex-wrap sm:flex-nowrap items-center justify-between gap-2 md:gap-4 w-full p-2 md:p-4 md:px-8 shrink-0 bg-surface-white border-b-2 md:border-b-4 border-primary z-10">
          <div className="flex items-center gap-2 md:gap-6 w-full sm:w-auto justify-between sm:justify-start">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 border-2 border-primary bg-surface-white transition-all duration-100 ease-out active:scale-[0.98] active:translate-y-[0.5px] md:hidden text-primary min-h-[40px] min-w-[40px] flex items-center justify-center">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex bg-cream p-1 border-2 border-primary w-full sm:w-auto justify-center">
              <button onClick={() => setActiveTab('reader')} className={`flex-1 sm:flex-none min-h-[40px] min-w-[40px] px-2 py-1.5 md:px-6 text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-100 ease-out active:scale-[0.98] active:translate-y-[0.5px] border-2 border-transparent flex items-center justify-center gap-1.5 ${activeTab === 'reader' ? 'bg-primary text-surface-white' : 'text-primary md:hover:bg-surface-white md:hover:border-primary'}`}>
                <BookOpen className="h-3.5 w-3.5 md:h-4 md:w-4" /> Reader
              </button>
              <button onClick={() => setActiveTab('search')} className={`flex-1 sm:flex-none min-h-[40px] min-w-[40px] px-2 py-1.5 md:px-6 text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-100 ease-out active:scale-[0.98] active:translate-y-[0.5px] border-2 border-transparent flex items-center justify-center gap-1.5 ${activeTab === 'search' ? 'bg-primary text-surface-white' : 'text-primary md:hover:bg-surface-white md:hover:border-primary'}`}>
                <Search className="h-3.5 w-3.5 md:h-4 md:w-4" /> Search
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-between w-full sm:w-auto mt-1 sm:mt-0">
             {activeTab === 'reader' && selectedBook && (
                <div className="relative flex-1 sm:flex-none">
                  <button 
                    onClick={() => setIsViewModeDropdownOpen(!isViewModeDropdownOpen)}
                    className="flex w-full sm:w-56 items-center justify-between gap-1.5 md:gap-3 bg-surface-white border-2 border-primary px-2 py-1.5 md:px-4 md:py-3 transition-all duration-300 ease-out active:scale-[0.98] md:hover:shadow-[4px_4px_0px_0px_#1A1A1A] md:hover:-translate-y-1 md:hover:-translate-x-1 cursor-pointer min-h-[40px]"
                  >
                    <div className="flex items-center gap-2">
                       <Globe className="h-5 w-5 text-primary hidden sm:block" />
                       <span className="font-bold uppercase tracking-wider text-sm">
                         {viewMode === 'parallel' ? 'Parallel View' : viewMode === 'single_kjv' ? 'KJV Only' : 'Telugu Only'}
                       </span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-primary transition-transform duration-300 ${isViewModeDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <div className={`absolute top-full left-0 right-0 mt-2 bg-surface-white border-2 border-primary shadow-[6px_6px_0px_0px_#1A1A1A] flex flex-col overflow-hidden transition-all duration-300 origin-top z-50 ${isViewModeDropdownOpen ? 'scale-y-100 opacity-100 visible' : 'scale-y-0 opacity-0 invisible'}`}>
                    {['parallel', 'single_kjv', 'single_telugu'].map(mode => (
                      <button 
                        key={mode}
                        onClick={() => { setViewMode(mode); setIsViewModeDropdownOpen(false); }}
                        className={`px-4 py-4 text-left font-bold uppercase tracking-wider text-sm transition-colors md:hover:bg-cream ${viewMode === mode ? 'bg-primary text-surface-white md:hover:bg-primary' : 'text-primary'}`}
                      >
                        {mode === 'parallel' ? 'Parallel View' : mode === 'single_kjv' ? 'KJV Only' : 'Telugu Only'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <button 
                onClick={() => setIsSettingsOpen(true)} 
                className="p-2 bg-surface-white border-2 border-primary text-primary transition-all duration-100 ease-out active:scale-[0.98] active:translate-y-[0.5px] md:hover:shadow-[4px_4px_0px_0px_#1A1A1A] md:hover:-translate-y-1 md:hover:-translate-x-1 min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <Settings className="w-4 h-4 md:w-5 md:h-5"/>
              </button>
          </div>
        </header>

        {/* CONTAINER DISPLAY WINDOW */}
        <div className="flex-1 p-2 md:p-8 overflow-hidden flex flex-col">
          {activeTab === 'reader' ? (
            <div className="max-w-5xl w-full mx-auto bg-surface-white border-2 md:border-4 border-primary shadow-[4px_4px_0px_0px_#1A1A1A] md:shadow-[8px_8px_0px_0px_#1A1A1A] min-h-0 flex flex-col h-full overflow-hidden">
              {selectedBook ? (
                <>
                  {/* STATIC CONTROL HEADER */}
                  <div className="p-3 md:p-8 border-b-2 md:border-b-4 border-primary bg-cream text-center shrink-0">
                    <h2 className="text-xl md:text-5xl font-extrabold text-primary tracking-tighter uppercase">{selectedBook.name}</h2>
                    <p className="text-primary font-bold mt-0.5 md:mt-2 text-xs md:text-lg tracking-widest uppercase">Chapter {selectedChapter}</p>
                  </div>

                  {/* SCROLLABLE TEXT WRAPPER */}
                  <div className="p-3 md:p-10 flex-1 overflow-y-auto space-y-4 md:space-y-6 bg-surface-white">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="animate-spin rounded-none h-10 w-10 border-4 border-primary border-t-accent-red" />
                        <p className="text-lg text-primary font-bold uppercase tracking-widest">Rendering...</p>
                      </div>
                    ) : (
                      chapterVerses.map((v) => (
                        <div key={v._id} className="flex items-start gap-4 p-4 border-2 border-primary bg-surface-white transition-all duration-100 ease-out md:hover:shadow-[6px_6px_0px_0px_#1A1A1A] md:hover:translate-x-[-2px] md:hover:translate-y-[-2px]">
                          <span className="text-sm font-bold text-surface-white bg-primary px-3 py-1.5 mt-1 shrink-0">{v.verseNumber}</span>
                          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-8 transition-none">
                            {/* DYNAMIC LAYOUT CONTROL RENDERING */}
                            {(viewMode === 'parallel' || viewMode === 'single_kjv') && (
                              <div className={`transition-none ${viewMode === 'parallel' ? 'lg:col-span-1' : 'lg:col-span-2'}`}>
                                <p className="text-primary leading-relaxed font-medium" style={{ fontSize: `calc(1.15rem * ${settings.fontScale})` }}>
                                  {v.translations?.KJV || <span className="text-primary/50 italic">Text Unavailable</span>}
                                </p>
                              </div>
                            )}
                            {(viewMode === 'parallel' || viewMode === 'single_telugu') && (
                              <div className={`transition-none ${viewMode === 'parallel' ? 'lg:col-span-1 border-t-4 border-primary pt-6 lg:border-t-0 lg:border-l-4 lg:pt-0 lg:pl-8' : 'lg:col-span-2'}`}>
                                <p className="text-primary font-sans font-semibold" style={{ fontSize: `calc(1.4rem * ${settings.fontScale * 0.9})`, lineHeight: 1.8 }}>
                                  {v.translations?.TELUGU || <span className="text-primary/50 italic">తెలుగు పాఠం అందుబాటులో లేదు</span>}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 py-20 text-primary bg-surface-white">
                  <BookOpen className="h-16 w-16 mb-4" />
                  <p className="font-bold text-xl uppercase tracking-widest">Select a book</p>
                </div>
              )}
            </div>
          ) : (
            /* SEARCH TAB PANELS */
            <div className="max-w-4xl w-full mx-auto bg-surface-white border-4 border-primary shadow-[8px_8px_0px_0px_#1A1A1A] p-6 md:p-10 min-h-0 flex flex-col h-full overflow-hidden">
              <form onSubmit={handleSearch} className="flex gap-4 mb-8 shrink-0 flex-wrap sm:flex-nowrap">
                <div className="flex-1 relative w-full sm:w-auto">
                  <Search className="absolute left-4 top-4 h-5 w-5 text-primary" />
                  <input
                    type="text"
                    placeholder="QUERY SCRIPTURE..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full min-h-[44px] min-w-[44px] pl-12 pr-4 py-3 bg-surface-white border-2 border-primary text-lg font-bold placeholder-primary/50 focus:outline-none focus:shadow-[4px_4px_0px_0px_#1A1A1A] md:focus:-translate-y-1 md:focus:-translate-x-1 transition-all"
                  />
                </div>
                <select
                  value={searchTranslation}
                  onChange={(e) => setSearchTranslation(e.target.value)}
                  className="w-full sm:w-auto min-h-[44px] min-w-[44px] bg-cream border-2 border-primary px-4 py-3 sm:py-0 text-lg font-bold uppercase tracking-wider text-primary focus:outline-none cursor-pointer appearance-none md:hover:shadow-[4px_4px_0px_0px_#1A1A1A] md:hover:-translate-y-1 md:hover:-translate-x-1 transition-all duration-100 ease-out active:scale-[0.98] active:translate-y-[0.5px]"
                >
                  <option value="">All Regions</option>
                  <option value="KJV">English (KJV)</option>
                  <option value="TELUGU">Telugu (తెలుగు)</option>
                </select>
                <button type="submit" disabled={searching} className="w-full sm:w-auto min-h-[44px] min-w-[44px] bg-primary text-surface-white font-extrabold text-lg px-8 py-3 sm:py-0 border-2 border-primary uppercase tracking-widest md:hover:bg-accent-red md:hover:shadow-[4px_4px_0px_0px_#1A1A1A] md:hover:-translate-y-1 md:hover:-translate-x-1 transition-all duration-100 ease-out active:scale-[0.98] active:translate-y-[0.5px] disabled:opacity-50">
                  {searching ? 'Querying' : 'Search'}
                </button>
              </form>

              {/* SEARCH ENGINE MATCH OUTPUT CONTAINER */}
              <div className="flex-1 overflow-y-auto space-y-6">
                {searching ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin h-10 w-10 border-4 border-primary border-t-accent-red" />
                  </div>
                ) : searchResults ? (
                  <>
                    <div className="border-b-4 border-primary pb-4 mb-4">
                      <p className="text-xl font-extrabold text-primary tracking-widest uppercase">Query Matches: {searchResults.length}</p>
                    </div>
                    {searchResults.map((result) => (
                      <div
                        key={result._id}
                        onClick={() => {
                           jumpToChapter(result.bookNumber, result.chapterNumber);
                           if (window.innerWidth < 768) setSidebarOpen(false);
                        }}
                        className="p-6 min-h-[44px] border-2 border-primary bg-cream md:hover:bg-surface-white cursor-pointer transition-all duration-100 ease-out active:scale-[0.98] active:translate-y-[0.5px] space-y-4 group md:hover:shadow-[6px_6px_0px_0px_#1A1A1A] md:hover:-translate-y-1 md:hover:-translate-x-1"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <span className="text-lg font-extrabold text-primary md:group-hover:text-accent-red uppercase tracking-wider">
                            Book {result.bookNumber} — {result.chapterNumber}:{result.verseNumber}
                          </span>
                          <span className="text-sm text-surface-white bg-primary px-3 py-1.5 font-bold uppercase tracking-widest border-2 border-primary md:group-hover:bg-accent-red transition-colors inline-block w-fit">JUMP →</span>
                        </div>
                        <div className="space-y-3">
                          {result.translations?.KJV && <p className="text-primary leading-relaxed font-medium" style={{ fontSize: `calc(1.15rem * ${settings.fontScale})` }}>{highlightText(result.translations.KJV, searchQuery)}</p>}
                          {result.translations?.TELUGU && <p className="text-primary font-sans font-semibold border-t-2 border-primary pt-3" style={{ fontSize: `calc(1.4rem * ${settings.fontScale * 0.9})`, lineHeight: 1.8 }}>{highlightText(result.translations.TELUGU, searchQuery)}</p>}
                        </div>
                      </div>
                    ))}
                    {searchResults.length === 0 && (
                      <div className="text-center py-20 text-primary">
                        <HelpCircle className="h-16 w-16 mx-auto mb-4" />
                        <p className="font-bold text-xl uppercase tracking-widest">No matches found</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-20 text-primary">
                    <Search className="h-16 w-16 mx-auto mb-4" />
                    <p className="font-bold text-xl uppercase tracking-widest">Enter parameters to query</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}